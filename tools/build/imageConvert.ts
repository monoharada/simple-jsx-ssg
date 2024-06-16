import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = 'src/assets/image';
const outputDir = 'dist/www/assets/image';
const metadataFile = 'src/data/image_metadata.json';

export async function convertImages() {
    fs.mkdirSync(outputDir, { recursive: true });

    fs.readdir(inputDir, async (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        const metadata: Record<string, { width: number, height: number }> = {};

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
                const inputFilePath = path.join(inputDir, file);
                const outputFilePath = path.join(outputDir, `${path.basename(file, ext)}.avif`);
                const relativeOutputFilePath = `/assets/images/${path.basename(file, ext)}.avif`;

                if (fs.existsSync(outputFilePath)) {
                    console.log(`Skipping ${file} as it is already converted.`);
                    continue;
                }

                try {
                    const image = sharp(inputFilePath);


                    await image.toFormat('avif').toFile(outputFilePath);


                    console.log(`Converted ${file} to ${outputFilePath}`);
                } catch (err) {
                    console.error('Error processing file:', err);
                }
            }
        }

    });
}
