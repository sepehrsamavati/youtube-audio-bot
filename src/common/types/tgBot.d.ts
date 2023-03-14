export type ChatID = number;

export type MessageID = number;

export type Chat = {
    id: ChatID;
}

export type TelegramMessage = {
    text?: string;
    chat: Chat;
    from: Chat;
    message_id: MessageID;
    contact?: {
        user_id: ChatID;
        phone_number: string;
    };
    forward_from?: ChatID;
    forward_from_chat?: Chat;
};

export type TgMsgUpdate = {
    callback_query?: {
        id: string;
        data: string;
        from: Chat;
        message: TelegramMessage;
    }
    inline_query?: {
        id: string;
        query: string;
        from: Chat;
    }
    message?: TelegramMessage;
}
