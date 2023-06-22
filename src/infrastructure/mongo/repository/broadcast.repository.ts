import BroadcastModel from "../models/broadcast.js";
import { logError } from "../../../common/helpers/log.js";
import IBroadcastRepository from "../../../application/contracts/broadcast/repository.interface.js";
import { IBroadcast } from "../../../common/interfaces/broadcast.interface.js";

export default class BroadcastRepository implements IBroadcastRepository {
	async add(broadcast: IBroadcast): Promise<boolean> {
		try {
			const res = await BroadcastModel.create(broadcast);
			return Boolean(res);
		} catch (e) {
			logError("Broadcast repository / Add", e);
			return false;
		}
	}
	async getStatistics(): Promise<{ count: number; last: Date; } | null> {
		try {
			const res: { _id: string; count: number; last: Date; }[] = await BroadcastModel.aggregate([
				{
					$group: {
						_id: "",
						count: {
							"$sum": 1
						},
						last: {
							"$max": "$start"
						}
					}
				}
			]).exec();

			return res?.length ? {
				count: res[0].count,
				last: res[0].last
			} : null;
		} catch (e) {
			logError("Broadcast repository / Get statistics", e);
			return null;
		}
	}
};
