import { QueueVideo } from "../models/queueVideo.js";

export default function generateMp3Name(video: QueueVideo) {
    let fileName = video.title;
    if (!fileName.startsWith(video.artist) && fileName.split(" - ").length !== 2) {
        fileName = video.artist + " - " + fileName;
    }
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
    return fileName + ".mp3";
};