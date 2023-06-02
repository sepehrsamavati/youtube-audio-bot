import settings from "../settings.js";
import { log } from "../common/helpers/log.js";
import { AppSettings } from "../common/interfaces/yta.interface.js";
import SettingsRepository from "../infrastructure/mongo/repository/settings.repository.js";

export const settingsKeyList: (keyof AppSettings)[] = [
    "publicMode",
    "shareAvailable",
    "defaultLang",
    "protectAudios"
];

export default async (settingsRepository: SettingsRepository) => {

    const now = new Date();
    const seedSettings: Setting[] = settingsKeyList.map(item => {
        return {
            key: item,
            value: JSON.stringify(settings[item]),
            lastUpdate: now
        };
    });

    log(`Seeding settings ${seedSettings.length} item(s)`);

    const res = await settingsRepository.add(seedSettings);

    log(`Settings seed success: ${res}`);
}