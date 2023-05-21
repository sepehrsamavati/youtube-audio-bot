import { User } from "../../../common/types/user.js";
import OperationResult from "../../../common/models/operationResult.js";
import { UserMode, UserStatus, UserType } from "../../../common/enums/user.enum.js";

export default interface IUserApplication {
    getByTgId(id: number, createIfNotFound?: boolean, updateLastRequest?: boolean): Promise<User | null>;
    getByUsername(username: string): Promise<User | null>;
    getListOfAdmins(): Promise<number[]>;
    setUsername(tgId: number, username: string): Promise<OperationResult>;
    setUserMode(tgId: number, mode: UserMode): Promise<OperationResult>;
    setUserType(tgId: number, type: UserType): Promise<OperationResult>;
    setUsersStatus(tgIds: number[], status: UserStatus): Promise<OperationResult>;
    canSubmitRequest(user: User): OperationResult;
    getTotalCount(): Promise<number>;
    getBroadcastIdList(): Promise<number[]>;
}
