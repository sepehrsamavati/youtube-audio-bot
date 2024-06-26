export default class Extensions {
    static readonly #persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
    static readonly #dateLocales = ({
        "en": "en-SE",
        "fa": "fa-IR-u-nu-latn",
    } as const);

    static StringFormatter(text: string, replaceWith: string | (string | number)[]) {
        const input = text;
        if (!Array.isArray(replaceWith)) {
            replaceWith = [replaceWith];
        }
        return input.replace(/(%s)\d/g, (a) => replaceWith[parseInt(a.slice(2)) - 1]?.toString());
    }

    static toPersianDigits(text: number | string) {
        return text.toString().replace(/[0-9]/g, w => Extensions.#persianNumbers[+w]);
    }

    static digitLocalization(text: number | string, locale: string) {
        if(locale === 'fa')
            return Extensions.toPersianDigits(text);
        return text.toString();
    }

    static dateLocalization(date: Date, locale: string) {
        const dateLocale = Extensions.#dateLocales[locale as 'en'] ?? Extensions.#dateLocales.en;
        return Extensions.digitLocalization(date.toLocaleString(dateLocale), locale);
    }
}