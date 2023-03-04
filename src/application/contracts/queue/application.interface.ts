import { QueueVideo } from "../../../common/types/video";

export default interface IQueueApplication {
    queue: QueueVideo[];
    add(video: QueueVideo): boolean;
    exists(vid: string): boolean;
    remove(vid: string): boolean;
}
