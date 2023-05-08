import { User } from "../../../common/types/user.js";
import { UserMode, UserType } from "../../../common/enums/user.enum.js";
import OperationResult from "../../../common/models/operationResult.js";

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
    getListOfAdmins(): Promise<number[]>;
    setUserMode(tgId: number, mode: UserMode): Promise<OperationResult>;
    setUserType(tgId: number, type: UserType): Promise<OperationResult>;
    canSubmitRequest(user: User): OperationResult;
    getTotalCount(): Promise<number>;
}
