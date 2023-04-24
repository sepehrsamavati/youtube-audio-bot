import i18n from "./helpers/i18n.js";
import { findUser as auth } from "./helpers/auth.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import { TgMsgUpdate } from "../../common/types/tgBot.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { UserMode, UserType } from "../../common/enums/user.enum.js";
import HomeHandler from "./home.handler.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import CallbackQueryHandler from "./callbackQuery.handler.js";
import InlineQueryHandler from "./inlineQuery.handler.js";
import AdminHandler from "./admin.handler.js";
import dynamicText from "./helpers/dynamicText.js";
import UserApplication from "../../application/user.application.js";

class UpdateHandler {
	async handleUpdate(update: TgMsgUpdate) {
		const helper = this.helper;
		const message = update.message;

		helper.update = update;
		helper.ID =
			message?.chat.id
			?? update.callback_query?.message.chat.id
			?? update.inline_query?.from.id
			?? 0;
		helper.user = await auth(this.userApplication, helper.ID);

		const { UIT, langCode } = i18n(helper.user);
		helper.UIT = UIT;
		helper.langCode = langCode;

		if (helper.user && this.#continue) {
			if (message) {
				if (helper.user.type === UserType.Admin) {
					await this.adminHandler.handler(helper);
				}

				if (this.#continue) {
					switch (message.text?.toLowerCase()) {
						case "/start":
							helper.call(TelegramMethodEnum.SendText, {
								chat_id: helper.ID,
								text: dynamicText({
									text: UIT._start,
									update
								}),
								reply_markup: inlineKeyboards.user(helper.user, helper.UIT)
							});
							this.end();
							await this.helper.setUserMode(UserMode.Default);
							break;
					}
					if (this.#continue) {
						switch (helper.user.mode) {
							case UserMode.Default:
								await this.homeHandler.handler(helper);
								break;
						}
					}
				}
			} else if (update.callback_query) {
				this.callbackQueryHandler.handler(helper);
			} else if (update.inline_query) {
				this.inlineQueryHandler.handler(helper);
			}
		}
	}

	constructor(
		private userApplication: UserApplication,
		private adminHandler: AdminHandler,
		private homeHandler: HomeHandler,
		private callbackQueryHandler: CallbackQueryHandler,
		private inlineQueryHandler: InlineQueryHandler
	) {
		this.helper = new HandlerHelper(userApplication);
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
