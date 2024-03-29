import fs from 'node:fs';
import config from './config.js';
import TelegramBot from './tgbot/app.js';
import * as settings from './settings.js';
import Services from './common/services.js';
import UIText from './common/languages/UIText.js';
import clearDirectory from './common/helpers/clearDirectory.js';
import * as database from './infrastructure/mongo/connection.js';

if (!fs.existsSync(config.cacheDirectory))
    fs.mkdirSync(config.cacheDirectory, { recursive: true });

await database.connect();

clearDirectory(config.cacheDirectory);

const services = new Services();

await settings.readFromDatabase(services.settingsApplication);

UIText.texts = await services.UITApplication.get();

const tgBot = new TelegramBot(services);

process.once("SIGINT", async () => {
    await database.closeConnection();
    process.exit();
});
