import OperationResult from "../../../common/models/operationResult.js";

export default interface IBroadcastApplication {
    createNew(targetUsers: number): IBroadcast;
    finish(broadcast: IBroadcast): Promise<OperationResult>;
    getStatistics(): Promise<{ count: number; last: Date; }>;
}
