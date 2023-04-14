import SettingsModel from "../models/settings.js";
import { logError } from "../../../common/helpers/log.js";
import ISettingsRepository from "../../../application/contracts/settings/repository.interface.js";

export default class SettingsRepository implements ISettingsRepository {
	async add(settings: Setting[]): Promise<boolean> {
		try {
			const res = await SettingsModel.insertMany<Setting[]>(settings);
			return Boolean(res);
		} catch(e) {
			logError("Settings Repository / add", e);
			return false;
		}
	}
	async update(setting: Setting): Promise<boolean> {
		try {
			const res = await SettingsModel.findOneAndUpdate(
				{ key: setting.key },
				{ value: setting.value, lastUpdate: setting.lastUpdate }
			);
			return Boolean(res);
		} catch(e) {
			logError("Settings Repository / update", e);
			return false;
		}
	}
	async get(key: string): Promise<Setting | null> {
		try {
			const setting = await SettingsModel.findOne({ key });
			return setting ? {
				key,
				value: setting.value,
				lastUpdate: setting.lastUpdate
			} : null;
		} catch(e) {
			logError("Settings Repository / get", e);
			return null;
		}
	}
	async getValue(key: string): Promise<string | null> {
		try {
			const setting = await SettingsModel.findOne({ key });
			return setting ? setting.value : null;
		} catch(e) {
			logError("Settings Repository / getValue", e);
			return null;
		}
	}
};
