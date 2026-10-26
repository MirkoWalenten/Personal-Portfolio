(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');

  // Header: sombra al hacer scroll
  if (header && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.className = 'top-sentinel';
    document.body.appendChild(sentinel);
    new IntersectionObserver(function (e) {
      header.classList.toggle('is-scrolled', !e[0].isIntersecting);
    }).observe(sentinel);
  }

  // Menú móvil: hoja a pantalla completa con foco atrapado y scroll bloqueado
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu-principal');

  if (toggle && menu && header) {
    var behind = [].slice.call(document.querySelectorAll('main, .site-footer'));
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };
    var setOpen = function (open, back) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      root.classList.toggle('nav-open', open);
      behind.forEach(function (el) { el.inert = open; });
      if (open) menu.querySelector('a').focus({ preventScroll: true });
      else if (back) toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') {
        setOpen(false, true);
      } else if (e.key === 'Tab') {
        var f = [].slice.call(header.querySelectorAll('a[href], button'));
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    });

    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (e) {
      if (e.matches && isOpen()) setOpen(false);
    });
  }

  // Año del footer
  var year = document.getElementById('anio');
  if (year) year.textContent = new Date().getFullYear();

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
