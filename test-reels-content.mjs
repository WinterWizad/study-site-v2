import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { BI_QUESTION_MANIFEST, BI_QUESTION_UNIT_COUNTS } from './reels/bi-question-manifest.mjs';
import { CLOUD_QUESTION_MANIFEST } from './reels/cloud-question-manifest.mjs';
import {
  createHeadingIdAssigner,
  extractReelContent,
  generatedHeadingId,
  htmlToPlain,
  isExcludedHeading,
  parseQuestionHeading,
  plainInline,
  repairMojibake,
  splitInlineMarkdown
} from './reels/content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const subject = {
  id: 'bi',
  code: 'IT 249',
  name: 'Business Intelligence',
  folder: '01-business-intelligence',
  color: '#2563eb'
};

const files = {
  1: 'unit-1-introduction-to-bi.md',
  2: 'unit-2-data-warehousing.md',
  3: 'unit-3-data-mining.md',
  4: 'unit-4-data-visualization.md',
  5: 'unit-5-bi-tools-and-technologies.md',
  6: 'unit-6-bi-implementation.md'
};

const units = Object.entries(files).map(([num, file]) => ({
  num: Number(num),
  title: `Unit ${num}`,
  file
}));

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function sectionEnd(tokens, start) {
  let end = start + 1;
  while (end < tokens.length) {
    const token = tokens[end];
    if (token.type === 'heading' && token.depth <= 2) break;
    end += 1;
  }
  return end;
}

function hasDirectContent(tokens, start) {
  const end = sectionEnd(tokens, start);
  const firstChild = tokens.findIndex((token, index) => index > start && index < end && token.type === 'heading' && token.depth === 3);
  const directEnd = firstChild === -1 ? end : firstChild;
  return tokens.slice(start + 1, directEnd).some(token => {
    if (!['paragraph', 'blockquote', 'list', 'table', 'code', 'html'].includes(token.type)) return false;
    if (token.type === 'paragraph') return Boolean(token.text?.trim());
    if (token.type === 'html') return Boolean(token.text?.trim());
    return true;
  });
}

function parseModelOfficialQuestions(markdown) {
  const questions = new Map();
  let group = null;
  const marksByGroup = { A: '1', B: '3', C: '5', D: '10' };

  for (const line of markdown.split(/\r?\n/)) {
    const groupMatch = line.match(/^### Group "([ABCD])"/);
    if (groupMatch) {
      group = groupMatch[1];
      continue;
    }

    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (!group || !questionMatch) continue;
    const code = `${group}${questionMatch[1]}`;
    questions.set(code, {
      question: questionMatch[2].trim(),
      marks: marksByGroup[group]
    });
  }

  return questions;
}

function parseModelUnitMap(markdown) {
  const section = markdown.split('## What each question demands, and where the answer lives')[1]
    ?.split('### Marks by unit if every question is attempted')[0] || '';
  const units = new Map();

  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([ABCD]\d+)\s*\|[^|]*\|\s*([^|]+?)\s*\|/);
    if (match) units.set(match[1], match[2]);
  }

  return units;
}

function parseBoardOfficialQuestions(markdown) {
  const questions = new Map();
  const marksByGroup = { A: '1', B: '3', C: '5', D: '20' };
  const boardSection = markdown.split('## Real paper — TU 2026')[1]
    ?.split('## Official model question — coverage of Units 1–5')[0] || '';

  for (const line of boardSection.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([ABCD]\d+)\s*\|\s*(.*?)\s*\|\s*(\d+)\s*\|/);
    if (!match) continue;
    const code = match[1];
    questions.set(code, {
      question: match[2],
      unit: Number(match[3]),
      marks: marksByGroup[code[0]]
    });
  }

  return questions;
}

const payload = extractReelContent({
  subject,
  units,
  rootDir: __dirname,
  questionManifest: BI_QUESTION_MANIFEST
});

const entriesByUnitAndAnchor = new Map();
for (const entry of payload.entries) {
  const key = `${entry.unit}|${entry.sourceAnchor}`;
  const matches = entriesByUnitAndAnchor.get(key) || [];
  matches.push(entry);
  entriesByUnitAndAnchor.set(key, matches);
}

const missingHeadings = [];
const unexpectedlyIncluded = [];
const sourceAnchorIdsByUnit = new Map();
const sourceHeadingPositionsByUnit = new Map();

for (const unit of units) {
  const filePath = path.join(__dirname, subject.folder, unit.file);
  const originalMarkdown = fs.readFileSync(filePath, 'utf8');
  const originalTokens = marked.lexer(originalMarkdown);
  const repairedTokens = marked.lexer(repairMojibake(originalMarkdown));
  const sourceHeadings = originalTokens.filter(token => token.type === 'heading');
  const repairedHeadings = repairedTokens.filter(token => token.type === 'heading');
  const assignSourceHeadingId = createHeadingIdAssigner(generatedHeadingId);
  const sourceIds = sourceHeadings.map(heading => assignSourceHeadingId(heading.text));
  const sourceIdsByRepairedHeading = new Map();
  repairedHeadings.forEach((heading, index) => {
    const ids = sourceIdsByRepairedHeading.get(heading.text) || [];
    ids.push(sourceIds[index]);
    sourceIdsByRepairedHeading.set(heading.text, ids);
  });
  sourceAnchorIdsByUnit.set(unit.num, sourceIdsByRepairedHeading);
  const sourceHeadingPositions = new Map();
  repairedTokens.forEach((token, index) => {
    if (token.type !== 'heading') return;
    const positions = sourceHeadingPositions.get(token.text) || [];
    positions.push(index);
    sourceHeadingPositions.set(token.text, positions);
  });
  sourceHeadingPositionsByUnit.set(unit.num, sourceHeadingPositions);
  let parentHeading = null;

  for (let index = 0; index < repairedTokens.length; index += 1) {
    const repaired = repairedTokens[index];
    const original = originalTokens[index];
    if (repaired.type !== 'heading' || (repaired.depth !== 2 && repaired.depth !== 3)) continue;

    if (repaired.depth === 2) {
      parentHeading = {
        text: repaired.text,
        excluded: isExcludedHeading(repaired.text),
        answerSkeleton: /answer skeletons/i.test(repaired.text)
      };
    }

    const ownExcluded = isExcludedHeading(repaired.text);
    const anchor = generatedHeadingId(original.text);
    const matches = entriesByUnitAndAnchor.get(`${unit.num}|${anchor}`) || [];
    const question = parseQuestionHeading(repaired.text);
    const answerSkeletonQuestion = parentHeading?.answerSkeleton && Boolean(question);

    if (repaired.depth === 3 && parentHeading?.excluded && !answerSkeletonQuestion) {
      if (matches.length) {
        unexpectedlyIncluded.push({ unit: unit.num, heading: repaired.text, anchor });
      }
      continue;
    }

    if (ownExcluded) {
      if (matches.length) {
        unexpectedlyIncluded.push({ unit: unit.num, heading: repaired.text, anchor });
      }
      continue;
    }

    if (!matches.length && repaired.depth === 3) {
      missingHeadings.push({ unit: unit.num, heading: repaired.text, anchor });
    }

    if (!matches.length && repaired.depth === 2 && hasDirectContent(repairedTokens, index)) {
      missingHeadings.push({ unit: unit.num, heading: repaired.text, anchor, directContent: true });
    }
  }
}

check('Every source heading is classified exactly once', payload.audit.sourceHeadings === payload.audit.includedHeadings + payload.audit.excludedHeadings.length + payload.audit.containerHeadings + payload.audit.duplicateHeadings, JSON.stringify(payload.audit));
check('All 157 depth-2 and depth-3 BI headings are audited', payload.audit.sourceHeadings === 157, String(payload.audit.sourceHeadings));
check('All included source sections produce feed entries', missingHeadings.length === 0, JSON.stringify(missingHeadings));
check('Excluded sections do not leak into the feed', unexpectedlyIncluded.length === 0, JSON.stringify(unexpectedlyIncluded));
check('Every unit contributes sections', Object.keys(payload.audit.unitCounts).length === 6 && Object.values(payload.audit.unitCounts).every(count => count > 0));
check('Every entry has a stable unique ID', new Set(payload.entries.map(entry => entry.id)).size === payload.entries.length);
check('Every entry links to its own BI unit page', payload.entries.every(entry => entry.sourceUrl === `/bi/unit-${entry.unit}.html#${entry.sourceAnchor}`));
check('Every concept and question contains readable source content', payload.entries.every(entry => entry.parts.length > 0 && entry.parts.every(part => part.text?.trim() || /<svg/i.test(part.html || ''))));
check('Tables and diagrams survive extraction', payload.audit.partCounts.table > 0 && payload.audit.partCounts.diagram > 0 && payload.audit.partCounts.visual > 0, JSON.stringify(payload.audit.partCounts));

const questionEntries = payload.entries.filter(entry => entry.kind === 'question');
const actualQuestions = questionEntries.map(entry => [entry.unit, entry.code, entry.questionText]);
const manifestById = new Map(BI_QUESTION_MANIFEST.map(question => [question.id, question]));
const questionEntriesByManifestId = new Map(questionEntries.map(entry => [entry.manifestId, entry]));
const boardQuestionText = fs.readFileSync(path.join(__dirname, subject.folder, 'question-bank.md'), 'utf8');
const modelQuestionText = fs.readFileSync(path.join(__dirname, subject.folder, 'model-question.md'), 'utf8');
const officialBoardQuestions = parseBoardOfficialQuestions(boardQuestionText);
const officialModelQuestions = parseModelOfficialQuestions(modelQuestionText);
const officialModelUnits = parseModelUnitMap(modelQuestionText);

check('The feed contains every audited mapped question', actualQuestions.length === BI_QUESTION_MANIFEST.length, String(actualQuestions.length));
check('The audited manifest contains 42 distinct coded questions', BI_QUESTION_MANIFEST.length === 42 && new Set(BI_QUESTION_MANIFEST.map(question => `${question.paper}|${question.code}`)).size === 42);
check('The audited manifest covers all six BI units', JSON.stringify(BI_QUESTION_UNIT_COUNTS) === JSON.stringify({ 1: 6, 2: 11, 3: 9, 4: 6, 5: 6, 6: 4 }), JSON.stringify(BI_QUESTION_UNIT_COUNTS));
check('Every manifest question is represented exactly once', questionEntries.length === BI_QUESTION_MANIFEST.length && questionEntries.every(entry => entry.manifestId && manifestById.has(entry.manifestId)) && new Set(questionEntries.map(entry => entry.manifestId)).size === BI_QUESTION_MANIFEST.length);
check('Every manifest display question matches the feed exactly', questionEntries.every(entry => entry.questionText === manifestById.get(entry.manifestId)?.displayQuestion));
check('Every manifest official question is preserved in the feed metadata', questionEntries.every(entry => entry.officialQuestion === manifestById.get(entry.manifestId)?.officialQuestion));

const boardManifestEntries = BI_QUESTION_MANIFEST.filter(question => question.paper === 'board');
const boardManifestMismatches = boardManifestEntries.filter(question => {
  const official = officialBoardQuestions.get(question.code);
  return !official
    || official.question !== question.officialQuestion
    || official.unit !== question.unit
    || official.marks !== question.marks;
});
check('The board manifest exactly matches all 20 official board-paper questions', boardManifestEntries.length === 20 && officialBoardQuestions.size === 20 && boardManifestMismatches.length === 0, JSON.stringify(boardManifestMismatches));

const modelManifestEntries = BI_QUESTION_MANIFEST.filter(question => question.paper === 'model');
const modelManifestMismatches = modelManifestEntries.filter(question => {
  const official = officialModelQuestions.get(question.code);
  const officialUnit = officialModelUnits.get(question.code);
  const expectedUnit = question.code === 'D21' ? 6 : Number(officialUnit);
  return !official
    || !officialUnit
    || official.question !== question.officialQuestion
    || official.marks !== question.marks
    || expectedUnit !== question.unit;
});
check('The model manifest exactly matches all 22 official model-paper questions', modelManifestEntries.length === 22 && officialModelQuestions.size === 22 && officialModelUnits.size === 22 && modelManifestMismatches.length === 0, JSON.stringify(modelManifestMismatches));
check('The cross-unit D21 case is filed with its complete worked answer in Unit 6', manifestById.get('model-d21')?.unit === 6 && officialModelUnits.get('D21') === '2 + 6');

check('Every mapped question has an answer', questionEntries.every(entry => entry.parts.some(part => part.section === 'answer')));
check('Every mapped question links to a source anchor in its own unit', questionEntries.every(entry => entry.sourceUrl === `/bi/unit-${entry.unit}.html#${entry.sourceAnchor}`));

const manifestAnchorMismatches = BI_QUESTION_MANIFEST.filter(question => {
  const sourceIds = sourceAnchorIdsByUnit.get(question.unit)?.get(question.sourceHeading) || [];
  const occurrence = question.sourceHeadingOccurrence ?? 1;
  const expectedSourceId = sourceIds[occurrence - 1];
  const entry = questionEntriesByManifestId.get(question.id);
  return !entry || !expectedSourceId || entry.sourceAnchor !== expectedSourceId;
});
check('Every mapped question points to its exact generated source-heading occurrence', manifestAnchorMismatches.length === 0, JSON.stringify(manifestAnchorMismatches));

const cloudSubject = {
  id: 'cloud',
  code: 'IT 277',
  name: 'Cloud Computing',
  folder: '03-cloud-computing',
  color: '#7c3aed'
};
const cloudUnits = Array.from({ length: 7 }, (_, index) => {
  const num = index + 1;
  return { num, title: `Unit ${num}`, file: [
    'unit-1-introduction.md',
    'unit-2-architecture.md',
    'unit-3-applications.md',
    'unit-4-virtualization.md',
    'unit-5-mapreduce.md',
    'unit-6-security.md',
    'unit-7-platforms.md'
  ][index] };
});
const cloudPayload = extractReelContent({
  subject: cloudSubject,
  units: cloudUnits,
  rootDir: __dirname,
  questionManifest: CLOUD_QUESTION_MANIFEST
});
const cloudQuestions = cloudPayload.entries.filter(entry => entry.kind === 'question');
const cloudCodes = cloudQuestions.map(entry => entry.code);
const cloudOfficialText = fs.readFileSync(path.join(__dirname, cloudSubject.folder, 'model-question.md'), 'utf8');
check('Cloud feed maps all 22 official model questions exactly once', cloudQuestions.length === 22 && new Set(cloudCodes).size === 22 && CLOUD_QUESTION_MANIFEST.length === 22, JSON.stringify({ questions: cloudQuestions.length, uniqueCodes: new Set(cloudCodes).size }));
check('Cloud manifest preserves every official question wording', CLOUD_QUESTION_MANIFEST.every(question => cloudOfficialText.includes(question.officialQuestion)), JSON.stringify(CLOUD_QUESTION_MANIFEST.filter(question => !cloudOfficialText.includes(question.officialQuestion)).map(question => question.id)));
check('Every Cloud unit contributes source sections', Object.keys(cloudPayload.audit.unitCounts).length === 7 && Object.values(cloudPayload.audit.unitCounts).every(count => count > 0), JSON.stringify(cloudPayload.audit.unitCounts));
check('Cloud source links are root-absolute', cloudPayload.entries.every(entry => entry.sourceUrl === `/cloud/unit-${entry.unit}.html#${entry.sourceAnchor}`), String(cloudPayload.entries.find(entry => !entry.sourceUrl.startsWith('/cloud/unit-'))?.sourceUrl || ''));
check('Every Cloud question has answer content', cloudQuestions.every(entry => entry.parts.some(part => part.section === 'answer')), JSON.stringify(cloudQuestions.filter(entry => !entry.parts.some(part => part.section === 'answer')).map(entry => entry.id)));

const duplicateSourceIds = [];
for (const unit of units) {
  const ids = sourceAnchorIdsByUnit.get(unit.num);
  const seen = new Set();
  for (const sourceIdList of ids.values()) {
    for (const sourceId of sourceIdList) {
      if (seen.has(sourceId)) duplicateSourceIds.push({ unit: unit.num, sourceId });
      seen.add(sourceId);
    }
  }
}
check('Generated source-heading IDs are unique within every unit', duplicateSourceIds.length === 0, JSON.stringify(duplicateSourceIds));

const expectedManifestOrder = [...BI_QUESTION_MANIFEST]
  .sort((left, right) => {
    if (left.unit !== right.unit) return left.unit - right.unit;
    const leftPositions = sourceHeadingPositionsByUnit.get(left.unit)?.get(left.sourceHeading) || [];
    const rightPositions = sourceHeadingPositionsByUnit.get(right.unit)?.get(right.sourceHeading) || [];
    const leftPosition = leftPositions[(left.sourceHeadingOccurrence ?? 1) - 1] ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = rightPositions[(right.sourceHeadingOccurrence ?? 1) - 1] ?? Number.MAX_SAFE_INTEGER;
    if (leftPosition !== rightPosition) return leftPosition - rightPosition;
    return BI_QUESTION_MANIFEST.indexOf(left) - BI_QUESTION_MANIFEST.indexOf(right);
  })
  .map(question => question.id);
const actualManifestOrder = questionEntries.map(entry => entry.manifestId);
check('Mapped questions keep source order', JSON.stringify(actualManifestOrder) === JSON.stringify(expectedManifestOrder), JSON.stringify({ actualManifestOrder, expectedManifestOrder }));

check('No Unit 1 mojibake reaches the feed', !JSON.stringify(payload).match(/[âÂÃð]/));

const inlineCodeNarration = plainInline('Use `fact_sales` with `dim_product` when recency < 30 days AND average basket > NPR 2,000');
check('Narration preserves code identifiers and comparison operators', inlineCodeNarration.includes('fact_sales') && inlineCodeNarration.includes('dim_product') && inlineCodeNarration.includes('< 30 days') && inlineCodeNarration.includes('> NPR 2,000'), inlineCodeNarration);

const plainHtmlComparison = htmlToPlain('<p>Use <code>fact_sales</code> when recency < 30 days AND average basket > NPR 2,000.</p>');
check('Plain-text extraction does not treat comparisons as HTML', plainHtmlComparison.includes('fact_sales') && plainHtmlComparison.includes('< 30 days') && plainHtmlComparison.includes('> NPR 2,000'), plainHtmlComparison);

const abbreviationChunks = splitInlineMarkdown('A sentence with e.g. a value and another sentence.');
const abbreviationNarration = abbreviationChunks.map(plainInline).join(' ');
check('Sentence splitting preserves text before abbreviations', abbreviationNarration === 'A sentence with e.g. a value and another sentence.', abbreviationNarration);

const inlinePrefixChunks = splitInlineMarkdown('Warning sentence. Second sentence. Each point must say *what improves as a result*.');
const inlinePrefixNarration = inlinePrefixChunks.map(plainInline).join(' ');
check('Sentence splitting preserves a prefix before an inline token', inlinePrefixNarration === 'Warning sentence. Second sentence. Each point must say what improves as a result.', inlinePrefixNarration);

const malformedEmphasisChunks = splitInlineMarkdown('⚠ **Trap:**Writing loses the mark.');
const malformedEmphasisNarration = malformedEmphasisChunks.map(plainInline).join(' ');
check('Malformed emphasis never reaches the transcript as literal markers', !malformedEmphasisNarration.includes('*') && malformedEmphasisNarration.includes('Trap:'), malformedEmphasisNarration);

const payloadTextParts = payload.entries.flatMap(entry => entry.parts).filter(part => part.type === 'text');
const payloadTextMismatches = payloadTextParts.filter(part => htmlToPlain(part.html) !== part.text);
const orphanedMarkerParts = payloadTextParts.filter(part => part.text.includes('*'));
check('Every rendered text part matches its narration text', payloadTextMismatches.length === 0, JSON.stringify(payloadTextMismatches.slice(0, 5)));
check('No rendered text part contains orphaned Markdown markers', orphanedMarkerParts.length === 0, JSON.stringify(orphanedMarkerParts.slice(0, 5)));

const allNarrationText = payload.entries.flatMap(entry => entry.parts).map(part => part.text || '').join(' ');
check('The feed narration retains warehouse identifiers', allNarrationText.includes('fact_sales') && allNarrationText.includes('dim_product'));
check('The feed narration retains comparison operators', allNarrationText.includes('< 30 days') && allNarrationText.includes('> NPR 2,000'));

const requiredSourcePhrases = [
  'Each point must say what improves as a result.',
  'The exam likes the distinction:',
  'Industry rule:',
  'Three groups fall out:',
  'Always quote support',
  'It finds rules above',
  'Ask of every tile:',
  'No individual number is false; the',
  'That is a pattern of',
  "(This is also why §5.1's definition insisted on",
  'When a case question asks you to "propose an approach", say how you will know it worked —',
  "C1's word"
];
const missingSourcePhrases = requiredSourcePhrases.filter(phrase => !allNarrationText.includes(phrase));
check('The feed retains every audited source phrase affected by sentence splitting', missingSourcePhrases.length === 0, JSON.stringify(missingSourcePhrases));

const sourceInlineCandidates = [];
for (const unit of units) {
  const markdown = repairMojibake(fs.readFileSync(path.join(__dirname, subject.folder, unit.file), 'utf8'));
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'paragraph') sourceInlineCandidates.push(token.text ?? '');
    if (token.type === 'blockquote') {
      for (const child of token.tokens ?? []) {
        if (child.type === 'paragraph') sourceInlineCandidates.push(child.text ?? '');
      }
    }
    if (token.type === 'list') {
      for (const item of token.items ?? []) sourceInlineCandidates.push(item.text ?? '');
    }
  }
}
const wordSequence = value => plainInline(value).match(/[\p{L}\p{N}]+/gu) ?? [];
const incompleteSourceSegments = sourceInlineCandidates.filter(candidate => {
  const sourceWords = wordSequence(candidate);
  const outputWords = wordSequence(splitInlineMarkdown(candidate).map(plainInline).join(' '));
  return JSON.stringify(sourceWords) !== JSON.stringify(outputWords);
});
check('Sentence splitting preserves every source word', incompleteSourceSegments.length === 0, JSON.stringify(incompleteSourceSegments.slice(0, 3)));

const sourceTableSignatures = new Set();
for (const unit of units) {
  const markdown = repairMojibake(fs.readFileSync(path.join(__dirname, subject.folder, unit.file), 'utf8'));
  for (const token of marked.lexer(markdown)) {
    if (token.type !== 'table') continue;
    sourceTableSignatures.add(JSON.stringify({
      header: (token.header ?? []).map(cell => plainInline(cell.text ?? '')),
      rows: (token.rows ?? []).map(row => row.map(cell => plainInline(cell.text ?? '')))
    }));
  }
}
const payloadTableSignatures = payload.entries
  .flatMap(entry => entry.parts)
  .filter(part => part.type === 'table')
  .map(part => JSON.stringify({
    header: (part.header ?? []).map(cell => cell.text),
    rows: (part.rows ?? []).map(row => row.map(cell => cell.text))
  }));
const alteredTableSignatures = payloadTableSignatures.filter(signature => !sourceTableSignatures.has(signature));
check('Every table keeps its source header and row boundaries', alteredTableSignatures.length === 0, JSON.stringify(alteredTableSignatures.slice(0, 3)));

const fixtureRoot = fs.mkdtempSync(path.join(process.env.TEMP || '.', 'quick-reels-content-'));
try {
  const fixtureFolder = path.join(fixtureRoot, 'fixture-subject');
  fs.mkdirSync(fixtureFolder, { recursive: true });
  fs.writeFileSync(path.join(fixtureFolder, 'unit-1.md'), `# Reusable Unit\n\n## Reusable details\n\n<details>\n<summary>Answers</summary>\n\n1. **First answer.** Keep this wording.\n</details>\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureFolder, 'unit-2.md'), `# Unsupported Unit\n\n## Unsupported HTML\n\n<div>Raw HTML must not disappear silently.</div>\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureFolder, 'unit-3.md'), `# Inline HTML Unit\n\n## Inline HTML\n\nThis sentence contains <iframe src="https://example.invalid"></iframe> unsupported HTML.\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureFolder, 'unit-4.md'), `# Details HTML Unit\n\n## Details HTML\n\n<details>\n<summary>Answers</summary>\n\n<div>Raw HTML inside details.</div>\n</details>\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureFolder, 'unit-5.md'), `# Nested Inline Unit\n\n## Nested Inline HTML\n\nThis has *emphasized <span>raw</span> HTML*.\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureFolder, 'unit-6.md'), `# Table HTML Unit\n\n## Table HTML\n\n| Heading |\n|---|\n| <span>raw</span> |\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureFolder, 'unit-7.md'), `# Details Table Unit\n\n## Details Table HTML\n\n<details>\n<summary>Answers</summary>\n\n| Heading |\n|---|\n| <span>raw</span> |\n</details>\n`, 'utf8');

  const fixtureSubject = { id: 'fixture', code: 'FX 1', name: 'Fixture', folder: 'fixture-subject', color: '#2563eb' };
  const reusablePayload = extractReelContent({
    subject: fixtureSubject,
    units: [{ num: 1, title: 'Reusable Unit', file: 'unit-1.md' }],
    rootDir: fixtureRoot,
    questionManifest: []
  });
  const reusablePart = reusablePayload.entries.flatMap(entry => entry.parts)[0];
  check('Reusable details blocks retain their summary and answer text', Boolean(reusablePart?.html.includes('<details') && reusablePart?.text.includes('Answers') && reusablePart?.text.includes('First answer. Keep this wording.')), JSON.stringify(reusablePart));

  let unsupportedError = null;
  try {
    extractReelContent({
      subject: fixtureSubject,
      units: [{ num: 2, title: 'Unsupported Unit', file: 'unit-2.md' }],
      rootDir: fixtureRoot,
      questionManifest: []
    });
  } catch (error) {
    unsupportedError = error;
  }
  check('Unsupported HTML blocks fail the build instead of disappearing', /Unsupported Quick Reels HTML block/.test(unsupportedError?.message || ''), unsupportedError?.message || 'no error');

  let inlineHtmlError = null;
  try {
    extractReelContent({
      subject: fixtureSubject,
      units: [{ num: 3, title: 'Inline HTML Unit', file: 'unit-3.md' }],
      rootDir: fixtureRoot,
      questionManifest: []
    });
  } catch (error) {
    inlineHtmlError = error;
  }
  check('Unsupported inline HTML fails the build instead of disappearing', /Unsupported Quick Reels inline HTML/.test(inlineHtmlError?.message || ''), inlineHtmlError?.message || 'no error');

  let detailsHtmlError = null;
  try {
    extractReelContent({
      subject: fixtureSubject,
      units: [{ num: 4, title: 'Details HTML Unit', file: 'unit-4.md' }],
      rootDir: fixtureRoot,
      questionManifest: []
    });
  } catch (error) {
    detailsHtmlError = error;
  }
  check('Unsupported HTML inside details fails the build instead of disappearing', /Unsupported Quick Reels HTML inside a <details> block/.test(detailsHtmlError?.message || ''), detailsHtmlError?.message || 'no error');

  let nestedInlineHtmlError = null;
  try {
    extractReelContent({
      subject: fixtureSubject,
      units: [{ num: 5, title: 'Nested Inline Unit', file: 'unit-5.md' }],
      rootDir: fixtureRoot,
      questionManifest: []
    });
  } catch (error) {
    nestedInlineHtmlError = error;
  }
  check('Unsupported nested inline HTML fails the build', /Unsupported Quick Reels inline HTML/.test(nestedInlineHtmlError?.message || ''), nestedInlineHtmlError?.message || 'no error');

  let tableCellHtmlError = null;
  try {
    extractReelContent({
      subject: fixtureSubject,
      units: [{ num: 6, title: 'Table HTML Unit', file: 'unit-6.md' }],
      rootDir: fixtureRoot,
      questionManifest: []
    });
  } catch (error) {
    tableCellHtmlError = error;
  }
  check('Unsupported HTML inside table cells fails the build', /Unsupported Quick Reels HTML inside a table cell/.test(tableCellHtmlError?.message || ''), tableCellHtmlError?.message || 'no error');

  let detailsTableHtmlError = null;
  try {
    extractReelContent({
      subject: fixtureSubject,
      units: [{ num: 7, title: 'Details Table Unit', file: 'unit-7.md' }],
      rootDir: fixtureRoot,
      questionManifest: []
    });
  } catch (error) {
    detailsTableHtmlError = error;
  }
  check('Unsupported HTML inside details table cells fails the build', /Unsupported Quick Reels HTML inside a (?:<details> block|table cell)/.test(detailsTableHtmlError?.message || '') && /<span>/.test(detailsTableHtmlError?.message || ''), detailsTableHtmlError?.message || 'no error');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log(`\nQuick Reels content checks: ${passed} passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
