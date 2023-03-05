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
    fileAddress: string;
    error?: string;

    mp4Size: number;
    mp3Size: number;
    title: string;
    artist: string;
    album: string;
    year: string;
    thumbnail: string;
    thumbSize: number;
}
