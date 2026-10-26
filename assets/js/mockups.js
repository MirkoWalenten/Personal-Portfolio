(function () {
  'use strict';

  var mocks = document.querySelectorAll('.mock');
  if (!mocks.length) return;

  // Con movimiento reducido (o sin IntersectionObserver) queda el estado final estático
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  function countUp(el) {
    var to = Number(el.getAttribute('data-count'));
    var start = null;
    var duration = 900;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 450);
  }

  mocks.forEach(function (mock) {
    mock.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = '0'; });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var mock = entry.target;
      mock.classList.add('is-playing');
      mock.querySelectorAll('[data-count]').forEach(countUp);
      observer.unobserve(mock);
    });
  }, { threshold: 0.4 });

  mocks.forEach(function (mock) { observer.observe(mock); });
})();
