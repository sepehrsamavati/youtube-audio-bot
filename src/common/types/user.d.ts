import { UserMode, UserStatus, UserType } from "../enums/user.enum.js";

export type User = {
    tgId: number;
    mode: UserMode;
    status: UserStatus;
    type: UserType;
    downloads: number;
    usage: {
        up: number;
        down: number;
    };
    lastRequest: Date;
    promotedBy?: number;
}