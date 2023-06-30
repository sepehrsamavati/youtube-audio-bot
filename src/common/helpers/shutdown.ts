import { closeConnection } from "../../infrastructure/mongo/connection.js";

export default async function() {
    await closeConnection();
    process.exitCode = 0;
}