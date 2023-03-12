import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";

export default class AdminHandler implements HandlerBase {
    constructor() { }
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        if (user && update.message?.text) {
            
        }
    };
}