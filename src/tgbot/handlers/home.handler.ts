import UserApplication from "../../application/user.application.js";
import VideoApplication from "../../application/video.application.js";
import { QueueVideoStep } from "../../common/enums/video.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { QueueVideo } from "../../common/models/queueVideo.js";
import { ChatID, MessageID, TgMsgUpdate } from "../../common/types/tgBot.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";

export default class HomeHandler implements HandlerBase {
    constructor(
        private videoApplication: VideoApplication,
        public userApplication: UserApplication
    ) { }
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        if (user && update.message?.text) {
            const canSubmit = this.userApplication.canSubmitRequest(user);
            if (canSubmit.ok) {
                const videoId = VideoApplication.Downloader.validateVideoId(update.message.text);

                if (!videoId)
                    return sendText(UIT.invalidVideo).end();

                const cacheVideo = await this.videoApplication.getAudio(videoId, ID);
                if (cacheVideo)
                {
                    call(TelegramMethodEnum.SendAudio, {
                        chat_id: ID,
                        audio: cacheVideo.tgFileId,
                        reply_markup: inlineKeyboards.audio.normal(cacheVideo, UIT)
                    });
                    end();
                    return;
                }

                const userMessageId: ChatID = update.message.message_id;
                const sentMessage = await call(TelegramMethodEnum.SendMessage, {
                    chat_id: ID,
                    reply_to_message_id: userMessageId,
                    text: UIT.getInfo
                });

                if (sentMessage !== null) {
                    const stepMessageId: MessageID = sentMessage.message_id;

                    this.videoApplication.startDownload(videoId, {
                        minDelay: 500,
                        stepCallback: (queueVideo: QueueVideo, success: boolean) => {

                            if (!success) {
                                return;
                            }

                            let text = "ERROR";

                            switch (queueVideo.step) {
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

                            /* Update steps status message */
                            call(TelegramMethodEnum.EditMessageText, {
                                chat_id: ID,
                                message_id: stepMessageId,
                                text
                            });

                            /* Successful end */
                            if (queueVideo.step === QueueVideoStep.SetMeta) {
                                call(TelegramMethodEnum.SendAudio, {
                                    chat_id: ID,
                                    file: queueVideo.fileAddress + ".mp3",
                                    reply_to_message_id: userMessageId,
                                    reply_markup: inlineKeyboards.audio.normal(queueVideo.id, UIT)
                                }, (data) => {
                                    if (data !== null) {
                                        this.videoApplication.add({
                                            id: queueVideo.id,
                                            tgFileId: data.audio.file_id,
                                            title: queueVideo.title
                                        }, ID);
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