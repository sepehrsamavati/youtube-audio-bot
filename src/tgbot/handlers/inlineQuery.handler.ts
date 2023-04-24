import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";

export default class InlineQueryHandler implements HandlerBase {
    constructor(
        private userApplication: UserApplication,
        private videoApplication: VideoApplication
    ) {}
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        const inlineQuery = update.inline_query;
        if (user && inlineQuery) {
            if(inlineQuery.query.startsWith("getVid"))
			{
                const videoYtId = inlineQuery.query.slice(6);
				const video = await this.videoApplication.getAudio(videoYtId, ID);
				const inlineResults = [];
				if(video)
				{
					inlineResults.push({
						type: "audio",
						id: video.vid,
						audio_file_id: video.tgFileId
					});
				}
				call(TelegramMethodEnum.AnswerInlineQuery, {
					inline_query_id: inlineQuery.id,
					results: inlineResults
				});
                end();
			}
        }
    };
}