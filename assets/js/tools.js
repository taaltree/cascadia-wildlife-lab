/* =====================================================
   CASCADIATOOLS SECTION — copy buttons, OS tabs, finder
   Source: ecotools/site_src/tools.js (copied by
   ecotools/tools/build_site.py). Plain JS, no framework.
   Everything here is an enhancement: without JS the
   pages show every tab panel and a plain module list.
   ===================================================== */
(function () {
  'use strict';

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function wireCopy(root) {
    (root || document).querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.dataset.copy);
        var status = btn.parentNode.querySelector('.copy-status');
        if (!target) return;
        copyText(target.innerText.trim()).then(function () {
          if (status) status.textContent = 'Copied. Paste it into Claude.';
        }, function () {
          if (status) status.textContent = 'Could not copy automatically: select the text and copy it.';
        });
        if (status) setTimeout(function () { status.textContent = ''; }, 6000);
      });
    });
  }
  wireCopy(document);

  /* ---------- Tabs (Windows / macOS) ---------- */
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var buttons = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
    var panels = buttons.map(function (b) { return document.getElementById(b.getAttribute('aria-controls')); });
    function select(i, focus) {
      buttons.forEach(function (b, j) {
        var on = i === j;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        if (panels[j]) panels[j].hidden = !on;
      });
      if (focus) buttons[i].focus();
      try { localStorage.setItem('ct-os', buttons[i].dataset.os || ''); } catch (e) {}
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i, false); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = buttons.length;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); select((i + 1) % n, true); }
        if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); select((i - 1 + n) % n, true); }
        if (k === 'Home') { e.preventDefault(); select(0, true); }
        if (k === 'End') { e.preventDefault(); select(n - 1, true); }
      });
    });
    // Start on the visitor's own system when we can tell; otherwise the first tab.
    var start = 0, saved = null;
    try { saved = localStorage.getItem('ct-os'); } catch (e) {}
    var ua = (navigator.userAgent || '').toLowerCase();
    var guess = saved || (ua.indexOf('mac') >= 0 ? 'mac' : (ua.indexOf('win') >= 0 ? 'windows' : ''));
    buttons.forEach(function (b, i) { if (b.dataset.os === guess) start = i; });
    select(start, false);
  });

  /* ---------- Finder ---------- */
  var finder = document.getElementById('finder');
  var dataEl = document.getElementById('finder-data');
  if (!finder || !dataEl) return;
  var DATA;
  try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var q1Box = document.getElementById('finder-q1');
  var q2Wrap = document.getElementById('finder-q2-wrap');
  var q2Box = document.getElementById('finder-q2');
  var q2Legend = document.getElementById('finder-q2-legend');
  var out = document.getElementById('finder-results');

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }

  function choice(name, value, label, hint) {
    var lab = el('label', { 'class': 'choice' });
    var inp = el('input', { type: 'radio', name: name, value: value });
    var span = el('span');
    span.appendChild(el('span', { 'class': 'choice-label' }, label));
    if (hint) span.appendChild(el('span', { 'class': 'choice-hint' }, hint));
    lab.appendChild(inp);
    lab.appendChild(span);
    return lab;
  }

  DATA.q1.forEach(function (o) { q1Box.appendChild(choice('q1', o.id, o.label, o.hint)); });

  function currentQ1() {
    var c = q1Box.querySelector('input:checked');
    if (!c) return null;
    return DATA.q1.filter(function (o) { return o.id === c.value; })[0];
  }

  q1Box.addEventListener('change', function () {
    var o = currentQ1();
    if (!o) return;
    q2Box.innerHTML = '';
    out.innerHTML = '';
    q2Legend.textContent = '2. ' + (o.q2_question || 'What do you want to know?');
    o.q2.forEach(function (opt, i) { q2Box.appendChild(choice('q2', String(i), opt.label, opt.hint)); });
    q2Wrap.hidden = false;
  });

  q2Box.addEventListener('change', function () {
    var o = currentQ1();
    var c = q2Box.querySelector('input:checked');
    if (!o || !c) return;
    render(o, o.q2[+c.value]);
  });

  function render(o, opt) {
    out.innerHTML = '';
    var h = el('h2', { id: 'finder-result-heading', tabindex: '-1' },
      opt.modules.length > 1 ? 'Analyses that fit' : 'The analysis that fits');
    out.appendChild(h);
    if (opt.note) out.appendChild(el('p', { 'class': 'callout finder-note' }, opt.note));
    opt.modules.forEach(function (id, i) {
      var m = DATA.modules[id];
      if (!m) return;
      var box = el('article', { 'class': 'rec' });
      box.appendChild(el('span', { 'class': 'rec-rank' }, i === 0 ? 'Best match' : 'Also consider'));
      var h3 = el('h3');
      h3.appendChild(el('a', { href: m.url }, m.title));
      box.appendChild(h3);
      var dl = el('dl');
      [['What it answers', m.question], ['Use it when', m.when_to_use], ['Not for', m.not_for], ['Data you need', m.data_needed]].forEach(function (p) {
        dl.appendChild(el('dt', null, p[0]));
        dl.appendChild(el('dd', null, p[1]));
      });
      box.appendChild(dl);
      var prompt = (opt.prompts && opt.prompts[id]) || DATA.prompts[id];
      if (prompt) {
        box.appendChild(el('h4', null, 'A prompt to start from'));
        box.appendChild(el('p', { 'class': 'small muted' },
          'Replace the parts in [square brackets] with your own details, then paste it into Claude.'));
        var pb = el('div', { 'class': 'prompt-box' });
        var pid = 'finder-prompt-' + id;
        pb.appendChild(el('p', { 'class': 'prompt-text', id: pid }, prompt));
        var act = el('div', { 'class': 'prompt-actions' });
        act.appendChild(el('button', { type: 'button', 'class': 'copy-btn', 'data-copy': pid }, 'Copy prompt'));
        act.appendChild(el('span', { 'class': 'copy-status', role: 'status', 'aria-live': 'polite' }));
        pb.appendChild(act);
        box.appendChild(pb);
      }
      var links = el('p', { 'class': 'btn-row' });
      links.appendChild(el('a', { href: m.url, 'class': 'btn btn-ghost-dark' }, 'See the worked example'));
      if (m.zip) links.appendChild(el('a', { href: m.zip, 'class': 'btn btn-ghost-dark', download: '' }, 'Download example data'));
      box.appendChild(links);
      out.appendChild(box);
    });
    var again = el('p', { 'class': 'finder-reset' });
    var btn = el('button', { type: 'button', 'class': 'btn btn-ghost-dark' }, 'Start again');
    btn.addEventListener('click', function () {
      q1Box.querySelectorAll('input').forEach(function (i) { i.checked = false; });
      q2Box.innerHTML = '';
      q2Wrap.hidden = true;
      out.innerHTML = '';
      var first = q1Box.querySelector('input');
      if (first) first.focus();
    });
    again.appendChild(btn);
    out.appendChild(again);
    wireCopy(out);
    h.focus({ preventScroll: true });
    h.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
})();
