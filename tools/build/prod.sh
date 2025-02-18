#!/bin/bash

# distディレクトリを削除
rm -rf dist
# ビルド
BUILD_MODE=production bun run tools/build/prod.ts  

 
# dist/www/assets/image/内のjpg,pngを再帰的にサブディレクトリのものも含めて削除する
find dist/www/assets/image/ -type f \( -name "*.jpg" -o -name "*.png" \) -exec rm {} \;

# find ./dist -name "*.html" -exec bunx js-beautify --editorconfig -r -f {} \;