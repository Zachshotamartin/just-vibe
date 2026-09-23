// Serialized into the private local dashboard; exports are explicitly downloaded.
export function contextClient(mode, records, { api, rows, status, reload, state }) {
  const el = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
  const button = (text, work) => { const b = el('button', text); b.type = 'button'; b.onclick = async () => { b.disabled = true; try { await work(); } catch(e) { status.textContent = e.message; } finally { b.disabled = false; } }; return b; };
  if (mode === 'activity') {
    rows.append(el('p', 'Saved is not loaded. Loaded is not verified behavior. This view shows retained local delivery receipts and observed tool activity.'));
    if (!records.length) rows.append(el('p', 'No task delivery has been recorded yet. Send a request through a configured host.'));
    for (const task of records) {
      const article = el('article'); article.append(el('h2', `${task.host} task`), el('p', task.id), el('p', task.at));
      if (!task.loads.length) article.append(el('p', 'No workflow loading observed.'));
      for (const load of task.loads) article.append(el('p', `${load.workflow} loaded at ${load.at}. ${load.lessons.length ? load.lessons.map(l => `${l.id}: loaded v${l.version}, current v${l.currentVersion ?? 'unavailable'}`).join('; ') : 'No saved preferences were included.'} Behavior: ${load.behavior}.`));
      article.append(el('p', `Observed tools: ${task.tools.join(', ') || 'none'}`));
      for (const conflict of task.conflicts) article.append(el('p', `${conflict.workflow}: ${conflict.detail}`));
      const known = new Set((state.activity?.lessons || []).map(lesson => lesson.id));
      state.exclusions ||= {};
      const saved = state.exclusions[task.id] ||= { revision: task.revision, selected: new Set(task.ignoredLessons), dirty: false, generation: 0, open: false };
      if (saved.revision !== task.revision && !saved.dirty && !saved.pending) {
        saved.revision = task.revision; saved.selected = new Set(task.ignoredLessons);
      }
      for (const id of saved.selected) if (!known.has(id)) saved.selected.delete(id);
      const stale = saved.revision !== task.revision;
      const details = el('details'), summary = el('summary', 'Ignore preferences for this task only');
      details.open = saved.open;
      summary.onclick = event => { event.preventDefault(); saved.open = !details.open; details.open = saved.open; };
      details.append(summary);
      const controls = [];
      if (stale) {
        details.append(el('p', 'This task changed. Your unsaved exclusions are retained. Compare the saved exclusions before keeping or discarding your draft.'));
        details.append(el('p', `Saved exclusions: ${task.ignoredLessons.filter(id => known.has(id)).join(', ') || 'none'}`));
        const rebase = button('Keep exclusions against current task', async () => { if (saved.pending) return; saved.revision = task.revision; await reload(); });
        controls.push(rebase); details.append(rebase);
      }
      const discard = button('Discard exclusion draft', async () => { if (saved.pending) return; delete state.exclusions[task.id]; await reload(); });
      controls.push(discard); details.append(discard);
      for (const lesson of (state.activity?.lessons || []).filter(l => task.selected.includes(l.workflow))) {
        const label = el('label', `${lesson.workflow} · v${lesson.version} · ${lesson.id}`), input = el('input'); input.type = 'checkbox'; input.checked = saved.selected.has(lesson.id); input.style.width = 'auto';
        input.onchange = () => { input.checked ? saved.selected.add(lesson.id) : saved.selected.delete(lesson.id); saved.dirty = true; saved.generation++; }; label.prepend(input); details.append(label);
      }
      const save = button('Save task exclusions', async () => {
        if (saved.pending || saved.revision !== task.revision) return;
        const generation = saved.generation; saved.pending = true; saved.render();
        try {
          const response = await api('preferences-action', { operation: 'exclude', payload: { taskId: task.id, revision: saved.revision, lessonIds: [...saved.selected] } });
          saved.revision = response.revision;
          if (saved.generation === generation) saved.dirty = false;
          await reload();
        } finally { saved.pending = false; saved.render(); }
      });
      saved.render = () => { save.disabled = !!saved.pending || saved.revision !== task.revision; for (const control of controls) control.disabled = !!saved.pending; };
      saved.render(); details.append(save);
      details.append(el('p', 'Checked preferences are skipped on the next workflow load for this task. Uncheck to restore. Saved global preferences and other tasks are unchanged.'));
      article.append(details); rows.append(article);
    }
    return;
  }
  rows.append(el('h2', 'Backup and transfer project context'), el('p', 'Export includes this project’s active preferences, memory and goals. User-wide preferences, credentials, evidence and execution permissions are excluded. Review the contents before sharing. Imported preferences stay pending until reviewed; existing IDs are preserved.'));
  state.transfer ||= { text: '', generation: 0 };
  const transfer = state.transfer, exportPreview = el('pre'), download = button('Download reviewed backup', async () => {
    if (!transfer.exported || transfer.exportPending) return;
    // Keep the file within the same byte limit used to validate the bundle.
    // The on-screen review stays indented, but formatting must not block reimport.
    const url = URL.createObjectURL(new Blob([JSON.stringify(transfer.exported)], { type: 'application/json' }));
    const a = el('a'); a.href = url; a.download = 'just-vibe-project-context.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const reviewExport = button('Review export', async () => {
    if (transfer.exportPending) return;
    transfer.exportPending = true; transfer.renderExport();
    try { transfer.exported = await api('context-export'); }
    finally { transfer.exportPending = false; transfer.renderExport(); }
  });
  transfer.renderExport = () => {
    exportPreview.textContent = transfer.exported ? JSON.stringify(transfer.exported, null, 2) : '';
    download.hidden = !transfer.exported;
    download.disabled = reviewExport.disabled = !!transfer.exportPending;
  };
  transfer.renderExport();
  rows.append(reviewExport, exportPreview, download);
  const fileLabel = el('label', 'Import JSON file'), file = el('input'); file.type = 'file'; file.accept = '.json,application/json'; fileLabel.append(file);
  const label = el('label', 'Or paste a project context bundle'), input = el('textarea'); input.value = transfer.text; input.maxLength = 524288; label.append(input);
  const preview = el('pre'), apply = button('Apply reviewed import', async () => {
    const p = transfer.preview;
    if (!p || transfer.applying || transfer.reading) return;
    transfer.applying = true; transfer.render();
    try {
      await api('context-apply', { id: p.id, hash: p.hash });
      transfer.preview = null;
      transfer.message = 'Project context imported. Preferences are pending review: use just-vibe learn status to inspect and approve them.';
    } finally { transfer.applying = false; transfer.render(); }
  });
  function invalidate() { transfer.generation++; transfer.preview = null; transfer.message = ''; }
  input.oninput = () => { transfer.text = input.value; invalidate(); transfer.render(); };
  file.onchange = async () => {
    if (transfer.applying || transfer.reading) return;
    const f = file.files[0]; if (!f) return;
    invalidate(); transfer.text = ''; transfer.reading = true; transfer.render();
    try {
      if (f.size > 524288) throw Error('Choose a bundle up to 512 KiB');
      transfer.text = await f.text();
    } catch(e) { status.textContent = e.message; }
    finally { transfer.reading = false; transfer.render(); }
  };
  const previewButton = button('Preview import', async () => {
    if (transfer.applying || transfer.reading) return;
    invalidate(); transfer.render();
    const generation = transfer.generation;
    const result = await api('context-preview', { bundle: JSON.parse(transfer.text) });
    if (generation !== transfer.generation) return;
    transfer.preview = result; transfer.render();
  });
  // These controls can be recreated by filtering or switching views during a request.
  // Keep both the pending operation and its current controls in the tab's state.
  transfer.render = () => {
    const busy = transfer.applying || transfer.reading;
    input.value = transfer.text;
    input.disabled = file.disabled = previewButton.disabled = apply.disabled = !!busy;
    apply.hidden = !transfer.preview;
    preview.textContent = transfer.reading ? 'Reading the selected backup…' : transfer.applying ? 'Applying the reviewed import…' : transfer.message || (transfer.preview ? JSON.stringify(transfer.preview.plan, null, 2) : '');
  };
  transfer.render();
  rows.append(fileLabel, label, previewButton, preview, apply);
}
