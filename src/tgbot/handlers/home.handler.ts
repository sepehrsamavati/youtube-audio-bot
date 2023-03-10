import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import { QueueVideo } from "../../common/models/queueVideo.js";

export default class HomeHandler implements HandlerBase {
    constructor(
        private videoApplication: VideoApplication,
        private userApplication: UserApplication
    ){}
    public async handler (handlerData: HandlerHelper) {
        const { update, end, sendText, UIT, user, langCode, call, ID } = handlerData;
        if(user && update.message?.text)
        {
            const canSubmit = this.userApplication.canSubmitRequest(user);
            if(canSubmit.ok) {
                const videoId = VideoApplication.Downloader.validateVideoId(update.message.text);

                if(!videoId)
                    return sendText(UIT.invalidVideo).end();

                const queueVideo = new QueueVideo(videoId);

                const info = await VideoApplication.Downloader.getInfo(queueVideo);
                if(!info.ok) return sendText(info.message).end();

                const download = await VideoApplication.Downloader.download(queueVideo);
                if(!download.ok) return sendText(info.message).end();

                const convert = await VideoApplication.Downloader.convert(queueVideo);
                if(!convert.ok) return sendText(info.message).end();

                const genCover = await VideoApplication.Downloader.generateCover(queueVideo);
                if(!genCover.ok) return sendText(info.message).end();

                const setMeta = await VideoApplication.Downloader.setMeta(queueVideo);
                if(!setMeta.ok) return sendText(info.message).end();

            } else {
                sendText(UIT[canSubmit.message]).end();
            }
        }
    };
}