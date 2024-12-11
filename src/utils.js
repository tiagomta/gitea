export function parseOptions(options) {
    const result = {};
    if (typeof options !== "string") return result;
    options = options.match(/(?:[^\s"]+|"[^"]*")+/g).map(option => option.replace(/(^"|"$)/g, ''));
    let i = 0;
    while (i < options.length) {
        const option = options[i];
        if (option.startsWith("--")) {
            const key = option.slice(2);
            let value = true;
            if (i + 1 < options.length && !options[i + 1].startsWith("--")) {
                value = options[i + 1];
                i++;
            }
            result[key] = value;
        }
        i++;
    }
    return result;
}