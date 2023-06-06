import settings from "../../settings.js";
import HandlerBase from "../../common/models/handlerBase.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import VideoApplication from "../../application/video.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";

export default class InlineQueryHandler implements HandlerBase {
    constructor(
        private videoApplication: VideoApplication
    ) {}
    public async handler(handlerData: HandlerHelper) {
        const { update, user, call, end } = handlerData;
        const inlineQuery = update.inline_query;
        if (user && inlineQuery) {
            if(inlineQuery.query.startsWith("getVid") && settings.shareAvailable)
			{
                const videoYtId = inlineQuery.query.slice(6);
				const video = await this.videoApplication.getAudio(videoYtId, user.id);
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