export function generateHash() {
  return Math.random().toString(36).substring(2, 10);
}

export function createAndAppend(elementType, parent, attributes = {}) {
  const element = document.createElement(elementType);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  parent.appendChild(element);
  return element;
}

export function addFootnotes(sectionElement) {
  const hash = sectionElement.id || generateHash();
  let footnoteList = sectionElement.querySelector("ol[data-footnote='list']");
  if (!footnoteList) {
    footnoteList = createAndAppend('ol', sectionElement, {
      'data-footnote': 'list',
    });
  }
  footnoteList.setAttribute('aria-label', '注釈');
  footnoteList.id = `footnote-list-${hash}`;

  const footnoteRefs = sectionElement.querySelectorAll("sup[data-footnote^='ref']");
  let refCounter = 0; // 追加: フットノート参照のカウンター
  const refIdMap = new Map(); // 追加: フットノート参照IDとインデックスのマッピング
  for (const ref of footnoteRefs) {
    const refNumber = ref.getAttribute('data-footnote').match(/^ref_(\d+)$/);
    if (!refNumber) {
      throw new Error(`Invalid footnote reference: ${ref.getAttribute('data-footnote')}`);
    }
    const index = parseInt(refNumber[1], 10) - 1;
    const footnoteId = `footnote-ref-${hash}-${index + 1}-${refCounter++}`; // 修正: 一意の識別子を追加
    refIdMap.set(index, footnoteId); // 追加: マッピングに追加
    const link = createAndAppend('a', ref.parentNode, {
      id: footnoteId,
      href: `#footnote-item-${hash}-${index + 1}`,
      'aria-describedby': `footnote-list-${hash}`,
    });
    ref.parentNode.replaceChild(link, ref);
    link.appendChild(ref);
  }

  const footnoteItems = sectionElement.querySelectorAll("ol[data-footnote='list'] li");
  for (const item of footnoteItems) {
    const index = Array.from(footnoteItems).indexOf(item);
    item.id = `footnote-item-${hash}-${index + 1}`;
    // <span class="annotation" aria-hidden="true"></span> を最初に挿入
    const annotationSpan = createAndAppend('span', item, {
      class: 'footnote-annotation',
      'aria-hidden': 'true',
    });
    item.insertBefore(annotationSpan, item.firstChild);
  }
}

export function initializeFootnotes() {
  const sections = Array.from(
    document.querySelectorAll('section:has([data-footnote]), article:has([data-footnote])'),
  );
  sections.forEach((sectionElement) => {
    addFootnotes(sectionElement);
  });
  addClickEventToFootnotes();
}

function addClickEventToFootnotes() {
  document.querySelectorAll("a[href^='#footnote-item']").forEach((link) => {
    link.addEventListener('click', (event) => {
      const linkId = link.id;
      const targetId = link.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);
      let backLink = targetElement.querySelector<HTMLAnchorElement>(
        'a[href][aria-label="コンテンツへ戻る"]',
      );

      if (!backLink) {
        backLink = createAndAppend('a', targetElement, {
          href: `#${linkId}`,
          'aria-label': 'コンテンツへ戻る',
          textContent: '↩',
        });
      } else {
        backLink.href = `#${linkId}`;
      }
    });
  });
}

initializeFootnotes();
