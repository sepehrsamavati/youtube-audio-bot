import i18n from "./helpers/i18n.js";
import config from "../../config.js";
import HomeHandler from "./home.handler.js";
import AdminHandler from "./admin.handler.js";
import ReturnHandler from "./return.handler.js";
import dynamicText from "./helpers/dynamicText.js";
import { findUser as auth } from "./helpers/auth.js";
import { logError } from "../../common/helpers/log.js";
import { TgMsgUpdate } from "../../common/types/tgBot.js";
import TelegramCall from "../../common/helpers/tgCall.js";
import InlineQueryHandler from "./inlineQuery.handler.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import AdminCommandHandler from "./adminCommand.handler.js";
import CallbackQueryHandler from "./callbackQuery.handler.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { UserMode, UserStatus, UserType } from "../../common/enums/user.enum.js";
import UIText from "../../common/languages/UIText.js";

class UpdateHandler {
	async handleUpdate(update: TgMsgUpdate) {
		const helper = this.helper;
		const message = update.message;

		helper.update = update;
		helper.ID =
			message?.chat.id
			?? update.callback_query?.message?.chat?.id
			?? update.inline_query?.from?.id
			?? update.my_chat_member?.from?.id
			?? update.channel_post?.chat?.id
			?? 0;

		if (helper.ID === 0) {
			logError("Main TG update handler / 0 chat ID", JSON.stringify(update));
			return;
		}

		if (update.channel_post
			&& !(
				update.channel_post.chat.username ? config.whiteListChats.includes(`@${update.channel_post.chat.username}`)
					: config.whiteListChats.includes(helper.ID.toString())
			)) {
			TelegramCall(TelegramMethodEnum.LeaveChat, { chat_id: helper.ID });
			return;
		}

		const user = await auth(this.userApplication, helper.ID);

		if (!(user && this.#continue && user.status !== UserStatus.Banned)) return;

		const username = message?.from.username ?? update.channel_post?.chat?.username;
		if (username && username !== user.username) {
			await this.userApplication.setUsername(user.tgId, username);
		}

		if (user.status === UserStatus.Temp) {
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
				if (update.message?.text?.startsWith('/'))
					await this.adminCommandHandler.handler(helper);
				if (this.#continue)
					await this.adminHandler.handler(helper);
			}

			if (this.#continue) {
				switch (message.text?.toLowerCase()) {
					case "/start":
					case UIT.userPanel.toLowerCase():
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
					case UIT.changeLanguage.toLowerCase():
					case "/language":
						helper.call(TelegramMethodEnum.SendText, {
							chat_id: helper.ID,
							text: UIT.selectLanguage,
							reply_markup: inlineKeyboards.changeLanguage(helper.UIT)
						});
						this.end();
						await this.helper.setUserMode(UserMode.ChangeLanguage);
						break;
					case "/cancel":
						const cancelResult = this.videoApplication.cancelDownload(helper.ID);
						helper.sendText(UIT[cancelResult] ?? cancelResult).end();
						break;
					case UIT.help.toLowerCase():
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
						case UserMode.ChangeLanguage: {
							if (!update.message?.text) {
								helper.sendText(UIT.commandNotFound).end();
							} else {
								const desiredLang = UIText.getLanguageByName(update.message.text);
								if (desiredLang) {
									if ((await this.userApplication.setUserLanguage(user.tgId, desiredLang._lang)).ok) {
										helper.call(TelegramMethodEnum.SendText, {
											chat_id: helper.ID,
											text: dynamicText({
												text: desiredLang.languageChanged,
												update
											}),
											reply_markup: inlineKeyboards.user(helper.user, desiredLang)
										});
										this.end();
										await this.helper.setUserMode(UserMode.Default);
									} else {
										helper.sendText(UIT.setError).end();
									}
								} else {
									helper.sendText(UIT.invalidLanguage).end();
								}
							}
						} break;
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
		private videoApplication: VideoApplication,
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
