import { Types } from "mongoose";
import { User } from "../../../common/types/user.js";
import { UserMode, UserStatus, UserType } from "../../../common/enums/user.enum.js";

export default interface IUserRepository {
    createUser(user: Omit<User, 'id'>): Promise<User | null>;
    findByTgId(id: number, updateLastRequest?: boolean): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    updateUsername(tgId: number, username: string): Promise<boolean>;
    updateUserMode(tgId: number, mode: UserMode): Promise<boolean>;
    updateUserType(tgId: number, type: UserType): Promise<boolean>;
    updateUserStatus(tgId: number, userStatus: UserStatus): Promise<boolean>;
    updateUsersStatus(tgIds: number[], userStatus: UserStatus): Promise<boolean>;
    getIdByTgId(id: number): Promise<Types.ObjectId | null>;
    getAdmins(): Promise<number[]>;
    count(): Promise<number>;
    getBroadcastValidUserIds(): Promise<number[]>;
    promote(tgId: number, promoter: number): Promise<boolean>;
    demote(tgId: number): Promise<boolean>;
}
