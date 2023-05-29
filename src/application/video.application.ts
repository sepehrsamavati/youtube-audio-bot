import { Types } from 'mongoose';
import config from "../config.js";
import { User } from '../common/types/user.js';
import { UITextObj } from '../common/types/uitext.js';
import { Downloader } from './downloader.application.js';
import deleteFile from '../common/helpers/deleteFile.js';
import { QueueVideo } from '../common/models/queueVideo.js';
import { StepCallback } from '../common/types/stepCallback.js';
import OperationResult from "../common/models/operationResult.js";
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
        }, stepFinish = (result: OperationResult) => {
            queueVideo.lastUpdate = new Date();
            if(queueVideo.canceled) {
                result.failed("canceledByUser");
            }
            options.stepCallback({ ...queueVideo }, result.ok, result.ok ? undefined : result.message);
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
        stepFinish(new OperationResult().succeeded());

        const info = await VideoApplication.Downloader.getInfo(queueVideo);
        await stepSleep();
        stepFinish(info);
        if (!info.ok) return taskEnd();

        const download = await VideoApplication.Downloader.download(queueVideo);
        await stepSleep();
        stepFinish(download);
        if (!download.ok) return taskEnd();

        const convert = await VideoApplication.Downloader.convert(queueVideo);
        await stepSleep();
        stepFinish(convert);
        if (!convert.ok) return taskEnd();

        const genCover = await VideoApplication.Downloader.generateCover(queueVideo);
        await stepSleep();
        stepFinish(genCover);
        if (!genCover.ok) return taskEnd();

        const setMeta = await VideoApplication.Downloader.setMeta(queueVideo);
        await stepSleep();
        stepFinish(setMeta);

        taskEnd();
    }
    flush(video: QueueVideo): void {
        ["webp", "jpg", "mp4", "mp3"]
            .forEach(ext => deleteFile(`${video.fileAddress}.${ext}`));
        this.#removeFromQueue(video.id);
    }

    cancelDownload(reqByTgId: number): keyof UITextObj {
        const downloads = this.queue.filter(qv => qv.canceled === false && qv.fromUser.tgId === reqByTgId);
        if(!downloads.length) return "nothingToCancel";

        downloads.forEach(d => d.canceled = true);

        return "downloadsCanceled";
    }

    static Downloader = Downloader;
};
