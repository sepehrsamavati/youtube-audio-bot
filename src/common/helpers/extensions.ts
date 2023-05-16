export default class Extensions {
    static StringFormatter(text: string, replaceWith: string | (string | number)[]) {
        const input = text;
        if (!Array.isArray(replaceWith)) {
            replaceWith = [replaceWith];
        }
        return input.replace(/(%s)\d/g, (a) => replaceWith[parseInt(a.slice(2)) - 1]?.toString());
    }
}