import settings from "../../../settings.js";
import { User } from "../../../common/types/user.js";
import UIText from "../../../common/languages/UIText.js";

export default function getUserUIT(user?: User) {
    const langCode = settings.defaultLang;
    return {
        UIT: UIText.getObject(langCode),
        langCode
    };
};
