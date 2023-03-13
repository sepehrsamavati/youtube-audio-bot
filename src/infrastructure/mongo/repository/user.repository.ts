import { HydratedDocument } from "mongoose";
import config from "../../../config.js";
import UserModel from "../models/user.js";
import { UserMode, UserStatus, UserType } from "../../../common/enums/user.enum.js";
import IUserRepository from "../../../application/contracts/user/repository.interface.js";
import { User } from "../../../common/types/user.js";

export default class UserRepository implements IUserRepository {
	async createUser(tgId: number): Promise<User | null> {
		try {
			const newUser = await UserModel.create({
				tgId,
				mode: UserMode.Default,
				type: config.owners.includes(tgId) ? UserType.Admin : UserType.Default,
				language: config.defaultLang,
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
                downloads: user.downloads,
                lastRequest: user.lastRequest,
                status: user.status,
                usage: user.usage,
				promotedBy: user.promotedBy
			};
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
