import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = 'src/assets/image';
const outputDir = 'dist/www/assets/image';
const metadataFile = 'src/data/image_metadata.json';

export async function generateimage_metadata() {
    fs.readdir(inputDir, async (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        const metadata: Record<string, { width: number, height: number, ext: string }> = {};

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
                const inputFilePath = path.join(inputDir, file);
                const relativeOutputFilePath = `/assets/image/${path.basename(file, ext)}`;

                try {
                    const image = sharp(inputFilePath);
                    const { width, height } = await image.metadata();
                    metadata[relativeOutputFilePath] = { width: width || 0, height: height || 0, ext: ext };
                } catch (err) {
                    console.error('Error processing file:', err);
                }
            }
        }

        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        console.log(`Metadata written to ${metadataFile}`);
    });
}
