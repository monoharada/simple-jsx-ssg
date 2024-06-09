import fs from 'node:fs';
import path from 'node:path';

const getCssFiles = (): string[] => {
  const stylesDir = path.resolve(__dirname, '../assets/css/common');
  let cssFiles: string[] = [];

  try {
    const files = fs.readdirSync(stylesDir);
    cssFiles = files
      .filter((file) => file.endsWith('.css') && !file.startsWith('_'))
      .map((file) => path.join('/assets/css/common', file));

    // Check if base.css exists and move it to the front of the array
    const baseCssIndex = cssFiles.findIndex((file) => file.endsWith('/base.css'));
    if (baseCssIndex !== -1) {
      const [baseCss] = cssFiles.splice(baseCssIndex, 1);
      cssFiles.unshift(baseCss);
    }
  } catch (err) {
    console.error('Error reading styles directory:', err);
  }
  return cssFiles;
};

export default getCssFiles;
