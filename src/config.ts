// @ts-check
import dotenv from 'dotenv'
dotenv.config();

const config = {
	tgbot: {
        token: process.env.YTA_TG_TOKEN,
        api: "https://api.telegram.org/bot",
        botUrl: ""
    },
	defaultLang: "en",
	cacheDirectory: "./.data/YTAudio/files/",
	ffmpegExe: process.env.YTA_FFMPEG_EXE ?? "",
	maxThreads: parseInt(process.env.YTA_CONCURRENT_DOWNLOADS ?? "2"),
	timeout: parseInt(process.env.YTA_STEP_TIMEOUT ?? "20"),
	owners: (process.env.YTA_TG_OWNERS ?? "").split(',').map(id => parseInt(id)),
	connectionString: process.env.YTA_MONGODB ?? "",
	version: "-"
};

config.tgbot.botUrl = `${config.tgbot.api}${config.tgbot.token}/`;

Object.freeze(config);

export default config;
