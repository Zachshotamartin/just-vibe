import { controls } from './controls.mjs';
console.log(JSON.stringify({ kind: 'fixture-controls', modelReviewPerformed: false, results: await controls() }, null, 2));
