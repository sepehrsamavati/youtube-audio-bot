import { QueueVideoStep } from "../enums/video.enum.js";
import { ChatID, MessageID } from "../types/tgBot.js";

export class QueueVideo {
    public id: string = "";
    public localId: string = "";
    public fromUser: User['tgId'] = -1;
    public userMessageId: ChatID = -1;
    public lastUpdate: Date = new Date();
    public stepMessageId: MessageID = -1;
    public step: QueueVideoStep = QueueVideoStep.GetInfo;
    public fileAddress: string = "";
    public error?: string;

    public mp4Size: number = -1;
    public mp3Size: number = -1;
    public title: string = "";
    public artist: string = "";
    public album: string = "";
    public year: string = "";
    public thumbnail: string = "";
    public thumbSize: number = -1;

    
}