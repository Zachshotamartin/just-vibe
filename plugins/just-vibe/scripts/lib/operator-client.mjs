// Serialized into the nonce-protected local operator page; no server state is embedded.
export function operatorClient(learningClient, contextClient) {
  let token = location.hash.slice(1);
  try {
    if (token) sessionStorage.setItem('just-vibe-operator-token', token);
    else token = sessionStorage.getItem('just-vibe-operator-token') || '';
    if (token) history.replaceState(null, '', location.pathname + location.search);
  } catch {
    /* Keep the private fragment when session storage is unavailable. */
  }
  const state = {};
  let mode = 'work',
    records = [],
    generation = 0,
    loadedMode = null;
  const status = document.querySelector('#status'),
    rows = document.querySelector('#rows'),
    search = document.querySelector('#search');
  async function api(path, body) {
    if (!token) throw Error('Open the private operator URL again to connect.');
    const r = await fetch('/api/' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        'x-operator-token': token,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (r.status === 403) throw Error('Open the private operator URL again to connect.');
    const value = await r.json();
    if (!r.ok) throw Error(value.error || 'Request failed');
    return value;
  }
  function draw() {
    rows.replaceChildren();
    if (loadedMode !== mode) { status.textContent = 'Loading local records…'; return; }
    const filtered = records.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase()),
    );
    status.textContent = mode === 'context' ? 'Review the export or import before applying changes.' : filtered.length + (filtered.length === 1 ? ' record' : ' records');
    search.hidden = mode === 'context';
    document.querySelector('label[for=search]').hidden = search.hidden;
    search.previousElementSibling.hidden = search.hidden;
    if (mode === 'learning') {
      learningClient(filtered, { api, rows, status, reload: load, state });
      return;
    }
    if (['context', 'activity'].includes(mode)) { contextClient(mode, filtered, { api, rows, status, reload: load, state }); return; }
    for (const r of filtered) {
      const a = document.createElement('article'),
        h = document.createElement('h2'),
        p = document.createElement('p'),
        details = document.createElement('details'),
        summary = document.createElement('summary'),
        pre = document.createElement('pre');
      h.textContent = r.title || r.id || r.kind;
      p.textContent = r.summary || r.status || r.message || r.reason || '';
      summary.textContent = 'Inspect record';
      pre.textContent = JSON.stringify(r, null, 2);
      details.append(summary, pre);
      a.append(h, p, details);
      if (r.action) {
        const b = document.createElement('button');
        b.textContent = r.action.label;
        b.onclick = async () => {
          b.disabled = true;
          try {
            await api('action', { operation: r.action.operation, payload: r.action.payload });
            await load();
          } catch (e) {
            status.textContent = e.message;
            b.disabled = false;
          }
        };
        a.append(b);
      }
      rows.append(a);
    }
  }
  async function load() {
    const attempt = ++generation;
    if (loadedMode !== mode) rows.replaceChildren();
    status.textContent = 'Loading local records…';
    try {
      for (const id of ['work', 'catalog', 'learning', 'activity', 'context']) document.getElementById(id).setAttribute('aria-pressed', String(mode === id));
      if (mode === 'context') { document.querySelector('#install').hidden = true; records = []; }
      else if (mode === 'learning' || mode === 'activity') {
        document.querySelector('#install').hidden = true;
        const [data, activity] = await Promise.all([api('preferences'), api('preferences-activity')]);
        if (attempt !== generation) return;
        state.activity = activity; state.conflicts = data.conflicts;
        records = mode === 'learning' ? data.lessons : activity.tasks;
      } else if (mode === 'catalog') {
        const c = await api('catalog');
        if (attempt !== generation) return;
        document.querySelector('#install').hidden = !c.installationEnabled;
        const target = document.querySelector('#target');
        if (!target.options.length)
          for (const id of c.targets) {
            const o = document.createElement('option');
            o.value = id;
            o.textContent = id;
            target.append(o);
          }
        records = c.commands;
      } else {
        document.querySelector('#install').hidden = true;
        const s = await api('status');
        if (attempt !== generation) return;
        records = [
          ...s.workers.jobs.map((r) => ({ ...r, kind: 'worker' })),
          ...s.jobs.jobs.map((r) => ({ ...r, kind: 'job' })),
          ...s.claims.map((r) => ({
            ...r,
            kind: 'claim',
            action: {
              label: 'Release claim',
              operation: 'release',
              payload: { id: r.id, owner: r.owner, revision: s.revision },
            },
          })),
          ...s.conflicts.map((r, i) => ({ ...r, id: 'conflict-' + i, kind: 'conflict' })),
          ...s.inbox.map((r) => ({
            ...r,
            kind: 'message',
            ...(!r.acknowledged
              ? {
                  action: {
                    label: 'Acknowledge',
                    operation: 'acknowledge',
                    payload: { id: r.id, revision: s.revision },
                  },
                }
              : {}),
          })),
          ...s.merges.map((r) => ({ ...r, kind: 'merge-review' })),
          ...s.dispatch.map((r) => ({
            ...r,
            kind: 'dispatch',
            ...(r.status === 'finished'
              ? {
                  action: {
                    label: 'Retire finished request',
                    operation: 'retire-dispatch',
                    payload: { id: r.id, revision: s.revision },
                  },
                }
              : {}),
          })),
        ];
      }
      loadedMode = mode;
      draw();
    } catch (e) {
      if (attempt === generation) status.textContent = e.message;
    }
  }
  document.querySelector('#work').onclick = () => {
    mode = 'work';
    load();
  };
  document.querySelector('#catalog').onclick = () => {
    mode = 'catalog';
    load();
  };
  document.querySelector('#learning').onclick = () => { mode = 'learning'; load(); };
  for (const view of ['context', 'activity']) document.getElementById(view).onclick = () => { mode = view; load(); };
  document.querySelector('#refresh').onclick = load;
  search.oninput = draw;
  let installPreview = null,
    previewGeneration = 0;
  const apply = document.querySelector('#apply'),
    plan = document.querySelector('#plan'),
    preview = document.querySelector('#preview');
  const controls = ['target', 'operation', 'profile'].map((id) => document.getElementById(id));
  function invalidatePreview() {
    ++previewGeneration;
    installPreview = null;
    apply.hidden = true;
    plan.textContent = '';
  }
  for (const control of controls) control.onchange = invalidatePreview;
  preview.onclick = async () => {
    invalidatePreview();
    const attempt = previewGeneration;
    try {
      const result = await api(
        'install-preview',
        Object.fromEntries(controls.map((c) => [c.id, c.value])),
      );
      if (attempt !== previewGeneration) return;
      installPreview = result;
      plan.textContent = JSON.stringify(result.plan, null, 2);
      apply.hidden = false;
    } catch (e) {
      if (attempt === previewGeneration) status.textContent = e.message;
    }
  };
  apply.onclick = async () => {
    if (!installPreview) return;
    const reviewed = installPreview;
    apply.disabled = true;
    preview.disabled = true;
    for (const c of controls) c.disabled = true;
    try {
      await api('install-apply', { id: reviewed.id, hash: reviewed.hash });
      invalidatePreview();
      plan.textContent = 'Owned project files updated. Restart the selected host to discover them.';
    } catch (e) {
      status.textContent = e.message;
    } finally {
      apply.disabled = false;
      preview.disabled = false;
      for (const c of controls) c.disabled = false;
    }
  };
  api('identity').then(identity => {
    const region = document.querySelector('#identity');
    for (const text of [identity.demo ? 'Demo mode: disposable sample data' : 'Running on your computer', `Project: ${identity.project}`, `Storage: ${identity.storage}`, identity.demo ? 'Demo changes are discarded when this process stops. Your real preferences are not used.' : identity.note]) { const p = document.createElement('p'); p.textContent = text; region.append(p); }
  }).catch(e => { status.textContent = e.message; });
  load();
}
