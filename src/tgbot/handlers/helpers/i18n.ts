import config from "../../../config.js";
import UIText from "../../../common/languages/uitext.js";
import { UITextObj } from "../../../common/types/uitext.js";

export default function getUserUIT(user?: User) {
    const langCode = config.defaultLang;
    return {
        UIT: UIText.find(UIT => UIT._lang == langCode) as UITextObj,
        langCode
    };
};
