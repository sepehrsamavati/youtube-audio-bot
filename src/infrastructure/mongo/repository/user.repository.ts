import { Types } from "mongoose";
import UserModel from "../models/user.js";
import { User } from "../../../common/types/user.js";
import { logError } from "../../../common/helpers/log.js";
import { UserMode, UserStatus, UserType } from "../../../common/enums/user.enum.js";
import IUserRepository from "../../../application/contracts/user/repository.interface.js";

export default class UserRepository implements IUserRepository {
	async count(): Promise<number> {
		try {
			return await UserModel.count();
		} catch (e) {
			logError("User repository / Count", e);
			return 0;
		}
	}
	async updateUsername(tgId: number, username: string): Promise<boolean> {
		try {
			const res = await UserModel.findOneAndUpdate({ tgId }, { username });
			return Boolean(res);
		} catch(e) {
			logError("User repository / Update username");
			return false;
		}
	}
	async updateUserMode(tgId: number, userMode: UserMode): Promise<boolean> {
		try {
			await UserModel.findOneAndUpdate({ tgId: tgId }, {
				mode: userMode
			});
			return true;
		} catch {
			return false;
		}
	}
	async updateUserType(tgId: number, userType: UserType): Promise<boolean> {
		try {
			await UserModel.findOneAndUpdate({ tgId: tgId }, {
				type: userType
			});
			return true;
		} catch {
			return false;
		}
	}
	async updateUsersStatus(tgIds: number[], userStatus: UserStatus): Promise<boolean> {
		try {
			await UserModel.updateMany({
				tgId: {
					$in: tgIds
				}
			}, {
				status: userStatus
			});
			return true;
		} catch(e) {
			logError("User repository / updateUsersStatus", e);
			return false;
		}
	}
	async createUser(user: Omit<User, 'id'>): Promise<User | null> {
		try {
			const newUser = await UserModel.create(user);
			return newUser ? {
				id: newUser.id,
				tgId: newUser.tgId,
				mode: newUser.mode,
				status: newUser.status,
				type: newUser.type,
				language: newUser.language,
				lastRequest: newUser.lastRequest,
				username: newUser.username,
				promotedBy: newUser.promotedBy
			} : null;
		} catch (e) {
			logError("User repository / Create user", e);
			return null;
		}
	}
	async findByTgId(id: number, updateLastRequest: boolean = false): Promise<User | null> {
		try {
			const user = updateLastRequest ? await UserModel.findOneAndUpdate({ tgId: id }, {
				lastRequest: new Date()
			}) : await UserModel.findOne({ tgId: id });

			if (!user)
				return null;

			return {
				id: user._id,
				tgId: user.tgId,
				mode: user.mode,
				type: user.type,
				lastRequest: user.lastRequest,
				language: user.language,
				status: user.status,
				username: user.username,
				promotedBy: user.promotedBy
			};
		} catch (e) {
			logError("User repository / findByTgId", e);
			return null;
		}
	}
	async getIdByTgId(id: number): Promise<Types.ObjectId | null> {
		try {
			const user = await UserModel.findOne({ tgId: id });

			return user?._id ?? null;
		} catch (e) {
			return null;
		}
	}
	async getAdmins(): Promise<number[]> {
		try {
			const admins = await UserModel.find({ type: UserType.Admin });
			return admins.map(admin => admin.tgId);
		} catch {
			return [];
		}
	}
	async getBroadcastValidUserIds(): Promise<number[]> {
		try {
			const users = await UserModel.find({
				status: {
					$nin: [UserStatus.Banned, UserStatus.Blocked]
				}
			});
			return users.map(user => user.tgId);
		} catch {
			return [];
		}
	}
};
