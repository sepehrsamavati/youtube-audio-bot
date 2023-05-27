import { log } from "../common/helpers/log.js";
import call from "../common/helpers/tgCall.js";
import UpdateHandler from "./handlers/main.js";
import HomeHandler from "./handlers/home.handler.js";
import AdminHandler from "./handlers/admin.handler.js";
import ReturnHandler from "./handlers/return.handler.js";
import YTAServices from "../common/interfaces/yta.interface.js";
import UserApplication from "../application/user.application.js";
import InlineQueryHandler from "./handlers/inlineQuery.handler.js";
import VideoApplication from "../application/video.application.js";
import AdminCommandHandler from "./handlers/adminCommand.handler.js";
import { TelegramMethodEnum } from "../common/enums/tgMethod.enum.js";
import CallbackQueryHandler from "./handlers/callbackQuery.handler.js";

export default class TelegramBot {
	userApplication: UserApplication;
	videoApplication: VideoApplication;
	returnHandler: ReturnHandler;
	adminHandler: AdminHandler;
	adminCommandHandler: AdminCommandHandler;
	homeHandler: HomeHandler;
	callbackQueryHandler: CallbackQueryHandler;
	inlineQueryHandler: InlineQueryHandler;

	#nextUpdateId = 0;

	constructor(services: YTAServices) {
		this.userApplication = services.userApplication;
		this.videoApplication = services.videoApplication;
		this.returnHandler = new ReturnHandler();
		this.adminHandler = new AdminHandler(
			services.userApplication,
			services.UITApplication,
			services.settingsApplication,
			services.broadcastApplication,
			services.viewApplication,
			services.videoApplication
			);
		this.adminCommandHandler = new AdminCommandHandler(services.userApplication);
		this.homeHandler = new HomeHandler(services.videoApplication, services.userApplication);
		this.callbackQueryHandler = new CallbackQueryHandler(services.userApplication, services.videoApplication);
		this.inlineQueryHandler = new InlineQueryHandler(services.videoApplication);
		this.#startBot();
	}

	#startBot() {
		call(TelegramMethodEnum.GetMe, null, (bot) => {
			if(!bot)
			{
				console.log("Telegram connection issue!");
				return;
			}
	
			const botUsername = bot.username;
	
			log(`Bot started @${botUsername}`);
	
			this.#getUpdates();
		});
	};
	
	#getUpdates() {
		call(TelegramMethodEnum.GetUpdates, {
			offset: this.#nextUpdateId,
			limit: 100,
			timeout: 10
			}, (updates) => {
				if(updates)
				{
					if (updates.length > 0) {
						for (var i=0; i<updates.length; ++i) {
							const updateHandler = new UpdateHandler(
								this.userApplication,
								this.videoApplication,
								this.returnHandler,
								this.adminHandler,
								this.adminCommandHandler,
								this.homeHandler,
								this.callbackQueryHandler,
								this.inlineQueryHandler
							);
							updateHandler.handleUpdate(updates[i]);
						}
						var lastUpdate = updates[updates.length-1];
						this.#nextUpdateId = lastUpdate.update_id + 1;
					}
					this.#getUpdates();
				}
		});
	};
}
