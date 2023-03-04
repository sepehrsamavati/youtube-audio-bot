import OperationResult from "../../../common/models/operationResult";

export default interface IUserApplication {
    getByTgId(id: number): Promise<User | null>;
    canSubmitRequest(user: User): OperationResult;
}
