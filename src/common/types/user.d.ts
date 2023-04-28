import { Types } from "mongoose";
import { UserMode, UserStatus, UserType } from "../enums/user.enum.js";

export type User = {
    id: Types.ObjectId;
    tgId: number;
    mode: UserMode;
    status: UserStatus;
    type: UserType;
    lastRequest: Date;
    promotedBy?: number;
}