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
		){}

	ID!: number;
	update!: TgMsgUpdate;
	user?: User;
	UIT!: UITextObj;
	langCode!: string;
	call = TelegramCall;
	end!: () => void;

	setUserMode(mode: UserMode){
		return this.userApplication.setUserMode(this.ID, mode);
	}

	sendText = (message: string) => {
		this.call(TelegramMethodEnum.SendText, {
			chat_id: this.ID,
			text: message
		});
		return this;
	}
};
