import { Types } from "mongoose";
import OperationResult from "../../../common/models/operationResult";

export default interface IViewRepository {
    isViewed(vid: Types.ObjectId, uid: Types.ObjectId): Promise<boolean>;
    add(vid: Types.ObjectId, uid: Types.ObjectId): Promise<OperationResult>;
    getTotalCount(): Promise<number>;
}
