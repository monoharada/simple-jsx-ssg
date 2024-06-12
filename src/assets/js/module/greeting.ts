class SimpleGreeting extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });
    this.shadowRoot.innerHTML = '<p><slot></slot></p>';
  }
}

customElements.define('simple-greeting', SimpleGreeting);

// 使い方:
// <simple-greeting>ここに表示したいテキストを入れる</simple-greeting>
