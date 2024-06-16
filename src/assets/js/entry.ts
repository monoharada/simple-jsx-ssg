import './module/insert';
import './module/greeting';

// ページ内にdata-footnoteがあったら./module/foot-noteを読み込む
const hasFootnote = document.querySelector('[data-footnote]');
if (hasFootnote) {
  import('./module/foot-note');
}

console.log('Hello');
