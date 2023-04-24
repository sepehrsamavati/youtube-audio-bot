import { UITextObj } from "../../../common/types/uitext.js";

export default interface IUserInterfaceTextRepository {
    add(lang: string, key: string, value: string): Promise<boolean>;
    set(lang: string, key: string, value: string): Promise<boolean>;
    getAll(): Promise<Partial<UITextObj>[] | null>;
}
