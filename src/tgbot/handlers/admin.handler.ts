import config from "../../config.js";
import settings from "../../settings.js";
import UITextApplication from "../../application/uitext.application.js";
import UserApplication from "../../application/user.application.js";
import { TelegramMethodEnum } from "../../common/enums/tgMethod.enum.js";
import { UserMode, UserStatus, UserType } from "../../common/enums/user.enum.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";
import HandlerBase from "../../common/models/handlerBase.js";
import { DynamicTextHelp, dynamicTextHelp } from "./helpers/dynamicText.js";
import inlineKeyboards from "./helpers/inlineKeyboards.js";
import SettingsInputValidation from "./helpers/settingsInputValidation.js";
import SettingsApplication from "../../application/settings.application.js";
import Extensions from "../../common/helpers/extensions.js";
import { broadcastHandler } from "./helpers/broadcast.js";
import BroadcastApplication from "../../application/broadcast.application.js";
import ViewApplication from "../../application/view.application.js";
import VideoApplication from "../../application/video.application.js";
import { BroadcastType } from "../../common/interfaces/broadcast.interface.js";

export default class AdminHandler implements HandlerBase {
    constructor(
        private userApplication: UserApplication,
        private UITApplication: UITextApplication,
        private settingsApplication: SettingsApplication,
        private broadcastApplication: BroadcastApplication,
        private viewApplication: ViewApplication,
        private videoApplication: VideoApplication
    ) { }
    public async handler(handlerData: HandlerHelper) {
        const { update, sendText, UIT, langCode, user, call, ID, end } = handlerData;
        const isOwner = config.owners.includes(ID);
        if (update.message?.text) {
            switch (update.message.text) {
                case "/bc":
                case "/fbc":
                    if (update.message.reply_to_message) {
                        const isForward = update.message.text === "/fbc";
                        const usersId = await this.userApplication.getBroadcastIdList();
                        const broadcast = this.broadcastApplication.createNew(
                            usersId.length,
                            isForward ? BroadcastType.Forward : BroadcastType.Copy
                        );
                        sendText(Extensions.StringFormatter(UIT.sendingToUsers, [usersId.length]));
                        const broadcastResult = await broadcastHandler({
                            adminTgId: ID,
                            forward: isForward,
                            messageId: update.message.reply_to_message.message_id,
                            toUsers: usersId
                        });
                        broadcast.usersReceived = broadcastResult.sentCount;
                        this.broadcastApplication.finish(broadcast);
                        if (broadcastResult.sendFailed.length) {
                            this.userApplication.setUsersStatus(broadcastResult.sendFailed, UserStatus.Blocked);
                        }
                        sendText(Extensions.StringFormatter(UIT.sentToUsers, [broadcastResult.sentCount]));
                    } else {
                        sendText(UIT.replyToMessageToBroadcast);
                    }
                    end();
                    return;
                case "...":
                case UIT.adminPanel:
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
                case UIT.stats:
                    const totalViews = await this.viewApplication.getTotalCount();
                    const broadcastStats = await this.broadcastApplication.getStatistics();
                    const lastWeekDownloads = await this.videoApplication.getLastWeekDownloadsCount();
                    const totalSavedVideos = await this.videoApplication.getTotalCount();
                    const usersCount = await this.userApplication.getTotalCount();
                    sendText(Extensions.StringFormatter(UIT._stats, [
                        config.version,
                        broadcastStats.count,
                        broadcastStats.last.getTime() === 0 ? UIT.never : broadcastStats.last.toLocaleString(),
                        lastWeekDownloads,
                        totalSavedVideos,
                        totalViews,
                        usersCount
                    ])).end();
                    return;
                case UIT.settings:
                    handlerData.setUserMode(UserMode.AdminSettings);
                    call(TelegramMethodEnum.SendMessage, {
                        chat_id: ID,
                        text: '⚙',
                        reply_markup: inlineKeyboards.create([
                            [UIT.startText, UIT.helpText],
                            [UIT.shareAvailable, UIT.publicMode],
                            [UIT.protectAudios],
                            [UIT.return]
                        ])
                    });
                    end();
                    return;
                case UIT.addAdmin:
                    if (!isOwner) {
                        sendText(UIT.noAccess).end();
                        return;
                    }

                    handlerData.setUserMode(UserMode.AddAdmin);
                    call(TelegramMethodEnum.SendMessage, {
                        chat_id: ID,
                        text: UIT.sendUserIdToAddAdmin,
                        reply_markup: inlineKeyboards.return(UIT)
                    });
                    end();
                    return;
                case UIT.remAdmin:
                    if (!isOwner) {
                        sendText(UIT.noAccess).end();
                        return;
                    }

                    const adminsKeyboard = (await this.userApplication.getListOfAdmins())
                        .map(adminId => [adminId.toString()]);
                    adminsKeyboard.push([UIT.return]);

                    handlerData.setUserMode(UserMode.RemoveAdmin);
                    call(TelegramMethodEnum.SendMessage, {
                        chat_id: ID,
                        text: UIT.selectItemToRemove,
                        reply_markup: inlineKeyboards.create(adminsKeyboard)
                    });
                    end();
                    return;
            }

            switch (user.mode) {
                case UserMode.AddAdmin:
                case UserMode.RemoveAdmin:
                    let targetAdminTgId = parseInt(update.message.text);
                    const targetAdmin = await this.userApplication.getByTgId(targetAdminTgId, false, false);
                    if (targetAdmin) {
                        const success = (text: string) => {
                            handlerData.setUserMode(UserMode.Default);
                            call(TelegramMethodEnum.SendMessage, {
                                chat_id: ID,
                                text: text,
                                reply_markup: inlineKeyboards.admin(user, UIT)
                            });
                        };
                        if (user.mode === UserMode.AddAdmin) {
                            if (targetAdmin.type !== UserType.Admin) {
                                this.userApplication.setUserType(targetAdmin.tgId, UserType.Admin);
                                success(Extensions.StringFormatter(UIT.adminAdded, targetAdminTgId.toString()));
                            }
                            else
                                sendText(UIT.alreadyAdmin)
                        } else {
                            if (config.owners.includes(targetAdminTgId))
                                sendText(UIT.cantRemoveOwner);
                            else if (targetAdmin.type === UserType.Admin) {
                                this.userApplication.setUserType(targetAdmin.tgId, UserType.Default);
                                success(Extensions.StringFormatter(UIT.adminRemoved, targetAdminTgId.toString()));
                            }
                            else
                                sendText(UIT.userIsNotAdmin)
                        }
                    }
                    else
                        sendText(UIT.userNotFound);
                    end();
                    return;
                case UserMode.AdminSettings:
                    let settingTypeSelect = false,
                        settingText = UIT.invalidCommand,
                        settingKeyboard: string[][] = [],
                        availableDTs: (keyof DynamicTextHelp)[] = [],
                        onOfCurrentStatus = false;

                    switch (update.message.text) {
                        case UIT.startText:
                            handlerData.setUserMode(UserMode.SetStartText);
                            settingText = Extensions.StringFormatter(
                                UIT.currentValueSendNewMessage,
                                UIT._start
                            );
                            availableDTs = ["name"];
                            break;
                        case UIT.helpText:
                            handlerData.setUserMode(UserMode.SetHelpText);
                            settingText = Extensions.StringFormatter(
                                UIT.currentValueSendNewMessage,
                                UIT._help
                            );
                            availableDTs = ["name"];
                            break;
                        case UIT.shareAvailable:
                            handlerData.setUserMode(UserMode.SetShareAvailability);
                            onOfCurrentStatus = settings.shareAvailable;
                            settingTypeSelect = true;
                            break;
                        case UIT.protectAudios:
                            handlerData.setUserMode(UserMode.SetProtectAudios);
                            onOfCurrentStatus = settings.protectAudios;
                            settingTypeSelect = true;
                            break;
                        case UIT.publicMode:
                            handlerData.setUserMode(UserMode.SetPublicMode);
                            onOfCurrentStatus = settings.publicMode;
                            settingTypeSelect = true;
                            break;
                    }

                    if (settingTypeSelect) {
                        settingKeyboard.push([onOfCurrentStatus ? UIT.off : UIT.on]);
                        settingText = Extensions.StringFormatter(UIT.currentValueSelectNew, [onOfCurrentStatus ? UIT.on : UIT.off]);
                    }

                    if (availableDTs.length) {
                        settingText += `\n\n${UIT.availableDynamicWords}\n` + availableDTs.map((key) => {
                            const dt = dynamicTextHelp[key];
                            return dt ? `${dt.key} ${UIT[dt.value] ?? dt.value}` : ""
                        }).join('\n');
                    }

                    settingKeyboard.push([UIT.return]);

                    call(TelegramMethodEnum.SendMessage, {
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
                            const maxLen = 1000;
                            if (text.length > maxLen) {
                                return Extensions.StringFormatter(UIT.textLengthLimitError, [maxLen]);
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
                            const maxLen = 2000;
                            if (text.length > maxLen) {
                                return Extensions.StringFormatter(UIT.textLengthLimitError, [maxLen]);
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
                            if (operationResult.ok)
                                settings.shareAvailable = value;
                            return operationResult;
                        }
                    });
                    end();
                    return;
                case UserMode.SetProtectAudios:
                    new SettingsInputValidation<boolean>(update, {
                        title: UIT.protectAudios,
                        user, UIT, handlerData,
                        type: Boolean,
                        onValid: async (value) => {
                            const operationResult = await this.settingsApplication.update("protectAudios", value);
                            if (operationResult.ok)
                                settings.protectAudios = value;
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
                            if (operationResult.ok)
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