import mongoose from "mongoose";

const schema = new mongoose.Schema<IBroadcast>({
	start: {
		type: Date,
		required: true,
        unique: true
	},
    end: {
		type: Date,
        required: true
    },
	totalUsers: {
		type: Number,
		required: true
	},
	usersReceived: {
		type: Number,
		required: true
	}
}, { versionKey: false, collection: 'broadcasts' });

const BroadcastModel = mongoose.model('Broadcast', schema);

export default BroadcastModel;
