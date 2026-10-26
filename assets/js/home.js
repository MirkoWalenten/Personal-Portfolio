(function () {
  'use strict';

  // Scroll-spy: marca el link de la sección visible
  var links = {};
  document.querySelectorAll('.nav__menu a[href^="#"]').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var cur = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (cur) cur.removeAttribute('aria-current');
        cur = links[e.target.id] || null;
        if (cur) cur.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    document.querySelectorAll('main > section[id]').forEach(function (s) { spy.observe(s); });
  }

  // Habilidades: pestañas en escritorio y acordeón en celular (sin JS quedan las tarjetas)
  var sk = document.querySelector('[data-skills]');
  if (sk) {
    var cards = sk.querySelectorAll('.skill-card');
    var unit = sk.getAttribute('data-unit');
    var ui = document.createElement('div');
    var desk = document.createElement('div');
    var tabs = document.createElement('div');
    var panels = document.createElement('div');
    var acc = document.createElement('div');
    var tabEls = [], panEls = [], accBtns = [], accPans = [];
    var add = function (parent, tag, cls, html) {
      var el = document.createElement(tag);
      el.className = cls;
      if (html) el.innerHTML = html;
      parent.appendChild(el);
      return el;
    };
    ui.className = 'skills-ui';
    desk.className = 'skills-desk';
    tabs.className = 'skills-tabs';
    panels.className = 'skills-panels';
    acc.className = 'skills-acc';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-orientation', 'vertical');
    tabs.setAttribute('aria-label', sk.getAttribute('data-label'));

    cards.forEach(function (c, i) {
      var h = c.querySelector('h3');
      var name = h.textContent.replace(/&/g, '&amp;');
      var chips = c.querySelector('ul').outerHTML.replace('class="chips"', 'class="chips chips--lg"');
      var n = c.querySelectorAll('li').length;
      var head = h.querySelector('svg').outerHTML + '<span class="skills-name">' + name + '</span>' +
        '<span class="skills-count" aria-hidden="true">' + n + '</span><span class="sr-only">, ' + n + ' ' + unit + '</span>';

      var t = add(tabs, 'button', 'skills-tab', head);
      t.type = 'button';
      t.id = 'skt' + i;
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', 'skp' + i);
      tabEls.push(t);
      var deco = h.querySelector('svg').outerHTML.replace('skill-icon', 'skills-deco').replace(/(width|height)="22"/g, '$1="140"');
      var p = add(panels, 'div', 'skills-panel', '<h3>' + name + '</h3>' + chips + deco);
      p.id = 'skp' + i;
      p.tabIndex = 0;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'skt' + i);
      panEls.push(p);

      var it = add(acc, 'div', 'skills-item',
        '<h3><button type="button" class="skills-acc-btn" id="ska' + i + '" aria-controls="skq' + i + '">' + head + '</button></h3>' +
        '<div class="skills-item__panel" id="skq' + i + '" role="region" aria-labelledby="ska' + i + '">' + chips + '</div>');
      accBtns.push(it.querySelector('button'));
      accPans.push(it.querySelector('.skills-item__panel'));
    });

    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var select = function (i, focus) {
      var from = panels.getBoundingClientRect().height;
      panels.style.height = '';
      tabEls.forEach(function (t, j) {
        t.setAttribute('aria-selected', j === i);
        t.tabIndex = j === i ? 0 : -1;
        panEls[j].hidden = j !== i;
      });
      var to = panels.getBoundingClientRect().height;
      if (from && to && from !== to && !calm) {
        panels.classList.add('is-sizing');
        panels.style.height = from + 'px';
        panels.getBoundingClientRect();
        panels.style.height = to + 'px';
        setTimeout(function () {
          panels.style.height = '';
          panels.classList.remove('is-sizing');
        }, 300);
      }
      if (focus) tabEls[i].focus();
    };
    var open = function (i) {
      accBtns.forEach(function (b, j) {
        b.setAttribute('aria-expanded', j === i);
        accPans[j].hidden = j !== i;
      });
    };

    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('[role="tab"]');
      if (t) select(tabEls.indexOf(t));
    });
    tabs.addEventListener('keydown', function (e) {
      var i = tabEls.indexOf(document.activeElement), n = tabEls.length, k = e.key;
      var j = k === 'ArrowDown' || k === 'ArrowRight' ? (i + 1) % n :
              k === 'ArrowUp' || k === 'ArrowLeft' ? (i + n - 1) % n :
              k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (i > -1 && j > -1) {
        e.preventDefault();
        select(j, true);
      }
    });
    acc.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.getAttribute('aria-expanded') !== 'true') open(accBtns.indexOf(b));
    });

    desk.appendChild(tabs);
    desk.appendChild(panels);
    ui.appendChild(desk);
    ui.appendChild(acc);
    sk.appendChild(ui);
    sk.classList.add('is-enhanced');
    select(0);
    open(0);
  }

  // Certificados: vista ampliada en un <dialog> modal (sin JS, "Ver certificado" abre el PDF)
  var certs = document.querySelector('.certs');
  if (certs && typeof HTMLDialogElement === 'function') {
    var root = document.documentElement;
    var dlg, dImg, dIssuer, dName, dDate, dPdf, last;
    var sprite = document.querySelector('use').getAttribute('href').split('#')[0];
    var ic = function (n) {
      return '<svg class="icon" width="20" height="20" aria-hidden="true" focusable="false"><use href="' + sprite + '#i-' + n + '"/></svg>';
    };
    var build = function () {
      dlg = document.createElement('dialog');
      dlg.className = 'cert-modal';
      dlg.setAttribute('aria-labelledby', 'cm-title');
      dlg.innerHTML = '<div class="cert-modal__box"><button type="button" class="cert-modal__close" autofocus aria-label="' + certs.dataset.close + '">' + ic('close') + '</button>' +
        '<div class="cert-modal__img"><img width="1440" height="1113" alt=""></div>' +
        '<div class="cert-modal__info"><div><p class="cert-modal__issuer"></p><h3 id="cm-title"></h3><p class="cert-modal__date"></p></div>' +
        '<a class="btn btn--sm" target="_blank" rel="noopener">' + certs.dataset.open + ic('external') + '</a></div></div>';
      dImg = dlg.querySelector('img');
      dIssuer = dlg.querySelector('.cert-modal__issuer');
      dName = dlg.querySelector('h3');
      dDate = dlg.querySelector('.cert-modal__date');
      dPdf = dlg.querySelector('.btn');
      dlg.querySelector('button').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var a = document.activeElement, x = dlg.querySelector('button'), y = dPdf;
        if (e.shiftKey ? a === x : a === y) {
          e.preventDefault();
          (e.shiftKey ? y : x).focus();
        }
      });
      dlg.addEventListener('close', function () {
        root.classList.remove('modal-open');
        if (last) last.focus();
      });
      document.body.appendChild(dlg);
    };
    var show = function (card, trigger) {
      if (!dlg) build();
      last = trigger;
      var name = card.querySelector('.cert__name').textContent;
      dIssuer.textContent = card.querySelector('.cert__issuer').textContent;
      dName.textContent = name;
      dDate.textContent = card.querySelector('.cert__date').textContent;
      dPdf.href = card.dataset.pdf;
      dImg.alt = certs.dataset.alt + ' ' + name;
      dImg.src = card.dataset.large;
      root.classList.add('modal-open');
      dlg.showModal();
    };
    certs.querySelectorAll('.cert[data-large]').forEach(function (card) {
      var link = card.querySelector('.cert__links a');
      var thumb = card.querySelector('.cert__preview');
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        show(card, link);
      });
      thumb.classList.add('is-zoomable');
      thumb.addEventListener('click', function () { show(card, link); });
    });
  }

  // Contacto: copiar el email al portapapeles (con aviso en una región aria-live)
  var copy = document.querySelector('.contact__copy');
  var status = document.querySelector('.contact__status');
  if (copy && status) {
    var timer;
    var say = function (msg) {
      status.textContent = msg;
      clearTimeout(timer);
      timer = setTimeout(function () { status.textContent = ''; }, 2000);
    };
    var fallback = function () {
      var r = document.createRange();
      var sel = window.getSelection();
      var ok = false;
      r.selectNodeContents(document.querySelector('.contact__text'));
      sel.removeAllRanges();
      sel.addRange(r);
      try { ok = document.execCommand('copy'); } catch (e) { /* sin portapapeles: queda seleccionado */ }
      say(ok ? copy.dataset.copied : copy.dataset.select);
    };
    copy.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copy.dataset.copy).then(function () { say(copy.dataset.copied); }, fallback);
      } else {
        fallback();
      }
    });
  }
})();
