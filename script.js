(function () {
  'use strict';

  /* ---------- Flikar (Områden) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.id === tab.getAttribute('aria-controls'));
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    select(tabs[0], false);
  });

  /* ---------- Säkerhetskoll ---------- */
  var form = document.getElementById('quiz');
  if (form) {
    var gapsText = {
      mfa: 'Slå på flerfaktorsautentisering (MFA) för alla konton, börja med administratörer och e-post.',
      mail: 'Konfigurera SPF, DKIM och DMARC för e-postdomänen, så att förfalskade mejl stoppas.',
      backup: 'Säkerställ att backupen fungerar genom att regelbundet testa en återställning.',
      patch: 'Inför en rutin för löpande uppdateringar av klienter, servrar och nätverksutrustning.',
      incident: 'Ta fram en enkel incidentplan: vem gör vad, i vilken ordning, och vem ska kontaktas.',
      offboard: 'Se till att konton och behörigheter stängs direkt när någon slutar.',
      aware: 'Ge medarbetarna en kort, praktisk genomgång om phishing och hur man rapporterar misstänkta mejl.'
    };
    var order = ['mfa', 'mail', 'backup', 'patch', 'incident', 'offboard', 'aware'];
    var result = document.getElementById('result');
    var scoreEl = document.getElementById('score');
    var msgEl = document.getElementById('msg');
    var gapsEl = document.getElementById('gaps');
    var mailBtn = document.getElementById('mailresult');

    function message(n) {
      if (n === 7) return 'Bra grund. Nästa steg är att hålla den uppdaterad och testa den.';
      if (n >= 5) return 'Ganska bra, men det finns några luckor som är värda att täppa till.';
      if (n >= 3) return 'Det finns flera luckor. Börja med de enkla åtgärderna nedan.';
      return 'Här finns mycket att vinna. Börja med det första på listan, så gör du stor skillnad snabbt.';
    }

    function update() {
      var boxes = Array.prototype.slice.call(form.querySelectorAll('input[name="q"]'));
      var checked = {};
      boxes.forEach(function (b) { if (b.checked) checked[b.value] = true; });
      var n = Object.keys(checked).length;
      var gaps = order.filter(function (k) { return !checked[k]; });

      scoreEl.textContent = String(n);
      msgEl.textContent = message(n);
      gapsEl.innerHTML = '';
      gaps.forEach(function (k) {
        var li = document.createElement('li');
        li.textContent = gapsText[k];
        gapsEl.appendChild(li);
      });
      gapsEl.hidden = gaps.length === 0;

      var body = 'Hej Mikael,\n\nJag gjorde säkerhetskollen på mydkey.se och fick ' + n + ' av 7.\n' +
        (gaps.length ? '\nDet här saknas hos oss:\n- ' + gaps.map(function (k) { return gapsText[k]; }).join('\n- ') + '\n' : '') +
        '\nHör gärna av dig.\n';
      mailBtn.href = 'mailto:mikael@mydkey.se?subject=' + encodeURIComponent('Säkerhetskoll: ' + n + ' av 7') +
        '&body=' + encodeURIComponent(body);

      result.hidden = false;
    }

    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- Rörelse vid scroll ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.section .wrap > *, .facts .fact');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
