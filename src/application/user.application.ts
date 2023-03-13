import OperationResult from "../common/models/operationResult.js";
import IUserApplication from "./contracts/user/application.interface.js";
import UserRepository from "../infrastructure/mongo/repository/user.repository.js";
import { User } from "../common/types/user.js";
import { UserType } from "../common/enums/user.enum.js";

export default class UserApplication implements IUserApplication {
    constructor(
        private userRepository: UserRepository
    ){}
    canSubmitRequest(user: User): OperationResult {
        const operationResult = new OperationResult();

        if(user.type === UserType.Admin)
            return operationResult.succeeded();

        if(!user.promotedBy)
            return operationResult.failed();

        return operationResult.succeeded();
    }

    async getByTgId(id: number): Promise<User | null> {
        let user = await this.userRepository.findByTgId(id) ?? await this.userRepository.createUser(id);
        return user;
    }
};
