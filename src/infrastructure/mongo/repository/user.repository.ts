import { HydratedDocument } from "mongoose";
import IUserRepository from "../../../application/contracts/user/repository.interface";
import { updateCache } from "../../../tgbot/handlers/helpers/auth.js";
import UserModel from "../models/user";
import config from "../../../config";
import { UserMode } from "../../../common/enums/user.enum";

export default class UserRepository implements IUserRepository {
	async createUser(tgId: number): Promise<User | null> {
		try {
			const newUser = await UserModel.create({
				tgId,
				mode: UserMode.Default,
				language: config.defaultLang
			});
			return newUser;
		} catch(e) {
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

	private updateCache(user: HydratedDocument<User>){
		updateCache(user.tgId, {
			tgId: user.tgId,
			mode: user.mode,
            downloads: user.downloads,
            usage: user.usage,
            lastRequest: user.lastRequest,
            status: user.status,
			promotedBy: user.promotedBy
		});
	}
};
