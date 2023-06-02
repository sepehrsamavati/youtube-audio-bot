import { ChatID } from "./tgBot"
import { UITextObj } from "./uitext";

export type SendAudioOptions = {
    ID: ChatID;
    filePath?: string;
    replyToMessage?: number;
    audio: string | AudioViewModel;
    UIT: UITextObj;
}