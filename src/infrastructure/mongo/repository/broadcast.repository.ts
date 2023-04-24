import BroadcastModel from "../models/broadcast.js";
import { logError } from "../../../common/helpers/log.js";
import IBroadcastRepository from "../../../application/contracts/broadcast/repository.interface.js";

export default class BroadcastRepository implements IBroadcastRepository {
	async add(broadcast: IBroadcast): Promise<boolean> {
		try {
			const res = await BroadcastModel.create(broadcast);
			return Boolean(res);
		} catch(e) {
			logError("Broadcast repository / Add", e);
			return false;
		}
	}
	async getStatistics(): Promise<{ count: number; last: Date; } | null> {
		return null;
	}
};