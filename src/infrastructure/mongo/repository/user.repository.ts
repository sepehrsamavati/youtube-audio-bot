import config from "../../../config.js";
import UserModel from "../models/user.js";
import settings from "../../../settings.js";
import { HydratedDocument, Types } from "mongoose";
import { User } from "../../../common/types/user.js";
import { logError } from "../../../common/helpers/log.js";
import { UserMode, UserStatus, UserType } from "../../../common/enums/user.enum.js";
import IUserRepository from "../../../application/contracts/user/repository.interface.js";

export default class UserRepository implements IUserRepository {
	async count(): Promise<number> {
		try {
			return await UserModel.count();
		} catch(e) {
			logError("User repository / Count", e);
			return 0;
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
	async createUser(tgId: number): Promise<User | null> {
		try {
			const newUser = await UserModel.create({
				tgId,
				mode: UserMode.Default,
				type: config.owners.includes(tgId) ? UserType.Admin : UserType.Default,
				language: settings.defaultLang,
				downloads: 0,
				lastRequest: 0,
				status: UserStatus.OK,
				usage: {
					down: 0,
					up: 0
				}
			});
			return newUser;
		} catch(e) {
			debugger
			return null;
		}
	}
	async findByTgId(id: number): Promise<User | null> {
		try {
			const user: HydratedDocument<User> | null = await UserModel.findOne({ tgId: id });

			if(!user)
				return null;

			return {
				tgId: user.tgId,
				mode: user.mode,
				type: user.type,
                lastRequest: user.lastRequest,
                status: user.status,
				promotedBy: user.promotedBy
			};
		} catch(e) {
			return null;
		}
	}
	async getIdByTgId(id: number): Promise<Types.ObjectId | null> {
		try {
			const user = await UserModel.findOne({ tgId: id });

			return user?._id ?? null;
		} catch(e) {
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
};
