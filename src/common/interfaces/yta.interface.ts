import UserApplication from "../../application/user.application";
import VideoApplication from "../../application/video.application";

export default interface YTAServices {
    videoApplication: VideoApplication;
    userApplication: UserApplication;
}