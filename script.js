(() => {
  'use strict';

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');
  function closeNavigation(restoreFocus = false) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    if (restoreFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', expanded);
    if (expanded) window.JavaRaysAnimations?.navigation(nav);
  });
  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeNavigation();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeNavigation(true);
  });
  document.addEventListener('click', event => {
    if (toggle?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeNavigation();
  });
  document.addEventListener('focusin', event => {
    if (toggle?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeNavigation();
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
    if (event.matches) closeNavigation();
  });

  const filters = [...document.querySelectorAll('[data-filter]')];
  const sections = [...document.querySelectorAll('[data-menu-section]')];
  const filterNames = { all: 'All drinks', espresso: 'Espresso & coffee', iced: 'Iced & blended', 'coffee-free': 'Chai, tea & more' };
  function applyFilter(category, updateUrl = false) {
    const selected = Object.hasOwn(filterNames, category) ? category : 'all';
    const changed = filters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.filter !== selected;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
    sections.forEach(section => { section.hidden = selected !== 'all' && section.dataset.menuSection !== selected; });
    const count = sections.filter(section => !section.hidden).reduce((total, section) => total + section.querySelectorAll('.drink-card').length, 0);
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `${filterNames[selected]} · ${count} drinks to explore`;
    if (updateUrl) history.replaceState(null, '', `${location.pathname}${location.search}${selected === 'all' ? '' : `#${selected}`}`);
    if (updateUrl && changed) {
      const visibleSections = sections.filter(section => !section.hidden);
      const firstSection = visibleSections[0];
      const filterBar = document.querySelector('.menu-filter-bar');
      // A sticky filter change should start at the new category, not halfway through its drinks.
      if (firstSection && filterBar && firstSection.getBoundingClientRect().top < filterBar.getBoundingClientRect().bottom) {
        firstSection.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      const cards = visibleSections.flatMap(section => [...section.querySelectorAll('.drink-card')]);
      window.JavaRaysAnimations?.filter(cards);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter, true)));
  if (filters.length) {
    applyFilter(location.hash.slice(1));
    window.addEventListener('hashchange', () => applyFilter(location.hash.slice(1)));
  }

  let dialogTrigger = null;
  function openDialog(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    dialogTrigger = trigger;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    window.JavaRaysAnimations?.enterDialog(dialog);
  }
  const closingDialogs = new WeakSet();
  async function closeDialog(dialog) {
    if (!dialog.open || closingDialogs.has(dialog)) return;
    closingDialogs.add(dialog);
    try {
      await window.JavaRaysAnimations?.exitDialog(dialog);
    } finally {
      dialog.close();
      closingDialogs.delete(dialog);
      dialog.style.removeProperty('opacity');
      dialog.style.removeProperty('transform');
    }
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close')?.addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      dialogTrigger?.focus({ preventScroll: true });
      dialogTrigger = null;
    });
  });
  document.querySelectorAll('[data-photo]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.querySelector('#photo-dialog');
      if (!dialog) return;
      const img = dialog.querySelector('img');
      img.src = button.dataset.photo;
      img.alt = button.querySelector('img').alt;
      dialog.querySelector('.photo-caption').textContent = button.dataset.caption;
      openDialog(dialog, button);
    });
  });
  document.querySelector('[data-open-menu]')?.addEventListener('click', event => openDialog(document.querySelector('#menu-dialog'), event.currentTarget));

  function updateBusinessHours(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Boise', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(now).map(part => [part.type, part.value]));
    const weekday = !['Sat', 'Sun'].includes(parts.weekday);
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const open = weekday && minutes >= 360 && minutes < 720;
    const status = document.querySelector('[data-open-status]');
    if (status) {
      status.classList.toggle('is-open', open);
      const label = open ? 'Open now · until noon' : weekday && minutes < 360 ? 'Opens today at 6 AM' : parts.weekday === 'Fri' || !weekday ? 'See you Monday at 6 AM' : 'See you tomorrow at 6 AM';
      status.querySelector('span:last-child').textContent = label;
    }
    document.querySelectorAll('[data-day]').forEach(row => row.classList.toggle('today', row.dataset.day === parts.weekday));
  }
  updateBusinessHours();
  if (document.querySelector('[data-open-status]')) setInterval(updateBusinessHours, 60000);
  document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
})();
