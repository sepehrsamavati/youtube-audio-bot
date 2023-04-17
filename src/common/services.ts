import YTAServices from "./interfaces/yta.interface.js";
import UserApplication from "../application/user.application.js";
import VideoApplication from "../application/video.application.js";
import UITextApplication from "../application/uitext.application.js";
import LikeRepository from "../infrastructure/mongo/repository/like.repository.js";
import UserRepository from "../infrastructure/mongo/repository/user.repository.js";
import ViewRepository from "../infrastructure/mongo/repository/view.repository.js";
import VideoRepository from "../infrastructure/mongo/repository/video.repository.js";
import UITextRepository from "../infrastructure/mongo/repository/uitext.repository.js";
import SettingsRepository from "../infrastructure/mongo/repository/settings.repository.js";
import SettingsApplication from "../application/settings.application.js";

export const Repositories = class {
    likeRepository: LikeRepository;
    viewRepository: ViewRepository;
    userRepository: UserRepository;
    videoRepository: VideoRepository;
    UITRepository: UITextRepository;
    settingsRepository: SettingsRepository;

    constructor(){
        this.likeRepository = new LikeRepository();
        this.viewRepository = new ViewRepository();
        this.userRepository = new UserRepository();
        this.videoRepository = new VideoRepository();
        this.UITRepository = new UITextRepository();
        this.settingsRepository = new SettingsRepository();
    }
}

export default class Services implements YTAServices {
    videoApplication: VideoApplication;
    userApplication: UserApplication;
    UITApplication: UITextApplication;
    settingsApplication: SettingsApplication;

    constructor() {
        const { userRepository, videoRepository, likeRepository, viewRepository, UITRepository, settingsRepository } = new Repositories();

        this.videoApplication = new VideoApplication(userRepository, videoRepository, likeRepository, viewRepository);

        this.userApplication = new UserApplication(userRepository);

        this.UITApplication = new UITextApplication(UITRepository);

        this.settingsApplication = new SettingsApplication(settingsRepository);
    }
}