import { User } from "../types/user.js";
import { UITextObj } from "../types/uitext.js";
import { newLocalVideoID } from "../helpers/id.js";
import { QueueVideoStep } from "../enums/video.enum.js";

export class QueueVideo {
    public id: string;
    public localId: string;
    public fromUser: User;
    public lastUpdate: Date = new Date();
    public step: QueueVideoStep = QueueVideoStep.Validate;
    public fileAddress: string = "";
    public error?: keyof UITextObj;
    public canceled = false;

    public mp4Size: number = 0;
    public mp3Size: number = 0;
    public title: string = "";
    public artist: string = "";
    public album: string = "";
    public year: string = "";
    public thumbnail: string = "";
    public thumbSize: number = 0;

    constructor(id: string, user: User){
        this.id = id;
        this.fromUser = user;
        this.localId = newLocalVideoID(this.id);
        return this;
    }
}