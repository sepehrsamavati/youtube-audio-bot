import { UserMode, UserStatus, UserType } from "../enums/user.enum.js";

export type User = {
    tgId: number;
    mode: UserMode;
    status: UserStatus;
    type: UserType;
    lastRequest: Date;
    promotedBy?: number;
}