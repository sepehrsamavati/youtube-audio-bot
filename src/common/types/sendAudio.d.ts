import { ChatID } from "./tgBot"
import { UITextObj } from "./uitext";
import { QueueVideo } from "../models/queueVideo.js";

export type SendAudioOptions = {
    ID: ChatID;
    queueVideo?: QueueVideo;
    replyToMessage?: number;
    audio: string | AudioViewModel | QueueVideo;
    UIT: UITextObj;
}