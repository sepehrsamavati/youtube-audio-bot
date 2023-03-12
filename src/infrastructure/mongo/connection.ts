import mongoose from "mongoose";
import config from "../../config.js";

mongoose.set('strictQuery', true);

export const connect = () => {
    mongoose.connect(config.connectionString).then(() => {
        console.log("MongoDB connection established.");
    });
};

export const closeConnection = async (): Promise<void> => {
    await mongoose.connection.close(false);
    console.log("MongoDB connection closed.");
    return;
};
