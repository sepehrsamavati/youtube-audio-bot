import HandlerHelper from "../helpers/handlerHelper.js";

export default class HandlerBase {
    public handler!: (handlerData: HandlerHelper) => Promise<void>;
};
