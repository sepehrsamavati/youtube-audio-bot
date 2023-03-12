import TelegramCall from "../helpers/tgCall.js";
import { ChatID, TgMsgUpdate } from "../types/tgBot.js";
import { User } from "../types/user.js";

export interface Handler {
    update: TgMsgUpdate;
    ID: ChatID;
    user?: User;
    call: typeof TelegramCall;
    end: () => void;
}
