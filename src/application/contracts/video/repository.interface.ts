import { HydratedDocument, Types } from "mongoose";

export default interface IVideoRepository {
    create(video: Video, uid: Types.ObjectId, download: number, upload: number): Promise<HydratedDocument<Video> | null>;
    findByYtId(id: string): Promise<HydratedDocument<Video> | null>;
    getIdByYtId(id: string): Promise<Types.ObjectId | null>;
    getMostViewed(count: number): Promise<HydratedDocument<Video>[]>;
    getMostLiked(count: number): Promise<HydratedDocument<Video>[]>;
    getByDateRange(limit: number, from: Date, to: Date): Promise<HydratedDocument<Video>[]>;
}
