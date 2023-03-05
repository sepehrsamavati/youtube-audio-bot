import mongoose from "mongoose";
import config from "../../config.js";

mongoose.set('strictQuery', true);
mongoose.connect(config.connectionString).then(() => {
    console.log("MongoDB connection established.");
});

const closeConnection = async (): Promise<void> => {
    await mongoose.connection.close(false);
    console.log("MongoDB connection closed.");
    return;
};

export {
	closeConnection
};
