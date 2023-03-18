import { UserMode } from "../../../common/enums/user.enum.js";
import OperationResult from "../../../common/models/operationResult.js";
import { User } from "../../../common/types/user.js";

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
    getListOfAdmins(): Promise<number[]>;
    setUserMode(tgId: number, mode: UserMode): Promise<OperationResult>;
    canSubmitRequest(user: User): OperationResult;
}
