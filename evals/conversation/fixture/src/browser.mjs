export async function assertEventually(read, expected, timeoutMs = 1000) {
  const actual = await read();
  if (actual !== expected) throw Error(`Expected ${expected}; got ${actual}`);
  return true;
}
