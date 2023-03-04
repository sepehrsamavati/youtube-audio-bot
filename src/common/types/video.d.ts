import { ChatID, MessageID } from "./tgBot";

type Video = {
    id: string;
    title: string;
    tgFileId: string;
}

type QueueVideo = {
    localId: string;
    fromUser: User['tgId'];
    userMessageId: ChatID;
    lastUpdate: Date;
    stepMessageId: MessageID;
    step: QueueVideoStep;
}
