import fs from 'node:fs';
import config from './config.js';
import './infrastructure/mongo/connection.js';
import VideoApplication from './application/video.application.js';
import TelegramBot from './tgbot/app.js';
import YTAServices from './common/interfaces/yta.interface.js';

if(!fs.existsSync(config.cacheDirectory))
    fs.mkdirSync(config.cacheDirectory, { recursive: true });

class Services implements YTAServices {
    videoApplication: VideoApplication;

    constructor(){
        this.videoApplication = new VideoApplication();
    }
}

const services = new Services();
    
const tgBot = new TelegramBot(services);
