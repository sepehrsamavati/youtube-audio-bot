import fs from 'node:fs';
import sharp from "sharp";
import path from 'node:path';
import http from 'node:https';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import NodeID3 from "node-id3";
import config from '../config.js';
import ffmpeg from "fluent-ffmpeg";
import { ClientType, Innertube, Platform, UniversalCache, Utils } from "youtubei.js";
import type { Types } from "youtubei.js";
import { logError } from '../common/helpers/log.js';
import { QueueVideo } from '../common/models/queueVideo.js';
import { QueueVideoStep } from '../common/enums/video.enum.js';
import OperationResult from '../common/models/operationResult.js';
import getFileSizeInMegaBytes from "../common/helpers/getFileSize.js";
import cropThumbnailSides from "../common/helpers/cropThumbnailSides.js";

type CookieJson = { name: string; value: string; domain?: string };

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const VIDEO_URL_REGEX = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
const ANONYMOUS_DOWNLOAD_CLIENTS: Types.InnerTubeClient[] = ["IOS", "TV_EMBEDDED", "TV", "MWEB", "YTMUSIC"];
const AUTHENTICATED_DOWNLOAD_CLIENTS: Types.InnerTubeClient[] = ["WEB_CREATOR", "TV_EMBEDDED", "TV", "MWEB", "YTMUSIC", "ANDROID"];

Platform.shim.eval = async (data) => new Function(data.output)();

let innertubeAuthPromise: Promise<Innertube> | undefined;
let innertubeAnonPromise: Promise<Innertube> | undefined;

function cookiesJsonToString(cookies: CookieJson[]): string {
    return cookies
        .filter(c => !c.domain || c.domain.includes("youtube.com"))
        .map(c => `${c.name}=${c.value}`)
        .join("; ");
}

function parseCookieFile(content: string): string {
    const trimmed = content.trim();
    if (!trimmed)
        throw new Error("Cookie file is empty");
    if (trimmed.startsWith("["))
        return cookiesJsonToString(JSON.parse(trimmed) as CookieJson[]);
    return trimmed;
}

function loadCookies(): string | undefined {
    const plainCookies = config.cookies.trim();
    if (plainCookies)
        return plainCookies;

    const cookiesPath = config.cookiesPath.trim();
    if (!cookiesPath)
        return undefined;

    return parseCookieFile(fs.readFileSync(cookiesPath, "utf8"));
}

function createInnertubeOptions(authenticated: boolean): Parameters<typeof Innertube.create>[0] {
    const options: Parameters<typeof Innertube.create>[0] = {
        cache: new UniversalCache(
            true,
            path.join(path.dirname(config.cacheDirectory), authenticated ? "innertube-cache" : "innertube-cache-anon"),
        ),
    };

    if (authenticated) {
        const cookie = loadCookies();
        if (cookie) {
            options.cookie = cookie;
            options.client_type = ClientType.WEB_CREATOR;
        }
    }

    return options;
}

function resetInnertubeSessions(): void {
    innertubeAuthPromise = undefined;
    innertubeAnonPromise = undefined;
}

async function getInnertube(authenticated = true): Promise<Innertube> {
    if (authenticated) {
        if (!innertubeAuthPromise)
            innertubeAuthPromise = Innertube.create(createInnertubeOptions(true));
        return innertubeAuthPromise;
    }

    if (!innertubeAnonPromise)
        innertubeAnonPromise = Innertube.create(createInnertubeOptions(false));
    return innertubeAnonPromise;
}

function isDownloadRetryableError(err: unknown): boolean {
    if (err instanceof Error) {
        const message = err.message;
        if (message.includes("No valid URL to decipher")
            || message.includes("No matching formats found")
            || message.includes("Streaming data not available")
            || message.includes("failed with status 400")
            || message.includes("status code 400")
            || message.includes("Video is login required")
            || message.includes("Video is unplayable")
            || message.includes("JavaScript evaluator")
            || message.includes("non 2xx status code")
            || message.includes("PlayerErrorCommand")
            || message.includes("This video is unavailable"))
            return true;
    }
    const errorType = (err as { info?: { error_type?: string } }).info?.error_type;
    return errorType === "NO_STREAMING_DATA"
        || errorType === "LOGIN_REQUIRED"
        || errorType === "UNPLAYABLE"
        || errorType === "FETCH_FAILED";
}

function hasPlayableAudio(info: Awaited<ReturnType<Innertube["getBasicInfo"]>>): boolean {
    const status = info.playability_status?.status;
    if (status === "LOGIN_REQUIRED" || status === "UNPLAYABLE")
        return false;

    const formats = [
        ...(info.streaming_data?.formats ?? []),
        ...(info.streaming_data?.adaptive_formats ?? []),
    ];
    return formats.some(f => f.has_audio && (f.url || f.signature_cipher || f.cipher));
}

function throwForUnplayableInfo(info: Awaited<ReturnType<Innertube["getBasicInfo"]>>): never {
    const status = info.playability_status?.status;
    const reason = info.playability_status?.reason ?? "Streaming data not available";
    const errorType = status === "LOGIN_REQUIRED" ? "LOGIN_REQUIRED" : "NO_STREAMING_DATA";
    throw Object.assign(new Error(reason), { info: { error_type: errorType } });
}

type DownloadAttempt = { authenticated: boolean; client: Types.InnerTubeClient };

function getDownloadAttempts(): DownloadAttempt[] {
    const attempts: DownloadAttempt[] = [];
    if (loadCookies())
        attempts.push(...AUTHENTICATED_DOWNLOAD_CLIENTS.map(client => ({ authenticated: true, client })));
    attempts.push(...ANONYMOUS_DOWNLOAD_CLIENTS.map(client => ({ authenticated: false, client })));
    return attempts;
}

async function downloadWithClient(innertube: Innertube, videoId: string, client: Types.InnerTubeClient) {
    const info = await innertube.getBasicInfo(videoId, { client });
    if (!hasPlayableAudio(info))
        throwForUnplayableInfo(info);

    return info.download({
        type: "audio",
        quality: "best",
        format: "any",
    });
}

async function writeStreamToFile(stream: ReadableStream<Uint8Array>, filePath: string): Promise<void> {
    const writeStream = fs.createWriteStream(filePath);
    try {
        await pipeline(Readable.from(Utils.streamToIterable(stream)), writeStream);
    } catch (e) {
        writeStream.destroy();
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        throw e;
    }
}

async function downloadAudioToFile(videoId: string, filePath: string) {
    let lastError: unknown;

    for (let pass = 0; pass < 2; pass++) {
        for (const { authenticated, client } of getDownloadAttempts()) {
            try {
                const stream = await downloadWithClient(await getInnertube(authenticated), videoId, client);
                await writeStreamToFile(stream, filePath);
                return;
            } catch (e) {
                lastError = e;
                if (!isDownloadRetryableError(e))
                    throw e;
            }
        }

        if (pass === 0) {
            resetInnertubeSessions();
            continue;
        }
    }

    try {
        const innertube = await getInnertube(false);
        const info = await innertube.getBasicInfo(videoId, { client: "IOS" });
        if (!hasPlayableAudio(info))
            throwForUnplayableInfo(info);
        const stream = await info.download({
            type: "video+audio",
            quality: "bestefficiency",
            format: "any",
        });
        await writeStreamToFile(stream, filePath);
    } catch (e) {
        throw lastError ?? e;
    }
}

function isRateLimitError(err: unknown): boolean {
    if (!err || typeof err !== "object")
        return false;
    if ("statusCode" in err && (err as { statusCode?: number }).statusCode === 429)
        return true;
    const info = (err as { info?: { response?: Response; error_type?: string } }).info;
    return info?.response?.status === 429
        || (info?.error_type === "FETCH_FAILED" && info?.response?.status === 429);
}

export class Downloader {
    static validateVideoId(idOrUrl: string) {
        try {
            if (VIDEO_ID_REGEX.test(idOrUrl))
                return idOrUrl;
            const match = idOrUrl.match(VIDEO_URL_REGEX);
            return match?.[1] ?? null;
        } catch (e) {
            if (e instanceof Error)
                console.error(e.message)
            return null;
        }
    }
    static async getInfo(video: QueueVideo): Promise<OperationResult> {
        const res = new OperationResult();
        video.step = QueueVideoStep.GetInfo;
        try {
            const innertube = await getInnertube(!!loadCookies());
            const info = await innertube.getInfo(video.id);

            let authorName = info.basic_info.channel?.name ?? info.basic_info.author ?? "";

            if (authorName.endsWith(" - Topic") && authorName.length > 8) /* remove ' - Topic' */ {
                authorName = authorName.slice(0, -8);
            }

            const videoTitle = info.basic_info.title ?? "";
            const videoTitleSplit = videoTitle.split(" - ");
            if (videoTitleSplit.length === 2) {
                video.title = videoTitleSplit[1];
                video.artist = videoTitleSplit[0];
                video.album = authorName;
            }
            else {
                video.title = videoTitle;
                video.artist = authorName;
                if (video.title.startsWith(video.artist + " - ") && video.title.length > video.artist.length + 3) {
                    video.title = video.title.slice(video.artist.length + 3);
                }
            }

            if (info.basic_info.start_timestamp) {
                video.year = info.basic_info.start_timestamp.getFullYear().toString();
            }

            const musicTrack = info.music_tracks[0];
            if (musicTrack?.song && musicTrack?.artist) {
                video.title = musicTrack.song;
                video.artist = musicTrack.artist;
            }

            const thumbnails = info.basic_info.thumbnail;
            video.thumbnail = thumbnails?.length ? thumbnails[thumbnails.length - 1].url : "";

            return res.succeeded();
        } catch (e) {
            logError("Downloader / Get info", e);
            return res.failed("getInfoError");
        }
    }
    static async download(video: QueueVideo): Promise<OperationResult> {
        const res = new OperationResult();
        video.step = QueueVideoStep.DownloadVideo;
        try {
            const baseFileAddress = video.fileAddress = path.join(config.cacheDirectory, video.localId);
            const videoFileAddress = baseFileAddress + '.mp4';

            await downloadAudioToFile(video.id, videoFileAddress);

            video.mp4Size = getFileSizeInMegaBytes(videoFileAddress);

            await new Promise<void>((resolve, reject) => {
                http.get(video.thumbnail, function (thumbnailStream) {
                    const thumbnailFileAddress = baseFileAddress + (video.thumbnail.endsWith(".jpg") ? ".jpg" : ".webp");
                    const thumbnailWriteStream = fs.createWriteStream(thumbnailFileAddress);
                    thumbnailStream.pipe(thumbnailWriteStream)
                        .on("finish", function () {
                            video.thumbSize = getFileSizeInMegaBytes(thumbnailFileAddress);
                            resolve();
                        })
                        .on("error", reject);
                }).on("error", reject);
            });

            return res.succeeded();
        } catch (e) {
            const reason = (e as { info?: { reason?: string; status?: string } }).info;
            if (reason?.reason)
                console.error(`Downloader / Client rejected: ${reason.status ?? "?"} — ${reason.reason}`);
            logError("Downloader / Download video", e);
            if (isRateLimitError(e))
                return res.failed("youtubeRateLimit");
            return res.failed("downloadError");
        }
    }
    static async convert(video: QueueVideo): Promise<OperationResult> {
        const res = new OperationResult();
        video.step = QueueVideoStep.ConvertToAudio;
        return new Promise(resolve => {
            try {
                const baseFileAddress = video.fileAddress
                const audioFileAddress = baseFileAddress + '.mp3';
                const videoFileAddress = baseFileAddress + '.mp4';
                const mp3File = ffmpeg({ source: videoFileAddress })
                    .setFfmpegPath(config.ffmpegExe)
                    .withAudioCodec('libmp3lame')
                    .toFormat('mp3')
                    .on('error', function (err) {
                        logError("Downloader / FFMPEG error", err);
                        resolve(res.failed(video.error = "convertError"));
                    })
                    .on('end', function () {
                        video.mp3Size = getFileSizeInMegaBytes(audioFileAddress);
                        if (video.mp3Size > 50) {
                            video.error = "fileSizeOver50";
                            resolve(res.failed(video.error));
                        } else {
                            resolve(res.succeeded());
                        }
                    });
                mp3File.saveToFile(audioFileAddress);
            } catch (e) {
                logError("Downloader / Convert to MP3", e);
                resolve(res.failed(video.error ?? "convertError"));
            }
        });
    }
    static async generateCover(video: QueueVideo): Promise<OperationResult> {
        const res = new OperationResult();
        video.step = QueueVideoStep.GenerateCover;
        return new Promise(resolve => {
            try {
                const baseFileAddress = video.fileAddress;
                const jpgFilePath = baseFileAddress + ".jpg";

                const cropSides = async () => {
                    const result = await cropThumbnailSides(jpgFilePath);
                    resolve(result);
                };

                let biggerSide = "width";
                if (video.thumbnail.endsWith(".jpg")) {
                    cropSides();
                }
                else {
                    /* convert webp to jpg */
                    sharp(baseFileAddress + ".webp").toFile(jpgFilePath).then(async (newFileInfo) => {
                        biggerSide = newFileInfo.height > newFileInfo.width ? "height" : "width";
                        cropSides();
                    }).catch((err) => {
                        logError("Downloader / Convert WEBP cover to JPG", err);
                        video.error = "coverConvertError";
                        resolve(res.failed(video.error));
                    });
                }
            } catch (e) {
                logError("Downloader / Generate cover", e);
                resolve(res.failed(video.error ?? "coverConvertError"));
            }
        });
    }
    static async setMeta(video: QueueVideo): Promise<OperationResult> {
        const res = new OperationResult();
        video.step = QueueVideoStep.SetMeta;
        return new Promise(resolve => {
            try {
                const baseFileAddress = video.fileAddress;
                const options: NodeID3.Tags = {
                    title: video.title,
                    artist: video.artist,
                    year: video.year,
                    image: baseFileAddress + ".jpg"
                };
                if (video.album) {
                    options.album = video.album;
                }
                NodeID3.write(options, baseFileAddress + ".mp3", function (err) {
                    if (err) {
                        logError("Downloader / Write metadata", err);
                        video.error = "setMetaError";
                        resolve(res.failed(video.error));
                    }
                    else
                        resolve(res.succeeded());
                });
            } catch (e) {
                logError("Downloader / Set metadata", e);
                resolve(res.failed(video.error ?? "setMetaError"));
            }
        });
    }
}
