import ViewModel from "../models/views.js";
import OperationResult from "../../../common/models/operationResult.js";
import IViewRepository from "../../../application/contracts/view/repository.interface.js";
import VideoModel from "../models/video.js";
import UserModel from "../models/user.js";

export default class ViewRepository implements IViewRepository {
	async isViewed(vid: string, uid: number): Promise<boolean> {
		try {
			const videoId = await VideoModel.findOne({ id: vid }).select("_id");
			const userId = await UserModel.findOne({ tgId: uid }).select("_id");
			const like = await ViewModel.exists({
				video: videoId,
				user: userId
			});
			return like != null;
		} catch {
			return false;
		}
	}
	async add(vid: string, uid: number): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			const video = await VideoModel.findOne({ id: vid }).select("_id");
			const user = video ? await UserModel.findOne({ tgId: uid }).select("_id") : null;
			if(video && user)
			{
				await ViewModel.create({
					video: video._id,
					user: video._id
				});
				result.succeeded();
			} else {
				result.failed();
			}
		} catch(e) {
			result.failed();
		}
		return result;
	}
};
