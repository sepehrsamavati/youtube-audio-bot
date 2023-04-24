import { HydratedDocument, Types } from "mongoose";
import IVideo from "../../../common/interfaces/video.interface.js";

export default interface IVideoRepository {
    create(video: Video, uid: Types.ObjectId, download: number, upload: number): Promise<IVideo | null>;
    findByYtId(id: string): Promise<IVideo | null>;
    getIdByYtId(id: string): Promise<Types.ObjectId | null>;
    getMostViewed(count: number): Promise<Video[]>;
    getMostLiked(count: number): Promise<Video[]>;
    getRecentAdded(count: number): Promise<Video[]>;
    getByDateRange(limit: number, from: Date, to: Date): Promise<Video[]>;
}
