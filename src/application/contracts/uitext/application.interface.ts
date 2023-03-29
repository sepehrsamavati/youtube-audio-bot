import OperationResult from "../../../common/models/operationResult.js";
import { UITextObj } from "../../../common/types/uitext.js";

export default interface IUserInterfaceTextApplication {
    set(uitList: UITextObj[]): Promise<OperationResult>;
    get(): Promise<UITextObj[]>;
}
