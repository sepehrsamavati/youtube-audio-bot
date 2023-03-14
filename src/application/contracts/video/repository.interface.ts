import { HydratedDocument, Types } from "mongoose";

export default interface IVideoRepository {
    create(video: Video): Promise<HydratedDocument<Video> | null>;
    findByYtId(id: string): Promise<HydratedDocument<Video> | null>;
    getIdByYtId(id: string): Promise<Types.ObjectId | null>;
}
