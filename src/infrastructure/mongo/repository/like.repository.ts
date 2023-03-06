import ILikeRepository from "../../../application/contracts/like/repository.interface.js";
import OperationResult from "../../../common/models/operationResult.js";
import LikeModel from "../models/like.js";

export default class LikeRepository implements ILikeRepository {
	async isLiked(vid: string, uid: number): Promise<boolean> {
		const like = await LikeModel.exists({ video: vid, user: uid });
		return like != null;
	}
	async like(vid: string, uid: number): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			await LikeModel.create({
				video: vid,
				user: uid
			});
			result.succeeded();
		} catch(e) {
			result.failed();
		}
		return result;
	}
	async removeLiked(vid: string, uid: number): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			await LikeModel.deleteOne({
				video: vid,
				user: uid
			});
			result.succeeded();
		} catch(e) {
			result.failed();
		}
		return result;
	}
};
