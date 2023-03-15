export enum QueueVideoStep {
    Validate = 0,
    GetInfo = 1,
    DownloadVideo = 2,
    ConvertToAudio = 3,
    GenerateCover = 4,
    SetMeta = 5,
    Upload = 6
}