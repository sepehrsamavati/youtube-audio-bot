import { User } from "../common/types/user.js";
import OperationResult from "../common/models/operationResult.js";
import IStatisticsApplication from "./contracts/statistics/application.interface.js";
import StatisticsRepository from "../infrastructure/mongo/repository/statistics.repository.js";

export default class StatisticsApplication implements IStatisticsApplication {
    constructor(
        private statisticsRepository: StatisticsRepository
    ){}
    addBroadcast(): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
    getStatistics(): Promise<IStatistics> {
        throw new Error("Method not implemented.");
    }
    getUserStatistics(user: User): Promise<IUserStatistics> {
        throw new Error("Method not implemented.");
    }
}