import OperationResult from "../../../common/models/operationResult.js";
import { User } from "../../../common/types/user.js";

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
    canSubmitRequest(user: User): OperationResult;
}
