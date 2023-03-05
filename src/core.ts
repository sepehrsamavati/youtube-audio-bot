import fs from 'node:fs';
import config from './config.js';
import { closeConnection } from './infrastructure/mongo/connection.js';

if(!fs.existsSync(config.cacheDirectory))
    fs.mkdirSync(config.cacheDirectory, { recursive: true });
