const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const active = new Map<HTMLElement, Animation>();
const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

preference.addEventListener('change', () => {
  if (!preference.matches) return;
  active.forEach((animation) => animation.cancel());
  active.clear();
});

function play(element: HTMLElement, frames: Keyframe[], duration: number) {
  if (preference.matches || typeof element.animate !== 'function') return;
  active.get(element)?.cancel();
  const animation = element.animate(frames, { duration, easing });
  active.set(element, animation);
  const release = () => {
    if (active.get(element) === animation) active.delete(element);
  };
  animation.addEventListener('finish', release, { once: true });
  animation.addEventListener('cancel', release, { once: true });
}

// Content is visible in CSS even if JavaScript, observers, or animation fail.
// Each section moves once on entry; reading content never loops or parallax-scrolls.
export function initMotion(signal: AbortSignal) {
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        if (element.contains(document.activeElement)) continue;
        play(
          element,
          [
            { opacity: 0.35, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          620,
        );
      }
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => observer.observe(el));
  const stop = () => {
    observer.disconnect();
    active.forEach((animation) => animation.cancel());
    active.clear();
  };
  signal.addEventListener('abort', stop, { once: true });
  preference.addEventListener(
    'change',
    () => {
      if (preference.matches) stop();
    },
    { signal },
  );
  document.addEventListener(
    'focusin',
    (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      active.forEach((animation, element) => {
        if (element.contains(target)) animation.cancel();
      });
    },
    { signal },
  );
}

// Selection feedback is short, and is never triggered while the user types.
export function animateChange(element: HTMLElement) {
  play(element, [{ opacity: 0.45 }, { opacity: 1 }], 220);
}
