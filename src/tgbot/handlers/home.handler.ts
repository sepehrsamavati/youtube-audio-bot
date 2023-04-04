import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import { QueueVideoStep } from "../../common/enums/video.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { QueueVideo } from "../../common/models/queueVideo.js";
import { ChatID, MessageID } from "../../common/types/tgBot.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import { getUICode } from "./helpers/videoIdBase64.js";

export default class HomeHandler implements HandlerBase {
    constructor(
        private videoApplication: VideoApplication,
        public userApplication: UserApplication
    ) { }
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        if (user && update.message?.text) {
            switch(update.message.text) {
                case UIT.recentDownloads:
                    const getRecentCount = 15;
                    const recentDownloads = await this.videoApplication.getRecentDownloads(getRecentCount);
                    sendText(
                            `📆 Recent ${recentDownloads.length} downloads`
                            + `\n\n\n${recentDownloads.map((video, i) => `${i+1}. ${video.title} /v${getUICode(video.id)}`).join("\n\n")}`
                            );
                    end();
                    return;
                case UIT.weekTop:
                    const getWeekCount = 5;
                    const lastWeekDownloads = await this.videoApplication.getLastWeekDownloads(getWeekCount);
                    sendText(
                            lastWeekDownloads.length
                            ? `🔥 Top ${lastWeekDownloads.length} last week downloads`
                            +`\n\n\n${lastWeekDownloads.map( (video, i) => `${i+1}. ${video.title} /v${getUICode(video.id)}` ).join("\n\n")}`
                            : "No downloads!"
                            );
                    end();
                    return;
            }

            const canSubmit = this.userApplication.canSubmitRequest(user);
            if (canSubmit.ok) {
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

                const cacheVideo = await this.videoApplication.getAudio(videoId, ID);
                if (cacheVideo) {
                    call(TelegramMethodEnum.SendAudio, {
                        chat_id: ID,
                        audio: cacheVideo.tgFileId,
                        reply_markup: inlineKeyboards.audio.normal(cacheVideo, UIT)
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
                    const stepMessageId: MessageID = sentMessage.message_id;

                    this.videoApplication.startDownload(videoId, ID, {
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
                            if (queueVideo?.step === QueueVideoStep.SetMeta) {
                                call(TelegramMethodEnum.SendAudio, {
                                    chat_id: ID,
                                    file: queueVideo.fileAddress + ".mp3",
                                    reply_to_message_id: userMessageId,
                                    reply_markup: inlineKeyboards.audio.normal(queueVideo.id, UIT)
                                }, (data) => {
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
            } else {
                sendText(UIT[canSubmit.message]).end();
            }
        }
    };
}