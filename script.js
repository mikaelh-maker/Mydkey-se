(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- Säkerhetskontroll för ledningen ---------- */
  var QUESTIONS = [
    {
      theme: 'Människor', short: 'Rutiner mot bedrägeri vid betalningar', weight: 4,
      q: 'Vet era medarbetare vad de ska göra om de får ett mejl som verkar komma från er eller ekonomichefen och ber om en brådskande betalning?',
      help: 'Falska chefsmejl och ändrade bankuppgifter är en av de vanligaste bedrägerimetoderna mot företag.',
      why: 'Fakturabedrägerier kostar svenska företag stora belopp varje år, och en enda ouppmärksam betalning räcker.',
      fix: 'Inför en enkel regel: betalningar och ändrade bankuppgifter bekräftas alltid per telefon. Gör en kort genomgång med dem som hanterar ekonomin.'
    },
    {
      theme: 'Konton och åtkomst', short: 'Inloggning med mer än lösenord', weight: 5,
      q: 'Måste alla logga in med mer än bara ett lösenord, till exempel med en kod i mobilen, när de når mejl och företagets system?',
      help: 'Det kallas flerfaktorsinloggning eller MFA.',
      why: 'Stulna lösenord är den vanligaste vägen in. Utan ett extra steg räcker ett enda läckt lösenord för att någon ska kunna läsa er e-post.',
      fix: 'Slå på flerfaktorsinloggning för alla konton, och börja med e-post och administratörer. Det tar ofta bara några timmar.'
    },
    {
      theme: 'Kontinuitet', short: 'Förmåga att återställa verksamheten', weight: 5,
      q: 'Om era datorer och filer blev oåtkomliga i morgon, till exempel av ett utpressningsvirus, vet ni då att ni kan få tillbaka verksamheten, och hur lång tid det tar?',
      help: 'Det räcker inte att ha backup. Den måste ha testats.',
      why: 'Många företag har en backup som aldrig har testats, och märker först i krisen att den inte fungerar.',
      fix: 'Testa att återställa de viktigaste uppgifterna och skriv ned hur lång tid det tar. Då vet ni vad ett avbrott skulle kosta.'
    },
    {
      theme: 'Beredskap', short: 'Plan för de första timmarna vid ett intrång', weight: 4,
      q: 'Finns det en kort plan för vem som gör vad under den första timmen efter ett intrång, och vem som ringer vem?',
      help: 'Det behöver inte vara längre än en sida.',
      why: 'De första timmarna avgör hur stor skadan blir. Utan plan går tiden åt till att fundera i stället för att agera.',
      fix: 'Ta fram en incidentplan på en sida med ansvariga, telefonnummer och de första stegen. Gör sedan en övning.'
    },
    {
      theme: 'Konton och åtkomst', short: 'Avslut av åtkomst när någon slutar', weight: 2,
      q: 'Stängs en medarbetares åtkomst till mejl och system samma dag som personen slutar?',
      help: 'Det gäller även konsulter och tillfälligt anställda.',
      why: 'Gamla konton som lever kvar är en öppen dörr, och de upptäcks sällan.',
      fix: 'Inför en checklista för start och avslut av anställning, med en ansvarig person som bockar av den.'
    },
    {
      theme: 'Teknik i vardagen', short: 'Löpande uppdateringar', weight: 3,
      q: 'Uppdateras datorer, mobiler och servrar löpande, utan att någon behöver komma ihåg det?',
      help: 'Ju längre en rättning dröjer, desto längre är ni öppna för kända attacker.',
      why: 'De flesta intrång utnyttjar kända svagheter som det redan finns en rättning för.',
      fix: 'Slå på automatiska uppdateringar och följ upp en gång i månaden att alla enheter är med.'
    },
    {
      theme: 'Förtroende', short: 'Skydd mot förfalskade mejl i ert namn', weight: 3,
      q: 'Är företagets e-postdomän skyddad mot att någon annan skickar mejl i ert namn?',
      help: 'Tekniskt kallas skyddet SPF, DKIM och DMARC. Er IT-leverantör eller jag kan se det på några minuter.',
      why: 'Förfalskade mejl i ert namn skadar förtroendet hos kunder och leverantörer, och används för bedrägerier.',
      fix: 'Konfigurera SPF, DKIM och DMARC för er domän. Jag kan göra en kontroll av domänen på några minuter.'
    },
    {
      theme: 'Ledning', short: 'Ledningens överblick över säkerheten', weight: 2,
      q: 'Får ledningen en kort redovisning av säkerhetsläget och de största riskerna minst en gång per år?',
      help: 'Säkerhet är ett ledningsansvar, inte bara en teknisk fråga.',
      why: 'Utan överblick prioriteras det som är bråttom, inte det som är viktigt, och ansvaret blir otydligt.',
      fix: 'Ta fram en enkel årlig riskbild: vad är mest värdefullt, vad hotar det, och vad görs åt det.'
    }
  ];

  var BANDS = [
    { min: 85, name: 'Stark grund', color: 'var(--green)', text: 'Ni har det mesta på plats. Nästa steg är att testa rutinerna och hålla dem aktuella, så att skyddet håller även när verksamheten förändras.' },
    { min: 60, name: 'God nivå, men med luckor', color: 'var(--cyan)', text: 'Grunden finns, men några viktiga delar saknas eller är bara delvis på plats. Det är ofta enkla åtgärder som ger störst effekt.' },
    { min: 35, name: 'Märkbara risker', color: 'var(--amber)', text: 'Flera centrala skydd saknas. Ett angrepp skulle sannolikt få tydliga följder för verksamheten. Börja med de tre åtgärderna nedan.' },
    { min: 0, name: 'Hög risk: agera nu', color: 'var(--red)', text: 'Viktiga skydd saknas, och ett angrepp skulle kunna stoppa verksamheten. Det går att förbättra mycket snabbt med rätt prioritering.' }
  ];

  var el = {
    start: document.getElementById('check-start'),
    begin: document.getElementById('check-begin'),
    run: document.getElementById('check-run'),
    step: document.getElementById('check-step'),
    bar: document.getElementById('check-bar'),
    q: document.getElementById('check-q'),
    back: document.getElementById('check-back'),
    result: document.getElementById('check-result')
  };

  if (el.start && el.begin) {
    var answers = [];
    var idx = 0;
    var N = QUESTIONS.length;

    el.start.hidden = false;

    var CHOICES = [
      { value: 2, label: 'Ja', sub: 'Det är på plats' },
      { value: 1, label: 'Delvis', sub: 'På vissa sätt eller ställen' },
      { value: 0, label: 'Nej', sub: 'Eller vet inte' }
    ];

    function show(which) {
      el.start.hidden = which !== 'start';
      el.run.hidden = which !== 'run';
      el.result.hidden = which !== 'result';
    }

    function renderQuestion() {
      var q = QUESTIONS[idx];
      el.step.innerHTML = '<b>Fråga ' + (idx + 1) + ' av ' + N + '</b> · ' + q.theme;
      el.bar.setAttribute('aria-valuenow', String(idx));
      el.bar.firstElementChild.style.width = (idx / N * 100) + '%';
      el.back.hidden = idx === 0;

      el.q.innerHTML = '';
      var legend = document.createElement('legend');
      legend.textContent = q.q;
      el.q.appendChild(legend);
      var help = document.createElement('p');
      help.className = 'check__help';
      help.textContent = q.help;
      el.q.appendChild(help);

      var wrap = document.createElement('div');
      wrap.className = 'choices';
      CHOICES.forEach(function (c) {
        var label = document.createElement('label');
        label.className = 'choice';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = String(c.value);
        if (answers[idx] === c.value) input.checked = true;
        var span = document.createElement('span');
        span.textContent = c.label;
        var small = document.createElement('small');
        small.textContent = c.sub;
        span.appendChild(small);
        label.appendChild(input);
        label.appendChild(span);
        wrap.appendChild(label);
        input.addEventListener('change', function () {
          answers[idx] = c.value;
          setTimeout(next, reduce ? 0 : 220);
        });
      });
      el.q.appendChild(wrap);
    }

    function next() {
      if (idx < N - 1) { idx += 1; renderQuestion(); focusFirst(); }
      else { renderResult(); }
    }

    function focusFirst() {
      // Flytta fokus till frågan (inte till ett svarsalternativ), så att inget ser förvalt ut
      el.q.setAttribute('tabindex', '-1');
      el.q.focus({ preventScroll: true });
    }

    function bandFor(pct) {
      for (var i = 0; i < BANDS.length; i++) { if (pct >= BANDS[i].min) return BANDS[i]; }
      return BANDS[BANDS.length - 1];
    }

    function renderResult() {
      el.bar.firstElementChild.style.width = '100%';
      var total = answers.reduce(function (a, b) { return a + b; }, 0);
      var pct = Math.round(total / (N * 2) * 100);
      var band = bandFor(pct);

      var gaps = [];
      var oks = [];
      QUESTIONS.forEach(function (q, i) {
        if (answers[i] === 2) oks.push(q); else gaps.push({ q: q, a: answers[i] });
      });
      gaps.sort(function (x, y) { return (x.a - y.a) || (y.q.weight - x.q.weight); });
      var top = gaps.slice(0, 3);

      var html = '<div class="res">';
      html += '<div class="res__head"><div class="gauge" style="--pct:' + pct + ';--c:' + band.color + '"><strong>' + pct + '<small>%</small></strong></div>';
      html += '<div><p class="res__band" style="--c:' + band.color + '"><em>' + band.name + '</em></p><p class="res__text">' + band.text + '</p></div></div>';

      if (top.length) {
        html += '<div><h4>De ' + (top.length === 1 ? 'viktigaste åtgärden' : top.length + ' viktigaste åtgärderna') + '</h4><ol class="gaps">';
        top.forEach(function (g) {
          html += '<li><h5>' + g.q.short + (g.a === 1 ? ' (delvis på plats)' : '') + '</h5><p><b>Varför det spelar roll:</b> ' + g.q.why + '</p><p><b>Första steget:</b> ' + g.q.fix + '</p></li>';
        });
        html += '</ol></div>';
      } else {
        html += '<div><h4>Inga luckor hittades</h4><p class="res__text">Ni svarade ja på allt. Då är nästa steg att regelbundet testa att skydden fungerar.</p></div>';
      }

      if (oks.length) {
        html += '<div><h4>Det här fungerar redan</h4><ul class="ok-list">';
        oks.forEach(function (q) { html += '<li>' + q.short + '</li>'; });
        html += '</ul></div>';
      }

      var labels = { 2: 'Ja', 1: 'Delvis', 0: 'Nej/vet inte' };
      var body = 'Hej Mikael,\n\nJag gjorde säkerhetskontrollen på mydkey.se och fick ' + pct + ' % (' + band.name + ').\n\nMina svar:\n' +
        QUESTIONS.map(function (q, i) { return '- ' + q.short + ': ' + labels[answers[i]]; }).join('\n') +
        '\n\nJag vill gärna prata om resultatet.\n';
      var href = 'mailto:mikael@mydkey.se?subject=' + encodeURIComponent('Säkerhetskontroll: ' + pct + ' %') + '&body=' + encodeURIComponent(body);

      html += '<div class="res__actions"><a class="btn btn--primary" href="' + href + '">Boka ett samtal om resultatet</a><button type="button" class="link-btn" id="check-redo">Gör om kontrollen</button></div>';
      html += '<p class="res__fine">Det här är en snabb indikation utifrån dina egna svar, inte en granskning. Inget sparas eller skickas förrän du själv väljer att mejla.</p></div>';

      el.result.innerHTML = html;
      show('result');
      var redo = document.getElementById('check-redo');
      if (redo) redo.addEventListener('click', function () { answers = []; idx = 0; show('start'); el.begin.focus(); });
      el.result.setAttribute('tabindex', '-1');
      el.result.focus({ preventScroll: true });
      if (el.result.scrollIntoView && !reduce) el.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    el.begin.addEventListener('click', function () {
      answers = []; idx = 0;
      show('run');
      renderQuestion();
      focusFirst();
    });
    el.back.addEventListener('click', function () {
      if (idx > 0) { idx -= 1; renderQuestion(); focusFirst(); }
    });
  }

  /* ---------- Aktiv menypost vid scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) {
            if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Rörelse vid scroll ---------- */
  var targets = document.querySelectorAll('.section .wrap > *, .facts .fact');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el2) { el2.classList.add('reveal'); io.observe(el2); });
  }
})();
