import log from "../common/helpers/log.js";
import call from "../common/helpers/tgCall.js";
import YTAServices from "../common/interfaces/yta.interface.js";
import HomeHandler from "./handlers/home.handler.js";
import UpdateHandler from "./handlers/main.js";

export default class TelegramBot {
	homeHandler: HomeHandler;

	#nextUpdateId = 0;

	constructor(services: YTAServices) {
		this.homeHandler = new HomeHandler(services.videoApplication, services.userApplication);
		this.#startBot();
	}

	#startBot() {
		call("getMe", null, (bot) => {
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
		call("getUpdates", {
			offset: this.#nextUpdateId,
			limit: 100,
			timeout: 10
			}, (updates) => {
				if(updates)
				{
					if (updates.length > 0) {
						for (var i=0; i<updates.length; ++i) {
							const updateHandler = new UpdateHandler(this.homeHandler);
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
