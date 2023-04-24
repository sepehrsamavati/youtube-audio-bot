import { User } from "../../../common/types/user.js";
import OperationResult from "../../../common/models/operationResult.js";

export default interface IStatisticsApplication {
    addBroadcast(): Promise<OperationResult>;
    getStatistics(): Promise<IStatistics>;
    getUserStatistics(user: User): Promise<IUserStatistics>;
}
