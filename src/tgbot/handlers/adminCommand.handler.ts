import Extensions from "../../common/helpers/extensions.js";
import HandlerBase from "../../common/models/handlerBase.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import UserApplication from "../../application/user.application.js";
import { UserMode, UserStatus } from "../../common/enums/user.enum.js";
import TelegramCall from "../../common/helpers/tgCall.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";

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
                    user.promotedBy ? Extensions.StringFormatter(UIT.promotedBy, [user.promotedBy, `/demote${user.tgId}`]) : `/promote${user.tgId}`,
                    user.status === UserStatus.Banned ? `/unban${user.tgId}` : `/ban${user.tgId}`
                ]) : UIT.userNotFound
            ).end();
        } else if (command.startsWith("get")) {
            const tgId = parseInt(command.slice(3));
            const user = await this.userApplication.getByTgId(tgId, false, false);
            sendText(
                user ? Extensions.StringFormatter(UIT.userAccountInfo, [
                    user.tgId, `${user.username ? `\n@${user.username}` : ''}`,
                    UserStatus[user.status], UserMode[user.mode], user.language, user.lastRequest.toLocaleString(),
                    user.promotedBy ? Extensions.StringFormatter(UIT.promotedBy, [user.promotedBy, `/demote${user.tgId}`]) : `/promote${user.tgId}`,
                    user.status === UserStatus.Banned ? `/unban${user.tgId}` : `/ban${user.tgId}`
                ]) : UIT.userNotFound
            ).end();
        } else if (command.startsWith("ban")) {
            const tgId = parseInt(command.slice(3));
            const user = await this.userApplication.getByTgId(tgId, false, false);
            let response = UIT.userNotFound;
            if(tgId !== ID) {
                if(user)
                {
                    if(user.status === UserStatus.Banned) response = UIT.alreadyBanned;
                    else response = (await this.userApplication.setUserStatus(user.tgId, UserStatus.Banned)).ok ? UIT.userBanned : UIT.failed;
                }
            } else {
                response = UIT.cantBanYourself;
            }
            sendText(response).end();
        } else if (command.startsWith("unban")) {
            const tgId = parseInt(command.slice(5));
            let response = UIT.userNotFound;
            const user = await this.userApplication.getByTgId(tgId, false, false);
            if(user)
            {
                if(user.status !== UserStatus.Banned) response = UIT.notBanned;
                else response = (await this.userApplication.setUserStatus(user.tgId, UserStatus.Temp)).ok ? UIT.userBanned : UIT.failed;
            }
            sendText(response).end();
        } else if (command.startsWith("promote")) {
            const tgId = parseInt(command.slice(7));
            let response = UIT.userNotFound;
            const user = await this.userApplication.getByTgId(tgId, false, false);
            if(user)
            {
                if(user.promotedBy) response = Extensions.StringFormatter(UIT.alreadyPromotedBy, [user.promotedBy]);
                else response = (await this.userApplication.promote(user.tgId, ID)).ok ? UIT.promoted : UIT.failed;
            }
            sendText(response).end();
        } else if (command.startsWith("demote")) {
            const tgId = parseInt(command.slice(6));
            let response = UIT.userNotFound;
            const user = await this.userApplication.getByTgId(tgId, false, false);
            if(user)
            {
                if(!user.promotedBy) response = UIT.notPromoted;
                else response = (await this.userApplication.demote(user.tgId)).ok ? UIT.demoted : UIT.failed;
            }
            sendText(response).end();
        } else if (command.startsWith("leave")) {
            const usernameOrId = command.slice(5);
            const res = await TelegramCall(TelegramMethodEnum.LeaveChat, {
                chat_id: usernameOrId
            });
            sendText(res ? UIT.ok : UIT.failed).end();
        }

    }
}