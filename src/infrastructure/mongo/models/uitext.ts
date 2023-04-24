import mongoose from "mongoose";

const schema = new mongoose.Schema({
	lang: {
		type: String,
        maxLength: 5,
		required: true
	},
	key: {
		type: String,
		required: true
	},
    value: {
        type: String,
        required: true
    }
}, { versionKey: false, collection: 'uitext' });

const UITextModel = mongoose.model('UIText', schema);

export default UITextModel;
