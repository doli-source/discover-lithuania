(function () {
  var STORAGE = { large: 'a11y_large', contrast: 'a11y_contrast', motion: 'a11y_reduce_motion' };
  var CLASS = { large: 'a11y-large', contrast: 'a11y-contrast', motion: 'a11y-reduce-motion' };

  var html = document.documentElement;

  var LABELS = {
    en: {
      title: 'Accessibility',
      ariaBtn: 'Accessibility options',
      fontSize: 'Font size',
      decrease: 'Decrease font size',
      increase: 'Increase font size',
      contrast: 'High contrast',
      motion: 'Reduce motion',
      statement: 'Accessibility statement',
    },
    he: {
      title: 'נגישות',
      ariaBtn: 'אפשרויות נגישות',
      fontSize: 'גודל גופן',
      decrease: 'הקטן גופן',
      increase: 'הגדל גופן',
      contrast: 'ניגודיות גבוהה',
      motion: 'הפחת תנועה',
      statement: 'הצהרת נגישות',
    },
  };

  // Check URL param (?lang=he) AND html[lang] — React app uses the URL param
  function getLang() {
    try {
      if (new URLSearchParams(window.location.search).get('lang') === 'he') return 'he';
    } catch (e) {}
    return html.lang === 'he' ? 'he' : 'en';
  }

  /* ── Apply saved state immediately ── */
  function applyState() {
    Object.keys(STORAGE).forEach(function (key) {
      if (localStorage.getItem(STORAGE[key]) === '1') {
        html.classList.add(CLASS[key]);
      }
    });
    injectModeCSS();
  }

  function injectModeCSS() {
    if (document.getElementById('a11y-inline-css')) return;
    var style = document.createElement('style');
    style.id = 'a11y-inline-css';
    style.textContent = [
      'html.a11y-large { font-size: 120% !important; }',
      'html.a11y-reduce-motion *, html.a11y-reduce-motion *::before, html.a11y-reduce-motion *::after {',
      '  animation-duration: 0.001ms !important;',
      '  animation-iteration-count: 1 !important;',
      '  transition-duration: 0.001ms !important;',
      '}',
      'html.a11y-contrast, html.a11y-contrast body { background: #000 !important; color: #fff !important; }',
      'html.a11y-contrast a { color: #ffff00 !important; }',
      'html.a11y-contrast img { filter: grayscale(100%) contrast(120%); }',
      'html.a11y-contrast button, html.a11y-contrast [role="button"] {',
      '  background: #000 !important; color: #fff !important; border: 2px solid #fff !important;',
      '}',
      'html.a11y-contrast input, html.a11y-contrast select, html.a11y-contrast textarea {',
      '  background: #111 !important; color: #fff !important; border-color: #fff !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Update all visible labels to current language ── */
  function updateLabels(btn, panel) {
    var L = LABELS[getLang()];
    var el;
    el = document.getElementById('a11y-title');          if (el) el.textContent = L.title;
    el = document.getElementById('a11y-label-size');     if (el) el.textContent = L.fontSize;
    el = document.getElementById('a11y-label-contrast'); if (el) el.textContent = L.contrast;
    el = document.getElementById('a11y-label-motion');   if (el) el.textContent = L.motion;
    el = document.getElementById('a11y-link-statement');
    if (el) {
      el.textContent = L.statement;
      el.href = getLang() === 'he' ? '/accessibility.html?lang=he' : '/accessibility.html';
    }
    el = document.getElementById('a11y-decrease');       if (el) el.setAttribute('aria-label', L.decrease);
    el = document.getElementById('a11y-increase');       if (el) el.setAttribute('aria-label', L.increase);
    el = document.getElementById('a11y-contrast-toggle');if (el) el.setAttribute('aria-label', L.contrast);
    el = document.getElementById('a11y-motion-toggle');  if (el) el.setAttribute('aria-label', L.motion);
    if (panel) panel.setAttribute('aria-label', L.title);
    if (btn)   btn.setAttribute('aria-label', L.ariaBtn);
  }

  /* ── Build widget ── */
  function buildWidget() {
    var L = LABELS[getLang()];
    var safeBottom = 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))';

    var panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', L.title);
    panel.setAttribute('aria-hidden', 'true');
    panel.style.cssText = [
      'display:none',
      'position:fixed',
      'z-index:8999',
      'background:#fff',
      'border-radius:12px',
      'box-shadow:0 4px 24px rgba(0,0,0,0.15)',
      'padding:14px 14px 10px',
      'width:min(220px, calc(100vw - 2rem))',
      'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
      'bottom:calc(' + safeBottom + ' + 60px)',
      'right:1.5rem',
    ].join(';');

    panel.innerHTML = [
      '<div id="a11y-title" style="font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#7a6040;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #eee;">' + L.title + '</div>',

      '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f0f0;">',
      '  <span id="a11y-label-size" style="font-size:13px;color:#3d2e18;">' + L.fontSize + '</span>',
      '  <div style="display:flex;gap:5px;">',
      '    <button id="a11y-decrease" aria-label="' + L.decrease + '" style="width:32px;height:32px;border-radius:6px;border:1px solid #ddd;background:#f9f6f0;font-size:14px;font-weight:700;cursor:pointer;color:#3d2e18;line-height:1;">A−</button>',
      '    <button id="a11y-increase" aria-label="' + L.increase + '" style="width:32px;height:32px;border-radius:6px;border:1px solid #ddd;background:#f9f6f0;font-size:14px;font-weight:700;cursor:pointer;color:#3d2e18;line-height:1;">A+</button>',
      '  </div>',
      '</div>',

      '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f0f0;">',
      '  <span id="a11y-label-contrast" style="font-size:13px;color:#3d2e18;">' + L.contrast + '</span>',
      '  <button id="a11y-contrast-toggle" role="switch" aria-checked="false" aria-label="' + L.contrast + '"',
      '    style="width:42px;height:24px;border-radius:12px;border:none;cursor:pointer;background:#ddd;position:relative;flex-shrink:0;padding:0;">',
      '    <span id="a11y-contrast-knob" style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.15s;display:block;"></span>',
      '  </button>',
      '</div>',

      '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f0f0;">',
      '  <span id="a11y-label-motion" style="font-size:13px;color:#3d2e18;">' + L.motion + '</span>',
      '  <button id="a11y-motion-toggle" role="switch" aria-checked="false" aria-label="' + L.motion + '"',
      '    style="width:42px;height:24px;border-radius:12px;border:none;cursor:pointer;background:#ddd;position:relative;flex-shrink:0;padding:0;">',
      '    <span id="a11y-motion-knob" style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.15s;display:block;"></span>',
      '  </button>',
      '</div>',

      '<a id="a11y-link-statement" href="' + (getLang() === 'he' ? '/accessibility.html?lang=he' : '/accessibility.html') + '" style="display:block;margin-top:10px;font-size:12px;color:#C28840;text-decoration:underline;">' + L.statement + '</a>',
    ].join('');

    var btn = document.createElement('button');
    btn.id = 'a11y-btn';
    btn.setAttribute('aria-label', L.ariaBtn);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'a11y-panel');
    btn.style.cssText = [
      'position:fixed',
      'z-index:9000',
      'bottom:' + safeBottom,
      'right:1.5rem',
      'width:48px',
      'height:48px',
      'border-radius:50%',
      'background:#C28840',
      'border:none',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-shadow:0 2px 10px rgba(0,0,0,0.22)',
      'padding:0',
    ].join(';');
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><path d="M8 9h8"/><path d="M12 9v10"/><path d="M9 19h6"/></svg>';

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    syncToggles();
    attachEvents(btn, panel);

    // MutationObserver as backup for html[lang] changes
    new MutationObserver(function () { updateLabels(btn, panel); })
      .observe(html, { attributes: true, attributeFilter: ['lang', 'dir'] });
  }

  function syncToggles() {
    setToggle('a11y-contrast-toggle', 'a11y-contrast-knob', html.classList.contains(CLASS.contrast));
    setToggle('a11y-motion-toggle', 'a11y-motion-knob', html.classList.contains(CLASS.motion));
  }

  function setToggle(btnId, knobId, active) {
    var b = document.getElementById(btnId);
    var knob = document.getElementById(knobId);
    if (!b || !knob) return;
    b.style.background = active ? '#C28840' : '#ddd';
    b.setAttribute('aria-checked', active ? 'true' : 'false');
    knob.style.left = active ? '22px' : '4px';
  }

  function attachEvents(btn, panel) {
    var open = false;

    function openPanel() {
      // Always re-read language when panel opens
      updateLabels(btn, panel);
      open = true;
      panel.style.display = 'block';
      panel.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      var first = panel.querySelector('button, a');
      if (first) first.focus();
    }

    function closePanel() {
      open = false;
      panel.style.display = 'none';
      panel.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      open ? closePanel() : openPanel();
    });

    document.addEventListener('click', function (e) {
      if (open && !panel.contains(e.target) && e.target !== btn) closePanel();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { closePanel(); btn.focus(); }
    });

    document.getElementById('a11y-decrease').addEventListener('click', function () {
      html.classList.remove(CLASS.large);
      localStorage.removeItem(STORAGE.large);
    });

    document.getElementById('a11y-increase').addEventListener('click', function () {
      html.classList.add(CLASS.large);
      localStorage.setItem(STORAGE.large, '1');
    });

    document.getElementById('a11y-contrast-toggle').addEventListener('click', function () {
      var active = html.classList.toggle(CLASS.contrast);
      active ? localStorage.setItem(STORAGE.contrast, '1') : localStorage.removeItem(STORAGE.contrast);
      setToggle('a11y-contrast-toggle', 'a11y-contrast-knob', active);
    });

    document.getElementById('a11y-motion-toggle').addEventListener('click', function () {
      var active = html.classList.toggle(CLASS.motion);
      active ? localStorage.setItem(STORAGE.motion, '1') : localStorage.removeItem(STORAGE.motion);
      setToggle('a11y-motion-toggle', 'a11y-motion-knob', active);
    });
  }

  /* ── Init ── */
  applyState();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
