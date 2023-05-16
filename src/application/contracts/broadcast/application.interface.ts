import { BroadcastType, IBroadcast } from "../../../common/interfaces/broadcast.interface.js";
import OperationResult from "../../../common/models/operationResult.js";

export default interface IBroadcastApplication {
    createNew(targetUsers: number, type: BroadcastType): IBroadcast;
    finish(broadcast: IBroadcast): Promise<OperationResult>;
    getStatistics(): Promise<{ count: number; last: Date; }>;
}
