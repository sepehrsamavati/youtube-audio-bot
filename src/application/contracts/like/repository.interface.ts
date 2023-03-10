import OperationResult from "../../../common/models/operationResult";
import { ChatID } from "../../../common/types/tgBot";

export default interface ILikeRepository {
    isLiked(vid: string, uid: ChatID): Promise<boolean>;
    like(vid: string, uid: ChatID): Promise<OperationResult>;
    removeLike(vid: string, uid: ChatID): Promise<OperationResult>;
}
