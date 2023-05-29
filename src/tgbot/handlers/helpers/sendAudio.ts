import settings from "../../../settings.js";
import inlineKeyboards from "./inlineKeyboards.js";
import TelegramCall from "../../../common/helpers/tgCall.js";
import { SendAudioOptions } from "../../../common/types/sendAudio.js";
import { TelegramMethodEnum } from "../../../common/enums/tgMethod.enum.js";


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

    if(settings.protectAudios)
        options.protect_content = true;

    if(filePath)
        options.file = filePath;
    else if(typeof audio === "object")
        options.audio = audio.tgFileId;

    return TelegramCall(TelegramMethodEnum.SendAudio, options);
};