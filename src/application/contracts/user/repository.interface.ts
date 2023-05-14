import { Types } from "mongoose";
import { User } from "../../../common/types/user.js";
import { UserMode, UserStatus, UserType } from "../../../common/enums/user.enum.js";

export default interface IUserRepository {
    createUser(user: Omit<User, 'id'>): Promise<User | null>;
    findByTgId(id: number, updateLastRequest?: boolean): Promise<User | null>;
    updateUserMode(tgId: number, mode: UserMode): Promise<boolean>;
    updateUserType(tgId: number, type: UserType): Promise<boolean>;
    updateUsersStatus(tgIds: number[], userStatus: UserStatus): Promise<boolean>;
    getIdByTgId(id: number): Promise<Types.ObjectId | null>;
    getAdmins(): Promise<number[]>;
    count(): Promise<number>;
    getBroadcastValidUserIds(): Promise<number[]>;
}
