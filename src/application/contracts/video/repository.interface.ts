import { Video } from "../../../common/types/video";

export default interface IVideoRepository {
    create(video: Video): Promise<Video | null>;
    findById(id: string): Promise<Video | null>;
}
