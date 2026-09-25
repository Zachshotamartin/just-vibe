// Routing quality report over the review corpus and catalog examples.
// Usage: node scripts/routing-report.mjs [--examples] [--misses] [--command <id>] [--pack <id>] [--json]
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadCorpus, catalogExamples, measureRouting, summarize } from './lib/routing-corpus.mjs';

const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const catalog = loadCatalog();
const packOf = Object.fromEntries(catalog.commands.map(c => [c.id, c.pack]));
let requests = args.includes('--examples') ? catalogExamples(catalog) : loadCorpus();
if (option('--command')) requests = requests.filter(r => r.command === option('--command'));
if (option('--pack')) requests = requests.filter(r => packOf[r.command] === option('--pack'));
const { rows, summary } = measureRouting(requests, { catalog, assist: !args.includes('--examples') });
if (args.includes('--json')) { console.log(JSON.stringify({ summary, rows }, null, 2)); process.exit(0); }
console.log('all', JSON.stringify(summary));
for (const pack of [...new Set(rows.map(r => packOf[r.command]))].sort()) console.log(pack.padEnd(16), JSON.stringify(summarize(rows.filter(r => packOf[r.command] === pack))));
if (args.includes('--misses')) for (const r of rows.filter(r => r.rank !== 1)) console.log(`- ${r.command} [${r.kind}] #${r.rank || '-'} "${r.request}" -> ${r.ids.slice(0, 3).join(', ') || '(none)'}${r.activates === false && !args.includes('--examples') ? ' (assist silent)' : ''}`);
