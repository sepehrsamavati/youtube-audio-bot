import fs from 'node:fs';
import sharp from "sharp";
import ytdl from "ytdl-core";
import path from 'node:path';
import http from 'node:https';
import NodeID3 from "node-id3";
import { Types } from 'mongoose';
import config from "../config.js";
import ffmpeg from "fluent-ffmpeg";
import { User } from '../common/types/user.js';
import { logError } from '../common/helpers/log.js';
import deleteFile from '../common/helpers/deleteFile.js';
import { QueueVideo } from '../common/models/queueVideo.js';
import { QueueVideoStep } from '../common/enums/video.enum.js';
import { StepCallback } from '../common/types/stepCallback.js';
import OperationResult from "../common/models/operationResult.js";
import getFileSizeInMegaBytes from "../common/helpers/getFileSize.js";
import cropThumbnailSides from "../common/helpers/cropThumbnailSides.js";
import IVideoApplication from "./contracts/video/application.interface.js";
import LikeRepository from '../infrastructure/mongo/repository/like.repository.js';
import ViewRepository from '../infrastructure/mongo/repository/view.repository.js';
import VideoRepository from '../infrastructure/mongo/repository/video.repository.js';

export default class VideoApplication implements IVideoApplication {
    constructor(
        private videoRepository: VideoRepository,
        private likeRepository: LikeRepository,
        private viewRepository: ViewRepository,
    ) { }

    queue: QueueVideo[] = [];

    async getRecentDownloads(count: number): Promise<Video[]> {
        return this.videoRepository.getRecentAdded(count);
    }
    async getLastWeekDownloads(count: number): Promise<Video[]> {
        const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return await this.videoRepository.getByDateRange(count, lastWeek, now);
    }
    async getLastWeekDownloadsCount(): Promise<number> {
        const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return this.videoRepository.getCountByDateRange(lastWeek, now);
    }
    async getTop(count: number): Promise<Video[]> {
        return this.videoRepository.getMostViewed(count);
    }
    getTotalCount(): Promise<number> {
        return this.videoRepository.getTotalCount();
    }
    getMostLiked(count: number): Promise<Video[]> {
        return this.videoRepository.getMostLiked(count);
    }
    async getAudio(videoYtId: string, userId: Types.ObjectId): Promise<AudioViewModel | null> {
        const video = await this.videoRepository.findByYtId(videoYtId);
        if (video) {
            if (!await this.viewRepository.isViewed(video._id, userId))
                await this.viewRepository.add(video._id, userId);
            return {
                vid: video.id,
                title: video.title,
                tgFileId: video.tgFileId,
                isLiked: await this.likeRepository.isLiked(video._id, userId)
            };
        }
        else
            return null;
    }
    async getRandomAudio(userId: Types.ObjectId): Promise<AudioViewModel | null> {
        const video = await this.videoRepository.getRandom();
        if (video) {
            if (!await this.viewRepository.isViewed(video._id, userId))
                await this.viewRepository.add(video._id, userId);
            return {
                vid: video.id,
                title: video.title,
                tgFileId: video.tgFileId,
                isLiked: await this.likeRepository.isLiked(video._id, userId)
            };
        }
        else
            return null;
    }
    async like(videoYtId: string, userId: Types.ObjectId): Promise<OperationResult> {
        let operationResult = new OperationResult();
        const videoId = await this.videoRepository.getIdByYtId(videoYtId);
        if (videoId) {
            if (await this.likeRepository.isLiked(videoId, userId)) {
                operationResult.failed("alreadyLiked");
            } else {
                operationResult = await this.likeRepository.like(videoId, userId);
            }
        }
        return operationResult;
    }
    async removeLike(videoYtId: string, userId: Types.ObjectId): Promise<OperationResult> {
        let operationResult = new OperationResult();
        const videoId = await this.videoRepository.getIdByYtId(videoYtId);
        if (videoId) {
            if (await this.likeRepository.isLiked(videoId, userId)) {
                operationResult = await this.likeRepository.removeLike(videoId, userId);
            } else {
                operationResult.failed("isNotLiked");
            }
        }
        return operationResult;
    }
    async add(queueVideo: QueueVideo, tgFileId: string): Promise<OperationResult> {
        let operationResult = new OperationResult();
        const userId = queueVideo.fromUser.id;
        const downloadSize = queueVideo.mp4Size + queueVideo.thumbSize;
        const uploadSize = queueVideo.mp3Size + queueVideo.thumbSize;

        const video = {
            id: queueVideo.id,
            tgFileId, title: queueVideo.title
        };

        let dbVideo = await this.videoRepository.create(video, userId, downloadSize, uploadSize);

        if (dbVideo) {
            const videoId = dbVideo._id;
            operationResult = await this.viewRepository.add(videoId, userId);
        }
        return operationResult;
    }

    #addToQueue(video: QueueVideo): boolean {
        // if (this.#getFromQueue(video.id)) {
        //     return false;
        // }
        this.queue.push(video);
        return true;
    }

    #getFromQueue(id: string): QueueVideo | undefined {
        return this.queue.find(qv => qv.id === id);
    }

    #removeFromQueue(id: string): boolean {
        const queueVideo = this.#getFromQueue(id);
        if (!queueVideo) return false;

        const index = this.queue.indexOf(queueVideo);
        if (index === -1) return false;

        this.queue.splice(index, 1);
        return true;
    }
    async startDownload(videoId: string, user: User, options: { minDelay: number, stepCallback: StepCallback }) {

        if (this.queue.length >= config.concurrentLimit) {
            options.stepCallback(null, false, "botIsBusy");
            return;
        }

        const queueVideo = new QueueVideo(videoId, user);

        if (this.queue.filter(qv => qv.fromUser.tgId === user.tgId).length >= config.concurrentLimitPerUser) {
            options.stepCallback(null, false, "reachedConcurrentDownloads");
            return;
        }

        if (!this.#addToQueue(queueVideo)) {
            options.stepCallback(null, false, "isBeingDownloaded");
            return;
        }

        const taskEnd = () => {
            this.#removeFromQueue(queueVideo.id);
        }, stepFinish = (success: boolean) => {
            queueVideo.lastUpdate = new Date();
            options.stepCallback({ ...queueVideo }, success);
        }, stepSleep = () => new Promise<void>(resolve => {
            const delay = options.minDelay - (new Date().getTime() - queueVideo.lastUpdate.getTime());

            if (delay > 10) {
                setTimeout(() => {
                    resolve();
                }, delay).unref();
            } else {
                resolve();
            }
        });

        /* Validation OK */
        stepFinish(true);

        const info = await VideoApplication.Downloader.getInfo(queueVideo);
        await stepSleep();
        stepFinish(info.ok);
        if (!info.ok) return taskEnd();

        const download = await VideoApplication.Downloader.download(queueVideo);
        await stepSleep();
        stepFinish(download.ok);
        if (!download.ok) return taskEnd();

        const convert = await VideoApplication.Downloader.convert(queueVideo);
        await stepSleep();
        stepFinish(convert.ok);
        if (!convert.ok) return taskEnd();

        const genCover = await VideoApplication.Downloader.generateCover(queueVideo);
        await stepSleep();
        stepFinish(genCover.ok);
        if (!genCover.ok) return taskEnd();

        const setMeta = await VideoApplication.Downloader.setMeta(queueVideo);
        await stepSleep();
        stepFinish(setMeta.ok);

        taskEnd();
    }
    flush(video: QueueVideo): void {
        ["webp", "jpg", "mp4", "mp3"]
            .forEach(ext => deleteFile(`${video.fileAddress}.${ext}`));
        this.#removeFromQueue(video.id);
    }

    static Downloader = class {
        static validateVideoId(idOrUrl: string) {
            try {
                if (ytdl.validateURL(idOrUrl))
                    return ytdl.getVideoID(idOrUrl);
                else if (ytdl.validateID(idOrUrl))
                    return idOrUrl;
                else
                    return null;
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
                const basicInfo = await ytdl.getBasicInfo(video.id);
                const { videoDetails } = basicInfo;

                if (videoDetails.author.name.endsWith(" - Topic") && videoDetails.author.name.length > 8) /* remove ' - Topic' */ {
                    videoDetails.author.name = videoDetails.author.name.slice(0, -8);
                }

                const videoTitleSplit = videoDetails.title.split(" - ");
                if (videoTitleSplit.length === 2) {
                    video.title = videoTitleSplit[1];
                    video.artist = videoTitleSplit[0];
                    video.album = videoDetails.author.name;
                }
                else {
                    video.title = videoDetails.title;
                    video.artist = videoDetails.author.name;
                    if (video.title.startsWith(video.artist + " - ") && video.title.length > video.artist.length + 3) {
                        video.title = video.title.slice(video.artist.length + 3);
                    }
                }


                if (videoDetails.publishDate) {
                    video.year = videoDetails.publishDate.split("-").shift() ?? "0";
                }
                if (videoDetails.media
                    && videoDetails.media.song
                    && videoDetails.media.artist) {
                    video.title = videoDetails.media.song;
                    video.artist = videoDetails.media.artist;
                    //info.album = videoDetails.media.album;
                }

                video.thumbnail = videoDetails.thumbnails.pop()?.url ?? "";

                return res.succeeded();
            } catch {
                return res.failed(video.error);
            }
        }
        static async download(video: QueueVideo): Promise<OperationResult> {
            const res = new OperationResult();
            video.step = QueueVideoStep.DownloadVideo;
            return new Promise(resolve => {
                try {
                    const baseFileAddress = video.fileAddress = path.join(config.cacheDirectory, video.localId);
                    const videoFileAddress = baseFileAddress + '.mp4';

                    const videoWriteStream = fs.createWriteStream(videoFileAddress);

                    videoWriteStream.on("finish", async function () {
                        video.mp4Size = getFileSizeInMegaBytes(videoFileAddress);

                        http.get(video.thumbnail, function (thumbnailStream) {
                            const thumbnailFileAddress = baseFileAddress + (video.thumbnail.endsWith(".jpg") ? ".jpg" : ".webp");
                            const thumbnailWriteStream = fs.createWriteStream(thumbnailFileAddress);
                            thumbnailStream.pipe(thumbnailWriteStream)
                                .on("finish", async function () {

                                    video.thumbSize = getFileSizeInMegaBytes(thumbnailFileAddress);

                                    resolve(res.succeeded());
                                });
                        });
                    });

                    ytdl(video.id, { quality: "highestaudio" }).pipe(videoWriteStream);
                } catch {
                    resolve(res.failed(video.error));
                }
            });
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
                            video.error = "convertError";
                            console.log('An error occurred: ' + err.message);
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
                    logError("Video application / FFMPEG convert to MP3", e);
                    resolve(res.failed(video.error));
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

                    /* convert webp to jpg */
                    sharp(baseFileAddress + ".webp").toFile(jpgFilePath).then(async (newFileInfo) => {
                        biggerSide = newFileInfo.height > newFileInfo.width ? "height" : "width";
                        cropSides();
                    }).catch((err) => {
                        logError("Video application / Convert WEBP cover to JPG", err);
                        video.error = "coverConvertError";
                        resolve(res.failed(video.error));
                    });
                } catch(e) {
                    logError("Video application / Generate cover", e);
                    resolve(res.failed(video.error));
                }
            });
        }
        static async setMeta(video: QueueVideo): Promise<OperationResult> {
            const res = new OperationResult();
            video.step = QueueVideoStep.SetMeta;
            return new Promise(resolve => {
                try {
                    const baseFileAddress = video.fileAddress;
                    const options: any = {
                        title: video.title,
                        artist: video.artist,
                        year: video.year,
                        APIC: baseFileAddress + ".jpg"
                    };
                    if (video.album) {
                        options.album = video.album;
                    }
                    NodeID3.write(options, baseFileAddress + ".mp3", function (err) {
                        if (err) {
                            logError("Video application / Write metadata", err);
                            video.error = "setCoverError";
                            resolve(res.failed(video.error));
                        }
                        else
                            resolve(res.succeeded());
                    });
                } catch(e) {
                    logError("Video application / Set metadata", e);
                    resolve(res.failed(video.error));
                }
            });
        }
    }
};
