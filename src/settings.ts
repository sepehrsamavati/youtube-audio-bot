import { logError } from "./common/helpers/log.js";
import { AppSettings } from "./common/interfaces/yta.interface.js";
import SettingsApplication from "./application/settings.application.js";

const settings: AppSettings = {
	defaultLang: "en",
	publicMode: false,
	shareAvailable: false,
	protectAudios: true
};

export const readFromDatabase = async (settingsApplication: SettingsApplication) => {
	const dbSettings = await settingsApplication.getAll();
	dbSettings
	?.forEach(setting => {
		const key = setting.key as keyof AppSettings;
		const rawValue = setting.value;
		try {
			const typeConstructor = settings[key].constructor;
			settings[key] = typeConstructor(JSON.parse(rawValue)) as never;
		} catch(e) {
			logError("Loading settings", e);
		}
	});
};

export default settings;
