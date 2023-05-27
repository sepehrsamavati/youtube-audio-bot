import TelegramCall from "./tgCall.js";
import { SendAudioOptions } from "../types/sendAudio";
import { TelegramMethodEnum } from "../enums/tgMethod.enum.js";
import inlineKeyboards from "../../tgbot/handlers/helpers/inlineKeyboards.js";


export default (opt: SendAudioOptions) => {
    const { ID, filePath, replyToMessage, UIT, audio } = opt;

    const options: any = {
        chat_id: ID,
        reply_markup: inlineKeyboards.audio.normal(audio, UIT)
    };

    if(replyToMessage)
    {
        options.reply_to_message_id = replyToMessage;
        options.allow_sending_without_reply = true;
    }

    if(filePath)
        options.file = filePath;
    else if(typeof audio === "object")
        options.audio = audio.tgFileId;

    return TelegramCall(TelegramMethodEnum.SendAudio, options);
};