import BroadcastModel from "../models/broadcast.js";
import { logError } from "../../../common/helpers/log.js";
import IBroadcastRepository from "../../../application/contracts/broadcast/repository.interface.js";
import { IBroadcast } from "../../../common/interfaces/broadcast.interface.js";

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
		try {
			const count = await BroadcastModel.count();
			if(typeof count !== "number") return null;

			const lastBroadcast = await BroadcastModel.find().sort({ start: -1 }).limit(1);

			return lastBroadcast?.length ? {
				count,
				last: lastBroadcast[0].start
			} : null;
		} catch(e) {
			logError("Broadcast repository / Get statistics", e);
			return null;
		}
	}
};
