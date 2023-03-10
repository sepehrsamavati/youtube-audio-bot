import { HydratedDocument } from "mongoose";
import IVideoRepository from "../../../application/contracts/video/repository.interface.js";
import VideoModel from "../models/video.js";
import OperationResult from "../../../common/models/operationResult.js";

export default class VideoRepository implements IVideoRepository {
	async create(video: Video): Promise<OperationResult> {
		const result = new OperationResult();
		try {
			await VideoModel.create({
				id: video.id,
				tgFileId: video.tgFileId,
				title: video.title
			});
			result.succeeded();
		} catch(e) {
			result.failed();
		}
		return result;
	}
	async findById(id: string): Promise<Video | null> {
		try {
			const video: HydratedDocument<Video> | null = await VideoModel.findOne({ id });

			if(!video)
				return null;

			return {
				id: video.id,
				tgFileId: video.tgFileId,
				title: video.title
			};
		} catch(e) {
			return null;
		}
	}
};
