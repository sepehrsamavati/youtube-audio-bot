import OperationResult from "../../../common/models/operationResult";
import { ChatID } from "../../../common/types/tgBot";
import { Video } from "../../../common/types/video";

export default interface IVideoApplication {
    get(videoId: string, userId: ChatID): Promise<Video | null>;
    like(videoId: string, userId: ChatID): Promise<OperationResult>;
    removeLike(videoId: string, userId: ChatID): Promise<OperationResult>;
    add(video: Video): Promise<OperationResult>;
    getInfo(vid: string): void;
}
