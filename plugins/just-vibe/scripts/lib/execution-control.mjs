// Poll durable revocation for work started in another CLI/MCP process. The same
// check also runs synchronously immediately before each new dispatch.
export function executionControl(check, signal) {
  const controller = new AbortController();
  const poll = () => {
    try {
      const reason = check();
      if (reason) controller.abort(reason);
    } catch { controller.abort('execution-state-unavailable'); }
    return controller.signal.aborted;
  };
  const abort = () => controller.abort('caller-cancelled');
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  poll();
  const timer = setInterval(poll, 50);
  return { signal: controller.signal, poll,
    close() { clearInterval(timer); signal?.removeEventListener('abort', abort); } };
}
