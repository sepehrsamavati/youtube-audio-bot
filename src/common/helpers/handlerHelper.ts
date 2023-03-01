import TelegramMethodEnum from "../enums/tgMethod.enum.js";
import { Handler, TgMsgUpdate } from "../interfaces/tgBot.interface";
import TelegramCall from "./tgCall.js";

export default class HandlerHelper implements Handler {

	ID!: number;
	update!: TgMsgUpdate;
	user?: User;
	UIT!: any;
	langCode!: string;
	call = TelegramCall;
	end!: () => void;

	sendText = (message: string) => {
		this.call(TelegramMethodEnum.SendText, {
			chat_id: this.ID,
			text: message
		});
	}
};
