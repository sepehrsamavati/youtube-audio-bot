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
            const tgId = parseInt(command.slice(5));
            const user = await this.userApplication.getByTgId(tgId, false, false);
            let response = UIT.userNotFound;
            if(tgId !== ID) {
                if(user)
                {
                    if(user.status === UserStatus.Blocked) response = UIT.alreadyBlocked;
                    else response = (await this.userApplication.setUserStatus(user.tgId, UserStatus.Blocked)).ok ? UIT.userBlocked : UIT.failed;
                }
            } else {
                response = UIT.cantBlockYourself;
            }
            sendText(response).end();
        } else if (command.startsWith("unblock")) {
            const tgId = parseInt(command.slice(7));
            let response = UIT.userNotFound;
            const user = await this.userApplication.getByTgId(tgId, false, false);
            if(user)
            {
                if(user.status !== UserStatus.Blocked) response = UIT.notBlocked;
                else response = (await this.userApplication.setUserStatus(user.tgId, UserStatus.Temp)).ok ? UIT.userBlocked : UIT.failed;
            }
            sendText(response).end();
        } else if (command.startsWith("promote")) {
        } else if (command.startsWith("demote")) {}

    }
}