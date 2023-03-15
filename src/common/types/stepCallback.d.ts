import { UITextObj } from "./uitext";

type StepCallback = (queueVideo: QueueVideo, stepSuccess: boolean, error?: keyof UITextObj) => void;