// Astro runs bundled modules once, but replaces their DOM on each navigation.
// Dispose document listeners and observers before initializing the next page.
export function onPageLoad(setup: (signal: AbortSignal) => void) {
  let controller: AbortController | undefined;
  document.addEventListener('astro:before-swap', () => controller?.abort());
  document.addEventListener('astro:page-load', () => {
    controller?.abort();
    controller = new AbortController();
    setup(controller.signal);
  });
}
