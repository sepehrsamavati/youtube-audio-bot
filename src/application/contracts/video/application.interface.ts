import OperationResult from "../../../common/models/operationResult";
import { ChatID } from "../../../common/types/tgBot";
import { QueueVideo, Video } from "../../../common/types/video";

export default interface IVideoApplication {
    queue: QueueVideo[];
    get(videoId: string, userId: ChatID): Promise<Video | null>;
    like(videoId: string, userId: ChatID): Promise<OperationResult>;
    removeLike(videoId: string, userId: ChatID): Promise<OperationResult>;
    add(video: Video): Promise<OperationResult>;
    startProgress(vid: string): Promise<void>;
    getInfo(video: QueueVideo): Promise<void>;
    download(video: QueueVideo): Promise<void>;
}
