import { Types } from "mongoose";
import VideoModel from "../models/video.js";
import LikeModel from "../models/like.js";
import ViewModel from "../models/views.js";
import IVideo from "../../../common/interfaces/video.interface.js";
import IVideoRepository from "../../../application/contracts/video/repository.interface.js";
import { logError } from "../../../common/helpers/log.js";

export default class VideoRepository implements IVideoRepository {
	async create(video: Video, uid: Types.ObjectId, download: number, upload: number): Promise<IVideo | null> {
		try {
			const vid = await VideoModel.create({
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
			return {
				_id: vid._id,
				id: vid.id,
				title: vid.title,
				tgFileId: vid.tgFileId
			};
		} catch (e) {
			return null;
		}
	}
	async findByYtId(id: string): Promise<IVideo | null> {
		try {
			const video = await VideoModel.findOne({ id });
			return video ? {
				_id: video._id,
				id: video.id,
				title: video.title,
				tgFileId: video.tgFileId,
			} : null;
		} catch (e) {
			return null;
		}
	}
	async getIdByYtId(id: string): Promise<Types.ObjectId | null> {
		try {
			const video = await VideoModel.findOne({ id });
			return video?._id ?? null;
		} catch (e) {
			return null;
		}
	}
	async getMostViewed(count: number): Promise<Video[]> {
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
				.map(item => {
					const video = item._id;
					return {
						id: video.id,
						title: video.title,
						tgFileId: video.tgFileId,
					};
				});
		} catch (e) {
			return [];
		}
	}
	async getMostLiked(count: number): Promise<Video[]> {
		try {
			const mostLikedVideos: { _id: Types.ObjectId; count: number; video: IVideo[] }[] = await LikeModel
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
					},
					{
						$lookup: {
							from: 'videos',
							localField: '_id',
							foreignField: '_id',
							as: 'video'
						}
					}
				])
				.limit(count)
				.exec();
			return mostLikedVideos.map(item => {
				const video = item.video[0];
				return {
					id: video.id,
					title: video.title,
					tgFileId: video.tgFileId,
				};
			});
		} catch (e) {
			return [];
		}
	}
	async getRecentAdded(count: number): Promise<Video[]> {
		try {
			const videos = await VideoModel
				.find()
				.sort({
					date: -1
				})
				.limit(count);
			return videos.map(video => {
				return {
					id: video.id,
					title: video.title,
					tgFileId: video.tgFileId,
				};
			});
		} catch (e) {
			return [];
		}
	}
	async getByDateRange(limit: number, from: Date, to: Date): Promise<Video[]> {
		try {
			const videos = await VideoModel
				.find({
					date: {
						$gte: from,
						$lte: to
					}
				})
				.limit(limit);
			return videos.map(video => {
				return {
					id: video.id,
					title: video.title,
					tgFileId: video.tgFileId,
				};
			});
		} catch (e) {
			return [];
		}
	}
	async getCountByDateRange(from: Date, to: Date): Promise<number> {
		try {
			return await VideoModel
				.count({
					date: {
						$gte: from,
						$lte: to
					}
				});
		} catch (e) {
			logError("Get count by date range / Video repository", e);
			return 0;
		}
	}
	async getTotalCount(): Promise<number> {
		try {
			return await VideoModel.count();
		} catch (e) {
			logError("Get total count / Video repository", e);
			return 0;
		}
	}
	async getRandom(): Promise<IVideo | null> {
		try {
			const video = await VideoModel.aggregate([
				{
					$sample: {
						size: 1
					}
				}
			]).exec();
			return video ? {
				_id: video[0]._id,
				title: video[0].title,
				id: video[0].id,
				tgFileId: video[0].tgFileId
			} : null;
		} catch (e) {
			logError("Get random / Video repository", e);
			return null;
		}
	}
};
