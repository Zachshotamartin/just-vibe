// Signals that decide whether automatic assistance engages with a prompt, and how a short
// follow-up relates to the previous task. They run on every prompt in a hooked host, so they
// stay lexical and bounded; the active agent still resolves intent.
import { normalize, stem } from './search.mjs';

// Engineering vocabulary, matched after the router's own normalization so plurals and
// inflections count ("tests", "migrations", "endpoints", "crashes").
const ENGINEERING_WORDS = `
  code codebase repo repository file bug test spec build compile compiler implement refactor debug review deploy publish
  commit merge rebase branch frontend backend api endpoint database db sql query schema migration react vite vercel github
  gitlab git pr ui ux css html website webpage app component menu dropdown footer header navbar sidebar tooltip layout
  page screen button modal form function typescript javascript python algorithm container docker pipeline cache notebook
  experiment keyboard accessibility a11y aria training model dataset gradient loss architecture teach explain login logout
  signin signup auth authentication authorization oauth jwt csrf xss injection vulnerability cve webhook dependency sdk cli
  script terminal ci lint linter eslint prettier typecheck tsc npm pnpm yarn pip node server crash error exception traceback
  kubernetes k8s helm terraform lambda serverless redis postgres postgresql mysql mongo mongodb sqlite prisma orm kafka cron
  latency timeout http json yaml graphql grpc websocket bundle webpack hydration ssr rerender jsx tsx props env staging
  monorepo microservice fixture mock coverage e2e playwright cypress jest vitest pytest regex nextjs django fastapi flask
  rails laravel golang rust kotlin swift php dotnet flaky deadlock llm embedding rag classifier overfitting hyperparameter
  pandas numpy pytorch torch tensorflow sklearn jupyter csv etl backfill dbt airflow spark snowflake bigquery mlregression
  prauc learningrate ml`.trim().split(/\s+/);
const ENGINEERING = new Set(ENGINEERING_WORDS.map(stem));
const ENGINEERING_PHRASES = /\b(?:linked\s+lists?|stack\s+traces?|memory\s+leaks?|race\s+conditions?|status\s+codes?|feature\s+flags?|screen\s+readers?|type\s+errors?|source\s+code|command\s+line|dark\s+mode|infinite\s+scroll|rate\s+limit(?:s|ing|er)?|null\s+pointer|segfault|segmentation\s+fault|out\s+of\s+memory|package\s+manager|unit\s+tests?)\b/i;

// A request engages automatic assistance when it uses engineering vocabulary or matches a
// domain topic rule. Generic action rules ("plan …", "how do I …") do not count on their own:
// "plan a weekend trip" and "how do I fold a fitted sheet" are not engineering requests.
export function engineeringRequest(positive, matches = []) {
  return ENGINEERING_PHRASES.test(positive)
    || normalize(positive).some(token => ENGINEERING.has(token.stem))
    || matches.some(rule => !rule.action && !rule.damp);
}

// Questions about the catalog itself. Answering them never starts the embedded task. "Tool"
// needs a just-vibe qualifier: "what tool should I use for load testing" asks for a recommendation.
const CATALOG_NOUN = String.raw`(?:(?:just-vibe|jv)\s+(?:commands?|workflows?|skills?|tools?)|commands?|workflows?|skills?)`;
const DISCOVERY = new RegExp([
  String.raw`\b(?:which|what)\s+${CATALOG_NOUN}\s+(?:should|would|could|can|do|does|fits?|handles?|covers?|helps?|is\s+(?:best|right|meant)|are\s+(?:there|available|best)|to\s+use|for)\b`,
  String.raw`\bis\s+there\s+(?:an?\s+|any\s+)?(?:just-vibe\s+)?(?:command|workflow|skill)s?\s+(?:for|that|to)\b`,
  String.raw`\bwhat\s+can\s+(?:you|this\s+plugin|just-vibe|jv)\s+do\b`,
  String.raw`\bwhat\s+(?:commands|workflows|skills|tools)\s+(?:do\s+you\s+have|are\s+(?:there|available))\b`,
  String.raw`\bhow\s+(?:do|can|should)\s+i\s+use\s+(?:just-vibe|jv)\b`,
  String.raw`\bwhich\s+(?:[\w-]+\s+){0,2}(?:commands|workflows|skills|tools)\s+(?:are|is)\s+(?:available|installed|missing|supported|enabled)\b`,
  String.raw`\bwhich\s+(?:integrations?|prerequisites?|capabilit(?:y|ies))\b[\w\s,-]*\b(?:missing|available|needed|required|installed)\b`,
  String.raw`\b(?:which|what)\s+(?:just-vibe\s+)?(?:persona|profile)s?\s+(?:should|would|fits?|suits?|is\s+(?:best|right)|for)\b`,
].join('|'), 'i');
const LISTING = /\b(?:what\s+(?:commands|workflows|skills|tools)\s+do\s+you\s+have|available|installed|missing|enabled|supported|list)\b/i;
const PERSONA = /\b(?:persona|profile)s?\b/i;

export function discoveryQuestion(positive) {
  if (!DISCOVERY.test(positive)) return null;
  if (PERSONA.test(positive)) return ['profile'];
  return LISTING.test(positive) ? ['tools', 'help'] : ['help', 'tools'];
}

// Short follow-ups. A continuation keeps the previous task unchanged; a repair follow-up after
// an inspection changes the action class ("fix it", "fix the first two", "address those").
export const continuation = /^(?:please\s+)?(?:continue|go ahead|do (?:it|that)|implement(?: it| that)?|fix(?: it| that)?|yes|keep going|proceed|(?:do (?:it|that|this) )?again|one more time|another pass|repeat(?: it| that)?)[.!\s]*$/i;
const REPAIR_OBJECT = String.raw`(?:it|that|them|those|these|this|all(?:\s+of\s+(?:them|those|these))?|everything|each(?:\s+one)?|both|the\s+(?:first|second|third|top|last|remaining|critical|high|main|other)\b[\w\s-]{0,30}|(?:the\s+|all\s+the\s+)?(?:issues?|findings?|bugs?|problems?|vulnerabilit(?:y|ies)|fixes|suggestions?|recommendations?)(?:\s+(?:you|we)\s+(?:found|flagged|listed|identified|mentioned|raised|reported))?)`;
const REPAIR = new RegExp(String.raw`^(?:(?:please|now|ok(?:ay)?|yes|great|thanks|go\s+ahead\s+and|then|so|and)[,\s]+)*(?:fix|repair|patch|remediate|address|resolve|implement)\s+${REPAIR_OBJECT}(?:\s+(?:too|as\s+well|now|please|for\s+me))?[.!\s]*$`, 'i');
export const repairFollowUp = text => REPAIR.test(text.trim());

// A workflow can carry out a repair when it applies by default or its mode policy allows apply.
export const canApply = command => command.defaultMode === 'apply' || /\bapply\b/i.test(command.modePolicy || '');
