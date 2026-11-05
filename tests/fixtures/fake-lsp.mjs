// A scripted language server for tests. The mode is read from .fake-lsp-mode in the working
// directory so one trusted runner identity covers every scenario.
import { readFileSync } from 'node:fs';

const mode = (() => { try { return readFileSync('.fake-lsp-mode', 'utf8').trim(); } catch { return 'push'; } })();
const write = message => {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  const bytes = Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`), body]);
  // Split mode delivers every byte separately, including inside multi-byte characters.
  if (mode === 'split') for (const byte of bytes) process.stdout.write(Buffer.from([byte]));
  else process.stdout.write(bytes);
};
let buffer = Buffer.alloc(0), configured = false;
const opened = new Map();
process.stdin.on('data', chunk => {
  buffer = Buffer.concat([buffer, chunk]);
  for (;;) {
    const end = buffer.indexOf('\r\n\r\n');
    if (end < 0) return;
    const length = Number(/Content-Length: (\d+)/i.exec(buffer.subarray(0, end).toString())[1]);
    if (buffer.length < end + 4 + length) return;
    const message = JSON.parse(buffer.subarray(end + 4, end + 4 + length).toString('utf8'));
    buffer = buffer.subarray(end + 4 + length);
    handle(message);
  }
});
function handle(message) {
  if (message.id !== undefined && message.method === undefined) { if (message.id === 'cfg-1') configured = Array.isArray(message.result); return; }
  if (message.method === 'initialize') {
    if (mode === 'hang') return;
    if (mode === 'oversize') { process.stdout.write('Content-Length: 99999999999\r\n\r\n'); return; }
    if (mode === 'server-request') write({ jsonrpc: '2.0', id: 'cfg-1', method: 'workspace/configuration', params: { items: [{ section: 'a' }, { section: 'b' }] } });
    write({ jsonrpc: '2.0', id: message.id, result: { capabilities: { definitionProvider: true, referencesProvider: true, ...(mode === 'pull' ? { diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false } } : {}) } } });
    if (mode === 'crash') setTimeout(() => process.exit(3), 20);
  } else if (message.method === 'textDocument/didOpen') {
    const { uri, text } = message.params.textDocument;
    opened.set(uri, text);
    if (mode !== 'pull') {
      write({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri, diagnostics: [] } });
      setTimeout(() => write({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri, diagnostics: diagnose(text) } }), 50);
    }
  } else if (message.method === 'textDocument/diagnostic') {
    write({ jsonrpc: '2.0', id: message.id, result: { kind: 'full', items: diagnose(opened.get(message.params.textDocument.uri) || '') } });
  } else if (message.method === 'textDocument/definition') {
    const uri = message.params.textDocument.uri;
    write({ jsonrpc: '2.0', id: message.id, result: [{ uri, range: { start: { line: 0, character: 9 }, end: { line: 0, character: 12 } } }] });
  } else if (message.method === 'textDocument/references') {
    const uri = message.params.textDocument.uri;
    const lines = (opened.get(uri) || '').split('\n');
    const found = lines.flatMap((line, index) => line.includes('add') ? [{ uri, range: { start: { line: index, character: line.indexOf('add') }, end: { line: index, character: line.indexOf('add') + 3 } } }] : []);
    write({ jsonrpc: '2.0', id: message.id, result: found });
  } else if (message.method === 'shutdown') write({ jsonrpc: '2.0', id: message.id, result: null });
  else if (message.method === 'exit') process.exit(mode === 'server-request' && !configured ? 9 : 0);
}
// Every line containing "ERROR" is an error; "WARN" a warning. Messages carry a multi-byte character.
function diagnose(text) {
  return text.split('\n').flatMap((line, index) => line.includes('ERROR') ? [{ range: { start: { line: index, character: line.indexOf('ERROR') }, end: { line: index, character: line.length } }, severity: 1, message: 'Type error — not assignable', source: 'fake' }]
    : line.includes('WARN') ? [{ range: { start: { line: index, character: 0 }, end: { line: index, character: line.length } }, severity: 2, message: 'Unused value', source: 'fake' }] : []);
}
