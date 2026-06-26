import fs from 'node:fs';
import sharp from "sharp";
import path from 'node:path';
import http from 'node:https';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import NodeID3 from "node-id3";
import config from '../config.js';
import ffmpeg from "fluent-ffmpeg";
import { Innertube, Utils } from "youtubei.js";
import { logError } from '../common/helpers/log.js';
import { QueueVideo } from '../common/models/queueVideo.js';
import { QueueVideoStep } from '../common/enums/video.enum.js';
import OperationResult from '../common/models/operationResult.js';
import getFileSizeInMegaBytes from "../common/helpers/getFileSize.js";
import cropThumbnailSides from "../common/helpers/cropThumbnailSides.js";

type CookieJson = { name: string; value: string; domain?: string };

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const VIDEO_URL_REGEX = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;

let innertubePromise: Promise<Innertube> | undefined;

function cookiesJsonToString(cookies: CookieJson[]): string {
    return cookies
        .filter(c => !c.domain || c.domain.includes("youtube.com"))
        .map(c => `${c.name}=${c.value}`)
        .join("; ");
}

async function getInnertube(): Promise<Innertube> {
    if (!innertubePromise) {
        const options: { cookie?: string } = {};
        if (config.cookiesPath) {
            const cookies = JSON.parse(fs.readFileSync(config.cookiesPath, "utf8")) as CookieJson[];
            options.cookie = cookiesJsonToString(cookies);
        }
        innertubePromise = Innertube.create(options);
    }
    return innertubePromise;
}

function isRateLimitError(err: unknown): boolean {
    if (!err || typeof err !== "object")
        return false;
    if ("statusCode" in err && (err as { statusCode?: number }).statusCode === 429)
        return true;
    const info = (err as { info?: { response?: Response } }).info;
    return info?.response?.status === 429;
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
            const innertube = await getInnertube();
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

            const innertube = await getInnertube();
            const downloadStream = await innertube.download(video.id, {
                type: "audio",
                quality: "best",
            });

            const videoWriteStream = fs.createWriteStream(videoFileAddress);
            await pipeline(Readable.from(Utils.streamToIterable(downloadStream)), videoWriteStream);

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
