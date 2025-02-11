// tests/module.test.ts
import { afterEach, beforeEach, expect, test } from "bun:test";
import { promises as fs } from "node:fs";
import os from "node:os";
import { join } from "node:path";

// ※ exec のダミー上書き（execSync は上書きできないため、実際のビルド結果になる）
import child_process from "node:child_process";
const originalExec = child_process.exec;
// @ts-ignore
child_process.exec = (
  command: string,
  callback: (error: Error | null, stdout: string, stderr: string) => void
) => {
  if (command.startsWith("bun build")) {
    const match = command.match(/bun build (\S+)/);
    if (match) {
      const inputFile = match[1];
      const jsFile = inputFile.replace(/\.tsx?$/, ".js");
      // ※ TSX 用は「Test Build」にする（ただし、今回のテストでは実際にビルドした結果になっているため期待値を後述で修正）
      fs.writeFile(jsFile, `export default () => "Test Build";`, "utf8")
        .then(() => callback(null, "", ""))
        .catch(err => callback(err, "", ""));
      return;
    }
  }
  return originalExec(command, callback);
};

import ts from "typescript";
// ★ テスト対象のモジュールをインポート（パスはプロジェクトに合わせて調整してください）
import {
  compileAll,
  compileAndCopyTS,
  compileHTML,
  copyAssets,
  copyAssetsAll,
} from "../build"; // ← テスト対象のモジュールへのパス

// 各テストでは、一時作業用ディレクトリを作成して作業ディレクトリを変更します
let tempDir: string;
let originalCwd: string;

beforeEach(async () => {
  originalCwd = process.cwd();
  tempDir = await fs.mkdtemp(join(os.tmpdir(), "test-"));
  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await fs.rm(tempDir, { recursive: true, force: true });
});

//
// 1. compileHTML のテスト
//
test("compileHTML creates HTML from TSX file", async () => {
  // テスト用に src/pages 配下に TSX ファイルを作成する
  await fs.mkdir("src/pages", { recursive: true });
  const tsxFile = join("src/pages", "test.tsx");
  // シンプルな TSX ファイル。ここでは「Test HTML」を返す関数としておく
  await fs.writeFile(tsxFile, `export default function() { return "Test HTML"; }`, "utf8");

  // compileHTML() を実行（引数は変更されたファイルパス）
  await compileHTML(tsxFile);

  // 出力先は、元ファイルのパスから拡張子を置換した「dist/www/…」以下（例: "dist/www/test.html"）
  const expectedHtmlPath = join("dist/www", "test.html");
  const htmlExists = await fs
    .stat(expectedHtmlPath)
    .then(() => true)
    .catch(() => false);
  expect(htmlExists).toBe(true);

  const content = await fs.readFile(expectedHtmlPath, "utf8");
  // ※ ここでは、実際の TSX の関数が返す "Test HTML" が利用され、
  // また、HTML 変換時に <!DOCTYPE html> が先頭に追加されるため以下のような内容となる
  expect(content).toContain("Test HTML");
  expect(content.startsWith("<!DOCTYPE html>")).toBe(true);
});

//
// 2. compileAndCopyTS のテスト
//
test("compileAndCopyTS compiles and copies TS file", async () => {
  // src/assets/js 配下に TS ファイルを用意
  await fs.mkdir("src/assets/js", { recursive: true });
  const tsFile = join("src/assets/js", "test.ts");
  await fs.writeFile(tsFile, `console.log("Hello TS");`, "utf8");

  await compileAndCopyTS();

  // 出力先は dist/www/assets/js/ 以下に、拡張子が .js に変換されたファイル
  const expectedJsPath = join("dist/www/assets/js", "test.js");
  const jsExists = await fs
    .stat(expectedJsPath)
    .then(() => true)
    .catch(() => false);
  expect(jsExists).toBe(true);

  const content = await fs.readFile(expectedJsPath, "utf8");
  // ※ この場合、実際のビルド処理では TS ファイルの内容に依存するため、
  // ここでは元ファイルの一部（"console.log(\"Hello TS\")"）が含まれていることを確認する
  expect(content).toContain('console.log("Hello TS")');
});

//
// 3. copyAssetsAll のテスト
//
test("copyAssetsAll copies non-CSS assets and skips CSS files", async () => {
  // src/assets に CSS 以外のファイルと CSS ファイルを用意する
  await fs.mkdir("src/assets", { recursive: true });
  const textFile = join("src/assets", "file.txt");
  const cssFile = join("src/assets", "style.css");
  await fs.writeFile(textFile, "dummy content", "utf8");
  await fs.writeFile(cssFile, "body {}", "utf8");

  await copyAssetsAll();

  // CSS 以外のファイルはコピーされる
  const copiedTextPath = join("dist/www/assets", "file.txt");
  const textExists = await fs
    .stat(copiedTextPath)
    .then(() => true)
    .catch(() => false);
  expect(textExists).toBe(true);

  // CSS ファイルはスキップされるはず
  const copiedCssPath = join("dist/www/assets", "style.css");
  const cssExists = await fs
    .stat(copiedCssPath)
    .then(() => true)
    .catch(() => false);
  expect(cssExists).toBe(false);
});

//
// 4. copyAssets のテスト
//
test("copyAssets copies a single asset file", async () => {
  // 単一の asset ファイルを作成する
  await fs.mkdir("src/assets", { recursive: true });
  const assetFile = join("src/assets", "single.txt");
  await fs.writeFile(assetFile, "single content", "utf8");

  await copyAssets(assetFile);

  const copiedAssetPath = join("dist/www/assets", "single.txt");
  const assetExists = await fs
    .stat(copiedAssetPath)
    .then(() => true)
    .catch(() => false);
  expect(assetExists).toBe(true);

  const content = await fs.readFile(copiedAssetPath, "utf8");
  expect(content).toBe("single content");
});

//
// 5. compileAll の統合テスト
//
test("compileAll runs full compilation process", async () => {
  // (1) src/pages 配下に TSX ファイルを用意（HTML に変換）
  await fs.mkdir("src/pages", { recursive: true });
  const tsxFile = join("src/pages", "page.tsx");
  await fs.writeFile(tsxFile, `export default function() { return "Page HTML"; }`, "utf8");

  // (2) src/assets/js 配下に TS ファイルを用意（コンパイルしてコピー）
  await fs.mkdir("src/assets/js", { recursive: true });
  const tsFile = join("src/assets/js", "asset.ts");
  await fs.writeFile(tsFile, `console.log("Asset TS");`, "utf8");

  // (3) src/assets 配下に CSS 以外のファイルを用意
  await fs.mkdir("src/assets", { recursive: true });
  const assetFile = join("src/assets", "data.txt");
  await fs.writeFile(assetFile, "asset data", "utf8");

  // (4) public 配下にファイルを用意
  await fs.mkdir("public", { recursive: true });
  const publicFile = join("public", "index.html");
  await fs.writeFile(publicFile, "<html>Public</html>", "utf8");

  // compileAll を実行すると各処理が並列／連続して実行される
  await compileAll();

  // (1) TSX ファイル → HTML 変換されたファイルの確認（dist/www/page.html）
  const expectedHtmlPath = join("dist/www", "page.html");
  const htmlExists = await fs
    .stat(expectedHtmlPath)
    .then(() => true)
    .catch(() => false);
  expect(htmlExists).toBe(true);

  // (2) assets/js の TS ファイルがコンパイルされ、dist/www/assets/js/asset.js が作成される
  const expectedAssetJsPath = join("dist/www/assets/js", "asset.js");
  const assetJsExists = await fs
    .stat(expectedAssetJsPath)
    .then(() => true)
    .catch(() => false);
  expect(assetJsExists).toBe(true);

  // (3) assets 配下の CSS 以外のファイルがコピーされる
  const expectedAssetFile = join("dist/www/assets", "data.txt");
  const assetFileExists = await fs
    .stat(expectedAssetFile)
    .then(() => true)
    .catch(() => false);
  expect(assetFileExists).toBe(true);

  // (4) public 配下のファイルがコピーされる（dist/www/index.html）
  const expectedPublicFile = join("dist/www", "index.html");
  const publicExists = await fs
    .stat(expectedPublicFile)
    .then(() => true)
    .catch(() => false);
  expect(publicExists).toBe(true);
});
