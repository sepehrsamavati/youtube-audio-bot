import mongoose from "mongoose";
import config from "../../config.js";

mongoose.set('strictQuery', true);

export const connect = async () => {
    const connection = await mongoose.connect(config.connectionString);
    console.log("MongoDB connection established.");
    return connection;
};

export const closeConnection = async (): Promise<void> => {
    await mongoose.connection.close(false);
    console.log("MongoDB connection closed.");
    return;
};
