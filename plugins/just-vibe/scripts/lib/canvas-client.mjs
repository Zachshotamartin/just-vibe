// Runs only in the nonce-authorized review page; no application HTML is evaluated here.
export function canvasClient() {
  const $ = (id) => document.getElementById(id);
  const token = location.hash.slice(1);
  let record,
    anchor = null,
    draftGeneration = 0,
    lastArtifact = null,
    refreshGeneration = 0,
    refreshing = false,
    busy = false,
    stopped = false;
  async function api(path, body) {
    const response = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: { 'x-canvas-token': token, ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw Error(text);
    }
    if (!response.ok) throw Error(data.error || 'Review unavailable');
    return data;
  }
  function select(line) {
    if (anchor !== line) draftGeneration++;
    anchor = line;
    $('anchor').textContent = line
      ? 'Annotating line ' + line + '.'
      : 'Comment on the whole document.';
    $('clear').hidden = !line;
    document
      .querySelectorAll('.line button')
      .forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.line) === line)));
    $('comment').textContent = line ? 'Add annotation' : 'Add comment';
  }
  function render(next) {
    record = next;
    $('title').textContent = next.title;
    $('path').textContent = next.artifact.path + ' · version ' + next.artifact.hash.slice(0, 12);
    const verdict = next.effectiveVerdict;
    const status = next.closed
      ? 'Review closed.'
      : next.stale
        ? 'The artifact changed. Ask the agent to refresh this review before responding.'
        : verdict
          ? verdict.kind === 'approve'
            ? 'This version is approved.'
            : 'Changes requested for this version.'
          : 'Ready for your review.';
    if ($('status').textContent !== status) $('status').textContent = status;
    for (const id of ['comment', 'changes', 'approve'])
      $(id).disabled = busy || next.closed || next.stale;
    if (lastArtifact !== next.artifact.hash) {
      lastArtifact = next.artifact.hash;
      select(null);
      $('document').replaceChildren();
      next.artifact.content.split('\n').forEach((line, i) => {
        const row = document.createElement('div');
        row.className = 'line';
        const button = document.createElement('button');
        button.textContent = String(i + 1);
        button.dataset.line = String(i + 1);
        button.setAttribute('aria-label', 'Annotate line ' + (i + 1));
        button.setAttribute('aria-pressed', 'false');
        button.onclick = () => {
          select(i + 1);
          $('message').focus();
        };
        const code = document.createElement('code');
        code.textContent = line || ' ';
        row.append(button, code);
        $('document').append(row);
      });
      $('view').hidden = next.artifact.format !== 'html';
      $('preview').srcdoc =
        '<meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; style-src &apos;unsafe-inline&apos;; img-src data:; base-uri &apos;none&apos;; form-action &apos;none&apos;">' +
        next.artifact.content;
    }
    $('feedback').replaceChildren();
    for (const entry of next.feedback) {
      const li = document.createElement('li'),
        label = document.createElement('small'),
        p = document.createElement('p');
      label.textContent =
        (entry.kind === 'context' ? 'Agent context' : entry.kind) +
        (entry.anchor ? ' · line ' + entry.anchor : '') +
        ' · ' +
        new Date(entry.at).toLocaleString();
      p.textContent = entry.text;
      li.append(label, p);
      $('feedback').append(li);
    }
    if (!next.feedback.length) {
      const li = document.createElement('li');
      li.textContent = 'No feedback yet.';
      $('feedback').append(li);
    }
  }
  async function refresh(force = false) {
    if (busy || stopped || (refreshing && !force)) return;
    const generation = ++refreshGeneration;
    refreshing = true;
    try {
      const next = await api('/api/review');
      if (generation === refreshGeneration && !busy) render(next);
    } catch (error) {
      if (generation !== refreshGeneration || busy) return;
      $('error').textContent = error.message;
      for (const id of ['comment', 'changes', 'approve']) $(id).disabled = true;
      stopped = true;
    } finally {
      if (generation === refreshGeneration) refreshing = false;
    }
  }
  async function submit(kind) {
    if (!record || busy || record.closed || record.stale) return;
    const text = $('message').value.trim();
    if (!text) {
      $('error').textContent = 'Write feedback or a review reason first.';
      $('message').focus();
      return;
    }
    const submittedGeneration = draftGeneration;
    ++refreshGeneration;
    busy = true;
    render(record);
    $('error').textContent = '';
    try {
      await api('/api/feedback', {
        revision: record.revision,
        artifactHash: record.artifact.hash,
        kind: kind === 'comment' && anchor ? 'annotation' : kind,
        text,
        ...(kind === 'comment' && anchor ? { anchor } : {}),
      });
      if (draftGeneration === submittedGeneration) {
        $('message').value = '';
        select(null);
      }
    } catch (error) {
      $('error').textContent = error.message;
    } finally {
      busy = false;
      await refresh(true);
    }
  }
  $('comment').onclick = () => submit('comment');
  $('message').oninput = () => { draftGeneration++; };
  $('approve').onclick = () => submit('approve');
  $('changes').onclick = () => submit('changes');
  $('clear').onclick = () => select(null);
  $('view').onclick = () => {
    const preview = $('preview').hidden;
    $('preview').hidden = !preview;
    $('document').hidden = preview;
    $('view').textContent = preview ? 'Show source lines' : 'Preview HTML';
  };
  if (!token) {
    $('error').textContent = 'Open the private review link returned by just-vibe.';
    stopped = true;
  } else {
    refresh();
    setInterval(refresh, 3000);
  }
}
