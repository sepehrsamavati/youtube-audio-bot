import { Types } from "mongoose";
import { UITextObj } from "../../../common/types/uitext.js";
import { QueueVideo } from "../../../common/models/queueVideo.js";
import OperationResult from "../../../common/models/operationResult.js";

export default interface IVideoApplication {
    getAudio(videoId: string, userId: Types.ObjectId): Promise<AudioViewModel | null>;
    getRandomAudio(userId: Types.ObjectId): Promise<AudioViewModel | null>;
    like(videoId: string, userId: Types.ObjectId): Promise<OperationResult>;
    removeLike(videoId: string, userId: Types.ObjectId): Promise<OperationResult>;
    add(queueVideo: QueueVideo, tgFileId: string): Promise<OperationResult>;
    getRecentDownloads(count: number): Promise<Video[]>;
    getLastWeekDownloads(count: number): Promise<Video[]>;
    getLastWeekDownloadsCount(): Promise<number>;
    getTotalCount(): Promise<number>;
    getTop(count: number): Promise<Video[]>;
    getMostLiked(count: number): Promise<Video[]>;
    cancelDownload(reqByTgId: number): keyof UITextObj;
}
