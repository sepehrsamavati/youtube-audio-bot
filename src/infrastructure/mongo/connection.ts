import mongoose from "mongoose";
import config from "../../config.js";
import { log } from "../../common/helpers/log.js";

mongoose.set('strictQuery', true);

export const connect = async () => {
    const connection = await mongoose.connect(config.connectionString);
    log("MongoDB connection established.");
    return connection;
};

export const closeConnection = async (): Promise<void> => {
    await mongoose.connection.close(false);
    log("MongoDB connection closed.");
    return;
};
