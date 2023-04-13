import fs from 'node:fs';
import config from './config.js';
import TelegramBot from './tgbot/app.js';
import Services from './common/services.js';
import clearDirectory from './common/helpers/clearDirectory.js';
import * as database from './infrastructure/mongo/connection.js';
import UIText from './common/languages/UIText.js';

if (!fs.existsSync(config.cacheDirectory))
    fs.mkdirSync(config.cacheDirectory, { recursive: true });

await database.connect();

clearDirectory(config.cacheDirectory);

const services = new Services();

UIText.texts = await services.UITApplication.get();

const tgBot = new TelegramBot(services);

process.once("SIGINT", async () => {
    await database.closeConnection();
    process.exit();
});
