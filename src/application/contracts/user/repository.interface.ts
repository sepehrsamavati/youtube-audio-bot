import { Types } from "mongoose";
import { User } from "../../../common/types/user.js";
import { UserMode } from "../../../common/enums/user.enum.js";

export default interface IUserRepository {
    createUser(tgId: number): Promise<User | null>;
    findByTgId(id: number): Promise<User | null>;
    updateUserMode(tgId: number, mode: UserMode): Promise<boolean>;
    getIdByTgId(id: number): Promise<Types.ObjectId | null>;
    getAdmins(): Promise<number[]>;
}
