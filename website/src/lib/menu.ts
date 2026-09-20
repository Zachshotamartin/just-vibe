export function initMenu(signal: AbortSignal) {
  const menu = document.querySelector<HTMLDetailsElement>('.mobile-menu');
  if (!menu) return;
  const toggle = menu.querySelector('summary')!;
  const panel = menu.querySelector('nav')!;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation: Animation | undefined;
  let expanded = menu.open;

  const setOpen = (open: boolean, immediate = false) => {
    expanded = open;
    animation?.cancel();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    panel.inert = !open;
    if (open) menu.open = true;
    if (immediate || preference.matches || typeof panel.animate !== 'function') {
      menu.open = open;
      return;
    }
    animation = panel.animate(
      open
        ? [
            { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-8px)' },
            { clipPath: 'inset(0)', transform: 'translateY(0)' },
          ]
        : [
            { clipPath: 'inset(0)', transform: 'translateY(0)' },
            { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-8px)' },
          ],
      { duration: open ? 220 : 160, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    animation.onfinish = () => {
      menu.open = expanded;
    };
  };
  setOpen(false, true);
  toggle.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      setOpen(!expanded);
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || !expanded) return;
      setOpen(false);
      toggle.focus();
    },
    { signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Node)) return;
      if (!menu.contains(event.target) && expanded) setOpen(false);
    },
    { signal },
  );
  panel.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Element && event.target.closest('a')) setOpen(false, true);
    },
    { signal },
  );
  preference.addEventListener(
    'change',
    () => {
      if (preference.matches) setOpen(expanded, true);
    },
    { signal },
  );
  const desktop = window.matchMedia('(min-width: 601px)');
  desktop.addEventListener(
    'change',
    () => {
      if (desktop.matches) setOpen(false, true);
    },
    { signal },
  );
  signal.addEventListener('abort', () => animation?.cancel(), { once: true });
}
