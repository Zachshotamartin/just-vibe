// Serialized into the local page. Draft state belongs to the tab, not a render.
export function learningClient(records, { api, rows, status, reload, state }) {
  const el = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
  const fields = ['instruction', 'triggers', 'avoid', 'tools', 'checks', 'conditions', 'exceptions', 'settingKey', 'settingValue'];
  function button(label, work) {
    const b = el('button', label); b.type = 'button'; b.onclick = async () => {
      b.disabled = true; try { await work(); } catch (e) { status.textContent = e.message; } finally { b.disabled = false; }
    }; return b;
  }
  function readValues(change) {
    return Object.fromEntries(fields.map(key => [key, key === 'instruction' ? change.instruction : key === 'settingKey' ? change.setting?.key || '' : key === 'settingValue' ? change.setting?.value || '' : (change[key] || []).join('\n')]));
  }
  function draft(values) {
    const result = Object.fromEntries(fields.filter(k => !k.startsWith('setting')).map(key => [key, key === 'instruction' ? values[key] : values[key].split('\n').map(v => v.trim()).filter(Boolean)]));
    if (values.settingKey || values.settingValue) result.setting = { key: values.settingKey.trim(), value: values.settingValue.trim() };
    return result;
  }
  function form(parent, values, changed) {
    for (const key of fields) {
      const title = key === 'instruction' ? 'Instruction' : key === 'settingKey' ? 'Optional setting key (for example package-manager)' : key === 'settingValue' ? 'Optional setting value (for example pnpm)' : `${key} (one per line)`;
      const label = el('label', title), input = el(key.startsWith('setting') ? 'input' : 'textarea');
      input.value = values[key]; input.maxLength = key === 'instruction' ? 2000 : key === 'settingKey' ? 80 : key === 'settingValue' ? 200 : 2500;
      input.oninput = () => { values[key] = input.value; changed(); };
      label.append(input); parent.append(label);
    }
  }
  rows.append(el('p', 'Real preferences persist on disk; demo changes are discarded when its process stops. Unsaved drafts survive filtering and switching views in this tab, but not closing or reloading the page.'));
  rows.append(el('p', 'Current requests take precedence. Project settings override user settings with the same key; conflicting values at the same scope are held back for review. Plain-language overlaps still need judgment.'));
  const create = el('details'), createSummary = el('summary', 'Create a preference');
  state.create ||= { workflow: '', scope: 'project', values: readValues({ instruction: '' }), open: false, generation: 0 };
  const fresh = state.create; create.open = fresh.open; createSummary.onclick = event => { event.preventDefault(); fresh.open = !create.open; create.open = fresh.open; }; create.append(createSummary);
  const workflowLabel = el('label', 'Workflow ID'), workflow = el('input'); workflow.value = fresh.workflow; workflow.maxLength = 80; workflow.oninput = () => { fresh.workflow = workflow.value; fresh.generation++; }; workflowLabel.append(workflow);
  const scopeLabel = el('label', 'Scope'), scope = el('select');
  for (const [value, title] of [['project', 'This project'], ['user', 'All projects on this computer']]) { const option = el('option', title); option.value = value; scope.append(option); }
  scope.value = fresh.scope; scope.onchange = () => { fresh.scope = scope.value; fresh.generation++; }; scopeLabel.append(scope); create.append(workflowLabel, scopeLabel);
  form(create, fresh.values, () => fresh.generation++);
  const createButton = button('Create preference', async () => {
    if (fresh.pending) return;
    const generation = fresh.generation; fresh.pending = true;
    try {
      await api('preferences-action', { operation: 'create', payload: { workflow: fresh.workflow.trim(), scope: fresh.scope, draft: draft(fresh.values) } });
      if (fresh.generation === generation) delete state.create;
      await reload();
    } finally { fresh.pending = false; for (const control of fresh.buttons || []) control.disabled = false; }
  });
  fresh.buttons = [createButton]; createButton.disabled = fresh.pending === true; create.append(createButton); rows.append(create);
  if (!records.length) rows.append(el('p', 'No preferences match this view. Create one above or save explicit feedback in your host.'));
  for (const conflict of state.conflicts || []) rows.append(el('p', `Review ${conflict.workflow}: ${conflict.detail}`));
  for (const lesson of records) {
    const current = lesson.history.find(v => v.version === lesson.current), article = el('article');
    article.append(el('h2', lesson.workflow), el('p', `${lesson.scope} scope · version ${lesson.current} · ${lesson.active ? 'Enabled' : 'Disabled'}`), el('p', current.change.instruction));
    article.append(el('p', `Source: ${current.source?.kind?.startsWith('explicit-') ? 'Explicit local preference' : 'Explicit user feedback'} — ${current.source?.excerpt || 'Unavailable'}`));
    const delivery = (state.activity?.tasks || []).flatMap(t => t.loads.flatMap(load => load.lessons.filter(l => l.id === lesson.id).map(l => ({ ...l, task: t.id, at: load.at })))).sort((a, b) => b.at.localeCompare(a.at));
    article.append(el('p', delivery.length ? `${delivery.length} retained task(s) show loading. Latest retained load used version ${delivery[0].version} at ${delivery[0].at}. Behavior is not independently verified.` : 'Saved; no loading observed in retained tasks. Behavior is not independently verified.'));
    state.drafts ||= {};
    const saved = state.drafts[lesson.id] ||= { revision: lesson.revision, values: readValues(current.change), samples: { yes: '', no: '' }, dirty: false, open: false, historyOpen: false, generation: 0 };
    if (saved.revision !== lesson.revision && !saved.dirty) { saved.revision = lesson.revision; saved.values = readValues(current.change); }
    const stale = saved.revision !== lesson.revision;
    const payload = { id: lesson.id, revision: lesson.revision };
    const controls = [];
    const controlled = (label, work, currentRevision = false) => { const control = button(label, work); controls.push({ control, currentRevision }); return control; };
    const mutation = async work => {
      if (saved.pending) return;
      saved.pending = true; saved.renderPending();
      try { await work(); } finally { saved.pending = false; saved.renderPending(); }
    };
    const mutate = (operation, extra) => mutation(async () => { await api('preferences-action', { operation, payload: { ...payload, ...extra } }); await reload(); });
    const actions = el('div'); actions.className = 'actions'; actions.append(controlled(lesson.active ? 'Disable' : 'Enable', () => mutate('toggle', { enabled: !lesson.active })));
    const editor = el('details'), editorSummary = el('summary', saved.dirty ? 'Edit and preview (unsaved)' : 'Edit and preview'); editor.open = saved.open; editorSummary.onclick = event => { event.preventDefault(); saved.open = !editor.open; editor.open = saved.open; }; editor.append(editorSummary);
    const result = el('pre'); result.setAttribute('aria-live', 'polite');
    if (stale) {
      editor.append(el('p', 'The saved preference changed. Your draft is retained. Compare the current instruction above, then explicitly rebase or discard your draft.'));
      editor.append(controlled('Keep draft against current version', async () => { if (saved.pending) return; saved.revision = lesson.revision; await reload(); }));
    }
    editor.append(controlled('Discard draft', async () => { if (saved.pending) return; delete state.drafts[lesson.id]; await reload(); }));
    const changed = () => { saved.dirty = true; saved.generation++; result.textContent = ''; editor.querySelector('summary').textContent = 'Edit and preview (unsaved)'; };
    form(editor, saved.values, changed);
    for (const [key, title] of [['yes', 'Request that should select this workflow'], ['no', 'Request that should not select this workflow']]) {
      const label = el('label', title), input = el('textarea'); input.value = saved.samples[key]; input.maxLength = 2000;
      input.oninput = () => { saved.samples[key] = input.value; saved.generation++; result.textContent = ''; }; label.append(input); editor.append(label);
    }
    const editorActions = el('div'); editorActions.className = 'actions';
    const preview = controlled('Preview examples', async () => {
      if (saved.pending || saved.revision !== lesson.revision) return;
      const generation = saved.generation;
      const response = await api('preferences-preview', { operation: 'preview', payload: { id: lesson.id, revision: saved.revision, draft: draft(saved.values), cases: [ { brief: saved.samples.yes, expectedAffected: true }, { brief: saved.samples.no, expectedAffected: false } ] } });
      if (generation !== saved.generation) return;
      result.textContent = response.cases.map(c => `${c.matchesExpectation ? 'Matches expectation' : 'Review routing'}: ${c.brief}\nBefore: ${c.before.join(', ')}\nAfter: ${c.after.join(', ')}`).join('\n\n') + '\n\n' + response.limitation;
    }, true);
    const save = controlled('Save new version', () => mutation(async () => {
      if (saved.revision !== lesson.revision) return;
      const generation = saved.generation;
      const response = await api('preferences-action', { operation: 'edit', payload: { id: lesson.id, revision: saved.revision, draft: draft(saved.values) } });
      saved.revision = response.revision;
      if (saved.generation === generation) saved.dirty = false;
      await reload();
    }), true);
    editorActions.append(preview, save); editor.append(editorActions, result);
    const history = el('details'), historySummary = el('summary', 'Version history and undo'); history.open = saved.historyOpen; historySummary.onclick = event => { event.preventDefault(); saved.historyOpen = !history.open; history.open = saved.historyOpen; }; history.append(historySummary);
    for (const version of [...lesson.history].reverse()) {
      const item = el('div'); item.append(el('p', `Version ${version.version} · ${version.at}`), el('p', version.change.instruction));
      if (version.version !== lesson.current) item.append(controlled(`Restore version ${version.version}`, () => mutate('rollback', { version: version.version })));
      history.append(item);
    }
    saved.renderPending = () => { for (const { control, currentRevision } of controls) control.disabled = !!saved.pending || (currentRevision && saved.revision !== lesson.revision); };
    saved.renderPending();
    article.append(actions, editor, history); rows.append(article);
  }
}
