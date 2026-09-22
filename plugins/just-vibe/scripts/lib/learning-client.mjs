// Browser function serialized by operator-http. All user text stays in textContent/value.
export function learningClient(records, { api, rows, status, reload }) {
  const el = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
  if (!records.length) rows.append(el('p', 'No saved preferences. Explicit corrections saved by your host will appear here.'));
  rows.append(el('p', 'Preferences are local. Editing preserves history; current requests take precedence. Preview shows routing candidates, not a promise that an agent will follow an instruction.'));
  for (const lesson of records) {
    const current = lesson.history.find(v => v.version === lesson.current), article = el('article');
    article.append(el('h2', lesson.workflow), el('p', `${lesson.scope} scope · version ${lesson.current} · ${lesson.active ? 'Enabled' : 'Disabled'}`), el('p', current.change.instruction));
    article.append(el('p', `Source: ${current.source?.kind === 'explicit-edit' ? 'Edited in preferences' : 'Explicit user feedback'} — ${current.source?.excerpt || 'Unavailable'}`));
    const actions = el('div'); actions.className = 'actions';
    function button(label, work) {
      const b = el('button', label); b.type = 'button'; b.onclick = async () => {
        b.disabled = true;
        try { await work(); } catch (e) { status.textContent = e.message; } finally { b.disabled = false; }
      }; return b;
    }
    const payload = { id: lesson.id, revision: lesson.revision };
    const mutate = async (operation, extra) => { await api('preferences-action', { operation, payload: { ...payload, ...extra } }); await reload(); };
    actions.append(button(lesson.active ? 'Disable' : 'Enable', () => mutate('toggle', { enabled: !lesson.active })));
    const editor = el('details'), heading = el('summary', 'Edit and preview'); editor.append(heading);
    const controls = {};
    for (const key of ['instruction', 'triggers', 'avoid', 'tools', 'checks', 'conditions', 'exceptions']) {
      const label = el('label', key === 'instruction' ? 'Instruction' : `${key} (one per line)`), input = el('textarea');
      input.value = key === 'instruction' ? current.change[key] : (current.change[key] || []).join('\n');
      input.maxLength = key === 'instruction' ? 2000 : 2500;
      label.append(input); editor.append(label); controls[key] = input;
    }
    const samples = {};
    for (const [key, title] of [['yes', 'Request that should select this workflow'], ['no', 'Request that should not select this workflow']]) {
      const label = el('label', title), input = el('textarea'); input.maxLength = 2000; label.append(input); editor.append(label); samples[key] = input;
    }
    let draftRevision = 0;
    const result = el('pre'); result.setAttribute('aria-live', 'polite');
    const draft = () => Object.fromEntries(Object.entries(controls).map(([key, input]) => [key, key === 'instruction' ? input.value : input.value.split('\n').map(v => v.trim()).filter(Boolean)]));
    const editorActions = el('div'); editorActions.className = 'actions';
    editorActions.append(button('Preview examples', async () => {
      const revision = draftRevision;
      const response = await api('preferences-preview', { operation: 'preview', payload: { ...payload, draft: draft(), cases: [
        { brief: samples.yes.value, expectedAffected: true }, { brief: samples.no.value, expectedAffected: false },
      ] } });
      if (revision !== draftRevision) return;
      result.textContent = response.cases.map(c => `${c.matchesExpectation ? 'Matches expectation' : 'Review routing'}: ${c.brief}\nBefore: ${c.before.join(', ')}\nAfter: ${c.after.join(', ')}`).join('\n\n') + '\n\n' + response.limitation;
    }), button('Save new version', () => mutate('edit', { draft: draft() })));
    for (const input of [...Object.values(controls), ...Object.values(samples)]) input.oninput = () => { ++draftRevision; result.textContent = ''; };
    editor.append(editorActions, result);
    const history = el('details'); history.append(el('summary', 'Version history and undo'));
    for (const version of [...lesson.history].reverse()) {
      const item = el('div'); item.append(el('p', `Version ${version.version} · ${version.at}`), el('p', version.change.instruction));
      if (version.version !== lesson.current) item.append(button(`Restore version ${version.version}`, () => mutate('rollback', { version: version.version })));
      history.append(item);
    }
    article.append(actions, editor, history); rows.append(article);
  }
}
