import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import sharp from 'sharp';

const inputPattern = 'src/assets/image/**/*.{png,jpg,jpeg}';
const outputDir = 'dist/www/assets/image';
const metadataFile = 'src/data/image_metadata.json';

export async function generate_image_metadata() {
  try {
    // 再帰的に画像ファイルを取得
    const files = await fg(inputPattern);
    const metadata: Record<string, { width: number, height: number, ext: string }> = {};

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      // "src/assets/image" を "/assets/image" に置換し、拡張子は除外する
      let relativeOutputFilePath = file.replace('src/assets/image', '/assets/image');
      relativeOutputFilePath = relativeOutputFilePath.slice(0, -ext.length);

      try {
        const image = sharp(file);
        const { width, height } = await image.metadata();
        metadata[relativeOutputFilePath] = { width: width || 0, height: height || 0, ext };
      } catch (err) {
        console.error('ファイルの処理中にエラーが発生しました:', file, err);
      }
    }

    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    console.log(`Metadata written to ${metadataFile}`);
  } catch (err) {
    console.error('ファイルの読み込み中にエラーが発生しました:', inputPattern, err);
  }
}
