import mongoose from "mongoose";
import config from "../../config";

mongoose.set('strictQuery', true);
mongoose.connect(config.connectionString);

const closeConnection = async (): Promise<void> => {
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
    return;
};

export {
	closeConnection
};
