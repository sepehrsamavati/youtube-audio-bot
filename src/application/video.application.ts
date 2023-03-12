import fs from 'node:fs';
import path from 'node:path';
import http from 'node:https';
import sharp from "sharp";
import ytdl from "ytdl-core";
import NodeID3 from "node-id3";
import ffmpeg from "fluent-ffmpeg";
import config from "../config.js";
import OperationResult from "../common/models/operationResult.js";
import IVideoApplication from "./contracts/video/application.interface.js";
import getFileSizeInMegaBytes from "../common/helpers/getFileSize.js";
import cropThumbnailSides from "../common/helpers/cropThumbnailSides.js";
import { QueueVideo } from '../common/models/queueVideo.js';
import { QueueVideoStep } from '../common/enums/video.enum.js';
import VideoRepository from '../infrastructure/mongo/repository/video.repository.js';
import LikeRepository from '../infrastructure/mongo/repository/like.repository.js';
import ViewRepository from '../infrastructure/mongo/repository/view.repository.js';

export default class VideoApplication implements IVideoApplication {
    constructor(
        private videoRepository: VideoRepository,
        private likeRepository: LikeRepository,
        private viewRepository: ViewRepository,
    ) { }

    queue: QueueVideo[] = [];

    get(videoId: string): Promise<Video | null> {
        return this.videoRepository.findById(videoId);
    }
    async getAudio(videoId: string, userId: number): Promise<AudioViewModel | null> {
        const video = await this.get(videoId);
        if(video)
        {
            if(!await this.viewRepository.isViewed(videoId, userId))
                await this.viewRepository.add(videoId, userId);

            return {
                vid: video.id,
                title: video.title,
                tgFileId: video.tgFileId,
                isLiked: await this.likeRepository.isLiked(video.id, userId)
            };
        }
        else
            return null;
    }
    async like(videoId: string, userId: number): Promise<OperationResult> {
        let operationResult = new OperationResult();
        if(await this.likeRepository.isLiked(videoId, userId)) {
            operationResult.failed("alreadyLiked");
        } else {
            operationResult = await this.likeRepository.like(videoId, userId);
        }
        return operationResult;
    }
    async removeLike(videoId: string, userId: number): Promise<OperationResult> {
        let operationResult = new OperationResult();
        if(await this.likeRepository.isLiked(videoId, userId)) {
            operationResult = await this.likeRepository.removeLike(videoId, userId);
        } else {
            operationResult.failed("isNotLiked");
        }
        return operationResult;
    }
    add(video: Video): Promise<OperationResult> {
        return this.videoRepository.create(video);
    }

    #addToQueue(video: QueueVideo): boolean {
        if (this.#getFromQueue(video.id)) {
            return false;
        }
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
    async startDownload(videoId: string, stepCallback: StepCallback) {
        const queueVideo = new QueueVideo(videoId);
        this.#addToQueue(queueVideo);

        const taskEnd = () => {
            this.#removeFromQueue(queueVideo.id);
        }, stepFinish = (success: boolean) => {
            stepCallback({...queueVideo}, success);
        };

        const info = await VideoApplication.Downloader.getInfo(queueVideo);
        stepFinish(info.ok);
        if (!info.ok) return taskEnd();

        const download = await VideoApplication.Downloader.download(queueVideo);
        stepFinish(download.ok);
        if (!download.ok) return taskEnd();

        const convert = await VideoApplication.Downloader.convert(queueVideo);
        stepFinish(convert.ok);
        if (!convert.ok) return taskEnd();

        const genCover = await VideoApplication.Downloader.generateCover(queueVideo);
        stepFinish(genCover.ok);
        if (!genCover.ok) return taskEnd();

        const setMeta = await VideoApplication.Downloader.setMeta(queueVideo);
        stepFinish(setMeta.ok);

        taskEnd();
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
                } catch {
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
                    sharp(baseFileAddress + ".webp").toFile(jpgFilePath).then(async (newFileInfo) => { /* convert webp to jpg */
                        biggerSide = newFileInfo.height > newFileInfo.width ? "height" : "width";
                        cropSides();
                    }).catch((err) => {
                        video.error = "coverConvertError";
                        resolve(res.failed(video.error));
                    });
                } catch {
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
                            video.error = "setCoverError";
                            resolve(res.failed(video.error));
                        }
                        else
                            resolve(res.succeeded());
                    });
                } catch {
                    resolve(res.failed(video.error));
                }
            });
        }
    }
};
