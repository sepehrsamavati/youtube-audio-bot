import OperationResult from "../../../common/models/operationResult";

export default interface IVideoRepository {
    create(video: Video): Promise<OperationResult>;
    findById(id: string): Promise<Video | null>;
}
