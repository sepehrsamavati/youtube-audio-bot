import config from "../../config.js";
import UITextData from "./uitextData.js";
import { UITextObj } from "../types/uitext";

class UIText {
    private static texts: UITextObj[] = UITextData;

    static set(langCode: string, key: keyof UITextObj, value: string) {
        const UIT = UIText.texts.find(uit => uit._lang === langCode);
        if (!UIT) {
            return false;
        }
        UIT[key] = value;
        return true;
    }

    static getAll() {
        return [...UIText.texts];
    }

    static getObject(lang: string): UITextObj {
        return UIText.texts.find(uit => uit._lang === lang)
            ?? UIText.texts.find(uit => uit._lang === config.defaultLang) as UITextObj;
    }
}

export default UIText;
