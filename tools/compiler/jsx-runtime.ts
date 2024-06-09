const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'
]);

export const Fragment = ({ children }: { children: string[] }) => children.join('');

export async function jsx(
    type: string | ((props: PropsWithChildren) => string),
    props: PropsWithChildren
): Promise<string> {
    if (typeof type === "function") return type(props);

    if (!Array.isArray(props.children)) props.children = [props.children];

    let line = `<${type}`;
    const notChildren = Object.keys(props).filter(key => key !== "children");

    for (const prop of notChildren) line += ` ${prop}="${props[prop]}"`;

    if (selfClosingTags.has(type.toLowerCase())) {
        line += ">";
    } else {
        line += ">";
        for (const child of props.children) {
            let nested = await child;
            if (!Array.isArray(nested)) nested = [nested as string];
            for (const item of nested as string[]) line += (await item) ?? "";
        }
        line += `</${type}>`;
    }

    return line;
}