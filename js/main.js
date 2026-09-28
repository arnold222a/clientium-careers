(function () {
  'use strict';

  var TO = 'arnold@clientium.it';
  var ROLE = 'Social Media Manager & Content Creator';

  /* ---------- Application form -> mailto ---------- */
  var form = document.getElementById('apply-form');
  var success = document.getElementById('form-success');
  var errorBox = document.getElementById('form-error');
  var wrap = document.querySelector('.form-wrap');
  var lastBody = '';

  function val(name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : '';
  }

  function isUrl(s) {
    return /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(s);
  }

  function normUrl(s) {
    if (!s) return '';
    return /^https?:\/\//i.test(s) ? s : 'https://' + s;
  }

  function validate() {
    var problems = [];
    form.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); });

    function flag(id, msg) {
      var el = document.getElementById(id);
      (el.type === 'checkbox' ? el.closest('.consent') : el).classList.add('invalid');
      problems.push({ el: el, msg: msg });
    }

    if (!val('nome')) flag('f-name', 'Inserisci nome e cognome.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) flag('f-email', 'Inserisci un indirizzo email valido.');
    if (val('telefono').replace(/\D/g, '').length < 6) flag('f-phone', 'Inserisci un numero di telefono valido.');
    if (!val('citta')) flag('f-city', 'Indica la città in cui vivi.');
    if (!isUrl(val('social'))) flag('f-social', 'Inserisci il link a un tuo profilo social.');
    if (val('portfolio') && !isUrl(val('portfolio'))) flag('f-portfolio', 'Il link al portfolio non sembra valido.');
    if (val('perche').length < 20) flag('f-why', 'Scrivi almeno un paio di righe nel campo "Perché tu?".');
    if (!val('disponibilita')) flag('f-avail', 'Seleziona la tua disponibilità.');
    if (!document.getElementById('f-privacy').checked) flag('f-privacy', 'Serve il consenso al trattamento dei dati.');

    return problems;
  }

  function buildBody() {
    var langs = Array.prototype.slice.call(form.querySelectorAll('input[name="lingue"]:checked'))
      .map(function (c) { return c.value; }).join(', ') || '-';
    return [
      'Ciao Arnold,',
      '',
      'mi candido per la posizione di ' + ROLE + ' a Tirana.',
      '',
      'Nome: ' + val('nome'),
      'Email: ' + val('email'),
      'Telefono: ' + val('telefono'),
      'Città: ' + val('citta'),
      'Profilo social: ' + normUrl(val('social')),
      'Portfolio: ' + (val('portfolio') ? normUrl(val('portfolio')) : '-'),
      'Lingue: ' + langs,
      'Disponibilità: ' + val('disponibilita'),
      '',
      'Perché io:',
      val('perche'),
      '',
      'Acconsento al trattamento dei dati personali ai fini della selezione.',
      '',
      'Inviato da clientium-careers'
    ].join('\n');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var problems = validate();
      if (problems.length) {
        errorBox.textContent = problems[0].msg + (problems.length > 1 ? ' (e altri ' + (problems.length - 1) + ' campi da controllare)' : '');
        errorBox.hidden = false;
        problems[0].el.focus();
        return;
      }
      errorBox.hidden = true;
      lastBody = buildBody();
      var subject = 'Candidatura ' + ROLE + ': ' + val('nome');
      var href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lastBody);
      window.location.href = href;

      form.hidden = true;
      success.hidden = false;
      wrap.classList.add('is-success');
      success.focus();
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
      var c = e.target.closest('.consent');
      if (c) c.classList.remove('invalid');
    });

    document.getElementById('edit-btn').addEventListener('click', function () {
      success.hidden = true;
      form.hidden = false;
      wrap.classList.remove('is-success');
      document.getElementById('f-name').focus();
    });

    document.getElementById('copy-btn').addEventListener('click', function () {
      var btn = this;
      var text = 'A: ' + TO + '\nOggetto: Candidatura ' + ROLE + ': ' + val('nome') + '\n\n' + lastBody;
      var done = function () { btn.textContent = 'Copiato'; setTimeout(function () { btn.textContent = 'Copia il testo'; }, 2000); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var faqs = document.querySelectorAll('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Mobile sticky CTA: hide over hero and apply section ---------- */
  var mobileCta = document.getElementById('mobile-cta');
  var hero = document.querySelector('.hero');
  var apply = document.getElementById('candidati');
  if ('IntersectionObserver' in window && mobileCta) {
    var state = { hero: true, apply: false };
    var update = function () { mobileCta.classList.toggle('hidden', state.hero || state.apply); };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.target === hero) state.hero = en.isIntersecting;
        if (en.target === apply) state.apply = en.isIntersecting;
      });
      update();
    }, { threshold: 0.15 }).observe(hero);
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { state.apply = en.isIntersecting; });
      update();
    }, { threshold: 0.05 }).observe(apply);
    update();
  }

  /* ---------- Active nav link ---------- */
  var links = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navObserver.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.section-head, .card, .panel, .step, .offer, .value, .tools li, .english-box, .faq details');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { el.classList.add('reveal'); ro.observe(el); });
  }
})();
