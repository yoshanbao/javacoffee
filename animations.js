(() => {
  'use strict';

  // Content is visible by default. A missing library never hides the website.
  const motion = window.JavaRaysMotion;
  if (!motion || !('animate' in Element.prototype) || !('IntersectionObserver' in window)) return;

  const { animate, inView, stagger } = motion;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 760px), (pointer: coarse)');
  const easeOut = [0.23, 1, 0.32, 1];
  const active = new Map();
  const revealed = new WeakSet();
  const isInternalNavigation = (() => {
    if (performance.getEntriesByType('navigation')[0]?.type === 'reload') return false;
    try {
      const previous = new URL(document.referrer);
      const current = new URL(location.href);
      const pages = ['index.html', 'menu.html', 'about.html', 'visit.html', ''];
      return new URL('.', previous).href === new URL('.', current).href &&
        pages.includes(previous.pathname.split('/').pop());
    } catch {
      return false;
    }
  })();

  function play(element, keyframes, options) {
    if (reduce.matches || !element) return null;
    active.get(element)?.stop();
    const animation = animate(element, keyframes, options);
    active.set(element, animation);
    animation.finished.then(() => {
      if (active.get(element) === animation) active.delete(element);
    });
    return animation;
  }

  function reveal(element, delay = 0, distance = 18) {
    if (revealed.has(element)) return;
    revealed.add(element);
    // Switching pages should show the new content immediately. Keep reveals below the fold.
    if (isInternalNavigation) {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) return;
    }
    // On phones, keep scrolling content readable and stationary from its first frame.
    play(element, compact.matches ? { opacity: [0.85, 1] } : {
      opacity: [0, 1],
      transform: [`translateY(${distance}px)`, 'translateY(0px)'],
    }, { duration: compact.matches ? 0.24 : 0.58, delay: compact.matches ? 0 : delay, ease: easeOut });
  }

  function enterDialog(dialog) {
    play(dialog, {
      opacity: [0, 1],
      transform: ['translateY(10px) scale(0.98)', 'translateY(0px) scale(1)'],
    }, { duration: 0.25, ease: easeOut });
  }

  function exitDialog(dialog) {
    const animation = play(dialog, {
      opacity: 0,
      transform: 'translateY(8px) scale(0.98)',
    }, { duration: 0.16, ease: easeOut });
    return animation?.finished;
  }

  function filter(cards) {
    // Read positions together before starting animations; avoid layout thrashing.
    const entering = cards.filter(card => {
      const box = card.getBoundingClientRect();
      return box.bottom > 80 && box.top < window.innerHeight + 24;
    });
    entering.forEach((card, index) => {
      revealed.add(card);
      play(card, compact.matches ? { opacity: [0.85, 1] } : {
        opacity: [0, 1],
        transform: ['translateY(8px)', 'translateY(0px)'],
      }, { duration: 0.24, delay: compact.matches ? 0 : Math.min(index * 0.035, 0.14), ease: easeOut });
    });
  }

  function navigation(nav) {
    play(nav, {
      transform: ['translateY(-3px)', 'translateY(0px)'],
    }, { duration: 0.12, ease: easeOut });
  }

  window.JavaRaysAnimations = Object.freeze({ enterDialog, exitDialog, filter, navigation });

  // One short entrance sequence. Navigation and essential controls remain immediate.
  const heroChildren = document.querySelectorAll(
    '.hero-content > .eyebrow, .hero-content > h1, .hero-content > .hero-description, .hero-content > .button-group, ' +
    '.about-hero-copy > .eyebrow, .about-hero-copy > h1, .about-hero-copy > p:not(.eyebrow), .about-hero-copy > .button-group, ' +
    '.page-hero .page-hero-grid > div:first-child > .eyebrow, .page-hero .page-hero-grid > div:first-child > h1, ' +
    '.page-hero .page-hero-grid > div:first-child > p:not(.eyebrow)'
  );
  const entranceDelay = stagger(0.065, { startDelay: 0.04 });
  heroChildren.forEach((element, index) => reveal(element, entranceDelay(index, heroChildren.length), 16));
  const heroPhoto = document.querySelector('.hero-photo > img, .about-portrait > img');
  if (heroPhoto && !isInternalNavigation) play(heroPhoto, compact.matches ? { opacity: [0.9, 1] } : {
    opacity: [0.85, 1],
    transform: ['scale(1.025)', 'scale(1)'],
  }, { duration: compact.matches ? 0.3 : 0.75, ease: easeOut });

  const targets = document.querySelectorAll(
    '.split-layout > *, .section-heading, .gallery-grid > figure, .category-link, ' +
    '.rating-card, .review-card, .menu-section-heading, .drink-card, ' +
    '.about-section-label, .about-narrative, .about-value'
  );
  const order = new WeakMap();
  targets.forEach(element => {
    const siblings = [...element.parentElement.children];
    order.set(element, Math.min(siblings.indexOf(element) * 0.055, 0.165));
  });
  inView(targets, element => {
    if (!element.closest('[hidden]')) reveal(element, order.get(element) || 0);
  }, { margin: '0px 0px -24px 0px', amount: 0.08 });

  document.querySelectorAll('.faq-list details').forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      play(details.querySelector('p'), {
        opacity: [0, 1], transform: ['translateY(4px)', 'translateY(0px)'],
      }, { duration: 0.18, ease: easeOut });
    });
  });

  // Focusing a control always takes priority over an entrance animation.
  document.addEventListener('focusin', event => {
    active.forEach((animation, element) => {
      if (element.contains(event.target)) animation.complete();
    });
  });
  function finishActive() {
    active.forEach(animation => animation.complete());
    active.clear();
  }
  reduce.addEventListener('change', event => { if (event.matches) finishActive(); });
  compact.addEventListener('change', finishActive);
  window.addEventListener('pagehide', finishActive);
})();
