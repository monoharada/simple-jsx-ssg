# simple-jsx-template-engin

## 特徴

- `postcss-import`は使うが基本的にcssはコンパイルせず複数ファイルを読み込む。(HTTP/2を前提としている)
- 画像はサイズをjson形式で`src/data/image-metadata.json`に出力し`src/component/Image.tsx`で利用する。プロダクション環境ではpng,jpgはavifに変換される
- jsはmoduleで読み込み必要なものが必要な場合にリクエストされ
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
