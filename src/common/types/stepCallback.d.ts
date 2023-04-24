import { UITextObj } from "./uitext";
import { QueueVideo } from "../../common/models/queueVideo.js";

type StepCallback = (queueVideo: QueueVideo | null, stepSuccess: boolean, error?: keyof UITextObj) => void;