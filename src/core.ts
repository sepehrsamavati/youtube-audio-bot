import fs from 'node:fs';
import config from './config.js';
import './infrastructure/mongo/connection.js';

if(!fs.existsSync(config.cacheDirectory))
    fs.mkdirSync(config.cacheDirectory, { recursive: true });

import './tgbot/app.js';
