import VideoModel from "../models/video.js";
import { HydratedDocument, Types } from "mongoose";
import IVideoRepository from "../../../application/contracts/video/repository.interface.js";

export default class VideoRepository implements IVideoRepository {
	async create(video: Video, uid: Types.ObjectId, download: number, upload: number): Promise<HydratedDocument<Video> | null> {
		try {
			return await VideoModel.create({
				id: video.id,
				tgFileId: video.tgFileId,
				title: video.title,
				by: uid,
				usage: {
					up: upload,
					down: download
				}
			});
		} catch(e) {
			return null;
		}
	}
	async findByYtId(id: string): Promise<HydratedDocument<Video> | null> {
		try {
			const video = await VideoModel.findOne({ id });
			return video;
		} catch(e) {
			return null;
		}
	}
	async getIdByYtId(id: string): Promise<Types.ObjectId | null> {
		try {
			const video = await VideoModel.findOne({ id });
			return video?._id ?? null;
		} catch(e) {
			return null;
		}
	}
};
