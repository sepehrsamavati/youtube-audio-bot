import { User } from "../../../common/types/user.js";
import IStatisticsRepository from "../../../application/contracts/statistics/repository.interface.js";

export default class StatisticsRepository implements IStatisticsRepository {
	addBroadcast(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	getBroadcastsInfo(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	getTotalUsage(user?: User | undefined): Promise<number | null> {
		throw new Error("Method not implemented.");
	}
	getLastWeekDownloadsCount(): Promise<number | null> {
		throw new Error("Method not implemented.");
	}
};
