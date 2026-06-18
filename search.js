class PageSearch {
  constructor(contentSelector = 'body') {
    this.content = document.querySelector(contentSelector);
    this.originalHTML = this.content.innerHTML;
    this.marks = [];
    this.current = -1;
  }

  search(query) {
    this.content.innerHTML = this.originalHTML;
    this.marks = [];
    this.current = -1;
    if (!query) return 0;

    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const walker = document.createTreeWalker(this.content, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(textNode => {
      const parent = textNode.parentNode;
      if (['SCRIPT', 'STYLE', 'MARK'].includes(parent.nodeName)) return;
      const text = textNode.textContent;
      if (!re.test(text)) return;
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = re.exec(text)) !== null) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.textContent = m[0];
        frag.appendChild(mark);
        this.marks.push(mark);
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      parent.replaceChild(frag, textNode);
    });

    if (this.marks.length) this.goTo(0);
    return this.marks.length;
  }

  goTo(index) {
    if (!this.marks.length) return;
    if (this.current >= 0) this.marks[this.current].classList.remove('current');
    this.current = (index + this.marks.length) % this.marks.length;
    this.marks[this.current].classList.add('current');
    this.marks[this.current].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  next() { this.goTo(this.current + 1); }
  prev() { this.goTo(this.current - 1); }
  clear() { this.content.innerHTML = this.originalHTML; this.marks = []; this.current = -1; }
}