import UserApplication from "../../application/user.application.js";
import { TelegramMethodEnum } from "../enums/tgMethod.enum.js";
import { UserMode } from "../enums/user.enum.js";
import { Handler } from "../interfaces/tgBot.interface";
import { TgMsgUpdate } from "../types/tgBot.js";
import { UITextObj } from "../types/uitext.js";
import { User } from "../types/user.js";
import TelegramCall from "./tgCall.js";

export default class HandlerHelper implements Handler {

	constructor(
		private userApplication: UserApplication
	) { }

	ID!: number;
	update!: TgMsgUpdate;
	user!: User;
	UIT!: UITextObj;
	langCode!: string;
	call = TelegramCall;
	end!: () => void;

	setUserMode(mode: UserMode) {
		return this.userApplication.setUserMode(this.ID, mode);
	}

	sendText = (text: string, reply = true) => {
		const sendOptions: any = {
			chat_id: this.ID,
			text
		};
		if (reply) {
			const messageId = this.update?.message?.message_id;
			if (messageId) {
				sendOptions.reply_to_message_id = messageId;
				sendOptions.allow_sending_without_reply = true;
			}
		}
		this.call(TelegramMethodEnum.SendText, sendOptions);
		return this;
	}
};
