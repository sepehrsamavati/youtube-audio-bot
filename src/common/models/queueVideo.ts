import { QueueVideoStep } from "../enums/video.enum.js";
import { newLocalVideoID } from "../helpers/id.js";
import { UITextObj } from "../types/uitext.js";
import { User } from "../types/user.js";

export class QueueVideo {
    public id: string;
    public localId: string;
    public fromUser: User['tgId'] = -1;
    public lastUpdate: Date = new Date();
    public step: QueueVideoStep = QueueVideoStep.Validate;
    public fileAddress: string = "";
    public error?: keyof UITextObj;

    public mp4Size: number = 0;
    public mp3Size: number = 0;
    public title: string = "";
    public artist: string = "";
    public album: string = "";
    public year: string = "";
    public thumbnail: string = "";
    public thumbSize: number = 0;

    constructor(id: string, userId: number){
        this.id = id;
        this.fromUser = userId;
        this.localId = newLocalVideoID(this.id);
        return this;
    }
}