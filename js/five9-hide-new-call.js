(function () {
  'use strict';

  console.log('[five9-hide-new-call] script loaded');

  var SELECTORS = [
    '#sfli-home-new-call',
    '#newCallBtnComp',
    '.newCallBtnComp.newCallBtn',
    '.newCallBtnComp',
    '.newCallBtn',
    '#newCallBtn',
    '[name="newCallBtn"]',
    '[data-testid="new-call-button"]',
    '.btn.btn-primary.btn-call-to-action.sfli-flexible'
  ];

  var COMBINED = SELECTORS.join(',');
  var STYLE_ID = 'five9-hide-new-call-style';

  function injectStyle(root) {
    var styleHost = root.head || root.documentElement || root;
    if (!styleHost || (styleHost.querySelector && styleHost.querySelector('#' + STYLE_ID))) {
      return;
    }

    var styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = COMBINED + ' { display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; }';
    styleHost.appendChild(styleEl);
  }

  function hideInRoot(root) {
    if (!root.querySelectorAll) return 0;
    var nodes = root.querySelectorAll(COMBINED);
    var count = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.setAttribute('aria-hidden', 'true');
      count++;
    }
    return count;
  }

  function walk(root, fn) {
    fn(root);
    if (!root.querySelectorAll) return;
    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.shadowRoot) walk(el.shadowRoot, fn);
    }
  }

  function install() {
    var last = -1;

    function apply() {
      var total = 0;
      walk(document, function (root) {
        injectStyle(root);
        total += hideInRoot(root);
      });

      if (total !== last) {
        console.log('[five9-hide-new-call] hidden matches:', total);
        last = total;
      }
    }

    var mo = new MutationObserver(apply);
    mo.observe(document, { childList: true, subtree: true });

    var orig = Element.prototype.attachShadow;
    if (orig && !Element.prototype.__five9HidePatched) {
      Element.prototype.attachShadow = function (init) {
        var sr = orig.call(this, init);
        try {
          injectStyle(sr);
        } catch (e) {
          // ignore
        }
        try {
          var srObserver = new MutationObserver(apply);
          srObserver.observe(sr, { childList: true, subtree: true });
        } catch (e) {
          // ignore
        }
        return sr;
      };
      Element.prototype.__five9HidePatched = true;
    }

    apply();
    setInterval(apply, 500);
    console.log('[five9-hide-new-call] suppressor installed');
  }

  try {
    install();
  } catch (err) {
    console.error('[five9-hide-new-call] install failed', err);
  }
})();
