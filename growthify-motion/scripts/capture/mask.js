// Injected into every page: replaces phone numbers with a neat placeholder bar.
module.exports = `(() => {
  const RE = /(\\+?92[\\s-]?|0)3\\d{2}[\\s-]?\\d{7}/;
  const mask = (root) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const hits = [];
    while (w.nextNode()) { if (RE.test(w.currentNode.nodeValue) && !w.currentNode.parentElement.closest('[data-gmask]')) hits.push(w.currentNode); }
    for (const n of hits) {
      const s = document.createElement('span');
      s.setAttribute('data-gmask', '1');
      s.style.cssText = 'display:inline-block;width:7.2em;height:0.9em;border-radius:0.45em;background:#d6d6d6;vertical-align:-0.1em;';
      const parts = n.nodeValue.split(RE);
      n.parentNode.insertBefore(document.createTextNode(n.nodeValue.replace(new RegExp(RE.source + '.*'), '')), n);
      n.parentNode.insertBefore(s, n);
      n.nodeValue = n.nodeValue.replace(new RegExp('.*?' + RE.source), '');
    }
  };
  const run = () => document.body && mask(document.body);
  new MutationObserver(run).observe(document, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', run);
})();`;
