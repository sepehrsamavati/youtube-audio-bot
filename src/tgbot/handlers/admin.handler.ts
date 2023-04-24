import config from "../../config.js";
import settings from "../../settings.js";
import UITextApplication from "../../application/uitext.application.js";
import UserApplication from "../../application/user.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { UserMode } from "../../common/enums/user.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import { DynamicTextHelp, dynamicTextHelp } from "./helpers/dynamicText.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import SettingsInputValidation from "./helpers/settingsInputValidation.js";
import SettingsApplication from "../../application/settings.application.js";
import Extensions from "../../common/helpers/extensions.js";

export default class AdminHandler implements HandlerBase {
    constructor(
        private userApplication: UserApplication,
        private UITApplication: UITextApplication,
        private settingsApplication: SettingsApplication
    ) {}
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, langCode, user, call, ID, end } = handlerData;
        const isOwner = config.owners.includes(ID);
        if (user && update.message?.text) {
            switch(update.message.text) {
                case "...":
                case UIT.return:
                case UIT.cancel:
                    handlerData.setUserMode(UserMode.Default);
                    call(TelegramMethodEnum.SendMessage, {
                        chat_id: ID,
                        text: '🤖',
                        reply_markup: inlineKeyboards.admin(user, UIT)
                    });
                    end();
                    return;
                case UIT.settings:
                    handlerData.setUserMode(UserMode.AdminSettings);
                    call(TelegramMethodEnum.SendMessage, {
                        chat_id: ID,
                        text: '⚙',
                        reply_markup: inlineKeyboards.create([
                            [UIT.startText, UIT.helpText],
                            [UIT.shareAvailable, UIT.publicMode],
                            [UIT.cancel]
                        ])
                    });
                    end();
                    return;
                case UIT.addAdmin:
                    if(!isOwner) {
                        sendText(UIT.noAccess).end();
                        return;
                    }

                    call(TelegramMethodEnum.SendMessage, {
                        chat_id: ID,
                        text: UIT.sendUserIdToAddAdmin,
                        reply_markup: inlineKeyboards.cancel(UIT)
                    });
                    end();
                    return;
                case UIT.remAdmin:
                    if(!isOwner) {
                        sendText(UIT.noAccess).end();
                        return;
                    }

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

            switch(user.mode) {
                case UserMode.AdminSettings:
                    
                    let settingTypeSelect = false,
                        settingText = UIT.invalidCommand,
                        settingKeyboard: string[][] = [],
                        availableDTs: (keyof DynamicTextHelp)[] = [],
                        onOfCurrentStatus = false;

                    switch(update.message.text)
                    {
                        case UIT.startText:
                            handlerData.setUserMode(UserMode.SetStartText);
                            settingText = `Current value:\n\n'${UIT._start}'\n\n\nSend new message`;
                            availableDTs = ["name"];
                            break;
                        case UIT.helpText:
                            handlerData.setUserMode(UserMode.SetHelpText);
                            settingText = `Current value:\n\n'${UIT._help}'\n\n\nSend new message`;
                            availableDTs = ["name"];
                            break;
                        case UIT.shareAvailable:
                            handlerData.setUserMode(UserMode.SetShareAvailability);
                            onOfCurrentStatus = settings.shareAvailable;
                            settingTypeSelect = true;
                            break;
                        case UIT.publicMode:
                            handlerData.setUserMode(UserMode.SetPublicMode);
                            onOfCurrentStatus = settings.publicMode;
                            settingTypeSelect = true;
                            break;
                    }

                    if(settingTypeSelect)
                    {
                        settingKeyboard.push([onOfCurrentStatus ? UIT.off : UIT.on]);
                        settingText = Extensions.StringFormatter(UIT.currentValueSelectNew, [onOfCurrentStatus ? UIT.on : UIT.off]);
                    }

                    if(availableDTs.length)
                    {
                        settingText += "\n\nAvailable dynamic words:\n" + availableDTs.map((key)=>{
                            const dt = dynamicTextHelp[key];
                            return dt ? `${dt.key} ${dt.value}` : ""
                        }).join('\n');
                    }

                    settingKeyboard.push([UIT.return]);

                    call(TelegramMethodEnum.SendMessage,{
                        chat_id: ID,
                        text: settingText,
                        reply_markup: inlineKeyboards.create(settingKeyboard)
                    });
                    end();
                    return;
                case UserMode.SetStartText:
                    new SettingsInputValidation<string>(update, {
                        title: UIT.startText,
                        user, UIT, handlerData,
                        type: String,
                        validator: (text) => {
                            if(text.length > 1000) {
                                return "tooLarge";
                            }
                        },
                        onValid: (value) => this.UITApplication.set(langCode, "_start", value)
                    });
                    end();
                    return;
                case UserMode.SetHelpText:
                    new SettingsInputValidation<string>(update, {
                        title: UIT.helpText,
                        user, UIT, handlerData,
                        type: String,
                        validator: (text) => {
                            if(text.length > 2000) {
                                return "tooLarge";
                            }
                        },
                        onValid: (value) => this.UITApplication.set(langCode, "_help", value)
                    });
                    end();
                    return;
                case UserMode.SetShareAvailability:
                    new SettingsInputValidation<boolean>(update, {
                        title: UIT.shareAvailable,
                        user, UIT, handlerData,
                        type: Boolean,
                        onValid: async (value) => {
                            const operationResult = await this.settingsApplication.update("shareAvailable", value);
                            if(operationResult.ok)
                                settings.shareAvailable = value;
                            return operationResult;
                        }
                    });
                    end();
                    return;
                case UserMode.SetPublicMode:
                    new SettingsInputValidation<boolean>(update, {
                        title: UIT.publicMode,
                        user, UIT, handlerData,
                        type: Boolean,
                        onValid: async (value) => {
                            const operationResult = await this.settingsApplication.update("publicMode", value);
                            if(operationResult.ok)
                                settings.publicMode = value;
                            return operationResult;
                        }
                    });
                    end();
                    return;
            }
        }
    };
}