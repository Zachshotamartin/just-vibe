export async function assertEventually(read, expected, timeoutMs = 1000) {
  const deadline = Date.now() + timeoutMs;
  do {
    let timer;
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Expectation timed out')), Math.max(0, deadline - Date.now())); });
    let actual;
    try { actual = await Promise.race([Promise.resolve().then(read), timeout]); }
    finally { clearTimeout(timer); }
    if (actual === expected) return true;
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(10, remaining)));
  } while (true);
  throw Error('Expectation timed out');
}
