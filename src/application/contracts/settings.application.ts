import OperationResult from "../../common/models/operationResult";
import SettingsRepository from "../../infrastructure/mongo/repository/settings.repository";
import ISettingsApplication from "./settings/application.interface";

export default class SettingsApplication implements ISettingsApplication {
    constructor(
        private settingsRepository: SettingsRepository
    ){}
    async update(key: string, value: string): Promise<OperationResult> {
        const operationResult = new OperationResult();

        if(await this.settingsRepository.update({ key, value, lastUpdate: new Date() })) {
            operationResult.succeeded();
        }

        return operationResult;
    }
    get(key: string): Promise<string | null> {
        return this.settingsRepository.getValue(key);
    }
}