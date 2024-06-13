import fs from 'node:fs';
import path from 'node:path';

const getCssFiles = (): string[] => {
  const stylesDir = path.resolve(__dirname, '../../src/assets/css/common');
  let cssFiles: string[] = [];

  try {
    const files = fs.readdirSync(stylesDir);
    cssFiles = files
      .filter((file) => file.endsWith('.css') && !file.startsWith('_'))
      .map((file) => path.join('/assets/css/common', file));
  } catch (err) {
    console.error('Error reading styles directory:', err);
  }
  return cssFiles;
};

export default getCssFiles;
