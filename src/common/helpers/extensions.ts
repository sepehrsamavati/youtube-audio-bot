export default class Extensions {
    static readonly #persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

    static StringFormatter(text: string, replaceWith: string | (string | number)[]) {
        const input = text;
        if (!Array.isArray(replaceWith)) {
            replaceWith = [replaceWith];
        }
        return input.replace(/(%s)\d/g, (a) => replaceWith[parseInt(a.slice(2)) - 1]?.toString());
    }

    static ToPersianDigits(text: string) {
        return text.replace(/[0-9]/g, w => Extensions.#persianNumbers[+w]);
    }
}