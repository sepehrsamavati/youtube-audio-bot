import log from "../common/helpers/log.js";
import call from "../common/helpers/tgCall.js";
import HomeHandler from "./handlers/home.handler.js";
import UpdateHandler from "./handlers/main.js";

const homeHandler = new HomeHandler();

let nextUpdateId = 0;

const startBot = () => {
    call("getMe", null, function(bot) {
        if(!bot)
		{
			console.log("Telegram connection issue!");
			return;
		}

		const botUsername = bot.username;

		log(`Bot started @${botUsername}`);

		getUpdates();
	});
};

const getUpdates = () => {
	call("getUpdates", {
		offset: nextUpdateId,
		limit: 100,
		timeout: 10
		}, function(updates) {
			if(updates)
			{
				if (updates.length > 0) {
					for (var i=0; i<updates.length; ++i) {
                        const updateHandler = new UpdateHandler(homeHandler);
						updateHandler.handleUpdate(updates[i]);
					}
					var lastUpdate = updates[updates.length-1];
					nextUpdateId = lastUpdate.update_id + 1;
				}
				getUpdates();
			}
	});
};

startBot();
