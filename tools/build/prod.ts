import fs from 'node:fs';
import path from 'node:path';
import {generateImageMetadata} from 'tools/build/get-image-data.js';
import {convertImages} from 'tools/build/image-convert.js';
import { main as compileCSS } from '../compiler/cssCompile';
import {compileAll} from "./build.js";

// dist/wwwディレクトリをクリーンナップ
const cleanDist = () => {
    const dir = path.resolve(__dirname, 'dist/www');
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log('dist/www directory cleaned');
    }
};

cleanDist();
generateImageMetadata();
compileAll();
compileCSS();
convertImages();
