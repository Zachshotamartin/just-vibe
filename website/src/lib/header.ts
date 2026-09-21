// Match One Voice's 12px direction threshold and height-based top reveal zone.
export function initHeader(signal: AbortSignal) {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  let previousY = window.scrollY;
  let direction = 0;
  let travel = 0;
  let frame = 0;
  const reset = () => {
    previousY = window.scrollY;
    direction = 0;
    travel = 0;
    header.dataset.hidden = 'false';
    document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
  };
  const update = () => {
    frame = 0;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.max(0, Math.min(window.scrollY, maxY));
    if (y <= header.offsetHeight || header.querySelector(':focus-visible, .mobile-menu[open]')) {
      reset();
      return;
    }
    const delta = y - previousY;
    previousY = y;
    if (!delta) return;
    const nextDirection = Math.sign(delta);
    travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
    direction = nextDirection;
    if (travel >= 12) header.dataset.hidden = String(direction > 0);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  reset();
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', reset, { signal });
  header.addEventListener(
    'focusin',
    (event) => {
      if (event.target instanceof Element && event.target.matches(':focus-visible')) reset();
    },
    { signal },
  );
  header.querySelector('.mobile-menu')?.addEventListener('toggle', schedule, { signal });
  const observer = new ResizeObserver(reset);
  observer.observe(header);
  signal.addEventListener(
    'abort',
    () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    },
    { once: true },
  );
}
