import fs from 'node:fs';
import config from './config.js';
import * as database from './infrastructure/mongo/connection.js';
import VideoApplication from './application/video.application.js';
import TelegramBot from './tgbot/app.js';
import YTAServices from './common/interfaces/yta.interface.js';
import UserApplication from './application/user.application.js';
import UserRepository from './infrastructure/mongo/repository/user.repository.js';
import VideoRepository from './infrastructure/mongo/repository/video.repository.js';
import LikeRepository from './infrastructure/mongo/repository/like.repository.js';
import ViewRepository from './infrastructure/mongo/repository/view.repository.js';
import clearDirectory from './common/helpers/clearDirectory.js';

if (!fs.existsSync(config.cacheDirectory))
    fs.mkdirSync(config.cacheDirectory, { recursive: true });

database.connect();

class Services implements YTAServices {
    videoApplication: VideoApplication;
    userApplication: UserApplication;

    constructor() {
        const likeRepository = new LikeRepository();
        const viewRepository = new ViewRepository();
        const userRepository = new UserRepository();

        const videoRepository = new VideoRepository();
        this.videoApplication = new VideoApplication(userRepository, videoRepository, likeRepository, viewRepository);

        this.userApplication = new UserApplication(userRepository);
    }
}

clearDirectory(config.cacheDirectory);

const services = new Services();

const tgBot = new TelegramBot(services);

process.once("SIGINT", async () => {
    await database.closeConnection();
    process.exit();
});
