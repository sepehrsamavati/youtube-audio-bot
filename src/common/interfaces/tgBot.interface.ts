import TelegramCall from "../helpers/tgCall.js";

export type ChatID = number;

export type Chat = {
    id: ChatID;
}

export type TgMsgUpdate = {
    message?: {
        text?: string;
        chat: Chat;
        from: Chat;
        contact?: {
            user_id: ChatID;
            phone_number: string;
        };
        forward_from?: ChatID;
        forward_from_chat?: Chat;
    }
}

export interface Handler {
    update: TgMsgUpdate;
    ID: ChatID;
    user?: User;
    call: typeof TelegramCall;
    end: () => void;
}
