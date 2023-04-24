import mongoose from "mongoose";

const schema = new mongoose.Schema<Setting>({
	key: {
		type: String,
		required: true,
        unique: true
	},
    value: {
        type: String,
        required: true
    },
	lastUpdate: {
		type: Date,
		required: true
	}
}, { versionKey: false, collection: 'settings' });

const SettingsModel = mongoose.model('Settings', schema);

export default SettingsModel;
