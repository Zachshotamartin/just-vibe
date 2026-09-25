// Effect signals for the quick/tracked suggestion. An effect counts only when a verb acts on an
// object in the request's own clause: "delete the old S3 bucket" is destructive, "the delete
// button does nothing" is a symptom, and "is it safe to merge" is a question. The request text
// passed here has its negated clauses removed already.

// A clause ends at sentence punctuation, a comma or a conjunction, so each listed action keeps its
// own lead ("Fix the bug, add a test, and open a PR"). A period inside "v1.2" or "cart.ts" does not.
const CLAUSE_BREAK = /[.;:!?]+(?=\s|$)|\n+|,\s*|\s+(?=(?:and|but|then|also|after that|afterwards|finally)\b)/i;

// Words that may precede an imperative or declared action: "please", "then", "can you",
// "we are", "I need to". They are stripped before a clause is classified; a verb after any other
// word describes something rather than asking for it.
const LEAD = /^(?:(?:and|or|then|please|kindly|also|now|just|first|finally|next|so|ok|okay|afterwards|after that|go ahead and|once done|when done|can you|could you|would you|will you|let's|lets|let us|help me|it's time to|it is time to|time to|ready to|we're|we are|i'm|i am|you're|you are|we'll|we will|i'll|i will|we need to|i need to|you need to|need to|we have to|i have to|have to|we want to|i want to|want to|we should|i should|you should|we must|i must|you must|going to|about to|plan to|we plan to|i'd like to|we'd like to|i'd like you to|i want you to|we want you to|i need you to|feel free to|actually)[\s,]+)*/i;
const stripLead = clause => clause.replace(LEAD, '');
const verbFirst = pattern => new RegExp(`^(?:${pattern})`, 'i');
// Up to n words (articles, adjectives, names) between a verb and its object; zero is allowed.
const upto = n => String.raw`(?:\s+[\w'#./-]+){0,${n}}?\s+`;
const GAP = upto(3);

// Remote collaboration items. A following noun such as "template" or "description" makes the
// phrase a local document ("create an issue template", "make the PR description clearer").
const REMOTE_ITEM = String.raw`(?:pull requests?|prs?|merge requests?|mrs?|github issues?|issues?|tickets?|bug reports?|bugs?|releases?|gists?)`;
const LOCAL_FOLLOWER = String.raw`(?!\s+(?:templates?|descriptions?|titles?|bodies|body|checklists?|notes|branch(?:es)?|labels?|links?|urls?|numbers?|pages?|diffs?|files?|tabs?|summary|summaries|text|format|workflow|in\s+(?:the\s+)?(?:browser|editor|vs\s?code))\b)`;
const ENVIRONMENT = String.raw`(?:prod|production|staging|live|all regions|every region|all users|users|customers|the fleet|the app store|app store|play store|testflight)`;

const EXTERNAL = [
  // Deploys, releases and pushes. A following noun ("deploy script", "publish step",
  // "push notifications") names a thing in the code, not the action.
  String.raw`(?:re)?deploy(?:s|ed|ing)?\b(?!\s+(?:scripts?|buttons?|steps?|config(?:uration)?s?|logs?|pipelines?|jobs?|workflows?|keys?|hooks?|targets?|settings|process|docs|documentation|commands?|previews)\b)`,
  String.raw`publish(?:es|ed|ing)?\b(?!\s+(?:steps?|scripts?|buttons?|workflows?|config(?:uration)?|settings|dates?)\b)`,
  String.raw`(?:force[- ])?push(?:es|ed|ing)?\b(?!\s*-?\s*(?:notifications?|buttons?|state|ups?|model|back\s+on)\b)`,
  String.raw`merg(?:e|es|ed|ing)${GAP}(?:${REMOTE_ITEM}|dependabot|branch(?:es)?|it|this|them)\b(?!\s+conflicts?)`,
  String.raw`merg(?:e|es|ed|ing)(?:\s+(?:it|this|them))?\s+(?:in)?to\s+(?:main|master|trunk|develop|release|production|prod)\b|merg(?:e|es|ed|ing)\s+#?\d+`,
  String.raw`ship(?:s|ped|ping)?${upto(4)}to\s+${ENVIRONMENT}\b|ship(?:s|ped|ping)?\s+(?:it|this)\b|ship(?:s|ped|ping)?${GAP}(?:v?\d+(?:\.\d+)+|release|hotfix|build)\b`,
  String.raw`promot(?:e|es|ed|ing)${GAP}(?:previews?|deployments?|builds?|releases?|canary|images?|versions?)\b|promot(?:e|es|ed|ing)${upto(4)}to\s+${ENVIRONMENT}\b`,
  String.raw`roll(?:s|ed|ing)?\s+(?:out|back)${GAP}(?:builds?|releases?|versions?|features?|flags?|updates?|changes?|fix(?:es)?|hotfix(?:es)?|deploy(?:ment)?s?|migrations?|models?|canary|v?\d+(?:\.\d+)+)\b`,
  String.raw`roll(?:s|ed|ing)?\s+(?:out|back)${upto(4)}to\s+(?:${ENVIRONMENT}|v?\d|\d+\s*(?:%|percent))|roll(?:s|ed|ing)?\s+(?:out|back)\s+(?:it|this)\b|rollback\s+(?:the|to|production|prod|staging)\b`,
  String.raw`releas(?:e|es|ed|ing)\s+(?:(?:the\s+new\s+|the\s+|a\s+new\s+)?(?:v?\d+(?:\.\d+)*|versions?|package|build|app|library|sdk|crate|gem|it|this)\b|to\s+(?:npm|pypi|${ENVIRONMENT})\b)`,
  String.raw`tag(?:s|ged|ging)?\s+(?:(?:the|a|this)\s+(?:release|commit|version)|v?\d+(?:\.\d+)+|it|this)\b`,
  String.raw`cut(?:s|ting)?\s+(?:(?:a|the|new|another)\s+)*(?:releases?|tags?|versions?|rc|v?\d+(?:\.\d+)+)\b(?!\s+notes)`,
  String.raw`upload(?:s|ed|ing)?${GAP}(?:assets|artifacts|binaries|builds?|releases?|packages?|bundles?|dist|source\s?maps|files?\s+to|images?\s+to)\b|upload(?:s|ed|ing)?${GAP}to\s+(?:s3|gcs|github|the registry|npm|pypi|testflight|the app store)\b`,
  String.raw`provision(?:s|ed|ing)?\b|spin(?:s|ning)?\s+up${GAP}(?:servers?|instances?|clusters?|environments?|vms?|nodes?|databases?)\b`,
  String.raw`(?:purchas|buy)(?:e|es|ed|ing|s)?${GAP}(?:domains?|plans?|subscriptions?|credits?|seats?|licen[cs]es?|tiers?|gpus?|instances?|compute)\b|upgrad(?:e|ing)\s+(?:to|the)\s+(?:a\s+)?(?:paid|pro|team|business|enterprise)\s+(?:plan|tier)`,
  String.raw`(?:run|apply|execute|ran|running|applying)${GAP}migrations?\s+(?:on|in|against|to)\s+(?:the\s+)?(?:prod|production|staging|live)\b|migrat(?:e|ing)\s+(?:the\s+)?(?:prod|production|live)\s+(?:database|db|data)\b`,
  // Schema and data changes applied to a live database ("add a required column … on a live database").
  String.raw`(?:add|alter|chang|backfill|updat|modif|migrat|run|apply|execut|insert|writ|patch|renam|seed|import|load)\w*${upto(8)}(?:on|in|against|to|into)\s+(?:(?:a|the|our)\s+)?(?:live|production|prod)\s+(?:database|db|data|cluster|tables?)\b`,
  // Collaboration writes on a remote host.
  String.raw`(?:open(?:s|ed|ing)?|creat(?:e|es|ed|ing)|rais(?:e|es|ed|ing)|submit(?:s|ted|ting)?)${GAP}${REMOTE_ITEM}\b${LOCAL_FOLLOWER}`,
  String.raw`mak(?:e|es|ing)\s+(?:a|an|another|new|one)\s+(?:(?:new|draft|github)\s+)*${REMOTE_ITEM}\b${LOCAL_FOLLOWER}`,
  String.raw`fil(?:e|es|ed|ing)\s+(?:(?:a|an|the|new|another|one|github|separate)\s+)*(?:bugs?|issues?|tickets?|reports?)\b${LOCAL_FOLLOWER}`,
  String.raw`post(?:s|ed|ing)?${GAP}(?:reviews?|comments?|replies|reply|messages?|updates?|announcements?|summary|findings|results|reports?)\b|post(?:s|ed|ing)?${GAP}(?:to|on|in)\s+(?:slack|github|the pr|pr|the issue|the channel|#)`,
  String.raw`comment(?:s|ed|ing)?\s+on\s+(?:(?:the|this|that)\s+)?(?:pr|pull request|issue|#?\d+)\b|repl(?:y|ies|ied|ying)\s+to\s+(?:(?:the|each|all|every)\s+)?(?:reviews?|reviewers?|comments?|threads?)\b|resolv(?:e|es|ed|ing)\s+(?:(?:the|all)\s+)?(?:review\s+)?threads\b`,
  String.raw`(?:approv(?:e|es|ed|ing)|clos(?:e|es|ed|ing)|reopen(?:s|ed|ing)?|label(?:s|ed|led|ing|ling)?|assign(?:s|ed|ing)?|request\s+changes\s+on)${upto(2)}(?:prs?|pull requests?|issues?|#\d+)\b(?!\s+(?:templates?|descriptions?))`,
  String.raw`(?:re-?run(?:s|ning)?|re-?trigger(?:s|ed|ing)?|trigger(?:s|ed|ing)?|kick(?:s|ed|ing)?\s+off)${GAP}(?:ci|workflows?|pipelines?|deploy(?:ment)?s?|github\s+actions|(?:ci|failed|failing|github|remote)\s+(?:checks?|jobs?|runs?))\b`,
  // A hosted preview is a deployment ("spin up a preview of this branch"); a preview component is not.
  String.raw`(?:creat(?:e|es|ed|ing)|spin(?:s|ning)?\s+up|start(?:s|ed|ing)?)${GAP}(?:preview\s+deployments?|previews?|deployments?)\b(?!\s+(?:components?|pages?|panes?|panels?|images?|modes?|cards?|modals?|thumbnails?|text|config(?:uration)?|scripts?|settings)\b)`,
  String.raw`(?:send(?:s|ing)?|sent|email(?:s|ed|ing)?)${GAP}(?:emails?|messages?|newsletters?|invites?|invitations?|notifications?|announcements?|reports?|summary|results)\s+to\b|(?:send(?:s|ing)?|sent|email(?:s|ed|ing)?)${GAP}to\s+(?:users|customers|everyone|the team|the list|subscribers|slack|the channel|#)`,
].map(verbFirst);

// Command lines that act on a remote service. A command counts when it leads a clause, follows
// "run" or a shell marker, or carries a flag; "our Vercel deploy keeps failing" names the product.
const COMMAND = /\b(?:git\s+push|(?:npm|yarn|pnpm|cargo|gem|poetry)\s+publish|twine\s+upload|gh\s+(?:pr|issue|release|repo|workflow|run|api)\s+(?:create|merge|close|edit|comment|review|delete|upload|rerun|run|reopen|-X)|vercel\s+(?:deploy|--prod|promote|rollback|env\s+(?:add|rm))|kubectl\s+(?:apply|delete|rollout|scale|patch)|terraform\s+(?:apply|destroy)|helm\s+(?:install|upgrade|uninstall|rollback)|aws\s+\S+\s+(?:delete|rm|put|create|terminate)\S*)(?![\w-])/i;
const REMOTE_COMMAND = new RegExp(String.raw`^(?:${COMMAND.source})|(?:\b(?:run|ran|running|execute|type|use)\s+|[\`$]\s*)(?:${COMMAND.source})|(?:${COMMAND.source})\s+--?\w`, 'i');

// Destructive verbs count on shared resources or in a named live environment. The same verb on
// a local or test resource ("drop the local test table", "delete the unused helper") stays quick.
// "Remove" is common in code edits, so it needs both a shared resource and a live environment.
const DESTRUCTIVE = verbFirst(String.raw`(?:delet(?:e|es|ed|ing)|drop(?:s|ped|ping)?|truncat(?:e|es|ed|ing)|wip(?:e|es|ed|ing)|purg(?:e|es|ed|ing)|destroy(?:s|ed|ing)?|revok(?:e|es|ed|ing)|rotat(?:e|es|ed|ing)|reset(?:s|ting)?|flush(?:es|ed|ing)?|terminat(?:e|es|ed|ing)|decommission(?:s|ed|ing)?|tear(?:s|ing)?\s+down|overwrit(?:e|es|ing))\b(.*)`);
const REMOVE = verbFirst(String.raw`remov(?:e|es|ed|ing)\b(.*)`);
const SHARED_RESOURCE = /\b(?:tables?|databases?|dbs?|schemas?|buckets?|clusters?|instances?|servers?|vms?|volumes?|disks?|snapshots?|backups?|customer data|collections?|queues?|topics?|namespaces?|deployments?|environments?|repos?|repositories|keys?|secrets?|tokens?|credentials?|certificates?|certs?|resources|stacks?|infrastructure|dns|domains?|projects?|remote branch(?:es)?|remote tags?|releases?)\b/i;
const LIVE = /\b(?:prod|production|live|staging|remote|origin|s3|gcs|rds|dynamodb)\b/i;
const LOCAL = /\b(?:local|locally|test|tests|fixtures?|mocks?|sandbox|scratch|temp|tmp|dev|unused|dead|components?|pages?|ui|modals?|csv|json|yaml|files?|folders?|director(?:y|ies)|helpers?|functions?|imports?|variables?|code)\b/i;

// A cutover moves live traffic; it counts unless the request only asks to plan or explain it.
const CUTOVER = /\b(?:blue[- ]green|canary)\s+(?:cutover|deploy(?:ment)?|release|rollout)\b|\bcutover\s+(?:of|to)\b|\bcut(?:s|ting)?\s+over\s+to\b|\bswitch(?:es|ing)?\s+(?:the\s+)?(?:live\s+|production\s+|prod\s+)?traffic\s+to\b/i;

// A credential exposed outside the machine must be revoked on the service that issued it. Only an
// assertion counts: "I accidentally pushed our AWS key" or "the leaked Stripe key", not a scan
// question such as "did we leak any passwords?".
const SECRET = String.raw`(?:keys?|secrets?|tokens?|credentials?|passwords?)`;
const EXPOSED = new RegExp([
  String.raw`(?<!\b(?:whether|if)\s+)\b(?:i|we|someone|somebody|they)\s+(?:(?:accidentally|just|already|have|has)\s+)*(?:pushed|committed|leaked|exposed|published|posted|shared)\b.*\b${SECRET}\b`,
  String.raw`\baccidentally\s+(?:pushed|committed|published|posted|shared)\b.*\b${SECRET}\b`,
  String.raw`\b${SECRET}\s+(?:\w+\s+){0,3}(?:was|were|got|has\s+been|have\s+been)\s+(?:leaked|exposed|pushed|committed|published)\b`,
  String.raw`\b(?:the|our|a|this|that)\s+(?:leaked|exposed)\s+(?:[\w-]+\s+){0,2}${SECRET}\b`,
].join('|'), 'i');
const statements = text => text.replace(/[^.!?\n]*\?/g, ' ');

// Load against a shared or live environment affects other people even while planning it.
const LOAD = /\b(?:load|stress|soak|spike)[- ]?test(?:s|ing)?\b|\bramp(?:s|ing)?\s+up\b|\b\d+\s*(?:rps|qps|requests per second|concurrent users|virtual users|vus)\b|\bconcurrent users\b/i;
const SHARED_ENVIRONMENT = /\b(?:staging|production|prod|live|shared)\b/i;

// Continuation needs an action on prior work; "able to resume if it crashes" and "from the
// Figma dev-mode handoff" describe features and sources.
const CONTINUATION = [
  // "Resume" leads an imperative; "Resume parsing" or "resume builder" names a feature.
  String.raw`resum(?:e|es|ed|ing)\b(?!\s+(?:pars(?:e|er|ing)|builders?|templates?|uploads?|pages?|screens?|buttons?|pdfs?|formats?|fields?|sections?|components?|links?)\b)`,
  String.raw`(?:continu(?:e|es|ed|ing)|carry(?:ing)?\s+on|pick(?:s|ed|ing)?\s+(?:(?:it|this|that)\s+)?(?:back\s+)?up|restart(?:s|ed|ing)?)\s+(?:from\s+)?(?:where|(?:the|my|our|this)\s+(?:interrupted|previous|paused|stopped|last|saved)\b|(?:the\s+)?(?:checkpoint|hand-?off|last\s+(?:checkpoint|session|run)))`,
  String.raw`keep\s+going\b|(?:read|load|open|use|follow)${GAP}hand-?off\b(?!\s+(?:template|format)s?\b)`,
  String.raw`(?:write|prepare|create|make|draft|leave|produce|save|update)${GAP}(?:hand-?off|checkpoint)\b(?!\s+(?:template|format)s?\b)|hand\s+(?:(?:it|this|the\s+work)\s+)?(?:off|over)\b|checkpoint\s+(?:this|the|my|our|progress|it|here|now|work|state|everything)\b`,
  String.raw`(?:continu(?:e|es|ed|ing)|pick(?:s|ed|ing)?\s+up)${upto(4)}from\s+(?:where\b|(?:the\s+|my\s+|our\s+)?(?:saved\s+)?(?:notes|checkpoint|hand-?off)\b)`,
  String.raw`sav(?:e|es|ed|ing)\s+(?:(?:the|my|our)\s+)?(?:current\s+)?(?:task|session|work|run)(?:\s+(?:state|progress))?\b|sav(?:e|es|ed|ing)\s+(?:(?:my|our|the)\s+)?progress\b|sav(?:e|es|ed|ing)\s+where\s+(?:we|i)\b|sav(?:e|es|ed|ing)\s+(?:a\s+)?snapshot\s+of\s+(?:the\s+)?(?:current\s+)?(?:state|work|task|session|progress)\b`,
  String.raw`(?:record|write\s+down|note\s+down)\s+(?:what(?:'s|\s+is|\s+we)|(?:our|the)\s+decisions)`,
].map(verbFirst);
const RECORD_EVERY = /\b(?:record|track|log)\s+every\s+(?:step|stage|decision|change|action|attempt)\b/i;

// Sequencing words count only when they lead a clause: "Next.js" and "the Next button" do not.
const STAGE = /^(?:and\s+)?(?:then|after that|afterwards|next|finally|lastly|once (?:that's|that is|it's|it is) done)\b/i;

const clauses = text => text.replace(/[\u2018\u2019\u02bc]/g, "'").split(CLAUSE_BREAK).map(c => c?.trim()).filter(Boolean);

// A "before" clause names a later step, not the requested one: "verify it before vercel promote".
const requested = clause => clause.replace(/(?:^|\s+)before\s.*$/i, '');
// Subordinate clauses set conditions; the first main clause carries the request's lead verb.
const SUBORDINATE = /^(?:before|after|if|when|whenever|once|until|unless|since|while|because|although|as soon as)\b/i;

// "writing data and publishing its manifest" lists activities; it does not request one.
const LISTED_GERUND = /^(?:and|or)\s+[a-z]+ing\b/i;

const destroys = clause => {
  const removal = clause.match(REMOVE);
  if (removal) return SHARED_RESOURCE.test(removal[1]) && LIVE.test(removal[1]);
  const match = clause.match(DESTRUCTIVE);
  return Boolean(match) && (LIVE.test(match[1]) || (SHARED_RESOURCE.test(match[1]) && !LOCAL.test(match[1])));
};

// Requests that ask for inspection, planning or an answer, judged by the first main clause.
const PREPARATION = verbFirst(String.raw`(?:draft|plan|explain|describe|write|review|check|verify|audit|inspect|summari[sz]e|list|show|find|compare|prepare|outline|document|teach|quiz|diagnose|debug|investigate|look|tell|analy[sz]e|evaluate|assess|estimate|design|propose|suggest|recommend|figure|help|what|which|why|how|when|where|who|whose|is|are|was|were|should|does|do|did|can|could|would|will|if)\b`);
const CARRY_OUT = verbFirst(String.raw`(?:do\s+(?:it|this|that)|finish|complete|execute|perform|carry\s+out|go\s+ahead|proceed|retry|redo|resubmit|try\s+again|go\s+live|land|(?:get|put)\s+(?:it|this|that)\s+(?:out|live|shipped|merged|deployed))\b`);
const mainClause = positive => stripLead(clauses(positive).find(clause => !SUBORDINATE.test(clause)) || '');

export function effectSignals(positive) {
  const all = clauses(positive);
  const heads = all.map(stripLead);
  return {
    external: all.some(clause => REMOTE_COMMAND.test(stripLead(requested(clause))))
      || heads.some((head, i) => !LISTED_GERUND.test(all[i]) && EXTERNAL.some(rule => rule.test(head)))
      || (CUTOVER.test(positive) && !PREPARATION.test(mainClause(positive))),
    destructive: heads.some(destroys),
    exposed: EXPOSED.test(statements(positive)),
    load: LOAD.test(positive) && SHARED_ENVIRONMENT.test(positive),
    continuation: RECORD_EVERY.test(positive) || heads.some(head => CONTINUATION.some(rule => rule.test(head))),
    stages: all.filter(clause => STAGE.test(clause)).length + (positive.match(/\n\s*\d+[.)]/g) || []).length,
  };
}

// Workflows whose apply mode acts on a remote service. Selecting one is evidence of that effect
// only when the selection is explicit and the brief does not ask for preparation, or when the
// request just says to carry the work out ("finish the deployment goal"). A lexical match alone
// is not enough: symptoms such as "env vars missing on vercel" also rank these workflows first.
const REMOTE_WORKFLOWS = ['deploy', 'github-pr', 'github-issue', 'github-release', 'vercel-preview', 'vercel-env'];

export function remoteSelection(positive, selected, explicit = false) {
  if (!REMOTE_WORKFLOWS.includes(selected)) return false;
  const head = mainClause(positive);
  return explicit ? !PREPARATION.test(head) : CARRY_OUT.test(head);
}
