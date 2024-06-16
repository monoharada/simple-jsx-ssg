import * as fs from 'node:fs';
import * as path from 'node:path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';

const inputDir = 'src/assets/css';
const outputDir = 'dist/www/assets/css';

// 再帰的にディレクトリを探索して、CSSファイルを取得する関数
function getCssFiles(dir) {
  let cssFiles = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      cssFiles = cssFiles.concat(getCssFiles(fullPath));
    } else if (path.extname(file) === '.css' && !fullPath.includes('_import')) {
      cssFiles.push(fullPath);
    }
  }

  return cssFiles;
}
// 指定されたファイルをPostCSSで処理する関数
function processCssFile(inputFile, outputFile) {
  fs.readFile(inputFile, (err, css) => {
    if (err) throw err;

    postcss([postcssImport()])
      .process(css, { from: inputFile, to: outputFile })
      .then(result => {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(outputFile, result.css);
        if (result.map) {
          fs.writeFileSync(`${outputFile}.map`, result.map.toString());
        }
        console.log(`Processed: ${outputFile}`);
      })
      .catch(error => {
        console.error(`Error processing file ${inputFile}:`, error);
      });
  });
}

// メイン処理
export function main() {
  const cssFiles = getCssFiles(inputDir);
  console.log('Found CSS files:', cssFiles);

  for (const file of cssFiles) {
    const relativePath = path.relative(inputDir, file);
    const outputFile = path.join(outputDir, relativePath);
    processCssFile(file, outputFile);
  }
}

main();
