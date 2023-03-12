import i18n from "./helpers/i18n.js";
import { findUser as auth } from "./helpers/auth.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import { TgMsgUpdate } from "../../common/types/tgBot.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { UserMode } from "../../common/enums/user.enum.js";
import HomeHandler from "./home.handler.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";

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

		if(helper.user && this.#continue) {
			if (message) {
				switch (helper.user.mode) {
					case UserMode.Default:
						await this.homeHandler.handler(helper);
						break;
				}

				if (this.#continue) {
					switch (message.text?.toLowerCase()) {
						case "/start":
							helper.call(TelegramMethodEnum.SendText, {
								chat_id: helper.ID,
								text: UIT._start,
								reply_markup: {
									one_time_keyboard: false,
									keyboard: inlineKeyboards.user(helper.user, helper.UIT),
									resize_keyboard: true
								}
							});
							this.end();
							break;
						default:
							helper.sendText(UIT.commandNotFound).end();
					}
				}
			}
		}
	}

	constructor(private homeHandler: HomeHandler) {
		this.homeHandler = homeHandler;
		this.helper = new HandlerHelper();
		this.helper.end = this.end;
	}

	#continue: boolean = true;

	public helper: HandlerHelper;

	end = () => {
		if (this.#continue)
			this.#continue = false;
		else
			console.warn("Handler end duplicate call!");
	}
};

export default UpdateHandler;
