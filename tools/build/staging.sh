#!/bin/bash

# distディレクトリを削除
rm -rf dist
# ビルド
BUILD_MODE=staging bun run tools/build/prod.ts  

find ./dist -name "*.html" -exec bunx js-beautify --editorconfig -r -f {} \;