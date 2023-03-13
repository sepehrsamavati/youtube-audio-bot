import OperationResult from "../../../common/models/operationResult.js";
import { User } from "../../../common/types/user.js";

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
    getListOfAdmins(): Promise<number[]>;
    canSubmitRequest(user: User): OperationResult;
}
