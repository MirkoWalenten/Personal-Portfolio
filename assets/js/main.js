(function () {
  'use strict';

  // Menú móvil
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu-principal');

  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  // Año del footer
  var year = document.getElementById('anio');
  if (year) year.textContent = new Date().getFullYear();

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
      var p = add(panels, 'div', 'skills-panel', '<h3>' + name + '</h3>' + chips);
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

    var select = function (i, focus) {
      tabEls.forEach(function (t, j) {
        t.setAttribute('aria-selected', j === i);
        t.tabIndex = j === i ? 0 : -1;
        panEls[j].hidden = j !== i;
      });
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
      var i = accBtns.indexOf(b);
      open(b.getAttribute('aria-expanded') === 'true' ? -1 : i);
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

  // Aparición suave al entrar en pantalla
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { observer.observe(el); });
})();
