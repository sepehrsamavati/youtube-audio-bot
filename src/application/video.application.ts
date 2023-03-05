import fs from 'node:fs';
import path from 'node:path';
import http from 'node:https';
import sharp from "sharp";
import ytdl from "ytdl-core";
import NodeID3 from "node-id3";
import ffmpeg from "fluent-ffmpeg";
import config from "../config";
import OperationResult from "../common/models/operationResult";
import { QueueVideo, Video } from "../common/types/video";
import IVideoApplication from "./contracts/video/application.interface";
import getFileSizeInMegaBytes from "../common/helpers/getFileSize";
import cropThumbnailSides from "../common/helpers/cropThumbnailSides";

export default class VideoApplication implements IVideoApplication {
    constructor() { }
    queue: QueueVideo[] = [];
    get(videoId: string, userId: number): Promise<Video | null> {
        throw new Error("Method not implemented.");
    }
    like(videoId: string, userId: number): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
    removeLike(videoId: string, userId: number): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
    add(video: Video): Promise<OperationResult> {
        throw new Error("Method not implemented.");
    }
    async getInfo(video: QueueVideo): Promise<void> {
        video.step = QueueVideoStep.GetInfo;
        const basicInfo = await ytdl.getBasicInfo(video.id);

        const info: any = {};

        if (basicInfo.videoDetails.author.name.endsWith(" - Topic") && basicInfo.videoDetails.author.name.length > 8) /* remove ' - Topic' */ {
            basicInfo.videoDetails.author.name = basicInfo.videoDetails.author.name.slice(0, -8);
        }

        const videoTitleSplit = basicInfo.videoDetails.title.split(" - ");
        if (videoTitleSplit.length === 2) {
            info.title = videoTitleSplit[1];
            info.artist = videoTitleSplit[0];
            info.album = basicInfo.videoDetails.author.name;
        }
        else {
            info.title = basicInfo.videoDetails.title;
            info.artist = basicInfo.videoDetails.author.name;
            if (info.title.startsWith(info.artist + " - ") && info.title.length > info.artist.length + 3) {
                info.title = info.title.slice(info.artist.length + 3);
            }
        }


        if (basicInfo.videoDetails.publishDate) {
            info.year = basicInfo.videoDetails.publishDate.split("-").shift();
        }
        if (basicInfo.videoDetails.media
            && basicInfo.videoDetails.media
            && basicInfo.videoDetails.media.song
            && basicInfo.videoDetails.media.artist) {
            info.title = basicInfo.videoDetails.media.song;
            info.artist = basicInfo.videoDetails.media.artist;
            //info.album = basicInfo.videoDetails.media.album;
        }
        info.thumbnail = basicInfo.videoDetails.thumbnails.pop()?.url;
    }
    startProgress(vid: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async download(video: QueueVideo): Promise<void> {
        video.step = QueueVideoStep.DownloadVideo;
        const baseFileAddress = video.fileAddress = path.join(config.cacheDirectory, video.localId);
        const videoFileAddress = baseFileAddress + '.mp4';

        const videoWriteStream = fs.createWriteStream(videoFileAddress);

        videoWriteStream.on("finish", async function () {

            video.mp4Size = getFileSizeInMegaBytes(videoFileAddress);

            http.get(video.thumbnail, function (res) {
                const thumbnailFileAddress = baseFileAddress + (video.thumbnail.endsWith(".jpg") ? ".jpg" : ".webp");
                const thumbnailWriteStream = fs.createWriteStream(thumbnailFileAddress);
                res.pipe(thumbnailWriteStream)
                    .on("finish", async function () {

                        video.thumbSize = getFileSizeInMegaBytes(thumbnailFileAddress);

                        // DONE;
                    });
            });

        });

        ytdl(video.id, { quality: "highestaudio" }).pipe(videoWriteStream);
    }
    async convert(video: QueueVideo): Promise<void> {
        video.step = QueueVideoStep.ConvertToAudio;
        const baseFileAddress = video.fileAddress
        const audioFileAddress = baseFileAddress + '.mp3';
        const videoFileAddress = baseFileAddress + '.mp4';
        const mp3File = ffmpeg({ source: videoFileAddress })
            .setFfmpegPath(config.ffmpegExe)
            .withAudioCodec('libmp3lame')
            .toFormat('mp3')
            .on('error', function (err) {
                video.error = "Error in converting";
                console.log('An error occurred: ' + err.message);
            })
            .on('end', function () {
                video.mp3Size = getFileSizeInMegaBytes(audioFileAddress);
                if (video.mp3Size > 50) {
                    video.error = "File size is over 50 MB";
                    return;
                }
                // DONE;
            });
        mp3File.saveToFile(audioFileAddress);
    }
    async generateCover(video: QueueVideo): Promise<void> {
        video.step = QueueVideoStep.GenerateCover;
		const baseFileAddress = video.fileAddress;
        const jpgFilePath = baseFileAddress+".jpg";
        
        const cropSides = async () => {
            const result = await cropThumbnailSides(jpgFilePath);
        };

		let biggerSide = "width";
		if(video.thumbnail.endsWith(".jpg"))
		{
			cropSides();
			return;
		}
		sharp(baseFileAddress+".webp").toFile(jpgFilePath).then(async (newFileInfo) => { /* convert webp to jpg */
			biggerSide = newFileInfo.height > newFileInfo.width ? "height" : "width";
			cropSides();
		}).catch((err) => {
			video.error = "Couldn't convert cover";
		});
    }
    async setMeta(video: QueueVideo): Promise<void> {
        video.step = QueueVideoStep.SetMeta;

        const baseFileAddress = video.fileAddress;
		const options: any = {
			title: video.title,
			artist: video.artist,
			year: video.year,
			APIC: baseFileAddress+".jpg"
		};
		if(video.album)
		{
			options.album = video.album;
		}
		NodeID3.write(options, baseFileAddress+".mp3", function(err){
			if(err)
			{
				video.error = "Couldn't set cover";
			}
			else
			{
                // DONE;
			}
		});
    }
};
