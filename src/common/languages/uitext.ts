import settings from "../../settings.js";
import UITextData from "./UITextData.js";
import { UITextObj } from "../types/uitext.js";

class UIText {
    public static texts: UITextObj[] = UITextData;

    static set(langCode: string, key: keyof UITextObj, value: string) {
        const UIT = UIText.texts.find(uit => uit._lang === langCode);
        if (!UIT) {
            return false;
        }
        UIT[key] = value;
        return true;
    }

    static get(langCode: string, key: keyof UITextObj) {
        const UIT = UIText.texts.find(uit => uit._lang === langCode);
        if (UIT) {
            return UIT[key];
        }
        return null;
    }

    static getLanguageByName(name: string) {
        return UIText.texts.find(uit => uit._languageName === name);
    }

    static getAllLanguageNames() {
        return UIText.texts.map(uit => uit._languageName);
    }

    static getAll() {
        return [...UIText.texts];
    }

    static getObject(lang: string): UITextObj {
        return UIText.texts.find(uit => uit._lang === lang)
            ?? UIText.texts.find(uit => uit._lang === settings.defaultLang) as UITextObj;
    }
}

export default UIText;
