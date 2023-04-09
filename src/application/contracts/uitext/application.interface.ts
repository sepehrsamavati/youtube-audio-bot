import { UITextObj } from "../../../common/types/uitext.js";
import OperationResult from "../../../common/models/operationResult.js";

export default interface IUserInterfaceTextApplication {
    set(lang: string, key: string, value: string): Promise<OperationResult>;
    get(): Promise<UITextObj[]>;
}
