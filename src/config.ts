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
	admins: (process.env.YTA_DATA_INIT_ADMINS ?? "").split(',').map(id => parseInt(id)),
	connectionString: "",
	version: "-"
};

config.tgbot.botUrl = `${config.tgbot.api}${config.tgbot.token}/`;

Object.freeze(config);

export default config;