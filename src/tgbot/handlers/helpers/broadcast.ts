import TelegramCall from "../../../common/helpers/tgCall.js";
import { TelegramMethodEnum } from "../../../common/enums/tgMethod.enum.js";

interface BroadcastHandlerOptions {
    adminTgId: number;
    messageId: number;
    forward: boolean;
    toUsers: number[];
};

export async function bcHandler(options: BroadcastHandlerOptions) {
    const method = options.forward ? TelegramMethodEnum.ForwardMessage : TelegramMethodEnum.CopyMessage;
    let sentCount = 0;
    let sendFailed: number[] = [];
    for(const chatId of options.toUsers) {
        const res = await TelegramCall(method, {
            chat_id: chatId,
            from_chat_id: options.adminTgId,
            message_id: options.messageId
        });
        if (res)
            sentCount++;
        else
            sendFailed.push(chatId);
    }
    return {
        sentCount, sendFailed
    };
}