import UIText from "../common/languages/uitext.js";
import OperationResult from "../common/models/operationResult.js";
import { UITextObj } from "../common/types/uitext.js";
import IUserInterfaceTextApplication from "./contracts/uitext/application.interface.js";
import IUserInterfaceTextRepository from "./contracts/uitext/repository.interface.js";

export default class UITextApplication implements IUserInterfaceTextApplication {
    constructor(
        private uitextRepository: IUserInterfaceTextRepository
    ){}
    async set(uitList: UITextObj[]): Promise<OperationResult> {
        const operationResult = new OperationResult();
        if(await this.uitextRepository.set(uitList)) {
            operationResult.succeeded();
        }
        return operationResult;
    }
    async get(): Promise<UITextObj[]> {
        return await this.uitextRepository.get() ?? UIText.getAll();
    }
};
