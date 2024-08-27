import TelegramCall from "../common/helpers/tgCall.js";
import { TelegramMethodEnum } from "../common/enums/tgMethod.enum.js";

TelegramCall(TelegramMethodEnum.SetWebhook, {
    url: ""
})
    .then(res => {
        if (res === true)
            console.log("✅ Webhook unset was successful");
    });
