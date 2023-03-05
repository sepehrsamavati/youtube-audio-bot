import OperationResult from "../../../common/models/operationResult.js";
import { QueueVideo } from "../../../common/models/queueVideo.js";
import { ChatID } from "../../../common/types/tgBot.js";

export default interface IVideoApplication {
    get(videoId: string, userId: ChatID): Promise<Video | null>;
    like(videoId: string, userId: ChatID): Promise<OperationResult>;
    removeLike(videoId: string, userId: ChatID): Promise<OperationResult>;
    add(video: Video): Promise<OperationResult>;
}
