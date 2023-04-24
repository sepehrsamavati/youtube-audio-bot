import mongoose from "mongoose";

const schema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Video'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { versionKey: false, collection: 'likes' });

const LikeModel = mongoose.model('Like', schema);

export default LikeModel;
