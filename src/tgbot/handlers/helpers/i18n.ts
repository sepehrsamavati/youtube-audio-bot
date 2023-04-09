import config from "../../../config.js";
import UIText from "../../../common/languages/UIText.js";
import { User } from "../../../common/types/user.js";

export default function getUserUIT(user?: User) {
    const langCode = config.defaultLang;
    return {
        UIT: UIText.getObject(langCode),
        langCode
    };
};
