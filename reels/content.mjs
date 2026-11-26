import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { marked } from 'marked';
import { normalizeSpeech } from './speech.mjs';

// Reverse Windows-1252 sequences that were decoded as UTF-8 in Unit 1. The
// repair is intentionally local to suspicious runs: a second global pass would
// damage legitimate punctuation elsewhere in the same note.
const CP1252_REVERSE = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
  [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
  [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
  [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F]
]);

const MOJIBAKE_LEAD = /[ÂÃâð]/u;

function byteFor(character) {
  const codePoint = character.codePointAt(0);
  if (codePoint <= 0xFF) return codePoint;
  return CP1252_REVERSE.get(codePoint) ?? null;
}

function decodeMojibakeRun(value) {
  const bytes = [];
  for (const character of value) {
    const byte = byteFor(character);
    if (byte === null) return null;
    bytes.push(byte);
  }

  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
    return decoded.includes('�') ? null : decoded;
  } catch {
    return null;
  }
}

export function repairMojibake(input) {
  const value = String(input ?? '');
  let output = '';
  let index = 0;

  while (index < value.length) {
    const character = value[index];
    if (!MOJIBAKE_LEAD.test(character)) {
      output += character;
      index += 1;
      continue;
    }

    let repaired = null;
    let runLength = 0;
    for (let length = 2; length <= 4 && index + length <= value.length; length += 1) {
      const run = value.slice(index, index + length);
      if ([...run].some(item => !MOJIBAKE_LEAD.test(item) && byteFor(item) === null)) break;
      const candidate = decodeMojibakeRun(run);
      if (candidate && candidate !== run) {
        repaired = candidate;
        runLength = length;
        break;
      }
    }

    if (repaired) {
      output += repaired;
      index += runLength;
    } else {
      output += character;
      index += 1;
    }
  }

  return output;
}

export function escapeHtml(value) {
  const amp = String.fromCharCode(38);
  return String(value ?? '')
    .replace(/&/g, amp + 'amp;')
    .replace(/</g, amp + 'lt;')
    .replace(/>/g, amp + 'gt;')
    .replace(/"/g, amp + 'quot;')
    .replace(/'/g, amp + '#039;');
}

export function decodeEntities(value) {
  const amp = String.fromCharCode(38);
  const entity = name => new RegExp(amp + name + ';', 'gi');
  return String(value ?? '')
    .replace(entity('nbsp'), ' ')
    .replace(entity('lt'), '<')
    .replace(entity('gt'), '>')
    .replace(entity('quot'), '"')
    .replace(new RegExp(amp + '#0?39;' + '|' + amp + 'apos;', 'gi'), "'")
    .replace(entity('amp'), '&');
}

const PLAIN_TEXT_BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'dd', 'details', 'dialog', 'div', 'dl', 'dt',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'svg', 'g', 'defs'
]);

const PLAIN_TEXT_INLINE_TAGS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'del', 'desc', 'em', 'i', 'ins',
  'kbd', 'line', 'mark', 'path', 'polygon', 'polyline', 'q', 'rect', 'rp', 'rt', 'ruby', 's',
  'samp', 'small', 'span', 'strong', 'sub', 'sup', 'text', 'time', 'title', 'u', 'var', 'wbr',
  'circle', 'ellipse'
]);

export function htmlToPlain(html = '') {
  const withoutComments = String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/gi, ' $1 ')
    .replace(/<br\s*\/?\s*>/gi, ' ');

  const withoutTags = withoutComments.replace(
    /<\s*\/?\s*([a-z][a-z0-9:-]*)\b[^>]*>/gi,
    (match, name) => {
      const tag = name.toLowerCase();
      if (PLAIN_TEXT_INLINE_TAGS.has(tag)) return '';
      if (PLAIN_TEXT_BLOCK_TAGS.has(tag)) return ' ';
      return match;
    }
  );

  return decodeEntities(withoutTags)
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeInlineEmphasis(markdown = '') {
  const codeSpans = [];
  const protectedSource = String(markdown ?? '').replace(/(`+)([^`\n]*?)\1/g, match => {
    const index = codeSpans.push(match) - 1;
    return `\uE000${index}\uE001`;
  });

  const source = protectedSource;
  const normalizePairs = (delimiter) => {
    let output = '';
    let cursor = 0;

    while (cursor < source.length) {
      const open = source.indexOf(delimiter, cursor);
      if (open === -1) {
        output += source.slice(cursor);
        break;
      }

      const close = source.indexOf(delimiter, open + delimiter.length);
      if (close === -1) {
        output += source.slice(cursor);
        break;
      }

      const content = source.slice(open + delimiter.length, close);
      if (!content || content.includes('\n')) {
        output += source.slice(cursor, open + delimiter.length);
        cursor = open + delimiter.length;
        continue;
      }

      const trimmed = content.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
      output += `${source.slice(cursor, open)}${delimiter}${trimmed}${delimiter}`;
      cursor = close + delimiter.length;

      const next = source[cursor];
      if (next && /[A-Za-z0-9]/.test(next) && !/[ \t]$/.test(content)) output += ' ';
    }

    return output;
  };

  const strong = normalizePairs('**');
  const normalized = strong.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, (match, prefix, content, offset, fullText) => {
    const trimmed = content.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
    const next = fullText[offset + match.length];
    const separator = next && /[A-Za-z0-9]/.test(next) && !/[ \t]$/.test(content) ? ' ' : '';
    return `${prefix}*${trimmed}*${separator}`;
  });

  return normalized.replace(/\uE000(\d+)\uE001/g, (match, index) => codeSpans[Number(index)] ?? match);
}

export function plainInline(markdown = '') {
  const source = normalizeInlineEmphasis(markdown);
  let html = '';
  try {
    html = marked.parseInline(source);
  } catch {
    html = escapeHtml(source);
  }
  return htmlToPlain(html);
}

function splitSentences(value = '') {
  const text = String(value ?? '');
  if (!text.trim()) return [];

  // Match from the start of the string so punctuation inside abbreviations
  // (for example "e.g.") can never erase the words before it. The regex can
  // leave an unmatched suffix when the next word starts with an inline token,
  // so retain that suffix explicitly instead of silently dropping it.
  const matches = [...text.matchAll(/[\s\S]*?(?:[.!?]+["'”’)]*)(?:\s+|$)/g)];
  if (!matches.length) return [text];

  const pieces = matches.map(match => match[0]);
  const consumed = matches.reduce((length, match) => length + match[0].length, 0);
  const suffix = text.slice(consumed);
  if (suffix.trim()) pieces.push(suffix);

  if (pieces.length < 2) return [text];
  return pieces.filter(piece => piece.trim());
}

function splitMarkdownSentences(value = '') {
  const pieces = splitSentences(value);
  if (pieces.length < 2) return [value];

  const merged = [];
  for (const piece of pieces) {
    const previous = merged[merged.length - 1];
    const isAbbreviation = previous && /\b(?:e\.g|i\.e|etc|vs|fig|no|mr|mrs|ms|dr|prof|resp|approx|u\.s|u\.k)\.$/i.test(previous.trim());
    const isNumberedLead = previous && /^\d{1,2}\.$/.test(previous.trim());
    if (previous && (isAbbreviation || isNumberedLead)) {
      merged[merged.length - 1] = `${previous.trimEnd()} ${piece.trimStart()}`;
    } else {
      merged.push(piece);
    }
  }
  return merged;
}

function endsSentence(value = '') {
  return /[.!?](?:["'”’)]*)$/.test(plainInline(value).trim());
}

export function splitInlineMarkdown(value = '') {
  const source = normalizeInlineEmphasis(value);
  const inlineTokens = marked.Lexer.lexInline(source);
  if (!inlineTokens.length) return splitMarkdownSentences(source);

  assertNoUnsupportedHtml(inlineTokens, 'inline HTML');

  const chunks = [];
  let current = [];

  const flush = () => {
    const chunk = current.join('').trim();
    if (chunk) chunks.push(chunk);
    current = [];
  };

  for (const token of inlineTokens) {
    const raw = token.raw ?? token.text ?? '';
    if (token.type === 'text') {
      for (const sentence of splitMarkdownSentences(raw)) {
        current.push(sentence);
        if (endsSentence(sentence)) flush();
      }
      continue;
    }

    current.push(raw);
    if (endsSentence(raw)) flush();
  }

  flush();
  return chunks.length ? chunks : [source];
}

export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generatedHeadingId(value = '') {
  const renderedInline = marked.parseInline(String(value ?? ''));
  return slugify(renderedInline);
}

export function createHeadingIdAssigner(headingId = value => slugify(value)) {
  const occurrences = new Map();

  return value => {
    const baseId = headingId(value);
    const count = occurrences.get(baseId) ?? 0;
    occurrences.set(baseId, count + 1);
    return count === 0 ? baseId : `${baseId}-${count}`;
  };
}

function hashString(value = '') {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function inlineHtml(markdown = '') {
  return marked.parseInline(normalizeInlineEmphasis(markdown));
}

function cellData(cell) {
  const markdown = cell?.text ?? '';
  const cellTokens = cell?.tokens?.length ? cell.tokens : marked.Lexer.lexInline(markdown);
  assertNoUnsupportedHtml(cellTokens, 'HTML inside a table cell');

  const html = cell?.tokens?.length
    ? cell.tokens.map(token => inlineHtml(token.text ?? token.raw ?? '')).join('')
    : inlineHtml(markdown);

  return {
    html,
    text: plainInline(markdown)
  };
}

function tablePart(token, section) {
  const header = (token.header ?? []).map(cellData);
  const rows = (token.rows ?? []).map(row => row.map(cellData));
  const text = [
    ...header.map(cell => cell.text),
    ...rows.flat().map(cell => cell.text)
  ].filter(Boolean).join(' ');

  return [{
    section,
    type: 'table',
    visual: true,
    header,
    rows,
    text
  }];
}

function codePart(token, section) {
  const lines = String(token.text ?? '').replace(/\n$/, '').split('\n');
  if (!lines.length) return [];

  return [{
    section,
    type: 'diagram',
    visual: true,
    lines,
    text: lines.join('\n')
  }];
}

function nestedBlockParts(tokens = [], section) {
  return tokens.flatMap(token => tokenParts(token, section));
}

function encodeDetailsBlocks(markdown = '') {
  return String(markdown ?? '').replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, match => {
    const encoded = Buffer.from(match, 'utf8').toString('base64');
    return `<div data-quick-reels-details="${encoded}"></div>`;
  });
}

function firstUnsupportedHtmlToken(tokens = []) {
  for (const token of tokens) {
    if (!token) continue;
    if (token.type === 'html') return token;

    const nested = firstUnsupportedHtmlToken(token.tokens ?? []);
    if (nested) return nested;

    for (const item of token.items ?? []) {
      const nestedItem = firstUnsupportedHtmlToken(item?.tokens ?? []);
      if (nestedItem) return nestedItem;
    }

    for (const cell of token.header ?? []) {
      const nestedCell = firstUnsupportedHtmlToken(cell?.tokens ?? []);
      if (nestedCell) return nestedCell;
    }

    for (const row of token.rows ?? []) {
      for (const cell of row ?? []) {
        const nestedCell = firstUnsupportedHtmlToken(cell?.tokens ?? []);
        if (nestedCell) return nestedCell;
      }
    }
  }
  return null;
}

function assertNoUnsupportedHtml(tokens, label) {
  const token = firstUnsupportedHtmlToken(tokens);
  if (!token) return;

  const raw = token.raw ?? token.text ?? '';
  throw new Error(`Unsupported Quick Reels ${label}: ${raw.slice(0, 120).replace(/\s+/g, ' ')}`);
}

function detailsPart(raw, section) {
  const encoded = raw.match(/<div\b[^>]*\bdata-quick-reels-details="([^"]+)"[^>]*><\/div>/i)?.[1];
  const detailsRaw = encoded ? Buffer.from(encoded, 'base64').toString('utf8') : raw;
  const details = detailsRaw.match(/<details\b[^>]*>([\s\S]*?)<\/details>/i);
  if (!details) return null;

  const inner = details[1];
  const summary = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? 'Details';
  const body = inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '');

  assertNoUnsupportedHtml(marked.lexer(summary), 'HTML inside a <details> summary');
  assertNoUnsupportedHtml(marked.lexer(body), 'HTML inside a <details> block');

  const bodyHtml = marked.parse(body);

  return {
    section,
    type: 'text',
    visual: false,
    html: `<details class="reel-details"><summary>${inlineHtml(summary)}</summary>${bodyHtml}</details>`,
    text: `${plainInline(summary)} ${htmlToPlain(bodyHtml)}`.trim()
  };
}

function tokenParts(token, section) {
  if (!token) return [];

  if (token.type === 'paragraph') {
    return splitInlineMarkdown(token.text ?? '').map(sentence => ({
      section,
      type: 'text',
      visual: false,
      html: `<p>${inlineHtml(sentence)}</p>`,
      text: plainInline(sentence)
    }));
  }

  if (token.type === 'blockquote') {
    return nestedBlockParts(token.tokens ?? [], section).map(part => ({
      ...part,
      html: `<blockquote>${part.html}</blockquote>`
    }));
  }

  if (token.type === 'list') {
    return (token.items ?? []).flatMap((item, index) => {
      const tag = token.ordered ? 'ol' : 'ul';
      const itemNumber = (token.start ?? 1) + index;
      const start = token.ordered && itemNumber !== 1 ? ` start="${itemNumber}"` : '';
      const value = token.ordered ? ` value="${itemNumber}"` : '';
      return splitInlineMarkdown(item.text ?? '').map(chunk => ({
        section,
        type: 'text',
        visual: false,
        html: `<${tag}${start} class="reel-list"><li${value}>${inlineHtml(chunk)}</li></${tag}>`,
        text: plainInline(chunk)
      }));
    });
  }

  if (token.type === 'table') return tablePart(token, section);
  if (token.type === 'code') return codePart(token, section);

  if (token.type === 'html') {
    const raw = token.raw ?? token.text ?? '';
    const details = detailsPart(raw, section);
    if (details) return [details];

    throw new Error(`Unsupported Quick Reels HTML block: ${raw.slice(0, 120).replace(/\s+/g, ' ')}`);
  }

  return [];
}

function meaningfulParts(parts) {
  return parts.filter(part => part.text || /<svg/i.test(part.html ?? ''));
}

export function parseQuestionHeading(headingText) {
  // Match codes like A1, B11, C18, C20a, C21a, C20b (half), D22(a), D22(b)
  // Pattern: letter + digits + optional lowercase letter + optional (text in parens) before the middle dot
  const match = String(headingText).match(/^([ABCD]\d+[a-z]?(?:\([^)]*\))?)\s*(?:\([^)]*\))?\s*·\s*(.+)$/i);
  if (!match) return null;

  const code = match[1].toUpperCase();
  const remainder = match[2].trim();
  const quoted = remainder.match(/[“"]([^”"]+)[”"]/);
  const marks = remainder.match(/\[(\d+)\]/);
  const questionText = quoted
    ? quoted[1].trim()
    : remainder
      .replace(/\[\d+\]/g, '')
      .replace(/^Model Question\s*[—–-]\s*/i, '')
      .trim();

  return {
    code,
    marks: marks?.[1] ?? '',
    questionText
  };
}

function learnInMotionParts(markdown) {
  const svg = markdown.match(/<svg\b[\s\S]*?<\/svg>/i)?.[0];
  if (!svg) return [];

  const diagramTitle = markdown.match(/<h3\b[^>]*>([^<]+)<\/h3>/i)?.[1]?.trim() || 'Learn in Motion';

  const captionsSource = markdown.match(/const\s+captions\s*=\s*\[([\s\S]*?)\];/i)?.[1] ?? '';
  const captions = [];
  const captionPattern = /'((?:\\'|[^'])*)'/g;
  let match;
  while ((match = captionPattern.exec(captionsSource)) !== null) {
    captions.push(match[1].replace(/\\'/g, "'"));
  }

  const captionId = 'reel-learn-in-motion-captions';
  const accessibleSvg = svg.replace(/<svg\b([^>]*)>/i, (match, attributes) => {
    const hasRole = /\brole\s*=/i.test(attributes);
    const hasLabel = /\baria-(?:label|labelledby)\s*=/i.test(attributes);
    const hasDescription = /\baria-describedby\s*=/i.test(attributes);
    const description = hasDescription ? '' : ` aria-describedby="${captionId}"`;
    if (hasLabel) return match.replace(/>$/, `${description}>`);
    const role = hasRole ? '' : ' role="img"';
    return `<svg${attributes}${role} aria-label="${escapeHtml(diagramTitle)}"${description}>`;
  });
  const captionList = captions.length
    ? `<ul class="reel-visual-captions" id="${captionId}">${captions.map(caption => `<li>${escapeHtml(caption)}</li>`).join('')}</ul>`
    : '';

  return [{
    section: 'content',
    type: 'visual',
    visual: true,
    html: `<div class="reel-motion-visual">${accessibleSvg}</div>${captionList}`,
    captions,
    text: captions.join(' ')
  }];
}

function headingEnd(tokens, start, depth) {
  let end = start + 1;
  while (end < tokens.length) {
    const token = tokens[end];
    if (token.type === 'heading' && token.depth <= depth) break;
    end += 1;
  }
  return end;
}

function sectionRange(tokens, start, depth) {
  const end = headingEnd(tokens, start, depth);
  const childHeadings = [];
  for (let index = start + 1; index < end; index += 1) {
    const token = tokens[index];
    if (token.type === 'heading' && token.depth === depth + 1) {
      childHeadings.push({ token, index });
    }
  }
  return { end, childHeadings };
}

export function isExcludedHeading(headingText) {
  return /coverage map|self-test|sixty-second check|answer skeletons/i.test(headingText);
}

function makeConcept({ unit, subject, headingText, parts, sourceAnchor, audit, countAsSourceHeading = true }) {
  const meaningful = meaningfulParts(parts);
  if (!meaningful.length) return null;

  const id = `${subject.id}-u${unit.num}-c-${slugify(headingText)}-${hashString(headingText)}`.replace(/[^a-z0-9-]+/gi, '-');
  if (countAsSourceHeading) audit.includedHeadings += 1;

  return {
    id,
    unit: unit.num,
    unitTitle: unit.title,
    kind: 'concept',
    title: headingText,
    speechTitle: cleanSpeech(headingText),
    sourceAnchor,
    sourceUrl: `../${subject.id}/unit-${unit.num}.html#${sourceAnchor}`,
    parts: meaningful.map(part => ({ ...part, section: 'content' }))
  };
}

function makeQuestion({ unit, subject, headingText, questionInfo, questionOverride, answerParts, sourceAnchor, audit, manifestEntry = null }) {
  const questionText = manifestEntry?.displayQuestion || questionOverride?.text || questionInfo.questionText;
  const code = questionInfo.code;
  const marks = manifestEntry?.marks || questionOverride?.marks || questionInfo.marks;
  const key = manifestEntry?.id || `${unit.num}|${code}|${questionText.toLowerCase()}`;
  const id = manifestEntry
    ? `${subject.id}-q-${manifestEntry.id}`
    : `${subject.id}-u${unit.num}-q-${code.toLowerCase()}-${hashString(key)}`;

  const parts = meaningfulParts(answerParts).map(part => ({ ...part, section: 'answer' }));

  return {
    id,
    unit: unit.num,
    unitTitle: unit.title,
    kind: 'question',
    code,
    marks,
    paper: manifestEntry?.paper || 'note',
    manifestId: manifestEntry?.id || null,
    officialQuestion: manifestEntry?.officialQuestion || questionText,
    title: headingText,
    questionText,
    speechTitle: cleanSpeech(questionText),
    sourceAnchor,
    sourceUrl: `../${subject.id}/unit-${unit.num}.html#${sourceAnchor}`,
    parts
  };
}

function cleanSpeech(value = '') {
  return plainInline(value)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}]/gu, ' ')
    .replace(/[★☆]/g, ' ')
    .replace(/\s*\[\d+\]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function headingPart(text) {
  return {
    section: 'answer',
    type: 'text',
    visual: false,
    html: `<p><strong>${inlineHtml(text)}</strong></p>`,
    text: plainInline(text)
  };
}

function tokenRangeParts(tokens, start, end, { includeHeadings = false } = {}) {
  const parts = [];
  for (let index = start; index < end; index += 1) {
    const token = tokens[index];
    if (token.type === 'heading') {
      if (includeHeadings) parts.push(headingPart(token.text));
      continue;
    }
    parts.push(...tokenParts(token, 'answer'));
  }
  return parts;
}

function manifestAnswerParts(tokens, manifestEntry) {
  const headingNames = manifestEntry.answerHeadings || [manifestEntry.sourceHeading];
  const parts = [];

  for (const headingName of headingNames) {
    const headingIndex = tokens.findIndex(token => token.type === 'heading' && token.text === headingName);
    if (headingIndex === -1) {
      throw new Error(`Quick Reels answer heading is missing for ${manifestEntry.id}: ${headingName}`);
    }

    const headingToken = tokens[headingIndex];
    const { end, childHeadings } = sectionRange(tokens, headingIndex, headingToken.depth);

    if (manifestEntry.answerMode === 'section') {
      parts.push(...tokenRangeParts(tokens, headingIndex + 1, end, {
        includeHeadings: Boolean(manifestEntry.includeAnswerHeadings)
      }));
      continue;
    }

    const firstChildIndex = childHeadings[0]?.index ?? end;
    if (manifestEntry.includeAnswerHeadings) parts.push(headingPart(headingToken.text));
    parts.push(...tokenRangeParts(tokens, headingIndex + 1, firstChildIndex));
  }

  return parts;
}

export function collectSectionHeadingNames(units = [], rootDir = '.', folder = '') {
  const names = new Map();

  for (const unit of units) {
    const filePath = path.join(rootDir, folder, unit.file);
    const markdown = repairMojibake(fs.readFileSync(filePath, 'utf8'));
    const tokens = marked.lexer(markdown);

    for (const token of tokens) {
      if (token.type !== 'heading' || (token.depth !== 2 && token.depth !== 3)) continue;
      const match = String(token.text || '').match(/^(\d+(?:\.\d+)*)\.?\s+(.+)$/);
      if (!match) continue;

      const name = normalizeSpeech(match[2], { kind: 'heading' })
        .replace(/\s+[—-]\s+Draw This Diagram\s*$/i, '')
        .replace(/\s+[—-]\s+[A-D]\d+\b.*$/i, '')
        .replace(/\s+\d+(?:-\s*mark)?(?:\s*\/\s*\d+(?:-\s*mark)?)*\s*$/i, '')
        .trim();
      if (name) names.set(match[1], name);
    }
  }

  return names;
}

export function extractReelContent({ subject, units, rootDir, questionManifest = [] }) {
  const entries = [];
  const seenQuestionIds = new Set();
  const seenQuestionHeadingKeys = new Set();
  const seenManifestIds = new Set();
  const matchedManifestIds = new Set();
  const questionManifestByHeading = new Map();
  const sectionManifestByHeading = new Map();

  for (const manifestEntry of questionManifest) {
    if (seenManifestIds.has(manifestEntry.id)) {
      throw new Error(`Duplicate Quick Reels question manifest id: ${manifestEntry.id}`);
    }
    seenManifestIds.add(manifestEntry.id);
    const key = `${manifestEntry.unit}|${manifestEntry.sourceHeading}`;
    const matches = manifestEntry.sourceKind === 'question-heading'
      ? questionManifestByHeading
      : sectionManifestByHeading;
    const entries = matches.get(key) || [];
    entries.push(manifestEntry);
    matches.set(key, entries);
  }

  const audit = {
    sourceHeadings: 0,
    includedHeadings: 0,
    mappedQuestions: 0,
    containerHeadings: 0,
    duplicateHeadings: 0,
    introEntries: 0,
    entries: 0,
    excludedHeadings: [],
    unitCounts: {},
    partCounts: {},
    manifestQuestions: questionManifest.length,
    manifestMatched: 0,
    manifestSectionBacked: questionManifest.filter(entry => entry.sourceKind === 'section').length
  };

  for (const unit of units) {
    const filePath = path.join(rootDir, subject.folder, unit.file);
    const originalMarkdown = fs.readFileSync(filePath, 'utf8');
    const markdown = repairMojibake(originalMarkdown);
    const tokens = marked.lexer(encodeDetailsBlocks(markdown));
    const sourceTokens = marked.lexer(originalMarkdown);
    const sourceHeadings = sourceTokens.filter(token => token.type === 'heading');
    const repairedHeadings = tokens.filter(token => token.type === 'heading');
    if (sourceHeadings.length !== repairedHeadings.length) {
      throw new Error(`Mojibake repair changed the heading count for Unit ${unit.num}.`);
    }

    const assignSourceHeadingId = createHeadingIdAssigner(generatedHeadingId);
    const sourceHeadingIds = sourceHeadings.map(heading => assignSourceHeadingId(heading.text));
    const sourceAnchorByTokenIndex = new Map();
    const sourceHeadingOccurrenceByTokenIndex = new Map();
    const sourceHeadingOccurrences = new Map();
    let sourceHeadingIndex = 0;
    tokens.forEach((token, tokenIndex) => {
      if (token.type !== 'heading') return;
      sourceAnchorByTokenIndex.set(tokenIndex, sourceHeadingIds[sourceHeadingIndex]);
      const occurrence = (sourceHeadingOccurrences.get(token.text) ?? 0) + 1;
      sourceHeadingOccurrences.set(token.text, occurrence);
      sourceHeadingOccurrenceByTokenIndex.set(tokenIndex, occurrence);
      sourceHeadingIndex += 1;
    });

    audit.sourceHeadings += repairedHeadings.filter(token => token.depth === 2 || token.depth === 3).length;
    const unitEntries = [];
    const unitAudit = {
      includedHeadings: 0,
      mappedQuestions: 0,
      containerHeadings: 0,
      duplicateHeadings: 0,
      introEntries: 0
    };

    const sourceAnchorAt = index => sourceAnchorByTokenIndex.get(index) ?? '';
    const sourceHeadingOccurrenceAt = index => sourceHeadingOccurrenceByTokenIndex.get(index) ?? 1;
    const manifestForHeading = (headingText, occurrence) => {
      const candidates = questionManifestByHeading.get(`${unit.num}|${headingText}`) || [];
      return candidates.find(entry => (entry.sourceHeadingOccurrence ?? 1) === occurrence) || null;
    };
    const addManifestQuestion = (manifestEntry, headingIndex) => {
      const question = makeQuestion({
        unit,
        subject,
        headingText: manifestEntry.sourceHeading,
        questionInfo: {
          code: manifestEntry.code,
          marks: manifestEntry.marks,
          questionText: manifestEntry.displayQuestion
        },
        questionOverride: null,
        answerParts: manifestAnswerParts(tokens, manifestEntry),
        sourceAnchor: sourceAnchorAt(headingIndex),
        audit: unitAudit,
        manifestEntry
      });

      if (seenQuestionIds.has(question.id)) {
        unitAudit.duplicateHeadings += 1;
        return;
      }

      seenQuestionIds.add(question.id);
      matchedManifestIds.add(manifestEntry.id);
      unitAudit.mappedQuestions += 1;
      unitEntries.push(question);
    };
    const addSectionManifestQuestions = (headingText, headingIndex) => {
      const occurrence = sourceHeadingOccurrenceAt(headingIndex);
      const matches = sectionManifestByHeading.get(`${unit.num}|${headingText}`) || [];
      matches
        .filter(entry => (entry.sourceHeadingOccurrence ?? 1) === occurrence)
        .forEach(manifestEntry => addManifestQuestion(manifestEntry, headingIndex));
    };
    const unitHeading = tokens.find(token => token.type === 'heading' && token.depth === 1)?.text || `Unit ${unit.num}`;
    const unitHeadingIndex = tokens.findIndex(token => token.type === 'heading' && token.depth === 1);
    const firstSection = tokens.findIndex(token => token.type === 'heading' && token.depth === 2);
    const introTokens = firstSection === -1 ? tokens.slice(1) : tokens.slice(1, firstSection);
    const introParts = meaningfulParts(introTokens.flatMap(token => tokenParts(token, 'content')));
    if (introParts.length) {
      const intro = makeConcept({
        unit,
        subject,
        headingText: 'Read this first',
        sourceAnchor: sourceAnchorAt(unitHeadingIndex),
        parts: introParts,
        audit: unitAudit,
        countAsSourceHeading: false
      });
      if (intro) {
        unitAudit.introEntries += 1;
        unitEntries.push(intro);
      }
    }

    let index = firstSection === -1 ? tokens.length : firstSection;
    while (index < tokens.length) {
      const headingToken = tokens[index];
      if (!headingToken || headingToken.type !== 'heading' || headingToken.depth !== 2) {
        index += 1;
        continue;
      }

      const headingText = headingToken.text;
      const { end, childHeadings } = sectionRange(tokens, index, 2);

      if (isExcludedHeading(headingText)) {
        audit.excludedHeadings.push({ unit: unit.num, heading: headingText });

        // Answer Skeletons often contain the only copy of a mapped question.
        // Keep unique mapped questions, while the global question-id set drops
        // repeated skeleton copies. All other excluded sections stay excluded.
        if (/answer skeletons/i.test(headingText)) {
          for (const child of childHeadings) {
            const questionInfo = parseQuestionHeading(child.token.text);
            if (!questionInfo) continue;

            const childEnd = childHeadings[childHeadings.indexOf(child) + 1]?.index ?? end;
            const childTokens = tokens.slice(child.index + 1, childEnd);
            const manifestEntry = manifestForHeading(child.token.text, sourceHeadingOccurrenceAt(child.index));

            const question = makeQuestion({
              unit,
              subject,
              headingText: child.token.text,
              questionInfo,
              questionOverride: null,
              answerParts: childTokens.flatMap(token => tokenParts(token, 'answer')),
              sourceAnchor: sourceAnchorAt(child.index),
              audit: unitAudit,
              manifestEntry
            });

            const questionHeadingKey = `${unit.num}|${child.token.text}`;
            if (!seenQuestionIds.has(question.id) && !seenQuestionHeadingKeys.has(questionHeadingKey)) {
              seenQuestionIds.add(question.id);
              seenQuestionHeadingKeys.add(questionHeadingKey);
              if (manifestEntry) matchedManifestIds.add(manifestEntry.id);
              unitAudit.includedHeadings += 1;
              unitAudit.mappedQuestions += 1;
              unitEntries.push(question);
            } else {
              unitAudit.duplicateHeadings += 1;
            }
          }
        }

        index = end;
        continue;
      }

      if (/^Learn in Motion$/i.test(headingText)) {
        const motionParts = learnInMotionParts(markdown);
        const motion = makeConcept({
          unit,
          subject,
          headingText,
          sourceAnchor: sourceAnchorAt(index),
          parts: motionParts,
          audit: unitAudit
        });
        if (motion) unitEntries.push(motion);
        index = end;
        continue;
      }

      const firstChildIndex = childHeadings[0]?.index ?? end;
      const directTokens = tokens.slice(index + 1, firstChildIndex);
      const directParts = meaningfulParts(directTokens.flatMap(token => tokenParts(token, 'content')));
      let questionOverride = null;

      if (!directParts.length) {
        unitAudit.containerHeadings += 1;
      }

      if (directParts.length) {
        const concept = makeConcept({
          unit,
          subject,
          headingText,
          sourceAnchor: sourceAnchorAt(index),
          parts: directParts,
          audit: unitAudit
        });
        if (concept) unitEntries.push(concept);

        const firstQuote = directTokens.find(token => token.type === 'blockquote');
        if (firstQuote && /Worked Case\s*[—–-]/i.test(headingText)) {
          questionOverride = {
            text: plainInline(firstQuote.text),
            marks: ''
          };
        }
      }

      addSectionManifestQuestions(headingText, index);

      for (let childIndex = 0; childIndex < childHeadings.length; childIndex += 1) {
        const child = childHeadings[childIndex];
        const childEnd = childHeadings[childIndex + 1]?.index ?? end;
        const childTokens = tokens.slice(child.index + 1, childEnd);
        const childText = child.token.text;

        if (isExcludedHeading(childText)) {
          audit.excludedHeadings.push({ unit: unit.num, heading: childText });
          continue;
        }

        const questionInfo = parseQuestionHeading(childText);
        if (!questionInfo) {
          const concept = makeConcept({
            unit,
            subject,
            headingText: childText,
            sourceAnchor: sourceAnchorAt(child.index),
            parts: meaningfulParts(childTokens.flatMap(token => tokenParts(token, 'content'))),
            audit: unitAudit
          });
          if (concept) unitEntries.push(concept);
          addSectionManifestQuestions(childText, child.index);
          continue;
        }

        const manifestEntry = manifestForHeading(childText, sourceHeadingOccurrenceAt(child.index));
        const question = makeQuestion({
          unit,
          subject,
          headingText: childText,
          questionInfo,
          questionOverride: questionInfo.code.startsWith('D') ? questionOverride : null,
          answerParts: childTokens.flatMap(token => tokenParts(token, 'answer')),
          sourceAnchor: sourceAnchorAt(child.index),
          audit: unitAudit,
          manifestEntry
        });

        const questionHeadingKey = `${unit.num}|${childText}`;
        if (!seenQuestionIds.has(question.id) && !seenQuestionHeadingKeys.has(questionHeadingKey)) {
          seenQuestionIds.add(question.id);
          seenQuestionHeadingKeys.add(questionHeadingKey);
          if (manifestEntry) matchedManifestIds.add(manifestEntry.id);
          unitAudit.includedHeadings += 1;
          unitAudit.mappedQuestions += 1;
          unitEntries.push(question);
        } else {
          unitAudit.duplicateHeadings += 1;
        }
      }

      index = end;
    }

    audit.includedHeadings += unitAudit.includedHeadings;
    audit.mappedQuestions += unitAudit.mappedQuestions;
    audit.containerHeadings += unitAudit.containerHeadings;
    audit.duplicateHeadings += unitAudit.duplicateHeadings;
    audit.introEntries += unitAudit.introEntries;
    audit.unitCounts[unit.num] = unitEntries.length;
    for (const entry of unitEntries) {
      for (const part of entry.parts) {
        audit.partCounts[part.type] = (audit.partCounts[part.type] ?? 0) + 1;
      }
    }
    entries.push(...unitEntries);
  }

  audit.manifestMatched = matchedManifestIds.size;
  if (audit.manifestMatched !== questionManifest.length) {
    const missing = questionManifest
      .filter(entry => !matchedManifestIds.has(entry.id))
      .map(entry => entry.id);
    throw new Error(`Quick Reels question manifest entries did not match source headings: ${missing.join(', ')}`);
  }
  audit.entries = entries.length;

  return {
    version: 1,
    subject: {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      color: subject.color
    },
    units: units.map(unit => ({
      num: unit.num,
      title: unit.title,
      sourceUrl: `../${subject.id}/unit-${unit.num}.html`
    })),
    entries,
    audit
  };
}
