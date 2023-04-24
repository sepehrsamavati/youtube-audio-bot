import OperationResult from "../common/models/operationResult.js";
import IBroadcastApplication from "./contracts/broadcast/application.interface.js";
import UserRepository from "../infrastructure/mongo/repository/user.repository.js";
import BroadcastRepository from "../infrastructure/mongo/repository/broadcast.repository.js";

export default class BroadcastApplication implements IBroadcastApplication {
    constructor(
        private broadcastRepository: BroadcastRepository,
        private userRepository: UserRepository
    ){}
    async createNew(): Promise<IBroadcast> {
        const usersCount = await this.userRepository.count();
        const now = new Date();
        return {
            start: now, end: now,
            totalUsers: usersCount,
            usersReceived: 0
        };
    }
    async finish(broadcast: IBroadcast): Promise<OperationResult> {
        const operationResult = new OperationResult();

        if(await this.broadcastRepository.add(broadcast)) {
            operationResult.succeeded();
        }

        return operationResult;
    }
    async getStatistics(): Promise<{ count: number; last: Date; }> {
        return await this.broadcastRepository.getStatistics() ?? { count: 0, last: new Date(0) };
    }
}