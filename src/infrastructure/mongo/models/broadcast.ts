import mongoose from "mongoose";
import { BroadcastType, IBroadcast } from "../../../common/interfaces/broadcast.interface.js";

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
	targetUsers: {
		type: Number,
		required: true
	},
	type: {
		type: String,
		enum: Object.values(BroadcastType),
		required: true
	},
	usersReceived: {
		type: Number,
		required: true
	}
}, { versionKey: false, collection: 'broadcasts' });

const BroadcastModel = mongoose.model('Broadcast', schema);

export default BroadcastModel;
