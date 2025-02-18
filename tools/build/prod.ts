import fs from 'node:fs';
import { promises as fsPromises } from 'node:fs';
import path from 'node:path';
// js-beautify の Node 用 API をインポート（パッケージがインストールされている前提）
import { html as beautifyHtml } from 'js-beautify';
import { generate_image_metadata } from 'tools/build/getImageData';
import { convertImages } from 'tools/build/imageConvert';
import { main as compileCSS } from '../compiler/css-compile';
import { compileAll } from './build';

const buildMode = process.env.BUILD_MODE;
const isProduction = buildMode === 'production';
const isStaging = buildMode === 'staging';

// このファイルの __dirname は tools/build 内にあると仮定して、
// 出力先ディレクトリはプロジェクトルートの dist/www とする
const outputDir = path.resolve(__dirname, '../../dist/www');

/**
 * dist/www ディレクトリのクリーンナップ（同期版）
 */
const cleanDist = () => {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log('dist/www directory cleaned');
  }
};

/**
 * 指定ディレクトリ以下の HTML ファイルに記述された SSI を、
 * 対象ファイルの内容に置き換える（非同期版・並列処理対応）
 */
const replaceSSI = async (dir: string): Promise<void> => {
  try {
    await fsPromises.access(dir);
  } catch (err) {
    console.error(`Directory not found: ${dir}`);
    return;
  }

  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await replaceSSI(fullPath);
      } else if (entry.name.endsWith('.html')) {
        console.log(`Processing file: ${fullPath}`);
        let content = await fsPromises.readFile(fullPath, 'utf-8');

        // SSI 記述を検出して順次置換
        const ssiRegex = /<!--#include virtual="(.+?)" -->/g;
        const matches = Array.from(content.matchAll(ssiRegex));
        for (const match of matches) {
          const includeVirtual = match[1];
          const includePath = path.resolve(
            path.dirname(fullPath),
            includeVirtual.startsWith('/')
              ? `../../dist/www${includeVirtual}`
              : includeVirtual
          );
          console.log(`Including file: ${includePath}`);
          let includeContent = '';
          try {
            includeContent = await fsPromises.readFile(includePath, 'utf-8');
          } catch (err) {
            console.warn(`Include file not found: ${includePath}`);
            includeContent = match[0]; // 置換失敗時は元の SSI 指示を残す
          }
          content = content.replace(match[0], includeContent);
        }
        await fsPromises.writeFile(fullPath, content, 'utf-8');
        console.log(`${fullPath} updated with static SSI content`);
      }
    })
  );
};

/**
 * 指定ディレクトリ以下の HTML ファイルを再帰的に取得するヘルパー関数
 */
async function getHtmlFiles(dir: string): Promise<string[]> {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.join(dir, entry.name);
      return entry.isDirectory() ? getHtmlFiles(res) : res;
    })
  );
  return files.flat().filter((file) => file.endsWith('.html'));
}

/**
 * js-beautify を用いて、対象ディレクトリ内の HTML ファイルを整形する
 */
const beautifyHTMLFiles = async (dir: string): Promise<void> => {
  const htmlFiles = await getHtmlFiles(dir);
  await Promise.all(
    htmlFiles.map(async (file) => {
      try {
        const content = await fsPromises.readFile(file, 'utf-8');
        // 必要に応じてオプションを調整してください。ここでは indent_size: 2 を例示
        const beautified = beautifyHtml(content, { indent_size: 2, space_in_empty_paren: true });
        await fsPromises.writeFile(file, beautified, 'utf-8');
        console.log(`Beautified: ${file}`);
      } catch (err) {
        console.error(`Error beautifying file ${file}:`, err);
      }
    })
  );
};

/**
 * メインビルド処理
 *
 * 以下の処理を実行します:
 *  - dist/www のクリーンアップ
 *  - 画像メタデータの生成
 *  - 全体のコンパイル処理
 *  - CSS のコンパイル
 *  - （必要なら）画像変換（プロダクションモード時）
 *  - （必要なら）SSI の静的差し替え（ステージングモード時）
 *  - HTML ファイルの整形（js-beautify）
 */
const main = async () => {
  console.time('build');
  cleanDist();

  // 各タスクは依存関係に応じて順次実行
  await generate_image_metadata();
  await compileAll();
  await compileCSS();

  if (isProduction) {
    await convertImages();
  }
  if (isStaging) {
    await replaceSSI(outputDir);
  }

  // HTML の整形を実行（js-beautify を内部 API で実行）
  await beautifyHTMLFiles(outputDir);

  console.timeEnd('build');
};

main().catch((err) => {
  console.error(err);
});
