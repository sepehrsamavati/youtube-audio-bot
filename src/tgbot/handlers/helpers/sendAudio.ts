import fs from "node:fs/promises";
// import FormData from "form-data";
import settings from "../../../settings.js";
import inlineKeyboards from "./inlineKeyboards.js";
import TelegramCall from "../../../common/helpers/tgCall.js";
import { QueueVideo } from "../../../common/models/queueVideo.js";
import { SendAudioOptions } from "../../../common/types/sendAudio.js";
import generateMp3Name from "../../../common/helpers/generateMp3Name.js";
import { TelegramMethodEnum } from "../../../common/enums/tgMethod.enum.js";


export default async (opt: SendAudioOptions) => {
    const { ID, replyToMessage, UIT, audio } = opt;

    const viewModel = typeof audio === "object" ? (audio instanceof QueueVideo ? audio.id : audio) : audio;

    const options = new FormData();

    options.append("chat_id", ID.toString());
    options.append("reply_markup", JSON.stringify(inlineKeyboards.audio.normal(viewModel, UIT)));

    if (replyToMessage) {
        options.append("reply_to_message_id", replyToMessage.toString());
        options.append("allow_sending_without_reply", "true");
    }

    if (settings.protectAudios)
        options.append("protect_content", "true");

    if (typeof audio === "object") {
        if (audio instanceof QueueVideo) {
            options.append("title", audio.title);
            options.append("performer", audio.artist);
            options.append("audio", new Blob([await fs.readFile(audio.fileAddress + ".mp3")]), generateMp3Name(audio));
            options.append("thumb", new Blob([await fs.readFile(audio.fileAddress + ".jpg")]));
        } else
            options.append("audio", audio.tgFileId);
    }

    return TelegramCall(TelegramMethodEnum.SendAudio, options);
};