import VideoApplication from "../../application/video.application.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";

export default class HomeHandler implements HandlerBase {
    constructor(
        private videoApplication: VideoApplication
    ){}
    public async handler (handlerData: HandlerHelper) {
        const { update, end, sendText, UIT, user, langCode, call, ID } = handlerData;
        sendText(UIT.commandNotFound).end();
    };
}