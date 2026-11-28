const fs = require('fs');
const path = require('path');

const rootSubject = path.resolve(__dirname, '..', '04-it-entrepreneurship-management');
const mirrorSubject = path.join(__dirname, '04-it-entrepreneurship-management');
const distSubject = path.join(__dirname, 'dist', 'entrepreneurship');

const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function countWords(text) {
  const cleaned = text
    .replace(/^\*\(.*?\)\*$/gm, '')
    .replace(/^---$/gm, '');
  const words = cleaned.match(/[A-Za-z0-9\u0900-\u097F][A-Za-z0-9\u0900-\u097F'\-\/\.]*/g) || [];
  return words.length;
}

function answerSections(markdown) {
  const heading = /^### (A\d+|B\d+|C\d+|D\d+)\. (.+)$/gm;
  const found = [];
  let match;
  while ((match = heading.exec(markdown))) {
    found.push({ id: match[1], title: match[2], start: match.index, bodyStart: heading.lastIndex });
  }
  return found.map((item, index) => {
    const end = index + 1 < found.length ? found[index + 1].start : markdown.length;
    return { ...item, body: markdown.slice(item.bodyStart, end) };
  });
}

function assertAnswerBudgets(file, sections) {
  const expected = {
    A: [45, 60],
    B: [180, 250],
    C: [330, 420],
    D: [600, 800],
  };

  for (const section of sections) {
    const group = section.id[0];
    const [min, max] = expected[group];
    const words = countWords(section.body);
    check(words >= min && words <= max, `${path.basename(file)} ${section.id}: ${words} words (required ${min}-${max})`);

    const statedCount = section.body.match(/^\*\((\d+) words\)\*$/m);
    check(Boolean(statedCount), `${path.basename(file)} ${section.id}: missing saved word-count annotation`);
    if (statedCount) {
      check(Number(statedCount[1]) === words, `${path.basename(file)} ${section.id}: annotation says ${statedCount[1]}, saved body has ${words}`);
    }
  }
}

const syncFiles = [
  'README.md',
  'question-bank.md',
  'model-question.md',
  'model-question-answers.md',
  'board-paper-2026.md',
  'unit-1-foundations.md',
  'unit-2-idea-market.md',
  'unit-3-business-model.md',
  'unit-4-legal.md',
  'unit-5-finance-marketing.md',
  'unit-6-leadership-csr.md',
];

for (const name of syncFiles) {
  const canonical = path.join(rootSubject, name);
  const mirror = path.join(mirrorSubject, name);
  check(fs.existsSync(canonical), `Missing canonical file: ${name}`);
  check(fs.existsSync(mirror), `Missing deployment mirror: ${name}`);
  if (fs.existsSync(canonical) && fs.existsSync(mirror)) {
    check(read(canonical) === read(mirror), `Deployment mirror is stale: ${name}`);
  }
}

const modelAnswers = read(path.join(rootSubject, 'model-question-answers.md'));
const boardAnswers = read(path.join(rootSubject, 'board-paper-2026.md'));
const questionBank = read(path.join(rootSubject, 'question-bank.md'));

const modelSections = answerSections(modelAnswers);
const boardSections = answerSections(boardAnswers);
const expectedModelIds = [
  ...Array.from({ length: 10 }, (_, index) => `A${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `B${index + 11}`),
  ...Array.from({ length: 4 }, (_, index) => `C${index + 18}`),
  'D22',
];
const expectedBoardIds = [
  ...Array.from({ length: 10 }, (_, index) => `A${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `B${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `C${index + 1}`),
  'D1',
];
check(JSON.stringify(modelSections.map(section => section.id)) === JSON.stringify(expectedModelIds), 'Model answer IDs or order are wrong');
check(JSON.stringify(boardSections.map(section => section.id)) === JSON.stringify(expectedBoardIds), 'Board answer IDs or order are wrong');
assertAnswerBudgets('model-question-answers.md', modelSections);
assertAnswerBudgets('board-paper-2026.md', boardSections);

check(modelSections.some((section) => section.id === 'D22'), 'Model answers omit compulsory D22');
check(modelSections.some((section) => section.id === 'C21'), 'Model answers omit C21');
check(boardSections.some((section) => section.id === 'D1'), 'Board answers omit case D1');
check(boardSections.some((section) => section.id === 'C4'), 'Board answers omit C4');
check(questionBank.includes('Part 3 — TU 2026 board paper'), 'Question bank omits the 2026 board paper');
check(questionBank.includes('Part 4 — Board-paper coverage map'), 'Question bank omits the board coverage map');
check(questionBank.includes('maximum, not guaranteed'), 'Question bank lacks the maximum-exposure warning');

const unitBoardCoverage = {
  'unit-1-foundations.md': ['Board A1', 'Board A6', 'Board B1'],
  'unit-2-idea-market.md': ['Board A2', 'Board B2', 'Board C1'],
  'unit-3-business-model.md': ['Board A3', 'Board A5', 'Board A7', 'Board B3', 'Board C3'],
  'unit-4-legal.md': ['Board A4', 'Board A8', 'Board B4', 'Board C4'],
  'unit-5-finance-marketing.md': ['Board A9', 'Board A10', 'Board B5', 'Board B7', 'Board C2'],
  'unit-6-leadership-csr.md': ['Board B6'],
};

for (const [file, requiredHeadings] of Object.entries(unitBoardCoverage)) {
  const content = read(path.join(rootSubject, file));
  for (const heading of requiredHeadings) {
    check(content.includes(`### ${heading} `), `${file} omits ${heading}`);
  }
}

const bannedClaims = [
  '10,000+ other Nepali startups',
  '500k+ daily commuters',
  '200k smartphone users',
  '20k riders in Year 1',
  'NIC has incubated 200+ startups',
  '$50M deployed since 2018',
  'dominate Kathmandu',
  'app 60%+ bookings',
  '100% tax holiday',
  'quarterly advance tax',
];

for (const name of syncFiles.filter((file) => file.endsWith('.md'))) {
  const content = read(path.join(rootSubject, name));
  for (const claim of bannedClaims) {
    check(!content.includes(claim), `${name} still contains retired claim: ${claim}`);
  }
}

const distChecks = [
  ['model-question-answers.html', ['D22. Analyse the Pathao-style ride-sharing case', 'C21. Discuss about ethical marketing strategies']],
  ['board-paper-2026.html', ['Lead Founder of a technology-driven startup in Nepal', 'C4. What legal challenges do Nepali IT startups face?']],
  ['question-bank.html', ['Part 3 — TU 2026 board paper', 'Part 4 — Board-paper coverage map']],
  ['index.html', ['board-paper-2026.html', '2026 Board Paper and Answers']],
];

for (const [name, markers] of distChecks) {
  const file = path.join(distSubject, name);
  check(fs.existsSync(file), `Missing built page: ${name}`);
  if (fs.existsSync(file)) {
    const content = read(file);
    for (const marker of markers) {
      check(content.includes(marker), `Built page ${name} lacks marker: ${marker}`);
    }
  }
}

check(fs.existsSync(path.join(distSubject, 'board-paper-2026', 'index.html')), 'Missing clean route alias for the 2026 board paper');
check(read(path.join(distSubject, 'index.html')).includes('board-paper-2026.html'), 'Entrepreneurship subject index omits the 2026 board paper');
for (const subject of ['bi', 'de', 'cloud']) {
  const subjectIndex = read(path.join(__dirname, 'dist', subject, 'index.html'));
  check(!subjectIndex.includes('board-paper-2026.html'), `${subject} subject index links to a board paper it does not have`);
}

const vercelConfig = JSON.parse(read(path.join(__dirname, 'vercel.json')));
const entrepreneurshipRewrite = (vercelConfig.rewrites || []).find(rule => String(rule.source || '').startsWith('/entrepreneurship/'));
check(Boolean(entrepreneurshipRewrite && String(entrepreneurshipRewrite.source).includes('board-paper-2026')), 'Vercel clean-route rewrite omits board-paper-2026');

if (failures.length) {
  console.error(`IT 248 content check failed: ${failures.length}/${checks} checks failed`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`IT 248 content check passed: ${checks}/${checks} checks`);
