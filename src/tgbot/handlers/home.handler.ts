import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import { QueueVideoStep } from "../../common/enums/video.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { QueueVideo } from "../../common/models/queueVideo.js";
import { ChatID, MessageID } from "../../common/types/tgBot.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import { getUICode, getVideoId } from "./helpers/videoIdBase64.js";
import Extensions from "../../common/helpers/extensions.js";
import sendAudio from "./helpers/sendAudio.js";

export default class HomeHandler implements HandlerBase {
    constructor(
        private videoApplication: VideoApplication,
        public userApplication: UserApplication
    ) { }
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        if (!update.message?.text) return;

        switch(update.message.text) {
            case UIT.random:
                const randomAudio = await this.videoApplication.getRandomAudio(user.id);
                if(randomAudio)
                    sendAudio({
                        ID, UIT, replyToMessage: update.message.message_id,
                        audio: randomAudio, 
                    });
                else sendText(UIT.musicNotFound);
                return;
            case UIT.recentDownloads:
                const getRecentCount = 15;
                const recentDownloads = await this.videoApplication.getRecentDownloads(getRecentCount);
                sendText(
                        recentDownloads.length ?
                        Extensions.StringFormatter(UIT._recentDownloads, [
                            recentDownloads.length,
                            recentDownloads.map((video, i) => `${i+1}. ${video.title} /v${getUICode(video.id)}`).join("\n\n")
                        ]) : UIT.noDownloads
                    );
                end();
                return;
            case UIT.weekTop:
                const getWeekCount = 5;
                const lastWeekDownloads = await this.videoApplication.getLastWeekDownloads(getWeekCount);
                sendText(
                        lastWeekDownloads.length ?
                        Extensions.StringFormatter(UIT._weekTop, [
                            lastWeekDownloads.length,
                            lastWeekDownloads.map( (video, i) => `${i+1}. ${video.title} /v${getUICode(video.id)}` ).join("\n\n")
                        ]) : UIT.noDownloads
                    );
                end();
                return;
            case UIT.top5:
                const getTopNCount = 5;
                const topAudios = await this.videoApplication.getTop(getTopNCount);
                sendText(
                        topAudios.length ?
                        Extensions.StringFormatter(UIT._top5, [
                            topAudios.length,
                            topAudios.map( (video, i) => `${i+1}. ${video.title} /v${getUICode(video.id)}` ).join("\n\n")
                        ]) : UIT.noDownloads
                    );
                end();
                return;
            case UIT.mostLikes:
                const getMostLikedCount = 5;
                const mostLiked = await this.videoApplication.getMostLiked(getMostLikedCount);
                sendText(
                    mostLiked.length ?
                        Extensions.StringFormatter(UIT._mostLikes, [
                            mostLiked.length,
                            mostLiked.map( (video, i) => `${i+1}. ${video.title} /v${getUICode(video.id)}` ).join("\n\n")
                        ]) : UIT.noDownloads
                    );
                end();
                return;
        }

        const canSubmit = this.userApplication.canSubmitRequest(user);
        if (canSubmit.ok) {
            if(update.message.text.startsWith('/v')) {
                const videoId = getVideoId(update.message.text.slice(2));
                if(VideoApplication.Downloader.validateVideoId(videoId)) {
                    const video = await this.videoApplication.getAudio(videoId, user.id);
                    if(video)
                        sendAudio({
                            ID, UIT, replyToMessage: update.message.message_id,
                            audio: video
                        });
                    else
                        sendText(UIT.musicNotFound);
                    return end();
                }
            }

            const videoId = VideoApplication.Downloader.validateVideoId(update.message.text);
            const userMessageId: ChatID = update.message.message_id;

            if (!videoId) {
                call(TelegramMethodEnum.SendMessage, {
                    chat_id: ID,
                    reply_to_message_id: userMessageId,
                    text: UIT.invalidVideo
                });
                end();
                return
            }

            const cacheVideo = await this.videoApplication.getAudio(videoId, user.id);
            if (cacheVideo) {
                sendAudio({
                    ID, UIT, replyToMessage: userMessageId, audio: cacheVideo
                });
                end();
                return;
            }
            const sentMessage = await call(TelegramMethodEnum.SendMessage, {
                chat_id: ID,
                reply_to_message_id: userMessageId,
                text: UIT.validating
            });

            if (sentMessage !== null) {
                call(TelegramMethodEnum.SendChatAction, {
                    chat_id: ID,
                    action: "record_voice"
                });

                const stepMessageId: MessageID = sentMessage.message_id;

                this.videoApplication.startDownload(videoId, user, {
                    minDelay: 500,
                    stepCallback: (queueVideo: QueueVideo | null, success: boolean, error) => {

                        let text = (error ? UIT[error] : "ERROR") ?? "ERROR";

                        if (queueVideo && success) {
                            switch (queueVideo.step) {
                                case QueueVideoStep.Validate:
                                    text = UIT.getInfo;
                                    break;
                                case QueueVideoStep.GetInfo:
                                    text = UIT.downloadVideo;
                                    break;
                                case QueueVideoStep.DownloadVideo:
                                    text = UIT.convertToAudio;
                                    break;
                                case QueueVideoStep.ConvertToAudio:
                                    text = UIT.generateCover;
                                    break;
                                case QueueVideoStep.GenerateCover:
                                    text = UIT.setMeta;
                                    break;
                                case QueueVideoStep.SetMeta:
                                    text = UIT.upload;
                                    break;
                            }
                        }

                        /* Update steps status message */
                        call(TelegramMethodEnum.EditMessageText, {
                            chat_id: ID,
                            message_id: stepMessageId,
                            text
                        });

                        /* Successful end */
                        if (success && queueVideo?.step === QueueVideoStep.SetMeta) {
                            sendAudio({
                                ID, UIT,
                                replyToMessage: userMessageId,
                                audio: queueVideo
                            }).then(data => {
                                if (data !== null) {
                                    this.videoApplication.add(queueVideo, data.audio.file_id);
                                    call(TelegramMethodEnum.DeleteMessage, {
                                        chat_id: ID,
                                        message_id: stepMessageId
                                    });
                                } else {
                                    call(TelegramMethodEnum.EditMessageText, {
                                        chat_id: ID,
                                        message_id: stepMessageId,
                                        text: UIT.uploadError
                                    });
                                }
                                this.videoApplication.flush(queueVideo);
                            });
                        }
                    }
                });
            }

            end();
        }
        else
            sendText(UIT[canSubmit.message]).end();
    };
}