export default interface IBroadcastRepository {
    add(broadcast: IBroadcast): Promise<boolean>;
    getStatistics(): Promise<{ count: number; last: Date; } | null>;
}
