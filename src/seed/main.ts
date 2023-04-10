import uitext from "./uitext.js";
import { Repositories } from "../common/services.js";
import { closeConnection, connect } from "../infrastructure/mongo/connection.js";

await connect();

const repositories = new Repositories();

uitext(repositories.UITRepository);

await closeConnection();
