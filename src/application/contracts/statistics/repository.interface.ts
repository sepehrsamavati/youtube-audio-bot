import { User } from "../../../common/types/user.js";

export default interface IStatisticsRepository {
    addBroadcast(): Promise<boolean>;
    getBroadcastsInfo(): Promise<boolean>;
    getTotalUsage(user?: User): Promise<number | null>;
    getLastWeekDownloadsCount(): Promise<number | null>;
}
