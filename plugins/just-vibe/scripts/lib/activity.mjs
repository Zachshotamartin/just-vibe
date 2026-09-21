import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { runtimeStore, object, timestamp } from './runtime-store.mjs';
import { lessons } from './adaptive-learning.mjs';
import { within } from './storage.mjs';
import { escapeHtml } from './workbench.mjs';

export function activity(root, operation, payload = {}, options = {}) {
  object(payload, ['days']);
  const days = payload.days ?? 30;
  if (![7, 30, 90].includes(days)) throw Error('Activity window must be 7, 30 or 90 days.');
  const store = runtimeStore(root, options),
    cutoff = Date.now() - days * 86400000;
  const tasks = store
    .list(`${store.project}/tasks`)
    .map((n) => store.read(`${store.project}/tasks/${n}`))
    .filter((t) => Date.parse(t.createdAt) >= cutoff);
  const learned = lessons(store, { inactive: true });
  const patterns = store.get('patterns'),
    policy = store.get('policy'),
    goals = store.get('goals');
  const workflows = new Map();
  for (const task of tasks)
    for (const id of task.selected || []) {
      const stats = workflows.get(id) || {
        workflow: id,
        selected: 0,
        loaded: 0,
        toolFailures: 0,
        statuses: {},
        feedback: 0,
      };
      stats.selected++;
      stats.loaded += (task.loaded || []).some((l) => l.workflow === id) ? 1 : 0;
      stats.toolFailures += (task.observations || []).filter((o) => o.outcome === 'failed').length;
      stats.statuses[task.status] = (stats.statuses[task.status] || 0) + 1;
      workflows.set(id, stats);
    }
  for (const lesson of learned)
    if (workflows.has(lesson.workflow))
      workflows.get(lesson.workflow).feedback += lesson.history.length;
  const report = {
    generatedAt: timestamp(),
    days,
    workflows: [...workflows.values()],
    tasks: tasks.map((t) => ({
      id: t.id,
      at: t.createdAt,
      status: t.status,
      workflows: t.selected,
      reason: t.selectionReason || 'No host selection recorded',
      loaded: t.loaded,
      observations: t.observations,
    })),
    lessons: learned.map((l) => ({
      id: l.id,
      workflow: l.workflow,
      active: l.active,
      current: l.current,
      versions: l.history.map((v) => ({
        version: v.version,
        at: v.at,
        feedback: v.feedback,
        instruction: v.change.instruction,
      })),
    })),
    candidates: patterns?.candidates || [],
    policyEvents: (policy?.events || []).filter((e) => Date.parse(e.at) >= cutoff),
    goals: goals?.goals || [],
    note: 'Recorded activity only. Missing events are unknown. Loading instructions is not compliance; process success is not output quality. Retention may shorten this window. Failures count tool events, not verified defects.',
  };
  if (operation === 'show' || operation === 'health') return report;
  if (operation !== 'report') throw Error('Choose activity show, health or report.');
  const path = within(root, '.just-vibe/reports/activity.html');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, renderActivity(report), { mode: 0o600 });
  return {
    path,
    generatedAt: report.generatedAt,
    note: 'Local report; inspect its contents before sharing. It is not uploaded or served over the network.',
  };
}
export function renderActivity(report) {
  const e = escapeHtml;
  const row = (category, title, body) =>
    `<article data-category="${category}"><p class="eyebrow">${e(category)}</p><h2>${e(title)}</h2>${body}</article>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>just-vibe activity</title><style>
:root{color-scheme:light dark;--bg:#101211;--panel:#191c1a;--text:#eef3ef;--muted:#abb8af;--line:#39463d;--accent:#bdeacb}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:64px 28px}h1{font-size:clamp(2.5rem,7vw,4.8rem);line-height:1.08;letter-spacing:-.055em;margin:12px 0 24px}h2{font-size:1.4rem;margin:44px 0 16px}article h2{font-size:1.15rem;margin:0 0 12px;overflow-wrap:anywhere}p{max-width:78ch}.muted,.eyebrow{color:var(--muted)}.eyebrow{text-transform:uppercase;letter-spacing:.1em;font-size:.75rem;margin:0 0 8px}.controls{display:flex;gap:16px;flex-wrap:wrap;margin:32px 0}label{display:grid;gap:6px}input,select,button{font:inherit;padding:10px 14px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);max-width:100%}input{width:320px}input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:20px}article{border:1px solid var(--line);padding:24px;border-radius:8px;background:var(--panel);min-width:0;overflow-wrap:anywhere;animation:appear .2s ease-out}article[hidden]{display:none}.stats{display:flex;flex-wrap:wrap;gap:24px}.stats span{font-size:1.8rem;color:var(--accent)}details{margin-top:16px}summary{cursor:pointer;padding:6px 0}ul{padding-left:22px}li{margin-bottom:8px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem;max-height:300px;overflow:auto}@keyframes appear{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}@media(max-width:600px){main{padding:32px 20px}.controls,label,input{width:100%}}
</style></head><body><main><p class="eyebrow">just-vibe / local activity</p><h1>See what actually happened.</h1><p class="muted">${e(report.note)}</p><p>Last ${report.days} days · Generated ${e(report.generatedAt)}</p><div class="stats"><p><span>${report.tasks.length}</span><br>recorded tasks</p><p><span>${report.lessons.filter((l) => l.active).length}</span><br>active lessons</p><p><span>${report.candidates.filter((c) => c.status === 'pending').length}</span><br>pending suggestions</p></div><div class="controls"><label>Search activity<input id="search" type="search" placeholder="Workflow, reason or lesson"></label><label>Show<select id="category"><option value="all">Everything</option>${['workflow', 'task', 'lesson', 'suggestion', 'policy', 'goal'].map((c) => `<option value="${c}">${c}</option>`).join('')}</select></label></div><p id="count" role="status" aria-live="polite"></p><section class="grid" aria-label="Activity records">
${report.workflows.map((w) => row('workflow', w.workflow, `<p>Selected ${w.selected} times. Instructions loaded ${w.loaded} times. ${w.toolFailures} failed tool events in associated tasks.</p><p>${w.feedback} recorded lesson versions.</p>`)).join('')}
${report.tasks.map((t) => row('task', (t.workflows || []).join(', ') || 'Unselected task', `<p>${e(t.reason)}</p><p class="muted">${e(t.status)} · ${e(t.at)}</p><details><summary>Observed tools and instruction delivery</summary><pre tabindex="0" role="region" aria-label="Recorded tool activity">${e(JSON.stringify({ observations: t.observations, loaded: t.loaded }, null, 2))}</pre></details>`)).join('')}
${report.lessons.map((l) => row('lesson', l.workflow, `<p>${l.active ? 'Active' : 'Retired'} · version ${l.current}</p><ul>${l.versions.map((v) => `<li>v${v.version}: ${e(v.instruction)} <small>(${e(v.feedback)})</small></li>`).join('')}</ul>`)).join('')}
${report.candidates.map((c) => row('suggestion', c.change.workflow, `<p>${e(c.change.instruction)}</p><p>${e(c.status)} · ${e(c.origin)}</p><p>Review through the agent or learn approve/reject. Suggestions do not activate themselves.</p>`)).join('')}
${report.policyEvents.map((p) => row('policy', p.outcome, `<p>${e(p.rules.join(', '))}</p><p class="muted">${e(p.at)}</p>`)).join('')}
${report.goals.map((g) => row('goal', g.objective, `<p>${e(g.status)}</p><ul>${g.criteria.map((c) => `<li>${e(c.text)} — ${e(c.status)}</li>`).join('')}</ul>`)).join('')}
</section><p id="empty" hidden>No records match. Try another filter, or use just-vibe in this project and generate a fresh report.</p><p class="muted">This is a snapshot. Regenerate it to include new activity. Nothing in this report uploads data.</p></main><script>
const search=document.querySelector('#search'),category=document.querySelector('#category'),cards=[...document.querySelectorAll('article')];function filter(){let count=0;for(const card of cards){const show=(category.value==='all'||card.dataset.category===category.value)&&card.textContent.toLowerCase().includes(search.value.toLowerCase());card.hidden=!show;if(show)count++}document.querySelector('#count').textContent=count+' matching records';document.querySelector('#empty').hidden=count!==0}search.addEventListener('input',filter);category.addEventListener('change',filter);filter();
</script></body></html>`;
}
