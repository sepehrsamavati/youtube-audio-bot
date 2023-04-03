import VideoModel from "../models/video.js";
import { Document, HydratedDocument, Types } from "mongoose";
import IVideoRepository from "../../../application/contracts/video/repository.interface.js";
import LikeModel from "../models/like.js";
import ViewModel from "../models/views.js";

export default class VideoRepository implements IVideoRepository {
	async create(video: Video, uid: Types.ObjectId, download: number, upload: number): Promise<HydratedDocument<Video> | null> {
		try {
			return await VideoModel.create({
				id: video.id,
				tgFileId: video.tgFileId,
				title: video.title,
				date: new Date(),
				by: uid,
				size: {
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
	async getMostViewed(count: number): Promise<HydratedDocument<Video>[]> {
		try {
			const mostViewed = await ViewModel
				.aggregate([
					{
						$group: {
							_id: "$video",
							count: { "$sum": 1 }
						}
					},
					{
						$sort: {
							count: -1
						}
					}
				])
                .limit(count)
                .exec();
			return ((await VideoModel.populate(mostViewed, { path: "_id" })) as any[])
				.filter(item => item !== null)
				.map(item => item._id);
		} catch(e) {
			return [];
		}
	}
	async getMostLiked(count: number): Promise<HydratedDocument<Video>[]> {
		try {
			const likes = await LikeModel
				.aggregate([
					{
						$group: {
							_id: "$video",
							count: { "$sum": 1 }
						}
					},
					{
						$sort: {
							count: -1
						}
					}
				])
                .limit(count)
                .exec();
			return ((await VideoModel.populate(likes, { path: "_id" })) as any[])
				.filter(item => item !== null)
				.map(item => item._id);
		} catch(e) {
			return [];
		}
	}
	async getByDateRange(limit: number, from: Date, to: Date): Promise<HydratedDocument<Video>[]> {
		try {
			const videos = await VideoModel
				.find()
				.limit(limit);
			return videos;
		} catch(e) {
			return [];
		}
	}
};
