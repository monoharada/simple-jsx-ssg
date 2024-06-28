# simple-jsx-template-engine

jsxをシンプルにテンプレートエンジンとして使用する。TSで静的型安全に開発する。

## 特徴

- 開発時、プロダクション時にjsxは変更を検知するとすぐさま`dist/www`へ静的htmlで吐き出される。`dist/www`の変更を検知してブラウザがリロードされる。
- `postcss-import`は使うが基本的にcssはコンパイルせず複数ファイルを読み込む。(HTTP/2を前提としている)
- 画像はサイズをjson形式で`src/data/image_metadata.json`に出力し`/component/Image.tsx`で利用する。プロダクション環境ではpng,jpgはavifに変換される
- jsはmoduleで読み込み必要なものが必要な場合にリクエストされる。src/assets/js/内でvanilla.jsを使う（reactはパッケージに入っていない）
- meta情報は`src/data/page_metadata.ts`に記載していく
- pages配下の`.tsx`で`customMetaData`と`__filename`を`src/frame/Frame.tsx`に渡すことで追加スクリプトやmeta情報の変更を行える
- SSIが使えます。
  - Commentコンポーネントでprops`ssi`を使用してincファイル（htmlでもよい）への納品時の相対パスを記述します。
  - Cloudflareなどのモダンなプラットフォームを開発時の検証・共有サーバーにしたい場合にはビルドコマンドを`bun staging`に設定します。
  - ssiを使用できるサーバーへアップする場合は`bun run build`を使用します。

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
│ ├── image_metadata.json
│ └── page_metadata.ts
├── frame
│ ├── Frame.tsx
│ ├── Head.tsx
│ └── Layout.tsx
├── pages
│ ├── hoge
│ │ └── index.tsx
│ └── index.tsx
└── types.d.ts
```

## style guideline

cssファイルはコンパイルせずに複数読み込む。読み込み順による崩れを防ぐためにlinkタグより前にstyleタグにてcss cascade layersを規定する。

```html
<style>@layer xxx,xxx,xxx;</style>
```

### css cascade layersの基本設定

src/site_setting.tsにて設定する
デフォルト値は
**reset,tokens,base,layout,landmarks,components,contents,page,operational**
とし、各layer名と同一のcssファイルをsrc/assets/css/common/に配置する

- reset:リセットCSS
- tokens:`:root`でのcss変数
- base:html,body,any-link,imgなどの初期設定、font-faceなど
- layout:ページ大枠のレイアウト設定
- landmarks:headerやfooterなどサイト共通パーツ
- components:heading,text,link-button,card,badge,accordionなど
- contents:コンテンツ内でのコンポーネント間の余白調整
- page:ページ固有で必要なスタイル。このファイルだけはcommonにおかず各pages/{page}.tsxから読み込む
- operational:運用時に修正が必要になった場合（いずれよりも優先される）

### importについて

開発においては全てのファイル管理は以下を基本とする

*できるだけ細かく*
*できるだけ短く*
*できるだけ少なく*

そのためたとえばcard uiのスタイリングはcard.css内で行うことが望ましい。ただし、デプロイ時に全てのcssを並列に読み込むことはキャッシュ戦略上もあまり有用ではないため、cssファイルの目的に沿ってcascade layersのcssファイルに集約していく。
importされるcssファイルは`src/assets/css/_import/`配下に置く。

card.cssの場合は

```css
/* src/assets/css/commom/components.css */

@import url(../_import/card.css);
```

と読み込むことでpostcssによりdist/www/css/common/components.cssないに静的に_card.cssの中身が書き込まれた状態で出力される。

### cssの記述

以下の様に記述することが望ましい

```css
/* _card.css */
@layer components {
    .card {
        --card-row-gap: var(--system-contents-gap-small);
        --card-round: var(--system-radius-xs);
        
        container: card / inline-size;

        display:grid;
        gap: var(--card-row-gap);
        border-radius: var(--card-round);
        /* ... */

        > header {
            padding-block: var(--spacing-xs);
            @container (min-width > 640px) {
                border-bottom: var(--border-default);
            }
        }
        :where(:not(>footer,>header)) p {
            line-height:var(--lh-relax);
        }

        > footer {
            display: flex;
            /* ... */
            &:has(a) {
                justify-content:end;
            }
        }
    }
}
```

1. CSSファイルの構成:

    _card.css というファイル名で、コンポーネントに関するスタイルを定義しています。このように、ファイル名を機能や目的ごとに分けることで、後からスタイルを見直したり変更したりする際に、目的のスタイルを見つけやすくなります。

2. コンポーネントの定義:

    @layer components を使って、コンポーネント用のスタイルを定義するレイヤーを指定しています。これにより、他のスタイル（例えばユーティリティスタイルなど）と明確に分けることができます。

3. カードコンポーネントのスタイル設定
    カスタムプロパティ（CSS変数）の使用できる:する場合は`bun run build`を使用します。

    --card-row-gap や --card-round といったカスタムプロパティを使用して、カードの行間や角の丸みを指定しています。これらのプロパティは、変更が必要なときに簡単に値を調整できるようにするためのものです。また基本的には:root内で宣言しているサイト共通の変数を使いつつ、コンポーネント独自に規定すべきものについては同値であっても再代入します。

4. レイアウトの指定:

    スタイルのルートとなるclass内ではコンテナクエリーを宣言します。この例ではcontainer: card / inline-size を使って、カードがコンテナレイアウトを持つことを指定しています。inline-size はコンテナのサイズがインライン方向で調整されることを意味します。

5. レスポンシブデザインの対応:

    @container (min-width > 640px) を使って、コンテナクエリを適用しています。この条件を満たす場合（画面幅が640px以上の場合）、header 要素に下線を追加するスタイルが適用されます。

6. 理論値による余白指定
   padding-blockやmargin-inlineを使用して情報方向性に沿った余白を設定します。理論値,borderのみショートハンドでの記述を推奨します。

7. 特定の要素に対するスタイル設定
    :whereや:hasを使用し、詳細度を変えずに論理的にスタイルを記述します。

8. cssのネスト
    直下の要素か理論的に指定できる要素のみをネストさせます。孫要素などをhtmlセレクターで指定する場合は

    ```css
    .card {
        > header {
         /* ... */   
        }
        > header > h3 {}
    }
    ```
    
    という具合にheaderとheader > h3 はネストを分けます。

#### デバイスごとのだしわけについて:wip

##### 出し分けをするのが仕方ないものもの

記述コンテンツ（フレージング・コンテンツ)内のスタイリングでメインビジュアルや強いメッセージ表現を行う場合の画面幅ごとの調整

##### よく検討したいもの

上記仕方ないものではない場合、デバイスで出し分ける実装をする前にマークアップややその他のスタイリングで回避できないか確認します。
そのうえで必要となった場合、対象要素をラップしたdivで出し分けのスタイリングをします。

```html
<!-- ⛔ bad -->
<table class="product-table only-pc">...</table>

<!-- 👍 good -->
<div data-screen="pc">
    <table class="product-table">...</table>
</div>

```

`data-screen="pc"`を付与されているdivは画面幅PCの場合は`display: contents`となり、domツリーから外れる。
それ以外の画面幅では`display:none;`となる
