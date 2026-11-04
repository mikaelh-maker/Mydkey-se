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

  /* ---------- Illustrationer: animera bara det som syns ---------- */
  var scenes = document.querySelectorAll('.scene, .vision');
  if ('IntersectionObserver' in window) {
    var sceneObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting); });
    }, { rootMargin: '80px' });
    scenes.forEach(function (s) { sceneObs.observe(s); });
  } else {
    scenes.forEach(function (s) { s.classList.add('is-live'); });
  }

  /* ---------- Säkerhetskontroll för ledningen ---------- */
  var EN = (document.documentElement.lang || '').slice(0, 2) === 'en';

  var QUESTIONS_SV = [
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

  var QUESTIONS_EN = [
    {
      theme: 'People', short: 'Procedures against payment fraud', weight: 4,
      q: 'Do your employees know what to do if they receive an email that appears to come from you or the finance manager asking for an urgent payment?',
      help: 'Fake CEO emails and changed bank details are among the most common fraud methods against businesses.',
      why: 'Invoice fraud costs businesses large sums every year, and a single careless payment is enough.',
      fix: 'Introduce a simple rule: payments and changed bank details are always confirmed by phone. Run a short briefing with those who handle finances.'
    },
    {
      theme: 'Accounts and access', short: 'Sign-in with more than a password', weight: 5,
      q: 'Does everyone have to sign in with more than just a password, for example a code on their phone, to access email and company systems?',
      help: 'This is called multi-factor authentication, or MFA.',
      why: 'Stolen passwords are the most common way in. Without an extra step, a single leaked password is enough for someone to read your email.',
      fix: 'Turn on multi-factor authentication for all accounts, starting with email and administrators. It often takes only a few hours.'
    },
    {
      theme: 'Continuity', short: 'Ability to restore the business', weight: 5,
      q: 'If your computers and files became inaccessible tomorrow, for example because of ransomware, do you know that you can get the business running again, and how long it would take?',
      help: 'Having a backup is not enough. It has to have been tested.',
      why: 'Many companies have a backup that has never been tested, and only discover in a crisis that it does not work.',
      fix: 'Test restoring your most important data and write down how long it takes. Then you know what an outage would cost.'
    },
    {
      theme: 'Preparedness', short: 'Plan for the first hours of a breach', weight: 4,
      q: 'Is there a short plan for who does what during the first hour after a breach, and who calls whom?',
      help: 'It does not need to be longer than one page.',
      why: 'The first hours decide how much damage is done. Without a plan, time is spent thinking instead of acting.',
      fix: 'Write a one-page incident plan with responsible people, phone numbers and the first steps. Then run an exercise.'
    },
    {
      theme: 'Accounts and access', short: 'Removing access when someone leaves', weight: 2,
      q: 'Is an employee’s access to email and systems closed on the same day they leave?',
      help: 'This also applies to consultants and temporary staff.',
      why: 'Old accounts that stay active are an open door, and they are rarely noticed.',
      fix: 'Introduce a checklist for joiners and leavers, with one responsible person who ticks it off.'
    },
    {
      theme: 'Everyday technology', short: 'Ongoing updates', weight: 3,
      q: 'Are computers, phones and servers updated continuously, without anyone having to remember to do it?',
      help: 'The longer a fix is delayed, the longer you are exposed to known attacks.',
      why: 'Most breaches exploit known weaknesses for which a fix already exists.',
      fix: 'Turn on automatic updates and check once a month that all devices are included.'
    },
    {
      theme: 'Trust', short: 'Protection against forged emails in your name', weight: 3,
      q: 'Is your company’s email domain protected against others sending email in your name?',
      help: 'Technically, the protection is called SPF, DKIM and DMARC. Your IT provider or I can check it in a few minutes.',
      why: 'Forged emails in your name damage trust among customers and suppliers, and are used for fraud.',
      fix: 'Configure SPF, DKIM and DMARC for your domain. I can check your domain in a few minutes.'
    },
    {
      theme: 'Management', short: 'Management overview of security', weight: 2,
      q: 'Does management receive a short report on the security situation and the biggest risks at least once a year?',
      help: 'Security is a management responsibility, not just a technical issue.',
      why: 'Without an overview, what is urgent gets prioritised over what is important, and responsibility becomes unclear.',
      fix: 'Produce a simple annual risk picture: what is most valuable, what threatens it, and what is being done about it.'
    }
  ];
  var QUESTIONS = EN ? QUESTIONS_EN : QUESTIONS_SV;

  var BANDS_EN = [
    { min: 85, name: 'Strong foundation', color: 'var(--green)', text: 'You have most things in place. The next step is to test your procedures and keep them up to date, so that protection holds as the business changes.' },
    { min: 60, name: 'Good level, but with gaps', color: 'var(--cyan)', text: 'The foundation is there, but some important parts are missing or only partly in place. Simple actions often have the greatest effect.' },
    { min: 35, name: 'Noticeable risks', color: 'var(--amber)', text: 'Several key protections are missing. An attack would probably have clear consequences for the business. Start with the three actions below.' },
    { min: 0, name: 'High risk: act now', color: 'var(--red)', text: 'Important protections are missing, and an attack could stop the business. It is possible to improve a lot very quickly with the right priorities.' }
  ];

  var T = EN ? {
    choices: [['Yes', 'It is in place'], ['Partly', 'In some ways or places'], ['No', 'Or don’t know']],
    step: function (i, n) { return 'Question ' + i + ' of ' + n; },
    top: function (n) { return 'The ' + (n === 1 ? 'most important action' : n + ' most important actions'); },
    partly: ' (partly in place)', why: 'Why it matters:', first: 'First step:',
    noGaps: 'No gaps found', noGapsText: 'You answered yes to everything. The next step is to regularly test that your protections work.',
    works: 'What already works', labels: { 2: 'Yes', 1: 'Partly', 0: 'No/don’t know' },
    mailIntro: function (pct, band) { return 'Hi Mikael,\n\nI took the security check on mydkey.se and scored ' + pct + ' % (' + band + ').\n\nMy answers:\n'; },
    mailOutro: '\n\nI would like to talk about the result.\n', subject: function (pct) { return 'Security check: ' + pct + ' %'; },
    book: 'Book a call about the result', redo: 'Take the check again',
    fine: 'This is a quick indication based on your own answers, not an audit. Nothing is stored or sent unless you choose to email it.'
  } : {
    choices: [['Ja', 'Det är på plats'], ['Delvis', 'På vissa sätt eller ställen'], ['Nej', 'Eller vet inte']],
    step: function (i, n) { return 'Fråga ' + i + ' av ' + n; },
    top: function (n) { return 'De ' + (n === 1 ? 'viktigaste åtgärden' : n + ' viktigaste åtgärderna'); },
    partly: ' (delvis på plats)', why: 'Varför det spelar roll:', first: 'Första steget:',
    noGaps: 'Inga luckor hittades', noGapsText: 'Ni svarade ja på allt. Då är nästa steg att regelbundet testa att skydden fungerar.',
    works: 'Det här fungerar redan', labels: { 2: 'Ja', 1: 'Delvis', 0: 'Nej/vet inte' },
    mailIntro: function (pct, band) { return 'Hej Mikael,\n\nJag gjorde säkerhetskontrollen på mydkey.se och fick ' + pct + ' % (' + band + ').\n\nMina svar:\n'; },
    mailOutro: '\n\nJag vill gärna prata om resultatet.\n', subject: function (pct) { return 'Säkerhetskontroll: ' + pct + ' %'; },
    book: 'Boka ett samtal om resultatet', redo: 'Gör om kontrollen',
    fine: 'Det här är en snabb indikation utifrån dina egna svar, inte en granskning. Inget sparas eller skickas förrän du själv väljer att mejla.'
  };

  var BANDS_SV = [
    { min: 85, name: 'Stark grund', color: 'var(--green)', text: 'Ni har det mesta på plats. Nästa steg är att testa rutinerna och hålla dem aktuella, så att skyddet håller även när verksamheten förändras.' },
    { min: 60, name: 'God nivå, men med luckor', color: 'var(--cyan)', text: 'Grunden finns, men några viktiga delar saknas eller är bara delvis på plats. Det är ofta enkla åtgärder som ger störst effekt.' },
    { min: 35, name: 'Märkbara risker', color: 'var(--amber)', text: 'Flera centrala skydd saknas. Ett angrepp skulle sannolikt få tydliga följder för verksamheten. Börja med de tre åtgärderna nedan.' },
    { min: 0, name: 'Hög risk: agera nu', color: 'var(--red)', text: 'Viktiga skydd saknas, och ett angrepp skulle kunna stoppa verksamheten. Det går att förbättra mycket snabbt med rätt prioritering.' }
  ];
  var BANDS = EN ? BANDS_EN : BANDS_SV;

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

    var CHOICES = [2, 1, 0].map(function (v, i) {
      return { value: v, label: T.choices[i][0], sub: T.choices[i][1] };
    });

    function show(which) {
      el.start.hidden = which !== 'start';
      el.run.hidden = which !== 'run';
      el.result.hidden = which !== 'result';
    }

    function renderQuestion() {
      var q = QUESTIONS[idx];
      el.step.innerHTML = '<b>' + T.step(idx + 1, N) + '</b> · ' + q.theme;
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
        html += '<div><h4>' + T.top(top.length) + '</h4><ol class="gaps">';
        top.forEach(function (g) {
          html += '<li><h5>' + g.q.short + (g.a === 1 ? T.partly : '') + '</h5><p><b>' + T.why + '</b> ' + g.q.why + '</p><p><b>' + T.first + '</b> ' + g.q.fix + '</p></li>';
        });
        html += '</ol></div>';
      } else {
        html += '<div><h4>' + T.noGaps + '</h4><p class="res__text">' + T.noGapsText + '</p></div>';
      }

      if (oks.length) {
        html += '<div><h4>' + T.works + '</h4><ul class="ok-list">';
        oks.forEach(function (q) { html += '<li>' + q.short + '</li>'; });
        html += '</ul></div>';
      }

      var labels = T.labels;
      var body = T.mailIntro(pct, band.name) +
        QUESTIONS.map(function (q, i) { return '- ' + q.short + ': ' + labels[answers[i]]; }).join('\n') +
        T.mailOutro;
      var href = 'mailto:mikael@mydkey.se?subject=' + encodeURIComponent(T.subject(pct)) + '&body=' + encodeURIComponent(body);

      html += '<div class="res__actions"><a class="btn btn--primary" href="' + href + '">' + T.book + '</a><button type="button" class="link-btn" id="check-redo">' + T.redo + '</button></div>';
      html += '<p class="res__fine">' + T.fine + '</p></div>';

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

  /* ---------- Årtal i sidfoten ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Nyhetsflöde (rubriker från oberoende källor, news.json) ---------- */
  var news = document.querySelector('[data-news]');
  if (news && window.fetch) {
    var track = document.getElementById('news-track');
    var MON = EN ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                 : ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
    function fmt(iso) {
      var d = new Date(iso); if (isNaN(d)) return '';
      return EN ? MON[d.getMonth()] + ' ' + d.getDate() : d.getDate() + ' ' + MON[d.getMonth()];
    }
    function item(it, clone) {
      var li = document.createElement('li'); li.className = 'news__item';
      if (clone) li.setAttribute('aria-hidden', 'true');
      var a = document.createElement('a');
      a.href = it.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      if (it.lang) a.hreflang = it.lang;
      if (clone) a.tabIndex = -1;
      a.textContent = it.title;
      var src = document.createElement('span'); src.className = 'news__src';
      src.textContent = it.source + ' · ' + fmt(it.date);
      li.appendChild(a); li.appendChild(src);
      return li;
    }
    fetch(news.getAttribute('data-news'), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(function (data) {
        var items = (data && data.items || []).filter(function (it) {
          return it && it.title && /^https:\/\//.test(it.url || '');
        }).slice(0, 20);
        if (items.length < 3) return;
        items.forEach(function (it) { track.appendChild(item(it, false)); });
        if (!reduce) {
          items.forEach(function (it) { track.appendChild(item(it, true)); });
          news.classList.add('is-moving');
        }
        news.hidden = false;
        // ca 45 px per sekund oavsett hur många rubriker som finns
        var w = track.scrollWidth / 2;
        track.style.setProperty('--news-dur', Math.max(40, Math.round(w / 45)) + 's');
        // Pekskärm: håll fingret på bandet för att pausa, släpp så rullar det vidare
        var vp = news.querySelector('.news__viewport');
        vp.addEventListener('touchstart', function () { news.classList.add('is-paused'); }, { passive: true });
        vp.addEventListener('touchend', function () { setTimeout(function () { news.classList.remove('is-paused'); }, 1500); }, { passive: true });
      })
      .catch(function () { /* inget flöde, bandet förblir dolt */ });
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
