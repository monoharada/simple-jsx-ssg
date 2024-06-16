# Foot Note (注釈)

## 仕様と使い方

### 仕様

このスクリプトは、HTMLドキュメント内のフットノートを自動的に生成し、適切なリンクを追加します。以下の機能を提供します：

`src/assets/js/module/foot-note.ts`

1. **フットノートの生成**:
   - `addFootnotes`関数は、指定されたセクション内のフットノート参照（`<sup>`タグ）を探し、対応するフットノートリスト（`<ol>`タグ）を生成します。
   - 各フットノート参照には一意のIDが付与され、対応するフットノート項目へのリンクが作成されます。

2. **フットノートの初期化**:
   - `initializeFootnotes`関数は、ドキュメント内のすべてのセクションと記事を検索し、フットノートを初期化します。

3. **クリックイベントの追加**:
   - `addClickEventToFootnotes`関数は、フットノート参照リンクにクリックイベントを追加し、フットノート項目に戻るリンクを生成します。

### 使い方

#### HTMLの準備

フットノート参照を追加するには、`<sup>`タグを使用し、`data-footnote=ref_{index}`属性を設定します。注釈リストをolタグで作成し`data-footnote="list"`を付与します。
注釈リストの順番と`data-footnote="ref_{index}`のindexをあわせます。
prefix(※)やその他のスタイルの調整は`src/assets/css/_import/foot-note.css`で調整します。

```html
<section id="example-section">
  <p>これはフットノートの例です<sup data-footnote="ref_1">1</sup>。</p>
  <footer>
    <ol data-footnote="list">
      <li>これは最初のフットノートです。</li>
    </ol>
  </footer>
</section>
```
