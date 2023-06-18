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
    language: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false
    },
    promotedBy: {
        type: Number,
        required: false
    },
    lastRequest: {
        type: Date,
        required: true
    },
    createDate: {
        type: Date,
        required: true
    },
}, { versionKey: false, collection: 'users' });

const UserModel = mongoose.model<User>('User', schema);

export default UserModel;
