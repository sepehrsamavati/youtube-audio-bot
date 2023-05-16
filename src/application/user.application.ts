import { User } from "../common/types/user.js";
import { UserMode, UserStatus, UserType } from "../common/enums/user.enum.js";
import OperationResult from "../common/models/operationResult.js";
import IUserApplication from "./contracts/user/application.interface.js";
import UserRepository from "../infrastructure/mongo/repository/user.repository.js";
import config from "../config.js";
import settings from "../settings.js";

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

    async setUserMode(tgId: number, mode: UserMode): Promise<OperationResult> {
        const operationResult = new OperationResult();
        if(await this.userRepository.updateUserMode(tgId, mode)) {
            operationResult.succeeded();
        }
        return operationResult;
    }

    async setUserType(tgId: number, type: UserType): Promise<OperationResult> {
        const operationResult = new OperationResult();
        if(await this.userRepository.updateUserType(tgId, type)) {
            operationResult.succeeded();
        }
        return operationResult;
    }

    async setUsersStatus(tgIds: number[], status: UserStatus): Promise<OperationResult> {
        const operationResult = new OperationResult();

        if(await this.userRepository.updateUsersStatus(tgIds, status)) {
            operationResult.succeeded();
        }

        return operationResult;
    }

    getListOfAdmins(): Promise<number[]> {
        return this.userRepository.getAdmins();
    }

    async getByTgId(id: number, createIfNotFound: boolean = false, updateLastRequest: boolean = false): Promise<User | null> {
        let user = await this.userRepository.findByTgId(id, updateLastRequest)
            ?? (createIfNotFound ? await this.userRepository.createUser({
				tgId: id,
				mode: UserMode.Default,
				type: config.owners.includes(id) ? UserType.Admin : UserType.Default,
				language: settings.defaultLang,
				lastRequest: new Date(),
				status: UserStatus.OK
			}) : null);
        return user;
    }
    getTotalCount(): Promise<number> {
        return this.userRepository.count();
    }

    getBroadcastIdList(): Promise<number[]> {
        return this.userRepository.getBroadcastValidUserIds();
    }
};
