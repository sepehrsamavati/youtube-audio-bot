import OperationResult from "../../../common/models/operationResult.js";

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
    canSubmitRequest(user: User): OperationResult;
}
