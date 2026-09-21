import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuiz, presentQuestion, answerQuestion, reviewFreeText, quizReport } from '../plugins/just-vibe/scripts/lib/teaching.mjs';
import { main } from '../plugins/just-vibe/scripts/toolkit.mjs';

function question() { return { prompt: 'You already have a reference to node B. How much work does inserting X immediately after B require?',
  concept: 'Known-node insertion', correctOptionId: 'constant',
  options: [
    { id: 'constant', label: 'Constant time', description: 'Update a fixed number of links.' },
    { id: 'linear', label: 'Linear time', description: 'Walk every node in the list.' },
    { id: 'quadratic', label: 'Quadratic time', description: 'Compare every pair of nodes.' },
  ], explanation: 'With B already known, point X to B.next and B.next to X. Finding B from the head would be a separate linear traversal.' }; }
function pending(dialog = 'codex-async', options = {}) { return presentQuestion(createQuiz({ topic: 'Linked lists', ...options }), question(), dialog); }
function response(quiz, selection) { return { questionId: quiz.pending.id, submitted: true, selection }; }

test('native adapters emit exactly one schema-shaped question without the answer key or explanation', () => {
  for (const [dialog, tool] of [['codex-async', 'request_user_input_async'], ['codex', 'request_user_input'], ['claude', 'AskUserQuestion']]) {
    const { quiz, presentation } = pending(dialog);
    assert.equal(presentation.tool, tool);
    assert.equal(presentation.arguments.questions.length, 1);
    const q = presentation.arguments.questions[0];
    assert.equal(q.options.length, 3);
    assert.ok(!JSON.stringify(presentation).includes('correctOptionId'));
    assert.ok(!JSON.stringify(presentation).includes(question().explanation));
    assert.equal(quiz.status, 'awaiting-answer');
    assert.deepEqual(new Set(quiz.pending.options.map(o => o.id)), new Set(['constant', 'linear', 'quadratic']));
    if (dialog === 'claude') assert.equal(q.multiSelect, false);
    if (dialog === 'codex') assert.equal(q.id, quiz.pending.id);
    if (dialog === 'codex-async') assert.ok(q.options.every(o => typeof o === 'string'));
  }
});

test('no native dialog means a clear blocker, not inline fallback', () => {
  assert.throws(() => pending('none'), /native question dialog/);
  assert.throws(() => pending('terminal'), /native question dialog/);
});

test('empty, absent, timed-out or preselected-but-unsubmitted answers do not advance or grade', () => {
  const { quiz } = pending();
  for (const answer of [undefined, null, {}, { selection: 'constant' }, { submitted: false, selection: 'constant' }]) {
    const result = answerQuestion(quiz, answer);
    assert.equal(result.waiting, true);
    assert.equal(result.feedback, null);
    assert.deepEqual(result.quiz, quiz);
  }
  assert.throws(() => presentQuestion(quiz, question(), 'claude'), /Wait/);
});

test('actual submitted choices are graded by identity after shuffling and explanations follow submission', () => {
  const { quiz, presentation } = pending();
  const correct = quiz.pending.options.find(o => o.id === 'constant');
  const exactLabel = `${correct.label} — ${correct.description}`;
  assert.ok(presentation.arguments.questions[0].options.includes(exactLabel));
  const answer = answerQuestion(quiz, response(quiz, exactLabel));
  assert.equal(answer.feedback.result, 'correct');
  assert.equal(answer.feedback.explanation, question().explanation);
  assert.equal(answer.quiz.difficulty, 2);
  assert.equal(answer.quiz.pending, null);
  assert.equal(quiz.answers.length, 0);
  const wrong = answerQuestion(quiz, response(quiz, 'linear'));
  assert.equal(wrong.feedback.result, 'incorrect');
  assert.ok(wrong.nextFocus.includes('Known-node insertion'));
});

test('skips and cancellation are separate from wrong answers and enforce the question limit', () => {
  const { quiz } = pending('claude', { maxQuestions: 1 });
  const skipped = answerQuestion(quiz, { ...response(quiz), skipped: true });
  const report = quizReport(skipped.quiz);
  assert.equal(report.graded, 0); assert.equal(report.skipped, 1); assert.equal(report.correct, 0);
  assert.equal(report.status, 'completed');
  assert.throws(() => presentQuestion(skipped.quiz, question(), 'claude'));
  const cancelled = answerQuestion(quiz, { ...response(quiz), cancelled: true });
  assert.equal(cancelled.quiz.status, 'cancelled'); assert.equal(cancelled.quiz.answers.length, 0);
});

test('stale submissions cannot answer a new question or another quiz', () => {
  const first = pending(), second = pending();
  assert.notEqual(first.quiz.pending.id, second.quiz.pending.id);
  assert.throws(() => answerQuestion(second.quiz, response(first.quiz, 'constant')), /different question/);
  const answered = answerQuestion(first.quiz, response(first.quiz, 'constant'));
  const next = presentQuestion(answered.quiz, question(), 'codex');
  assert.throws(() => answerQuestion(next.quiz, response(first.quiz, 'constant')), /different question/);
});

test('custom free text waits for grounded review instead of guessing a clicked answer', () => {
  const { quiz } = pending();
  const result = answerQuestion(quiz, { ...response(quiz), freeText: 'Two link assignments, assuming B is already known.' });
  assert.equal(result.needsReview, true); assert.equal(result.feedback, null);
  assert.equal(result.quiz.answers.length, 0);
  assert.throws(() => presentQuestion(result.quiz, question(), 'claude'));
  const reviewed = reviewFreeText(result.quiz, { result: 'correct', explanation: 'The response correctly identifies fixed link work and the known-node assumption.' });
  assert.equal(reviewed.feedback.result, 'correct');
  assert.equal(reviewed.feedback.response, 'Two link assignments, assuming B is already known.');
});

test('test mode defers correctness and explanations until completion', () => {
  const { quiz } = pending('codex', { mode: 'test', maxQuestions: 2 });
  const first = answerQuestion(quiz, response(quiz, 'constant'));
  assert.deepEqual(first.feedback, { questionId: quiz.pending.id, recorded: true });
  assert.equal(first.nextFocus, undefined);
  assert.equal(first.quiz.difficulty, quiz.difficulty);
  assert.equal(quizReport(first.quiz).answers, undefined);
  assert.equal(quizReport(first.quiz).correct, undefined);
  const next = presentQuestion(first.quiz, question(), 'codex');
  const final = answerQuestion(next.quiz, response(next.quiz, 'linear'));
  const report = quizReport(final.quiz);
  assert.equal(report.status, 'completed'); assert.equal(report.correct, 1);
  assert.equal(report.answers.length, 2); assert.deepEqual(report.revisit, ['Known-node insertion']);
});

test('bad questions, duplicate labels and answer hints are rejected before opening a dialog', () => {
  for (const mutate of [
    q => { q.options = []; }, q => { q.correctOptionId = 'absent'; },
    q => { q.options[0].label = 'Correct answer'; },
    q => { q.options[1].label = q.options[0].label; },
  ]) {
    const q = question(); mutate(q);
    assert.throws(() => presentQuestion(createQuiz({ topic: 'Lists' }), q, 'claude'));
  }
});

test('questions reject answer aliases shared by different choices before shuffling', () => {
  for (const mutate of [
    q => { q.options[0].label = q.options[1].id; },
    q => { q.options[0].label = `${q.options[1].label} — ${q.options[1].description}`; },
  ]) {
    const q = question();
    q.options = [
      { id: 'a', label: 'Alpha', description: 'First variable.' },
      { id: 'b', label: 'Beta', description: 'Second variable.' },
      { id: 'c', label: 'Gamma', description: 'Third variable.' },
    ];
    q.correctOptionId = 'a'; mutate(q);
    assert.throws(() => presentQuestion(createQuiz({ topic: 'Variable names' }), q, 'codex'), /unambiguous/);
  }
  const q = question(); q.options[0].label = q.options[0].id;
  const { quiz } = presentQuestion(createQuiz({ topic: 'Variables' }), q, 'codex');
  assert.equal(answerQuestion(quiz, response(quiz, q.options[0].id)).feedback.result, 'correct');
});

test('legacy pending questions refuse ambiguous answers in every shuffle order', () => {
  const { quiz } = pending('codex');
  const choices = [
    { id: 'a', label: 'b', description: 'Variable b.' },
    { id: 'b', label: 'a', description: 'Variable a.' },
    { id: 'c', label: 'c', description: 'Variable c.' },
  ];
  for (const order of ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']) {
    const legacy = structuredClone(quiz);
    legacy.pending.options = [...order].map(id => choices.find(o => o.id === id));
    legacy.pending.correctOptionId = 'a';
    const before = structuredClone(legacy);
    assert.throws(() => answerQuestion(legacy, response(legacy, 'b')), /Ambiguous answer/);
    assert.deepEqual(legacy, before);
    assert.equal(answerQuestion(legacy, response(legacy, 'b — Variable b.')).feedback.result, 'correct');
  }
});

test('quiz CLI emits adapter payloads but never calls a host tool or starts a model', async () => {
  const logs = [];
  const quiz = createQuiz({ topic: 'Linked lists' });
  assert.equal(await main(['quiz', 'present'], { input: async () => JSON.stringify({ quiz, question: question(), dialog: 'claude' }), log: x => logs.push(x) }), 0);
  const result = JSON.parse(logs[0]);
  assert.equal(result.presentation.tool, 'AskUserQuestion');
  assert.equal(result.quiz.answers.length, 0);
});

test('quiz JSON input accepts an explicit stdin flag as well as the implicit default', async () => {
  for (const flags of [[], ['--stdin']]) {
    const logs = [];
    assert.equal(await main(['quiz', 'create', ...flags], {
      input: async () => JSON.stringify({ topic: 'Linked lists', maxQuestions: 1 }),
      log: value => logs.push(value),
    }), 0);
    const quiz = JSON.parse(logs[0]);
    assert.equal(quiz.topic, 'Linked lists');
    assert.equal(quiz.status, 'ready');
    assert.equal(quiz.maxQuestions, 1);
  }
});
