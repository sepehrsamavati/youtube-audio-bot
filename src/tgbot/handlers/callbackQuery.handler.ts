import inlineKeyboards from "./helpers/inlineKeyboards.js";
import HandlerBase from "../../common/models/handlerBase.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import UserApplication from "../../application/user.application.js";
import OperationResult from "../../common/models/operationResult.js";
import VideoApplication from "../../application/video.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";

export default class CallbackQueryHandler implements HandlerBase {
    constructor(
        private userApplication: UserApplication,
        private videoApplication: VideoApplication
    ) { }
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        const query = update.callback_query;
        if (user && query) {
            const addLike = query.data.startsWith("like");
            const removeLike = query.data.startsWith("remLike");
            if (addLike || removeLike) {
                let result = new OperationResult();
                const videoYtId = query.data.slice(addLike ? 4 : 7);
                const audio = await this.videoApplication.getAudio(videoYtId, user.id);

                if (audio)
                    result = addLike ? await this.videoApplication.like(audio.vid, user.id)
                            : await this.videoApplication.removeLike(audio.vid, user.id)
                else
                    result.failed("musicNotFound");
                    
                call(TelegramMethodEnum.AnswerCallbackQuery, {
                    callback_query_id: query.id,
                    text: UIT[result.message] ?? "ERROR"
                }, () => {
                    if (audio && result.ok) {
                        audio.isLiked = !audio.isLiked;
                        call(TelegramMethodEnum.EditMessageReplyMarkup, {
                            chat_id: query.message.chat.id,
                            message_id: query.message.message_id,
                            reply_markup: inlineKeyboards.audio.normal(audio, UIT)
                        });
                    }
                });
                end();
            }
        }
    };
}