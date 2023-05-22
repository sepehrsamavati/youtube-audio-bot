import Extensions from "../../common/helpers/extensions.js";
import HandlerBase from "../../common/models/handlerBase.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import UserApplication from "../../application/user.application.js";
import { UserMode, UserStatus } from "../../common/enums/user.enum.js";

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
            sendText(
                user ? Extensions.StringFormatter(UIT.userAccountInfo, [
                    user.tgId, `${user.username ? `\n@${user.username}` : ''}`,
                    UserStatus[user.status], UserMode[user.mode], user.language, user.lastRequest.toLocaleString(),
                    user.promotedBy ? Extensions.StringFormatter(UIT.promotedBy, [user.promotedBy]) : `/promote${user.tgId}`,
                    user.status === UserStatus.Blocked ? `/unblock${user.tgId}` : `/block${user.tgId}`
                ]) : UIT.userNotFound
            ).end();
        } else if (command.startsWith("get")) {
            const tgId = parseInt(command.slice(3));
            const user = await this.userApplication.getByTgId(tgId, false, false);
            sendText(
                user ? Extensions.StringFormatter(UIT.userAccountInfo, [
                    user.tgId, `${user.username ? `\n@${user.username}` : ''}`,
                    UserStatus[user.status], UserMode[user.mode], user.language, user.lastRequest.toLocaleString(),
                    user.promotedBy ? Extensions.StringFormatter(UIT.promotedBy, [user.promotedBy]) : `/promote${user.tgId}`,
                    user.status === UserStatus.Blocked ? `/unblock${user.tgId}` : `/block${user.tgId}`
                ]) : UIT.userNotFound
            ).end();
        } else if (command.startsWith("block")) {
        } else if (command.startsWith("unblock")) {
        } else if (command.startsWith("promote")) {
        } else if (command.startsWith("demote")) {}

    }
}