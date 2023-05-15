import { UserMode } from "../../common/enums/user.enum.js";
import HandlerBase from "../../common/models/handlerBase.js";
import HandlerHelper from "../../common/helpers/handlerHelper.js";

// This handler handles return commands by overriding the update object to fake the previous level command.
// For example: Home > Setting > Set help text / When user is in 'set help text' mode, this handler fakes the command to 'setting', so the user will see settings page.
export default class ReturnHandler implements HandlerBase {
    public handler = async (handlerData: HandlerHelper) => {
        const { update, UIT, user } = handlerData;

        if(update.message?.text === UIT.return) {
            switch(user.mode) {
                case UserMode.SetHelpText:
                case UserMode.SetPublicMode:
                case UserMode.SetShareAvailability:
                case UserMode.SetStartText:
                    user.mode = UserMode.Default;
                    update.message.text = UIT.settings;
                    break;
            }
        }
    };
}