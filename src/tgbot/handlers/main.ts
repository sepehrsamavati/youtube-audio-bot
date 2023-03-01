import { findUser as auth } from "./helpers/auth.js";
import { TgMsgUpdate } from "../../common/interfaces/tgBot.interface";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import i18n from "./helpers/i18n.js";

class UpdateHandler {
	async handleUpdate(update: TgMsgUpdate) {
		const helper = this.helper;
		const message = update.message;

		helper.update = update;
		helper.ID = message?.chat.id ?? 0;
		helper.user = await auth(helper.ID);

		const { UIT, langCode } = i18n(helper.user);
		helper.UIT = UIT;
		helper.langCode = langCode;

		if(this.#continue)
		{
			if(message)
			{
				helper.sendText(UIT.commandNotFound);
				this.end();
			}
		}
	}

	constructor(){
		this.helper = new HandlerHelper();
		this.helper.end = this.end;
	}

	#continue: boolean = true;

	public helper: HandlerHelper;

	end = () => {
		if(this.#continue)
			this.#continue = false;
		else
			console.warn("Handler end duplicate call!");
	}
};

export default UpdateHandler;
