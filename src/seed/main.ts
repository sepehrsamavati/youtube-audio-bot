import uitext from "./uitext.js";
import Services, { Repositories } from "../common/services.js";
import { closeConnection, connect } from "../infrastructure/mongo/connection.js";
import settings from "./settings.js";

await connect();

const repositories = new Repositories();

await settings(repositories.settingsRepository);

await uitext(repositories.UITRepository);

await closeConnection();
