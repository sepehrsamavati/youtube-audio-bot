import { TgMsgUpdate } from "./tgBot";

export type DynamicTextRender = {
    text?: string;
    update?: TgMsgUpdate;
    getWords?: true;
};