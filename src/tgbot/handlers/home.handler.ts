import fs from "node:fs";
import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import { QueueVideoStep } from "../../common/enums/video.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import TelegramMethodEnum from "../../common/enums/tgMethod.enum.js";
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

                this.videoApplication.startDownload(videoId, (queueVideo: QueueVideo, success: boolean) => {
                    console.log(QueueVideoStep[queueVideo.step], success)
                    if(queueVideo.step === QueueVideoStep.SetMeta && success) {
                        call(TelegramMethodEnum.SendAudio, {
                            chat_id: ID,
                            file: queueVideo.fileAddress+".mp3"
                        }, (data) => {
                            debugger
                        });
                    }
                });

            } else {
                sendText(UIT[canSubmit.message]).end();
            }
        }
    };
}