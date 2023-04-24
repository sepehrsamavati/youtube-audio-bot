import inlineKeyboards from "./inlineKeyboards.js";
import { User } from "../../../common/types/user.js";
import { UITextObj } from "../../../common/types/uitext.js";
import TelegramCall from "../../../common/helpers/tgCall.js";
import { TgMsgUpdate } from "../../../common/types/tgBot.js";
import Extensions from "../../../common/helpers/extensions.js";
import HandlerHelper from "../../../common/helpers/handlerHelper.js";
import OperationResult from "../../../common/models/operationResult.js";
import { TelegramMethodEnum } from "../../../common/enums/tgMethod.enum.js";
import { UserMode } from "../../../common/enums/user.enum.js";

export default class SettingsInputValidation<Type> {
    private errors: string[] = [];

    private value: Type;
    private handlerHelper: HandlerHelper;

    constructor(update: TgMsgUpdate, private options: {
        user: User,
        UIT: UITextObj,
        title: string,
        handlerData: HandlerHelper,
        onValid: (value: Type) => Promise<OperationResult>,
        type?: StringConstructor | NumberConstructor | BooleanConstructor,
        validator?: (value: Type) => string | void,
        validators?: [(value: Type) => string | undefined]
    }) {
        let input: any = undefined;

        switch (options.type) {
            case String:
                input = update.message?.text;
                break;
            case Number:
                const number = update.message?.text ? parseInt(update.message?.text) : undefined;
                if(typeof number === "number" && !isNaN(number)) {
                    input = number;
                }
                break;
            case Boolean:
                switch (update.message?.text) {
                    case options.UIT.on:
                        input = true;
                        break;
                    case options.UIT.off:
                        input = false;
                        break;
                }
                break;
        }

        const validators = options.validators ?? (options.validator ? [options.validator] : []);

        for (const validator of validators) {
            try {
                const errorMessage = validator(input);
                if (typeof errorMessage === "string") {
                    this.addError(errorMessage);
                }
            } catch {
                this.addError(this.options.UIT.invalidDataFormat);
            }
        }

        this.handlerHelper = options.handlerData;
        this.value = input;
        this.continue();
    }

    isValid(){
        return this.value !== undefined && this.value !== null && this.errors.length === 0;
    }

    addError(error: string) {
        this.errors.push(error);
    }

    private async continue(){
        const submitResult = this.isValid() ? await this.options.onValid(this.value) : null;

        let settingResult = "";

        if(this.value !== undefined && this.value !== null)
        {
            if(submitResult?.ok)
            {
                if(this.options.type === Boolean)
                settingResult = Extensions.StringFormatter(this.options.UIT.valueTurnedTo, [this.options.title, this.value ? this.options.UIT.on : this.options.UIT.off])
            else
                settingResult = Extensions.StringFormatter(this.options.UIT.valueChangedTo, [this.options.title, this.value.toString().includes("\n")?`\n\n'${this.value}'\n\n`:` '${this.value}' `]);
            } else {
                settingResult = this.options.UIT.invalidDataFormat;
            }
        } else if(this.errors.length > 0) {
            settingResult = Extensions.StringFormatter(this.options.UIT.invalidValue, [
                this.options.title,
                this.errors.map(error => `\n- ${error}`).join('')
            ]);
        } else {
            settingResult = this.options.UIT.invalidDataFormat;
        }

        
        this.handlerHelper.setUserMode(UserMode.Default);

        TelegramCall(TelegramMethodEnum.SendMessage, {
            chat_id: this.options.user.tgId,
            text: settingResult,
            reply_markup: inlineKeyboards.admin(this.options.user, this.options.UIT)
        });
    }
}