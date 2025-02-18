const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'
])

/**
 * この関数は再帰的に呼び出され、コンポーネントまたはHTMLタグを最終的に
 * すべてHTML文字列に変換します。
 */
export async function jsxDEV(
  type: string | ((props: PropsWithChildren) => string),
  props: PropsWithChildren
): Promise<string> {
  if (typeof type === "function") return type(props)

  if (!Array.isArray(props.children)) props.children = [props.children]

  let line = `<${type}`
  const notChildren = Object.keys(props).filter(key => key !== "children")

  for (const prop of notChildren) {
    const lowerCaseProp = prop.toLowerCase();
    if (lowerCaseProp === "classname") {
      line += ` class="${props[prop]}"`
    } else if (lowerCaseProp === "style" && typeof props[prop] === 'object') {
      // オブジェクトをCSS文字列に変換する
      const styleObj = props[prop];
      const styleStr = Object.entries(styleObj)
        .map(([key, value]) =>
          // キャメルケースをハイフン区切りに変換
          `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
        )
        .join(" ");
      line += ` style="${styleStr}"`
    } else if (props[prop] === true) {
      line += ` ${lowerCaseProp}`
    } else {
      line += ` ${lowerCaseProp}="${props[prop]}"`
    }
  }

  // 自閉じタグの場合、閉じスラッシュを省略
  if (selfClosingTags.has(type.toLowerCase())) {
    line += ">"
  } else {
    line += ">"
    for (const child of props.children) {
      let nested = await child

      if (!Array.isArray(nested)) nested = [nested as string]
      for (const item of nested as string[]) line += (await item) ?? ""
    }

    line += `</${type}>`
  }

  return line
}
