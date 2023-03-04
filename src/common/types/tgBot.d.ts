export type ChatID = number;

export type MessageID = number;

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
