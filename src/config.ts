import dotenv from 'dotenv';
import fs from "node:fs/promises";
import { logError } from './common/helpers/log.js';
dotenv.config();

const config = {
	isDevelopment: process.env.NODE_ENV === "development",
	whiteListChats: process.env.YTA_WHITELIST_CHATS?.split(',').map(item => item.trim()) ?? [],
	tgbot: {
        token: process.env.YTA_TG_TOKEN ?? "",
        api: "https://api.telegram.org/bot",
        botUrl: ""
    },
	cacheDirectory: process.env.YTA_CACHE_DIR ?? "./.data/YTAudio/files/",
	ffmpegExe: process.env.YTA_FFMPEG_EXE ?? "",
	concurrentLimitPerUser: parseInt(process.env.YTA_USER_CONCURRENT_DOWNLOADS ?? "1"),
	concurrentLimit: parseInt(process.env.YTA_TOTAL_CONCURRENT_DOWNLOADS ?? "2"),
	owners: (process.env.YTA_TG_OWNERS ?? "").split(',').map(id => parseInt(id)),
	connectionString: process.env.YTA_MONGODB ?? "",
	version: process.env.npm_package_version ?? "-",
	cookiesPath: process.env.YTA_COOKIES_JSON_PATH ?? ""
};

config.tgbot.botUrl = `${config.tgbot.api}${config.tgbot.token}/`;

if(config.version === "-") {
	try {
		const packageJsonBuffer = await fs.readFile("./package.json");
		config.version = JSON.parse(packageJsonBuffer.toString()).version;
	} catch(e) {
		logError("Config / Reading package.json", e);
	}
}

Object.freeze(config.tgbot);
Object.freeze(config);

export default config;
