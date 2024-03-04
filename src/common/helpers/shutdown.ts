import { ExitCode } from "../enums/exitCode.enum.js";
import { closeConnection } from "../../infrastructure/mongo/connection.js";

export default async function() {
    await closeConnection();
    process.exit(ExitCode.RestartRequired);
}