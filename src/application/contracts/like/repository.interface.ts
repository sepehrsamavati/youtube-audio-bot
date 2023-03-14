import { Types } from "mongoose";
import OperationResult from "../../../common/models/operationResult";

export default interface ILikeRepository {
    isLiked(vid: Types.ObjectId, uid: Types.ObjectId): Promise<boolean>;
    like(vid: Types.ObjectId, uid: Types.ObjectId): Promise<OperationResult>;
    removeLike(vid: Types.ObjectId, uid: Types.ObjectId): Promise<OperationResult>;
}
