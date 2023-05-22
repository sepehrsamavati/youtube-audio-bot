import i18n from "./helpers/i18n.js";
import { findUser as auth } from "./helpers/auth.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import { TgMsgUpdate } from "../../common/types/tgBot.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { UserMode, UserStatus, UserType } from "../../common/enums/user.enum.js";
import HomeHandler from "./home.handler.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import CallbackQueryHandler from "./callbackQuery.handler.js";
import InlineQueryHandler from "./inlineQuery.handler.js";
import AdminHandler from "./admin.handler.js";
import dynamicText from "./helpers/dynamicText.js";
import UserApplication from "../../application/user.application.js";
import { logError } from "../../common/helpers/log.js";
import ReturnHandler from "./return.handler.js";
import AdminCommandHandler from "./adminCommand.handler.js";

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

		if(helper.ID === 0) {
			logError("Main TG update handler / 0 chat ID", {
				update
			});
		}

		const user = await auth(this.userApplication, helper.ID);

		if(!(user && this.#continue && user.status !== UserStatus.Banned)) return;

		if(message?.from.username && message.from.username !== user.username) {
			await this.userApplication.setUsername(user.tgId, message.from.username);
		}

		if(user.status === UserStatus.Temp) {
			// EULA / TOS / Phone register
			await this.userApplication.setUserStatus(user.tgId, UserStatus.OK);
		}

		const { UIT, langCode } = i18n(user);
		helper.user = user;
		helper.UIT = UIT;
		helper.langCode = langCode;

		if (message) {
			await this.returnHandler.handler(helper);

			if (helper.user.type === UserType.Admin) {
				if(update.message?.text?.startsWith('/'))
					await this.adminCommandHandler.handler(helper);
				if(this.#continue)
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
					case UIT.help.toLocaleLowerCase():
					case "/help":
						helper.call(TelegramMethodEnum.SendText, {
							chat_id: helper.ID,
							text: dynamicText({
								text: UIT._help,
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

	constructor(
		private userApplication: UserApplication,
		private returnHandler: ReturnHandler,
		private adminHandler: AdminHandler,
		private adminCommandHandler: AdminCommandHandler,
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
