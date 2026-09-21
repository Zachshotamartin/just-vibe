// Remove JSONC comments/trailing commas without modifying quoted data.
export function parseJsonc(source) {
  let clean = '',
    quoted = false,
    escaped = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i],
      next = source[i + 1];
    if (quoted) {
      clean += c;
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') {
      quoted = true;
      clean += c;
    } else if (c === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') {
        clean += ' ';
        i++;
      }
      clean += '\n';
    } else if (c === '/' && next === '*') {
      clean += '  ';
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        clean += source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i >= source.length) throw Error('Unterminated JSONC comment.');
      clean += '  ';
      i++;
    } else clean += c;
  }
  let normalized = '';
  quoted = false;
  escaped = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (!quoted && c === ',' && /^[\s]*[}\]]/.test(clean.slice(i + 1))) {
      normalized += ' ';
      continue;
    }
    normalized += c;
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
  }
  return JSON.parse(normalized);
}

export function structuredConfigurations(source, extension) {
  if (extension === 'json' || extension === 'jsonc')
    return {
      values: [extension === 'json' ? JSON.parse(source) : parseJsonc(source)],
      partial: false,
    };
  // Common TOML command/args/url settings are parsed as literal values only.
  // Full TOML/YAML semantics are deliberately not inferred from text matching.
  if (extension !== 'toml') return { values: [], partial: ['yaml', 'yml'].includes(extension) };
  const values = [];
  let current = {};
  for (const line of source.split('\n')) {
    if (/^\s*\[/.test(line)) {
      values.push(current);
      current = {};
    }
    const m = line.match(/^\s*(command|args|url)\s*=\s*(.+?)\s*$/);
    if (!m) continue;
    try {
      current[m[1]] = JSON.parse(m[2]);
    } catch {
      /* Text indicators and partial coverage remain visible. */
    }
  }
  values.push(current);
  return { values, partial: true };
}

export function unsafeHttp(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'http:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}
export function unpinnedRunner(command, args = []) {
  const name = command
    ?.replaceAll('\\', '/')
    .split('/')
    .at(-1)
    ?.replace(/\.(?:cmd|exe)$/, '');
  if (!['npx', 'pnpm', 'bunx', 'yarn'].includes(name) || !Array.isArray(args)) return false;
  if (['pnpm', 'yarn'].includes(name) && args[0] !== 'dlx') return false;
  const tokens = ['pnpm', 'yarn'].includes(name) ? args.slice(1) : args;
  let packageName;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (typeof token !== 'string') return false;
    if (token === '--package' || token === '-p') {
      packageName = tokens[i + 1];
      break;
    }
    if (token.startsWith('--package=')) {
      packageName = token.slice(10);
      break;
    }
    if (token.startsWith('-')) continue;
    packageName = token;
    break;
  }
  return (
    typeof packageName === 'string' &&
    !/^(?:file:|\.\.?\/|\/)/.test(packageName) &&
    !/@\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(packageName)
  );
}
