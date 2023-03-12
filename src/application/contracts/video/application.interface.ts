import OperationResult from "../../../common/models/operationResult.js";
import { ChatID } from "../../../common/types/tgBot.js";

export default interface IVideoApplication {
    getAudio(videoId: string, userId: ChatID): Promise<AudioViewModel | null>;
    like(videoId: string, userId: ChatID): Promise<OperationResult>;
    removeLike(videoId: string, userId: ChatID): Promise<OperationResult>;
    add(video: Video): Promise<OperationResult>;
}
