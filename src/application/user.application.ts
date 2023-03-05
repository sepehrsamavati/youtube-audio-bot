import OperationResult from "../common/models/operationResult.js";
import UserRepository from "../infrastructure/mongo/repository/user.repository.js";
import IUserApplication from "./contracts/user/application.interface.js";

export default class UserApplication implements IUserApplication {
    constructor(
        private userRepository: UserRepository
    ){}
    canSubmitRequest(user: User): OperationResult {
        const operationResult = new OperationResult();

        if(!user.promotedBy)
            return operationResult.failed();

        return operationResult.succeeded();
    }

    async getByTgId(id: number): Promise<User | null> {
        let user = await this.userRepository.findByTgId(id);
        return user;
    }
};
