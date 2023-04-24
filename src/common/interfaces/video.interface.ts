import { Types } from "mongoose";

export default interface IVideo {
    _id: Types.ObjectId;
    id: string;
    title: string;
    tgFileId: string;
}