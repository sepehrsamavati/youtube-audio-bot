import mongoose from "mongoose";
import { User } from "../../../common/types/user.js";

const schema = new mongoose.Schema<User>({
	tgId: {
		type: Number,
		unique: true,
		required: true,
	},
	mode: {
		type: Number,
		required: true
	},
    status: {
        type: Number,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    downloads: {
        type: Number,
        required: true
    },
    promotedBy: {
        type: Number,
        required: false
    },
    usage: {
        up: {
            type: Number,
            required: true
        },
        down: {
            type: Number,
            required: true
        }
    },
    lastRequest: {
        type: Date,
        required: true
    },
}, { versionKey: false, collection: 'users' });

const UserModel = mongoose.model<User>('User', schema);

export default UserModel;
