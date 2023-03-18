import mongoose from "mongoose";

const schema = new mongoose.Schema({
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
    },
    by: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    size: {
        up: {
            type: Number,
            required: true
        },
        down: {
            type: Number,
            required: true
        }
    }
}, { versionKey: false, collection: 'videos' });

const VideoModel = mongoose.model<Video>('Video', schema);

export default VideoModel;
