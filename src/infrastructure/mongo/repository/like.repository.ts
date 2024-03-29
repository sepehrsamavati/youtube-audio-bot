import { Types } from "mongoose";
import LikeModel from "../models/like.js";
import ILikeRepository from "../../../application/contracts/like/repository.interface.js";
import OperationResult from "../../../common/models/operationResult.js";

export default class LikeRepository implements ILikeRepository {
	async isLiked(vid: Types.ObjectId, uid: Types.ObjectId): Promise<boolean> {
		const like = await LikeModel.exists({ video: vid, user: uid });
		return like != null;
	}
	async like(vid: Types.ObjectId, uid: Types.ObjectId): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			await LikeModel.create({
				video: vid,
				user: uid
			});
			result.succeeded("liked");
		} catch(e) {
			result.failed();
		}
		return result;
	}
	async removeLike(vid: Types.ObjectId, uid: Types.ObjectId): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			await LikeModel.deleteOne({
				video: vid,
				user: uid
			});
			result.succeeded("likeRemoved");
		} catch(e) {
			result.failed();
		}
		return result;
	}
};
