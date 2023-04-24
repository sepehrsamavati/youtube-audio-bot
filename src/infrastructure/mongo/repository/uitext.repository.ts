import UITextModel from "../models/uitext.js";
import { logError } from "../../../common/helpers/log.js";
import { UITextObj } from "../../../common/types/uitext.js";
import IUserInterfaceTextRepository from "../../../application/contracts/UIText/repository.interface.js";

export default class UITextRepository implements IUserInterfaceTextRepository {
	async add(lang: string, key: string, value: string): Promise<boolean> {
		try {
			const res = await UITextModel.create({
				lang,
				key, value
			});
			return Boolean(res._id);
		} catch(e) {
			logError("UIText repository add", e);
			return false;
		}
	}
	async set(lang: string, key: string, value: string): Promise<boolean> {
		try {
			const res = await UITextModel.findOneAndUpdate({
				lang,
				key
			}, {
				value
			});
			return Boolean(res?._id);
		} catch {
			return false;
		}
	}
	async getAll(): Promise<Partial<UITextObj>[] | null> {
		try {
			const dbUiTexts: {
				_id: string,
				dictionary: ({ key: string; value: string })[]
			}[] = await UITextModel
				.aggregate([
					{
						$group: {
							_id: "$lang",
							dictionary: {
								$push: { "key": "$key" , "value": "$value" }
							}
						}
					}
				])
                .exec();
			return dbUiTexts.map(item => {
				const uitext: Partial<UITextObj> = {};
				item.dictionary.forEach(uit => {
					uitext[uit.key as keyof UITextObj] = uit.value;
				});
				return uitext;
			});
		} catch {
			return null;
		}
	}
};
