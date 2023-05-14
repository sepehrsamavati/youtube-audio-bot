export enum BroadcastType {
    Copy = "Copy",
    Forward = "Forward"
}

export interface IBroadcast {
    start: Date;
    end: Date;
    type: BroadcastType;
    targetUsers: number;
    usersReceived: number;
}