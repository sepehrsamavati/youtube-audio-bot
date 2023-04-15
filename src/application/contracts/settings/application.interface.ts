import OperationResult from "../../../common/models/operationResult.js";

export default interface ISettingsApplication {
    update(key: string, value: string): Promise<OperationResult>;
    get(key: string): Promise<string | null>;
    getAll(): Promise<Setting[] | null>;
}
