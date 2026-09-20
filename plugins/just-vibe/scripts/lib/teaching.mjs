import { randomUUID, randomInt } from 'node:crypto';

const dialogs = new Set(['codex-async', 'codex', 'claude']);
function nonempty(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required.`);
  return value;
}
function checkQuiz(quiz) {
  if (quiz?.schemaVersion !== 1 || quiz.kind !== 'teach-test' || !Array.isArray(quiz.answers)
      || !['ready', 'awaiting-answer', 'awaiting-review', 'completed', 'cancelled'].includes(quiz.status)) throw new Error('Invalid quiz state.');
  return quiz;
}
export function createQuiz({ topic, maxQuestions = 5, difficulty = 1, mode = 'practice' }) {
  nonempty(topic, 'Topic or target workflow');
  if (!Number.isInteger(maxQuestions) || maxQuestions < 1 || maxQuestions > 20) throw new Error('Choose 1–20 questions.');
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 3) throw new Error('Difficulty must be 1, 2 or 3.');
  if (!['practice', 'test'].includes(mode)) throw new Error('Quiz mode must be practice or test.');
  return { schemaVersion: 1, kind: 'teach-test', id: randomUUID(), topic, maxQuestions, difficulty, mode,
    status: 'ready', answers: [], pending: null };
}

function validateQuestion(question) {
  for (const field of ['prompt', 'concept', 'explanation']) nonempty(question[field], field);
  if (!Array.isArray(question.options) || question.options.length !== 3) throw new Error('Use exactly three choices for cross-host compatibility.');
  const ids = new Set(), labels = new Set();
  for (const o of question.options) {
    if (!/^[a-z0-9_-]+$/.test(o.id)) throw new Error('Choice IDs must be stable identifiers.');
    nonempty(o.label, 'Choice label'); nonempty(o.description, 'Choice description');
    if (o.label.trim().split(/\s+/).length > 5 || o.label.length > 80) throw new Error('Choice labels must be short (1–5 words).');
    if (ids.has(o.id) || labels.has(o.label.toLowerCase())) throw new Error('Duplicate choice.');
    if (/\b(?:recommended|correct answer)\b/i.test(o.label + ' ' + o.description)) throw new Error('Do not disclose an answer through option hints.');
    ids.add(o.id); labels.add(o.label.toLowerCase());
  }
  if (!ids.has(question.correctOptionId)) throw new Error('Answer key must identify one of the choices.');
}

export function nativeQuestionPayload(question, dialog) {
  if (!dialogs.has(dialog)) throw new Error('A supported native question dialog is required; do not fall back to inline quiz questions.');
  const options = question.options.map(o => ({ label: o.label, description: o.description }));
  if (dialog === 'codex-async') return { tool: 'request_user_input_async', arguments: {
    questions: [{ title: question.prompt, options: options.map(o => `${o.label} — ${o.description}`) }],
  } };
  if (dialog === 'codex') return { tool: 'request_user_input', arguments: {
    questions: [{ id: question.id, header: 'Knowledge', question: question.prompt, options }],
  } };
  return { tool: 'AskUserQuestion', arguments: {
    questions: [{ header: 'Knowledge', question: question.prompt, options, multiSelect: false }],
  } };
}

export function presentQuestion(quiz, question, dialog) {
  checkQuiz(quiz);
  if (quiz.status !== 'ready' || quiz.pending) throw new Error('Wait for and review the current answer before asking another question.');
  if (quiz.answers.length >= quiz.maxQuestions) throw new Error('Question budget exhausted.');
  validateQuestion(question);
  const options = structuredClone(question.options);
  for (let i = options.length - 1; i > 0; i--) { const j = randomInt(i + 1); [options[i], options[j]] = [options[j], options[i]]; }
  const pending = { ...structuredClone(question), id: `q_${quiz.id.replaceAll('-', '_')}_${quiz.answers.length + 1}`, options, dialog };
  const presentation = nativeQuestionPayload(pending, dialog);
  return { quiz: { ...structuredClone(quiz), pending, status: 'awaiting-answer' }, presentation };
}

function assessed(quiz, response, result, explanation) {
  const next = structuredClone(quiz);
  const q = next.pending;
  const answer = { questionId: q.id, prompt: q.prompt, concept: q.concept, response, result,
    correctLabel: q.options.find(o => o.id === q.correctOptionId).label, explanation };
  next.answers.push(answer);
  next.pending = null;
  if (next.mode === 'practice' && result !== 'skipped') next.difficulty = Math.max(1, Math.min(3, next.difficulty + (result === 'correct' ? 1 : -1)));
  next.status = next.answers.length >= next.maxQuestions ? 'completed' : 'ready';
  const feedback = next.mode === 'practice' ? answer : { questionId: answer.questionId, recorded: true };
  return { quiz: next, feedback, ...(next.mode === 'practice' ? {
    nextFocus: result === 'correct' ? 'Apply or extend the concept.' : `Revisit ${q.concept} with a simpler or differently framed example.`,
  } : {}) };
}

export function answerQuestion(quiz, response) {
  checkQuiz(quiz);
  if (!quiz.pending || quiz.status !== 'awaiting-answer') throw new Error('No unanswered native question is pending.');
  // Async tool calls returning immediately, empty submissions and timeouts are not answers.
  if (!response || response.submitted !== true) return { quiz: structuredClone(quiz), feedback: null, waiting: true };
  if (response.questionId !== quiz.pending.id) throw new Error('Answer belongs to a different question.');
  if (response.cancelled) return { quiz: { ...structuredClone(quiz), status: 'cancelled' }, feedback: null };
  if (response.skipped) return assessed(quiz, null, 'skipped', quiz.pending.explanation);
  const selected = quiz.pending.options.find(o => o.id === response.selection || o.label === response.selection || `${o.label} — ${o.description}` === response.selection);
  if (selected) return assessed(quiz, response.selection, selected.id === quiz.pending.correctOptionId ? 'correct' : 'incorrect', quiz.pending.explanation);
  if (typeof response.freeText === 'string' && response.freeText.trim()) {
    const next = structuredClone(quiz);
    next.status = 'awaiting-review'; next.pending.freeText = response.freeText;
    return { quiz: next, feedback: null, needsReview: true };
  }
  throw new Error('Unrecognized answer. Preserve the pending question; do not infer a selection.');
}

export function reviewFreeText(quiz, judgment) {
  checkQuiz(quiz);
  if (quiz.status !== 'awaiting-review' || !quiz.pending?.freeText) throw new Error('No free-text answer awaits review.');
  if (!['correct', 'partial', 'incorrect'].includes(judgment.result)) throw new Error('Invalid review result.');
  nonempty(judgment.explanation, 'Grounded explanation of the learner answer');
  return assessed(quiz, quiz.pending.freeText, judgment.result, judgment.explanation);
}

export function quizReport(quiz) {
  checkQuiz(quiz);
  const correct = quiz.answers.filter(a => a.result === 'correct').length;
  const incorrect = quiz.answers.filter(a => ['incorrect', 'partial'].includes(a.result));
  const finished = ['completed', 'cancelled'].includes(quiz.status);
  const report = { topic: quiz.topic, status: quiz.status, answered: quiz.answers.length,
    graded: quiz.answers.filter(a => a.result !== 'skipped').length, skipped: quiz.answers.filter(a => a.result === 'skipped').length,
    pending: Boolean(quiz.pending), nextDifficulty: quiz.difficulty,
    note: 'Results describe this short sample, not proof of mastery. No learner profile is saved automatically.' };
  if (quiz.mode === 'practice' || finished) {
    report.correct = correct; report.revisit = [...new Set(incorrect.map(a => a.concept))];
    report.answers = structuredClone(quiz.answers);
  }
  return report;
}
