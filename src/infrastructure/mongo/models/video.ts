import mongoose from "mongoose";

const schema = new mongoose.Schema<Video>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    tgFileId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
}, { versionKey: false, collection: 'videos' });

const VideoModel = mongoose.model<Video>('Video', schema);

export default VideoModel;
