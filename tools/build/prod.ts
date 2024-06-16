import fs from 'node:fs';
import path from 'node:path';
import {generateimage_metadata} from 'tools/build/getImageData.js';
import {convertImages} from 'tools/build/imageConvert.js';
import { main as compileCSS } from '../compiler/css-compile';
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
generateimage_metadata();
compileAll();
compileCSS();
convertImages();
