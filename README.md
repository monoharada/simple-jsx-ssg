# simple-jsx-template-engin

jsxをシンプルにテンプレートエンジンとして使用する。TSで静的安全に開発する。

## 特徴

- 開発時、プロダクション時にjsxは変更を検知するとすぐさま`dist/www`へ静的htmlで吐き出される。`dist/www`の変更を検知してブラウザがリロードされる。
- `postcss-import`は使うが基本的にcssはコンパイルせず複数ファイルを読み込む。(HTTP/2を前提としている)
- 画像はサイズをjson形式で`src/data/image-metadata.json`に出力し`src/component/Image.tsx`で利用する。プロダクション環境ではpng,jpgはavifに変換される
- jsはmoduleで読み込み必要なものが必要な場合にリクエストされる。src/assets/js/内でvanilla.jsを使う（reactはパッケージに入っていない）
- meta情報は`src/data/metaData.ts`に記載していく
- pages配下の`.tsx`で`customMetaData`と`__filename`を`layout.tsx`に渡すことで追加スクリプトやmeta情報の変更を行える

To install dev dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

To Build for Production

```bash
bun run build
```

To linting

```bash
bun lint
```

file structure

```tree
src
├── component
│ └── Image.tsx
│ └── SomeComponent.tsx
├── data
│ ├── image-metadata.json
│ └── metaData.ts
├── layout
│ ├── Styles.ts
│ └── layout.tsx
├── pages
│ ├── hoge
│ │ └── index.tsx
│ └── index.tsx
└── types.d.ts
```
