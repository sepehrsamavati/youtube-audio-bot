import OperationResult from "../../../common/models/operationResult";
import { ChatID } from "../../../common/types/tgBot";

export default interface IViewRepository {
    isViewed(vid: string, uid: ChatID): Promise<boolean>;
    add(vid: string, uid: ChatID): Promise<OperationResult>;
}
