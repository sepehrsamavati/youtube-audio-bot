import BroadcastApplication from "../../application/broadcast.application";
import SettingsApplication from "../../application/settings.application";
import UITextApplication from "../../application/uitext.application";
import UserApplication from "../../application/user.application";
import VideoApplication from "../../application/video.application";
import ViewApplication from "../../application/view.application";

export interface AppStatistics {
	defaultLang: string;
    publicMode: boolean;
	shareAvailable: boolean;
}

export interface AppSettings {
	defaultLang: string;
    publicMode: boolean;
	shareAvailable: boolean;
}

export default interface YTAServices {
    videoApplication: VideoApplication;
    userApplication: UserApplication;
    UITApplication: UITextApplication;
    viewApplication: ViewApplication;
    settingsApplication: SettingsApplication;
    broadcastApplication: BroadcastApplication;
}