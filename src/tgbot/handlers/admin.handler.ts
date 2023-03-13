import UserApplication from "../../application/user.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import config from "../../config.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";

export default class AdminHandler implements HandlerBase {
    constructor(
        private userApplication: UserApplication
    ) {}
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, user, call, ID, end } = handlerData;
        if (user && update.message?.text) {
            if(config.owners.includes(ID)) {
                switch(update.message.text) {
                    case UIT.addAdmin:
                        call(TelegramMethodEnum.SendMessage, {
                            chat_id: ID,
                            text: UIT.sendUserIdToAddAdmin,
                            reply_markup: inlineKeyboards.cancel(UIT)
                        });
                        end();
                        return;
                    case UIT.remAdmin:
                        const adminsKeyboard = (await this.userApplication.getListOfAdmins())
                            .map(adminId => [adminId.toString()]);
                        adminsKeyboard.push([UIT.cancel]);
                        call(TelegramMethodEnum.SendMessage, {
                            chat_id: ID,
                            text: UIT.selectItemToRemove,
                            reply_markup: inlineKeyboards.create(adminsKeyboard)
                        });
                        end();
                        return;
                }
            }
        }
    };
}