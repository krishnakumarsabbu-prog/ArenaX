(function () {
  'use strict';

  var XTEST_API = (typeof window !== 'undefined' && window.__XTEST_API__) || '/api';

  // ── Fingerprinting ──────────────────────────────────────────────────────────
  function getFingerprint() {
    var token = sessionStorage.getItem('_xt_token');
    if (!token) {
      token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_xt_token', token);
    }
    var parts = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      token
    ];
    var hash = 5381;
    var str = parts.join('|');
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  // ── Variant assignment ──────────────────────────────────────────────────────
  async function assignAndApply(experimentId) {
    var fp = getFingerprint();
    var deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

    var assignment;
    try {
      var res = await fetch(XTEST_API + '/experiments/' + experimentId + '/assign?fp=' + fp, {
        credentials: 'omit'
      });
      assignment = await res.json();
    } catch (e) {
      console.debug('[XTest] Assignment fetch failed:', e);
      return;
    }

    if (!assignment.variant_id || !assignment.changes || !assignment.changes.length) return;

    assignment.changes.forEach(function (change) {
      document.querySelectorAll(change.selector).forEach(function (el) {
        if (change.property === 'textContent') {
          el.textContent = change.value;
        } else if (change.property.startsWith('style.')) {
          el.style[change.property.slice(6)] = change.value;
        } else if (change.property === 'src') {
          el.src = change.value;
        } else {
          el.setAttribute(change.property, change.value);
        }
      });
    });

    await sendEvent({
      experiment_id: experimentId,
      variant_id: assignment.variant_id,
      fingerprint: fp,
      event_type: 'impression',
      device_type: deviceType,
      is_new_user: !localStorage.getItem('_xt_returning')
    });
    localStorage.setItem('_xt_returning', '1');

    trackConversions(experimentId, assignment.variant_id, fp, deviceType);
  }

  // ── Event sending ───────────────────────────────────────────────────────────
  async function sendEvent(payload) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(XTEST_API + '/events', JSON.stringify(payload));
      } else {
        await fetch(XTEST_API + '/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }
    } catch (e) {
      console.debug('[XTest] Event send failed:', e);
    }
  }

  // ── Conversion tracking ─────────────────────────────────────────────────────
  function trackConversions(expId, variantId, fp, deviceType) {
    document.querySelectorAll('[data-xtest-goal="conversion"]').forEach(function (el) {
      el.addEventListener('click', function () {
        sendEvent({
          experiment_id: expId,
          variant_id: variantId,
          fingerprint: fp,
          event_type: 'conversion',
          device_type: deviceType
        });
      }, { once: true });
    });

    document.querySelectorAll('[data-xtest-goal="form"]').forEach(function (form) {
      form.addEventListener('submit', function () {
        sendEvent({
          experiment_id: expId,
          variant_id: variantId,
          fingerprint: fp,
          event_type: 'conversion',
          metadata: { trigger: 'form_submit' },
          device_type: deviceType
        });
      }, { once: true });
    });

    var maxScroll = 0;
    window.addEventListener('scroll', function () {
      var pct = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (pct > maxScroll + 25 && pct <= 100) {
        maxScroll = pct;
        sendEvent({
          experiment_id: expId,
          variant_id: variantId,
          fingerprint: fp,
          event_type: 'scroll',
          metadata: { scroll_depth: pct },
          device_type: deviceType
        });
      }
    }, { passive: true });
  }

  // ── Auto-init ───────────────────────────────────────────────────────────────
  var scriptTag = document.currentScript || document.querySelector('script[data-experiments]');
  var expIds = (scriptTag && scriptTag.getAttribute('data-experiments') || '')
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { expIds.forEach(assignAndApply); });
  } else {
    expIds.forEach(assignAndApply);
  }

  // Public API
  window.XTest = { assign: assignAndApply, track: sendEvent };
})();
