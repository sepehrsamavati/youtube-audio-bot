import { UITextObj } from "../../../common/types/uitext.js";
import IUserInterfaceTextRepository from "../../../application/contracts/uitext/repository.interface.js";

export default class UITextRepository implements IUserInterfaceTextRepository {
	async set(uitList: UITextObj[]): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	async get(): Promise<UITextObj[] | null> {
		throw new Error("Method not implemented.");
	}
};
