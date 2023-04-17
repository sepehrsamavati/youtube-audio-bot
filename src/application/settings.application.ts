import OperationResult from "../common/models/operationResult.js";
import ISettingsApplication from "./contracts/settings/application.interface.js";
import SettingsRepository from "../infrastructure/mongo/repository/settings.repository.js";

export default class SettingsApplication implements ISettingsApplication {
    constructor(
        private settingsRepository: SettingsRepository
    ){}
    async update(key: string, value: string | number | boolean): Promise<OperationResult> {
        const operationResult = new OperationResult();

        if(await this.settingsRepository.update({ key, value: JSON.stringify(value), lastUpdate: new Date() })) {
            operationResult.succeeded();
        }

        return operationResult;
    }
    get(key: string): Promise<string | null> {
        return this.settingsRepository.getValue(key);
    }
    getAll(): Promise<Setting[] | null> {
        return this.settingsRepository.getAll();
    }
}