import { ChatID, MessageID } from "./tgBot";

type Video = {
    id: string;
    title: string;
    tgFileId: string;
}

type QueueVideo = {
    id: string;
    localId: string;
    fromUser: User['tgId'];
    userMessageId: ChatID;
    lastUpdate: Date;
    stepMessageId: MessageID;
    step: QueueVideoStep;

    mp4Size: number;
    thumbnail: string;
    thumbSize: number;
}
