const config = {
	token: "1818346970:AAHcILX18YPgB4owJOckauhUTfEaGFYQ6Wo", // Telegram bot API token
	dir: "YTAudio/files/", // Download directory
	ffmpegExe: "C:/Users/Administrator/Desktop/YTAudio/ffmpeg/bin/ffmpeg.exe", // Path to ffmpeg.exe for converting
	dataFile: "botYTADB.json", // Path to file to save data
	maxThreads: 2, // Downloads limit
	timeout: 20, // Step timeout in seconds (download, convert and ...)
	version: "1.1.5"
};

exports.token = config.token;
exports.dir = config.dir;
exports.ffmpegExe = config.ffmpegExe;
exports.dataFile = config.dataFile;
exports.maxThreads = config.maxThreads;
exports.TIMEOUT = config.timeout;
exports.appVersion = config.version;