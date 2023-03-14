import { Types } from "mongoose";
import { User } from "../../../common/types/user.js";

export default interface IUserRepository {
    createUser(tgId: number): Promise<User | null>;
    findByTgId(id: number): Promise<User | null>;
    getIdByTgId(id: number): Promise<Types.ObjectId | null>;
    getAdmins(): Promise<number[]>;
}
