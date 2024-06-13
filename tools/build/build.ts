import { execSync } from "node:child_process"
import { existsSync, promises as fsPromises, mkdirSync } from "node:fs"
import { dirname, extname, relative, resolve } from "node:path"


// ディレクトリが存在しない場合に作成する関数
const ensureDirectoryExistence = (filePath: string) => {
    const dirName = dirname(filePath)
    if (existsSync(dirName)) return true
    ensureDirectoryExistence(dirName)
    mkdirSync(dirName)
}

// ディレクトリを再帰的に探索してすべてのファイルパスを取得する関数
const getFilesRecursively = async (dir: string): Promise<string[]> => {
    const dirents = await fsPromises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
        dirents.map(async (dirent) => {
            const res = resolve(dir, dirent.name)
            return dirent.isDirectory() ? getFilesRecursively(res) : res
        })
    )
    return Array.prototype.concat(...files)
}

// モジュールキャッシュをクリアする関数
const clearRequireCache = (filePath: string) => {
    const resolvedPath = require.resolve(filePath)
    if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath]
        console.log(`Cache cleared for: ${filePath}`)
    }
}

// TypeScriptファイルをJavaScriptにコンパイルしてコピーする関数
const compileAndCopyTS = async () => {
    const tsFiles = await getFilesRecursively("./src/assets/js")
    for (const file of tsFiles) {
        if (extname(file) === ".ts") {
            const relativePath = relative("./src/assets/js", file)
            const outputPath = `./dist/www/assets/js/${relativePath.replace(/\.ts$/, '.js')}`
            ensureDirectoryExistence(outputPath)
            execSync(`bun build ${file} --outdir ${dirname(outputPath)}`)
            console.log(`Compiled and copied: ${file} to ${outputPath}`)
        }
    }
}

// CSSファイルをコピーする関数
const copyAssetsAll = async () => {
  const assetFiles = await getFilesRecursively("./src/assets")
  for (const file of assetFiles) {
      if (extname(file) === ".css") continue // CSSファイルをスキップ
      const relativePath = relative("./src/assets", file)
      const outputPath = `./dist/www/assets/${relativePath}`
      ensureDirectoryExistence(outputPath)
      await fsPromises.copyFile(file, outputPath)
      console.log(`Copied: ${file} to ${outputPath}`)
  }
}

// 特定のCSSファイルをコピーする関数
const copyAssets = async (file: string) => {
    const relativePath = relative("./src/assets", file)
    const outputPath = `./dist/www/assets/${relativePath}`
    ensureDirectoryExistence(outputPath)
    await fsPromises.copyFile(file, outputPath)
    console.log(`Copied: ${file} to ${outputPath}`)
}


// JSXファイルをHTMLに変換する関数
const compileHTML = async (changedFile: string) => {
  try {
    if (!existsSync("dist")) mkdirSync("dist");
    if (!existsSync("dist/js")) mkdirSync("dist/js");
    if (!existsSync("dist/www")) mkdirSync("dist/www");

    const jsxFiles = [changedFile].filter((file) => extname(file) === ".tsx");

    for (const file of jsxFiles) {
      const outputDir = `dist/js/${relative("./src/pages", dirname(file))}`;
      console.log(`outputDir!!: ${outputDir}`)
      if (!existsSync(outputDir)) {
        ensureDirectoryExistence(outputDir);
        mkdirSync(outputDir, { recursive: true });
      }
      console.log(`Building: ${file}`);
      execSync(`bun build ${file} --outdir ${outputDir} --target=bun`);
    }

    const jsFiles = [changedFile.replace(/\.tsx$/, ".js")];

    for (const file of jsFiles) {
      if (!file.endsWith(".js")) continue;

      const relativePath = relative("./src/pages", file);
      const nameWithoutExt = relativePath.replace(/\.js$/, "");
      const outputHtmlPath = `./dist/www/${nameWithoutExt}.html`;

      ensureDirectoryExistence(outputHtmlPath);

      console.log(`Converting ${file} to HTML`);
      const pageFunction = await import(resolve(file)).then((p) => p.default);
      let htmlContent = await pageFunction();

      // <!DOCTYPE html> を追加
      htmlContent = `<!DOCTYPE html>\n${htmlContent}`;

      await fsPromises.writeFile(outputHtmlPath, htmlContent, "utf8");
      console.log(`Generated: ${outputHtmlPath}`);
    }
  } catch (error) {
    console.error("Error during HTML compilation:", error);
  }
};

// public配下のファイルをそのままdist/www/配下に階層構造を保ってコピーする関数
const copyPublicFiles = async () => {
  const publicFiles = await getFilesRecursively("./public")
  for (const file of publicFiles) {
      const relativePath = relative("./public", file)
      const outputPath = `./dist/www/${relativePath}`
      ensureDirectoryExistence(outputPath)
      await fsPromises.copyFile(file, outputPath)
      console.log(`Copied: ${file} to ${outputPath}`)
  }
}

// 既存のcompileAll関数に追加
const compileAll = async () => {
  try {
      if (!existsSync("dist")) mkdirSync("dist")
      if (!existsSync("dist/js")) mkdirSync("dist/js")
      if (!existsSync("dist/www")) mkdirSync("dist/www")

      const pageFiles = await getFilesRecursively("./src/pages")
      const jsxFiles = pageFiles.filter(file => extname(file) === ".tsx")

      for (const file of jsxFiles) {
          const outputDir = `dist/js/${relative('./src/pages', dirname(file))}`
          if (!existsSync(outputDir)) {
              ensureDirectoryExistence(outputDir)
              mkdirSync(outputDir, { recursive: true })
          }
          console.log(`Building: ${file}`)
          execSync(`bun build ${file} --outdir ${outputDir} --target=bun`)
      }

      const jsFiles = await getFilesRecursively("./dist/js")

      for (const file of jsFiles) {
          if (!file.endsWith(".js")) continue

          const relativePath = relative('./dist/js', file)
          const nameWithoutExt = relativePath.replace(/\.js$/, '')
          const outputHtmlPath = `./dist/www/${nameWithoutExt}.html`

          ensureDirectoryExistence(outputHtmlPath)

          console.log(`Converting ${file} to HTML`)
          clearRequireCache(resolve(file))
          const pageFunction = await import(resolve(file)).then(p => p.default)
          let htmlContent = await pageFunction()

          // <!DOCTYPE html> を追加
          htmlContent = `<!DOCTYPE html>\n${htmlContent}`

          await fsPromises.writeFile(outputHtmlPath, htmlContent, 'utf8')
          console.log(`Generated: ${outputHtmlPath}`)
      }

      // CSSファイルをコピー
      await copyAssetsAll()

      // TypeScriptファイルをコンパイルしてコピー
      await compileAndCopyTS()

      // public配下のファイルをコピー
      await copyPublicFiles()

  } catch (error) {
      console.error("Error during HTML compilation:", error)
  }
}

export { compileHTML, compileAll, copyAssetsAll, copyAssets, compileAndCopyTS }
