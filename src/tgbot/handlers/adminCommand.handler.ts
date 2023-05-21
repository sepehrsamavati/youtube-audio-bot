import HandlerBase from "../../common/models/handlerBase.js"
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import UserApplication from "../../application/user.application.js";

export default class AdminCommandHandler implements HandlerBase {
    constructor(
        public userApplication: UserApplication
    ) { }

    public async handler(handlerData: HandlerHelper) {
        const { ID, UIT, sendText } = handlerData;
        const command = handlerData.update.message!.text!.slice(1);

        if (command.startsWith("find")) {
            const username = command.split('@').pop();
            const user = await this.userApplication.getByUsername(username as string);
            sendText(JSON.stringify(user)).end();
        } else if (command.startsWith("get")) {
        } else if (command.startsWith("block")) {
        } else if (command.startsWith("unblock")) {
        } else if (command.startsWith("promote")) {
        } else if (command.startsWith("demote")) {}

    }
}