import OperationResult from "../common/models/operationResult";
import UserRepository from "../infrastructure/mongo/repository/userRepository";
import IUserApplication from "./contracts/user/application.interface";

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
