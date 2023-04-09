import UIText from "../common/languages/UIText.js";
import { UITextObj } from "../common/types/uitext.js";
import OperationResult from "../common/models/operationResult.js";
import IUserInterfaceTextRepository from "./contracts/UIText/repository.interface.js";
import IUserInterfaceTextApplication from "./contracts/UIText/application.interface.js";

export default class UITextApplication implements IUserInterfaceTextApplication {
    constructor(
        private uitextRepository: IUserInterfaceTextRepository
    ){}
    async set(lang: string, key: string, value: string): Promise<OperationResult> {
        const operationResult = new OperationResult();
        if(await this.uitextRepository.set(lang, key, value)) {
            operationResult.succeeded();
        }
        return operationResult;
    }
    async get(): Promise<UITextObj[]> {
        const fullUIT = UIText.getAll();
        const dbUIT = await this.uitextRepository.getAll();
        if(dbUIT) {
            dbUIT.forEach(UIT => {
                const langFullUIT = fullUIT.find(item => item._lang === UIT._lang);
                if(langFullUIT) {
                    for(const key of Object.keys(langFullUIT)) {
                        const value = UIT[key as keyof UITextObj];
                        if(value != undefined) {
                            langFullUIT[key as keyof UITextObj] = value;
                        }
                    }
                }
            });
        }
        return fullUIT;
    }
};
