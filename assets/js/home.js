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
})();
