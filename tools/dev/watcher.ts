import { watch } from "node:fs";
import path from "node:path";
import { compileAll, compileAndCopyTS, compileHTML, copyAssets, copyAssetsAll } from "../build/build";
import { generateImageMetadata } from "../build/get-image-data";
import { main as compileCSS } from '../compiler/cssCompile';

const watchDirectories = ["./src/", "./src/assets/"];

compileAll();
generateImageMetadata();
compileCSS();

const watchFiles = () => {
  console.log("ファイルの変更を監視中...");

  for (const directory of watchDirectories) {
    watch(directory, { recursive: true }, async (eventType, filename) => {
      if (filename) {
        const filePath = path.resolve(directory, filename);
        if (filename.endsWith(".tsx") || filename.endsWith(".html")) {
          console.log(`${filename}が変更されました。再構築中...`);
          try {
            if (filePath.includes(path.resolve("./src/pages/"))) {
              console.log('compileHTMLを実行中...');
              await compileHTML(filePath);
            } else {
              console.log('compileAllを実行中...');
              await compileAll();
            }
            console.log("再構築が完了しました！");
          } catch (error) {
            console.error("再構築中にエラーが発生しました：", error);
          }
        } else if (filename.endsWith(".ts")) {
          console.log(`${filename}が変更されました。TypeScriptをコンパイル中...`);
          try {
            console.log('compileAndCopyTSを実行中...');
            await compileAndCopyTS();
            console.log("TypeScriptのコンパイルが完了しました！");
          } catch (error) {
            console.error("TypeScriptのコンパイル中にエラーが発生しました：", error);
          }
        } else if (filename.endsWith(".css")) {
          console.log(`${filename}が変更されました。CSSをコンパイル中...`);
          try {
            console.log('compileCSSを実行中...');
            compileCSS();
            console.log("CSSのコンパイルが完了しました！");
          } catch (error) {
            console.error("CSSのコンパイル中にエラーが発生しました：", error);
          }
        } else if (filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
          console.log(`${filename}が変更されました。メタデータを再構築中...`);
          try {
            console.log('generateImageMetadataを実行中...');
            await generateImageMetadata();
            console.log("メタデータの再構築が完了しました！");
          } catch (error) {
            console.error("メタデータの再構築中にエラーが発生しました：", error);
          }
        }
      }
    });
  }
};
watchFiles();
