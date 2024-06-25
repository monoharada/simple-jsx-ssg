import fs from 'node:fs';
import path from 'node:path';
import {generateimage_metadata} from 'tools/build/getImageData.js';
import {convertImages} from 'tools/build/imageConvert.js';
import { main as compileCSS } from '../compiler/css-compile';
import {compileAll} from "./build.js";

const buildMode = process.env.BUILD_MODE;
const isProduction = buildMode === 'production';
const isStaging = buildMode === 'staging';

// dist/wwwディレクトリをクリーンナップ
const cleanDist = () => {
    const dir = path.resolve(__dirname, 'dist/www');
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log('dist/www directory cleaned');
    }
};

// SSI記述を静的に差し替える関数
const replaceSSI = async (dir) => {
  if (!fs.existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      return;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
      if (file.isDirectory()) {
          // 再帰的にディレクトリ内のファイルを処理
          await replaceSSI(path.join(dir, file.name));
      } else if (file.name.endsWith('.html')) {
          const filePath = path.join(dir, file.name);
          let content = fs.readFileSync(filePath, 'utf-8');

          // デバッグ用ログ
          console.log(`Processing file: ${filePath}`);

          // SSI記述を静的に差し替える処理
          content = content.replace(/<!--#include virtual="(.+?)" -->/g, (match, p1) => {
              const includePath = path.resolve(path.dirname(filePath), p1.startsWith('/') ? `../../dist/www${p1}` : p1);
              console.log(`Including file: ${includePath}`);
              if (fs.existsSync(includePath)) {
                  return fs.readFileSync(includePath, 'utf-8');
              }
              console.warn(`Include file not found: ${includePath}`);
              return match;
          });

          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`${filePath} updated with static SSI content`);
      }
  }
};

const main = async () => {
  cleanDist();
  generateimage_metadata();
  await compileAll();
  compileCSS();
  isProduction && convertImages();
  isStaging && await replaceSSI(path.resolve(__dirname, '../../dist/www'));
};

main().catch(err => {
  console.error(err);
});
