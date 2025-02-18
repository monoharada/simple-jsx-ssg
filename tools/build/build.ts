import { exec } from "node:child_process";
import { promises as fsPromises } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import util from "node:util";

const execAsync = util.promisify(exec);

/**
 * 指定パスの親ディレクトリが存在しなければ作成する（非同期版）
 */
const ensureDirectoryExistence = async (filePath: string): Promise<void> => {
  await fsPromises.mkdir(dirname(filePath), { recursive: true });
};

/**
 * 指定したコマンドを非同期で実行する
 */
const runCommand = async (command: string): Promise<void> => {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Command failed: ${command}`, error);
    throw error;
  }
};

/**
 * 指定ディレクトリ以下の全ファイルパスを再帰的に取得する
 */
const getFilesRecursively = async (dir: string): Promise<string[]> => {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = resolve(dir, entry.name);
      return entry.isDirectory() ? getFilesRecursively(fullPath) : fullPath;
    })
  );
  return files.flat();
};

/**
 * require キャッシュを依存関係も含めてクリアする
 */
const clearRequireCache = (filePath: string): void => {
  const resolvedPath = require.resolve(filePath);
  if (require.cache[resolvedPath]) {
    for (const child of require.cache[resolvedPath].children) {
      clearRequireCache(child.id);
    }
    delete require.cache[resolvedPath];
    console.log(`Cache cleared for: ${filePath}`);
  }
};

/**
 * TypeScript ファイルを bun でビルドし、出力先へコピーする
 */
const compileAndCopyTS = async (): Promise<void> => {
  const tsFiles = await getFilesRecursively("./src/assets/js");
  const tasks = tsFiles.filter(file => extname(file) === ".ts").map(async (file) => {
    const relPath = relative("./src/assets/js", file);
    const outputPath = `./dist/www/assets/js/${relPath.replace(/\.ts$/, ".js")}`;
    await ensureDirectoryExistence(outputPath);
    await runCommand(`bun build ${file} --outdir ${dirname(outputPath)}`);
    console.log(`Compiled and copied: ${file} to ${outputPath}`);
  });
  await Promise.all(tasks);
};

/**
 * CSS 以外の assets ファイルをコピーする
 */
const copyAssetsAll = async (): Promise<void> => {
  const assetFiles = await getFilesRecursively("./src/assets");
  const tasks = assetFiles
    .filter(file => extname(file) !== ".css")
    .map(async (file) => {
      const relPath = relative("./src/assets", file);
      const outputPath = `./dist/www/assets/${relPath}`;
      await ensureDirectoryExistence(outputPath);
      await fsPromises.copyFile(file, outputPath);
      console.log(`Copied: ${file} to ${outputPath}`);
    });
  await Promise.all(tasks);
};

/**
 * 単一の asset ファイル（CSS 等）をコピーする
 */
const copyAssets = async (file: string): Promise<void> => {
  const relPath = relative("./src/assets", file);
  const outputPath = `./dist/www/assets/${relPath}`;
  await ensureDirectoryExistence(outputPath);
  await fsPromises.copyFile(file, outputPath);
  console.log(`Copied: ${file} to ${outputPath}`);
};

/**
 * 指定の .tsx ファイルを bun でビルドし、対応する .js ファイルから HTML を生成する
 */
const compileHTML = async (changedFile: string): Promise<void> => {
  try {
    // 必要なベースディレクトリを非同期で作成
    await Promise.all([
      fsPromises.mkdir("dist", { recursive: true }),
      fsPromises.mkdir("dist/js", { recursive: true }),
      fsPromises.mkdir("dist/www", { recursive: true })
    ]);

    // .tsx ファイル以外は処理しない
    if (extname(changedFile) !== ".tsx") return;

    const outputDir = `dist/js/${relative("./src/pages", dirname(changedFile))}`;
    await fsPromises.mkdir(outputDir, { recursive: true });
    console.log(`Building: ${changedFile}`);
    await runCommand(`bun build ${changedFile} --outdir ${outputDir} --target=bun`);

    const jsFile = changedFile.replace(/\.tsx$/, ".js");
    if (!jsFile.endsWith(".js")) return;

    const relPath = relative("./src/pages", jsFile);
    const nameWithoutExt = relPath.replace(/\.js$/, "");
    const outputHtmlPath = jsFile.endsWith(".inc.js")
      ? `./dist/www/${nameWithoutExt}`
      : `./dist/www/${nameWithoutExt}.html`;

    // 出力先ディレクトリの作成
    await ensureDirectoryExistence(outputHtmlPath);
    console.log(`Converting ${jsFile} to HTML`);
    clearRequireCache(resolve(jsFile));

    // ES モジュールとして読み込み、ページ生成関数を実行する
    const pageModule = await import(resolve(jsFile));
    const pageFunction = pageModule.default;
    let htmlContent: string | undefined;
    if (jsFile.includes("pages")) {
      htmlContent = await pageFunction();
      if (!jsFile.endsWith(".inc.js") && !jsFile.includes("include")) {
        htmlContent = `<!DOCTYPE html>\n${htmlContent}`;
      }
    }
    if (htmlContent) {
      await fsPromises.writeFile(outputHtmlPath, htmlContent, "utf8");
      console.log(`Generated: ${outputHtmlPath}`);
    }
  } catch (error) {
    console.error("Error during HTML compilation:", error);
  }
};

/**
 * public 配下のファイルをそのまま dist/www/ 配下へコピーする
 */
const copyPublicFiles = async (): Promise<void> => {
  const publicFiles = await getFilesRecursively("./public");
  const tasks = publicFiles.map(async (file) => {
    const relPath = relative("./public", file);
    const outputPath = `./dist/www/${relPath}`;
    await ensureDirectoryExistence(outputPath);
    await fsPromises.copyFile(file, outputPath);
    console.log(`Copied: ${file} to ${outputPath}`);
  });
  await Promise.all(tasks);
};

/**
 * 全体のコンパイル処理を実行する
 * ・src 以下の .tsx ファイルを HTML 化
 * ・assets のコピーおよび TypeScript のビルド
 * ・public のファイルをコピー
 */
const compileAll = async (): Promise<void> => {
  try {
    // ベースディレクトリの作成
    await Promise.all([
      fsPromises.mkdir("dist", { recursive: true }),
      fsPromises.mkdir("dist/js", { recursive: true }),
      fsPromises.mkdir("dist/www", { recursive: true })
    ]);

    const pageFiles = await getFilesRecursively("./src");
    const jsxFiles = pageFiles.filter(file => extname(file) === ".tsx");

    // 各 .tsx ページを並列に HTML 化（処理数が多い場合は並列数を制限する方法も検討）
    await Promise.all(jsxFiles.map(file => compileHTML(file)));

    // CSS 以外の assets コピー、TypeScript のビルド、public コピーを並列実行
    await Promise.all([copyAssetsAll(), compileAndCopyTS(), copyPublicFiles()]);
  } catch (error) {
    console.error("Error during HTML compilation:", error);
  }
};

export { compileHTML, compileAll, copyAssetsAll, copyAssets, compileAndCopyTS };
