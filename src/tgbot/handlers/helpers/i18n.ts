import UIText from "../../../common/languages/uitext";
import { UITextObj } from "../../../common/types/uitext";
import config from "../../../config";

export default function getUserUIT(user?: User) {
    const langCode = config.defaultLang;
    return {
        UIT: UIText.find(UIT => UIT._lang == langCode) as UITextObj,
        langCode
    };
};
