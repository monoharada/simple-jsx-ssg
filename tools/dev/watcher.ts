import { watch } from "node:fs";
import path from "node:path";
import { compileAll, compileAndCopyTS, compileHTML } from "../build/build";
import { generate_image_metadata } from "../build/getImageData";
import { main as compileCSS } from "../compiler/css-compile";

// 監視対象ディレクトリ（絶対パスに変換しておく）
const srcDir = path.resolve("./src");
const assetsDir = path.resolve("./src/assets");
const pagesDir = path.resolve("./src/pages");
const watchDirectories = [srcDir, assetsDir];

/**
 * デバウンス関数
 * ※ 指定した delay 期間内に複数回呼ばれても最後の１回だけ実行する
 */
const debounce = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay = 100
): ((...args: Args) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};

// 各処理のデバウンス版を生成（delay は用途に合わせて調整）
const debouncedCompileHTML = debounce(async (filePath: string) => {
  console.log("compileHTMLを実行中...");
  await compileHTML(filePath);
}, 200);

const debouncedCompileAll = debounce(async () => {
  console.log("compileAllを実行中...");
  await compileAll();
}, 200);

const debouncedCompileTS = debounce(async () => {
  console.log("compileAndCopyTSを実行中...");
  await compileAndCopyTS();
}, 200);

const debouncedCompileCSS = debounce(() => {
  console.log("compileCSSを実行中...");
  compileCSS();
}, 200);

const debouncedGenerateImageMetadata = debounce(async () => {
  console.log("generate_image_metadataを実行中...");
  await generate_image_metadata();
}, 200);

/**
 * ファイル変更の監視処理
 */
const watchFiles = () => {
  console.log("ファイルの変更を監視中...");
  for (const directory of watchDirectories) {
    watch(directory, { recursive: true }, async (eventType, filename) => {
      if (!filename) return;

      // 監視対象ディレクトリ内でのファイルパスを解決
      const filePath = path.resolve(directory, filename);
      const ext = path.extname(filename).toLowerCase();

      // 拡張子に応じた処理
      if (ext === ".tsx" || ext === ".html") {
        console.log(`${filename}が変更されました。再構築中...`);
        try {
          // pages ディレクトリ内なら個別ページのみ再構築、それ以外は全体ビルド
          if (filePath.startsWith(pagesDir)) {
            debouncedCompileHTML(filePath);
          } else {
            debouncedCompileAll();
          }
          console.log("再構築のリクエストを受け付けました！");
        } catch (error) {
          console.error("再構築中にエラーが発生しました：", error);
        }
      } else if (ext === ".ts") {
        console.log(`${filename}が変更されました。TypeScriptをコンパイル中...`);
        try {
          debouncedCompileTS();
          console.log("TypeScriptのコンパイルリクエストを受け付けました！");
        } catch (error) {
          console.error("TypeScriptのコンパイル中にエラーが発生しました：", error);
        }
      } else if (ext === ".css") {
        console.log(`${filename}が変更されました。CSSをコンパイル中...`);
        try {
          debouncedCompileCSS();
          console.log("CSSのコンパイルリクエストを受け付けました！");
        } catch (error) {
          console.error("CSSのコンパイル中にエラーが発生しました：", error);
        }
      } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
        console.log(`${filename}が変更されました。メタデータを再構築中...`);
        try {
          debouncedGenerateImageMetadata();
          console.log("メタデータの再構築リクエストを受け付けました！");
        } catch (error) {
          console.error("メタデータの再構築中にエラーが発生しました：", error);
        }
      }
    });
  }
};

// 初回ビルドと監視開始（非同期即時実行）
(async () => {
  console.time("初回コンパイル");
  await compileAll();
  await generate_image_metadata();
  compileCSS();
  console.timeEnd("初回コンパイル");
  watchFiles();
})();
