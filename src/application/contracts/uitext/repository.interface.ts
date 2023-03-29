import { UITextObj } from "../../../common/types/uitext.js";

export default interface IUserInterfaceTextRepository {
    set(uitList: UITextObj[]): Promise<boolean>;
    get(): Promise<UITextObj[] | null>;
}
