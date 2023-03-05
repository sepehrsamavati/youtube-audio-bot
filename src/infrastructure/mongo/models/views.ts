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
}, { versionKey: false, collection: 'views' });

const ViewModel = mongoose.model('View', schema);

export default ViewModel;
