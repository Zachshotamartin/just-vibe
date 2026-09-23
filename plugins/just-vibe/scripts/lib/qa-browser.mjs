import { lstatSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
export function qaFixture(root, file) {
  if (typeof file !== 'string' || file.includes('\\') || file.startsWith('/') || /^[A-Za-z]:/.test(file)) throw Error('Use a relative fixture path');
  if (file.length > 500 || file.includes('\0') || file.split('/').some(part => !part || ['.', '..', '.git', '.just-vibe'].includes(part.toLowerCase()) || /(?:^\.env(?:\.|$)|\.(?:pem|key|p12|pfx)$|credentials|secrets?\.)/i.test(part))) throw Error('Private or unnormalized fixture path');
  const path = resolve(root, file), rel = relative(root, path);
  if (!rel || rel === '..' || rel.startsWith('..' + sep)) throw Error('Fixture escapes project');
  let part = resolve(root);
  for (const segment of rel.split(sep)) { part = resolve(part, segment); if (lstatSync(part).isSymbolicLink()) throw Error('Fixture symlinks are not allowed'); }
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.size > 8 * 1024 * 1024) throw Error('Fixture must be a regular file up to 8 MiB');
  return path;
}
async function waitVisible(locator, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    await locator.waitFor({ state: 'visible', timeout: Math.max(1, deadline - Date.now()) });
    const opaque = await locator.evaluate(element => {
      for (let node = element; node; node = node.assignedSlot || node.parentElement || node.getRootNode().host) {
        if (Number(getComputedStyle(node).opacity) === 0) return false;
      }
      return true;
    });
    if (opaque) return;
    if (Date.now() >= deadline) throw Error('Expected visible content, but the element or an ancestor is fully transparent');
    await new Promise(done => setTimeout(done, Math.min(100, deadline - Date.now())));
  }
}
async function containsVisibleText(locator, expected) {
  const result = await locator.evaluate((element, expected) => {
    if (!element.innerText.includes(expected)) return { matches: false };
    // innerText excludes display:none, but includes transparent or zero-size descendants.
    // Preserve its literal match and check that the matching text can also be
    // formed from rendered, nontransparent text, without mutating the app DOM.
    const parts = [];
    let invisible = false, unsupported = false, visited = 0;
    const parentOf = node => node.assignedSlot || node.parentElement || node.getRootNode().host;
    function visit(node) {
      if (++visited > 10000) { unsupported = invisible = true; return; }
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = parentOf(node);
        if (!parent || !node.textContent) return;
        const style = getComputedStyle(parent), range = document.createRange();
        range.selectNodeContents(node);
        if (style.visibility !== 'visible' || ![...range.getClientRects()].some(rect => rect.width > 0 && rect.height > 0)) {
          invisible = true; return;
        }
        for (let ancestor = parent; ancestor; ancestor = parentOf(ancestor)) {
          if (Number(getComputedStyle(ancestor).opacity) === 0) {
            invisible = true; parts.push('\0'); return;
          }
        }
        let text = node.textContent;
        const lang = parent.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || undefined;
        try {
          if (style.textTransform === 'uppercase') text = text.toLocaleUpperCase(lang);
          else if (style.textTransform === 'lowercase') text = text.toLocaleLowerCase(lang);
          else if (style.textTransform !== 'none') unsupported = true;
        } catch { unsupported = true; }
        parts.push(text);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') { parts.push('\n'); return; }
        const block = /^(block|flex|grid|flow-root|list-item|table)/.test(getComputedStyle(node).display);
        if (block) parts.push('\n');
        for (const child of node.childNodes) { if (visited > 10000) break; visit(child); }
        if (block) parts.push('\n');
      }
    }
    visit(element);
    const normalize = value => value.replace(/\s+/g, ' ').trim();
    return { matches: !invisible || normalize(parts.join('')).includes(normalize(expected)), unsupported: invisible && unsupported };
  }, expected);
  if (result.unsupported) {
    const error = Error('Mixed-visibility text needs a narrower selector or human verification for this text transform or DOM size');
    error.qaNeedsHuman = true; throw error;
  }
  return result.matches;
}
// Bounded executable checks, not arbitrary JavaScript supplied by an agent.
export async function executeQaStep(page, step, root, timeoutMs) {
  if (!['click', 'fill', 'upload', 'visible', 'text', 'media', 'layout'].includes(step.action)) throw Error(`Unsupported browser step: ${step.action}`);
  const locator = step.selector ? page.locator(step.selector) : null;
  if (step.action === 'click') await locator.click();
  if (step.action === 'fill') await locator.fill(step.value);
  if (step.action === 'upload') await locator.setInputFiles(qaFixture(root, step.file));
  if (step.action === 'visible') await waitVisible(locator, timeoutMs);
  if (step.action === 'text') {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      await waitVisible(locator, Math.max(1, deadline - Date.now()));
      if (await containsVisibleText(locator, step.contains)) break;
      if (Date.now() >= deadline) throw Error(`Expected visible text: ${step.contains}`);
      await new Promise(done => setTimeout(done, 100));
    }
  }
  if (step.action === 'media') {
    await waitVisible(locator, timeoutMs);
    await locator.evaluate(async (element, timeout) => {
      if (!(element instanceof HTMLMediaElement)) throw Error('Expected audio or video');
      let timer;
      try {
        await Promise.race([element.play(), new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Playback did not start')), timeout); })]);
        const initial = element.currentTime;
        const deadline = Date.now() + timeout;
        while (element.currentTime <= initial && !element.error && Date.now() < deadline) await new Promise(done => setTimeout(done, 100));
        if (element.error || element.readyState < 2 || !(element.currentTime > initial)) throw Error('Media did not advance during playback');
      } finally { clearTimeout(timer); element.pause(); }
    }, timeoutMs);
  }
  if (step.action === 'layout') {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) throw Error('Page has horizontal overflow');
    const boxes = [];
    for (const selector of step.selectors) {
      const l = page.locator(selector); await waitVisible(l, timeoutMs);
      const box = await l.boundingBox(), viewport = page.viewportSize();
      if (!box || box.width <= 0 || box.height <= 0 || box.x < -1 || box.x + box.width > viewport.width + 1) throw Error(`Clipped control: ${selector}`);
      const clipped = await l.evaluate(e => {
        const parentOf = node => node.assignedSlot || node.parentElement || node.getRootNode().host;
        const ancestors = [];
        for (let node = e; node; node = parentOf(node)) ancestors.push(node);
        // Inspect every transform/clipping context before inferring rectangular
        // clipping; an outer transform also changes all inner bounding boxes.
        for (const node of ancestors) {
          const style = getComputedStyle(node);
          if (style.clipPath !== 'none' || style.rotate !== 'none') return 'unsupported';
          if (style.scale !== 'none' && style.scale.split(' ').some(value => Number(value) <= 0)) return 'unsupported';
          if (style.transform !== 'none') {
            const matrix = new DOMMatrixReadOnly(style.transform);
            if (!matrix.is2D || Math.abs(matrix.b) > 0.0001 || Math.abs(matrix.c) > 0.0001 || matrix.a <= 0 || matrix.d <= 0) return 'unsupported';
          }
        }
        if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) return true;
        const box = e.getBoundingClientRect();
        for (let parent = parentOf(e); parent && parent !== document.documentElement; parent = parentOf(parent)) {
          const style = getComputedStyle(parent), bounds = parent.getBoundingClientRect();
          // DOM boxes are in rendered pixels; client/offset sizes are untransformed.
          const scaleX = parent.offsetWidth ? bounds.width / parent.offsetWidth : 1;
          const scaleY = parent.offsetHeight ? bounds.height / parent.offsetHeight : 1;
          const left = bounds.left + parent.clientLeft * scaleX, top = bounds.top + parent.clientTop * scaleY;
          if (/(hidden|clip|auto|scroll)/.test(style.overflowX) && (box.left < left - 1 || box.right > left + parent.clientWidth * scaleX + 1)) return true;
          if (/(hidden|clip|auto|scroll)/.test(style.overflowY) && (box.top < top - 1 || box.bottom > top + parent.clientHeight * scaleY + 1)) return true;
        }
        return false;
      });
      if (clipped === 'unsupported') { const error = Error('Custom clip paths or non-axis-aligned transforms require human layout verification'); error.qaNeedsHuman = true; throw error; }
      if (clipped) throw Error(`Control content exceeds its box: ${selector}`);
      for (const prior of boxes) if (box.x < prior.x + prior.width - 1 && box.x + box.width > prior.x + 1 && box.y < prior.y + prior.height - 1 && box.y + box.height > prior.y + 1) throw Error(`Overlapping controls: ${selector}`);
      boxes.push(box);
    }
  }
}
