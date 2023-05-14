import { IBroadcast } from "../../../common/interfaces/broadcast.interface";

export default interface IBroadcastRepository {
    add(broadcast: IBroadcast): Promise<boolean>;
    getStatistics(): Promise<{ count: number; last: Date; } | null>;
}
