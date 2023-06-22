export type ChatID = number;

export type MessageID = number;

export type Chat = {
    id: ChatID;
    type: "private" | "group" | "supergroup" | "channel";
    username?: string;
    first_name?: string;
    last_name?: string;
    is_forum?: true;
}

type User = {
    id: ChatID;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: string;
};

export type TelegramMessage = {
    text?: string;
    date: number;
    chat: Chat;
    from: User;
    message_id: MessageID;
    contact?: {
        user_id: ChatID;
        phone_number: string;
    };
    forward_from?: User;
    forward_from_chat?: Chat;
    reply_to_message?: TelegramMessage;
};

type ChatMemberOwner = {
    status: "creator";
    user: User;
    is_anonymous: boolean;
    custom_title?: string;
};

type ChatMemberAdministrator = {
    status: "administrator";
    user: User;
    can_be_edited: boolean;
    is_anonymous: boolean;
    can_manage_chat: boolean;
    custom_title?: string;
};

type ChatMemberMember = {
    status: "member";
    user: User;
};

type ChatMemberRestricted = {
    status: "restricted";
    user: User;
    is_member: boolean;
    can_send_messages: boolean;
    until_date: number;
};

type ChatMemberLeft = {
    status: "left";
    user: User;
};

type ChatMemberBanned = {
    status: "kicked";
    user: User;
    until_date: number;
};

type ChatMember = ChatMemberOwner | ChatMemberAdministrator | ChatMemberMember | ChatMemberRestricted | ChatMemberLeft | ChatMemberBanned;

type ChatMemberUpdated = {
    chat: Chat;
    from: User;
    date: number;
    old_chat_member: ChatMember;
    new_chat_member: ChatMember;
};

export type TgMsgUpdate = {
    callback_query?: {
        id: string;
        data: string;
        from: User;
        message: TelegramMessage;
    }
    inline_query?: {
        id: string;
        query: string;
        from: User;
    }
    message?: TelegramMessage;
    my_chat_member?: ChatMemberUpdated;
    channel_post?: TelegramMessage;
}
