const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}]/gu;
const BOX_DRAWING_RE = /[\u2500-\u{257F}\u{25A0}-\u{25FF}]/gu;
const ARROW_RE = /[→←⇒⇔↔]/gu;

export const DEFAULT_NARRATION_PROFILE = Object.freeze({
  provider: 'google',
  modelVersion: 'chirp-3-hd-v1',
  voice: 'en-US-Chirp3-HD-Achernar',
  languageCode: 'en-US',
  pace: 1.08,
  encoding: 'mp3',
  ssmlProfile: 'plain-v1',
  pronunciationVersion: 2
});

export const DEFAULT_PIPER_PROFILE = Object.freeze({
  provider: 'piper',
  modelVersion: 'piper-v1',
  voice: 'en_US-amy-medium',
  languageCode: 'en-US',
  pace: 1.0,
  encoding: 'wav',
  ssmlProfile: 'plain-v1',
  pronunciationVersion: 2
});

const ACRONYMS = new Map([
  ['API', 'A P I'],
  ['BI', 'B I'],
  ['CDC', 'C D C'],
  ['CRM', 'C R M'],
  ['DAX', 'D A X'],
  ['DQ', 'D Q'],
  ['DW', 'D W'],
  ['EDW', 'E D W'],
  ['ERP', 'E R P'],
  ['ETL', 'E T L'],
  ['ID', 'I D'],
  ['KPI', 'K P I'],
  ['MPP', 'M P P'],
  ['ML', 'M L'],
  ['ODS', 'O D S'],
  ['OLAP', 'O L A P'],
  ['OLTP', 'O L T P'],
  ['PII', 'P I I'],
  ['POS', 'P O S'],
  ['RFM', 'R F M'],
  ['SCD', 'S C D'],
  ['SQL', 'S Q L']
]);

const ASSOCIATION_TERMS = new Set([
  'association',
  'association rule',
  'association rule mining',
  'apriori',
  'classification',
  'clustering',
  'decision tree',
  'market basket'
]);

const RIGHT_HAND_VERBS = /^(?:answers|becomes|creates|drives|explains|gives|handles|helps|identifies|indicates|leads|means|prevents|produces|requires|results|shows|serves|tells|uses|works)\b/i;

export function hashString(value = '') {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function narrationProfileFromEnv(env = process.env) {
  const apiKey = String(env.GOOGLE_CLOUD_TTS_API_KEY || '').trim();

  if (!apiKey) {
    return {
      ...DEFAULT_PIPER_PROFILE,
      voice: String(env.PIPER_TTS_VOICE || DEFAULT_PIPER_PROFILE.voice).trim(),
      languageCode: DEFAULT_PIPER_PROFILE.languageCode,
      pace: DEFAULT_PIPER_PROFILE.pace
    };
  }

  const pace = Number(env.GOOGLE_TTS_PACE);
  const voice = String(env.GOOGLE_TTS_VOICE || DEFAULT_NARRATION_PROFILE.voice).trim();
  const languageCode = String(env.GOOGLE_TTS_LANGUAGE_CODE || '').trim()
    || (/^([a-z]{2}-[A-Z]{2})/.exec(voice)?.[1] || DEFAULT_NARRATION_PROFILE.languageCode);

  return {
    ...DEFAULT_NARRATION_PROFILE,
    modelVersion: String(env.GOOGLE_TTS_MODEL_VERSION || DEFAULT_NARRATION_PROFILE.modelVersion).trim()
      || DEFAULT_NARRATION_PROFILE.modelVersion,
    voice,
    languageCode,
    pace: Number.isFinite(pace) && pace >= 0.25 && pace <= 2
      ? pace
      : DEFAULT_NARRATION_PROFILE.pace
  };
}

function sectionName(reference, sectionNames) {
  const key = String(reference);
  const names = sectionNames instanceof Map
    ? sectionNames
    : new Map(Object.entries(sectionNames || {}));
  return names.get(key) || 'relevant';
}

function stripStructuralNumber(value, kind) {
  const text = String(value ?? '');
  const listCounter = /^\s*\d{1,2}[.)]\s+/;
  const headingCounter = /^\s*\d{1,2}(?:\.\d+)+\.?\s+/;
  const tableCounter = /^\s*\d{1,2}\s+(?=[A-Za-z])/;

  const withoutHeadingLabel = text.replace(headingCounter, '');
  if (kind === 'heading') {
    return withoutHeadingLabel.replace(/^\s*\d{1,2}\.\s+/, '');
  }
  if (kind === 'table-cell') {
    // Table sequence columns are joined to the first real cell by the reels
    // extractor. Do not remove quantities such as "3 marks" or "2 weeks".
    return withoutHeadingLabel.replace(listCounter, '').replace(tableCounter, numberPrefix => {
      const remainder = withoutHeadingLabel.slice(numberPrefix.length).toLowerCase();
      return /^(?:mark|marks|word|words|week|weeks|year|years|month|months|day|days|percent|percentage)\b/.test(remainder)
        ? numberPrefix
        : '';
    });
  }
  return withoutHeadingLabel.replace(listCounter, '');
}

function removeNarrationAnnotations(value) {
  return String(value ?? '').replace(/\(([^()]*)\)/g, (match, content) => {
    const annotation = String(content ?? '').trim();
    if (!annotation) return ' ';

    // Instructions tell the learner how to use a passage. They are not part
    // of the passage itself, so remove them even when they contain a number.
    if (/^(?:use|using|for exam|exam use)\b/i.test(annotation)) return ' ';
    if (/\b(?:marker|markers?|model question|board paper)\b/i.test(annotation)) return ' ';
    if (/^\d{1,3}\s*[-–]?\s*\d?\s*words?\b/i.test(annotation)) return ' ';
    if (/^(?:add|delete|cut)\b/i.test(annotation)) return ' ';
    if (/\b(?:one line each|worth one line|in your head|only place|to taste|if you need)\b/i.test(annotation)) return ' ';

    // Preserve semantic annotations: dates, percentages, money, formulas, and
    // technical identifiers. These carry meaning even when a note also uses
    // exam vocabulary nearby.
    const hasSemanticValue = /\b(?:19|20)\d{2}\b/.test(annotation)
      || /\d+(?:\.\d+)?\s*%/.test(annotation)
      || /\b(?:NPR|INR|USD|Rs\.?)\s*[\d,.]+/i.test(annotation)
      || /[=+*/<>≤≥]/.test(annotation)
      || /\b(?:API|BI|CDC|CRM|DAX|DQ|DW|EDW|ERP|ETL|KPI|ML|MPP|ODS|OLAP|OLTP|PII|POS|RFM|SCD|SQL)\b/.test(annotation);
    if (hasSemanticValue) return match;

    // Country shorthand and navigation-only labels are not spoken content.
    if (/^NP$/i.test(annotation)) return ' ';
    if (/^(?:Exam Insurance|Applied|high level|this unit|from this unit)$/i.test(annotation)) return ' ';
    if (/^(?:and\s+)?answers?\b/i.test(annotation)) return ' ';
    if (/^constructed\b/i.test(annotation)) return ' ';
    if (/^name\b/i.test(annotation)) return ' ';
    if (/\bexam\b/i.test(annotation)) return ' ';

    // Pure section ranges and question codes are structural labels. Four-digit
    // years remain meaningful and are deliberately excluded.
    if (/^\d{1,3}(?:\.\d+)*(?:[–-]\d{1,3}(?:\.\d+)*)?$/.test(annotation)) return ' ';
    if (/^[A-D]\d{1,2}(?:\s*,\s*[A-D]\d{1,2})*$/i.test(annotation)) return ' ';
    if (/^unit\s+\d/i.test(annotation)) return ' ';
    if (/^practice\s+\d/i.test(annotation)) return ' ';
    if (/\bsection\b/i.test(annotation)) return ' ';

    return match;
  });
}

function replaceSectionReferences(value, sectionNames) {
  const possessive = /§\s*(\d+(?:\.\d+)*)'s/gi;
  const prefixed = /\b(from|in|see)\s+§\s*(\d+(?:\.\d+)*)/gi;
  const generic = /§\s*(\d+(?:\.\d+)*)/g;

  return value
    .replace(possessive, (_, reference) => `the ${sectionName(reference, sectionNames)} section's`)
    .replace(prefixed, (match, prefix, reference) => {
      return `${prefix} the ${sectionName(reference, sectionNames)} section`;
    })
    .replace(generic, (_, reference) => `the ${sectionName(reference, sectionNames)} section`);
}

function arrowAssociation(left, right) {
  const cleanLeft = left.trim().replace(/[.,;:]+$/, '');
  const cleanRight = right.trim().replace(/[.,;:]+$/, '');
  if (!cleanLeft || !cleanRight) return null;

  if (/^[A-Z]$/.test(cleanLeft) && /^[A-Z]$/.test(cleanRight)) {
    return `${cleanLeft} is associated with ${cleanRight}`;
  }

  if (/\[support=/i.test(cleanRight)) {
    return `${cleanLeft} is associated with ${cleanRight}`;
  }

  const rightWords = cleanRight.toLowerCase().split(/\s+/);
  const startsWithAssociationTerm = ASSOCIATION_TERMS.has(rightWords.slice(0, 3).join(' '))
    || ASSOCIATION_TERMS.has(rightWords.slice(0, 2).join(' '))
    || ASSOCIATION_TERMS.has(rightWords[0]);

  if (startsWithAssociationTerm && /^(?:customers?|products?|people|users?|records?|items?|transactions?)\b/i.test(cleanLeft)) {
    const subject = /^(Products|Customers|People|Users|Records|Items|Transactions)\b/.exec(cleanLeft);
    const spokenSubject = subject
      ? subject[0].charAt(0).toLowerCase() + subject[0].slice(1)
      : cleanLeft;
    return `For ${spokenSubject}, use ${cleanRight}`;
  }

  return null;
}

function arrowConnector(left, right) {
  const cleanLeft = left.trim().replace(/[.,;:]+$/, '');
  const cleanRight = right.trim().replace(/[.,;:]+$/, '');
  if (!cleanLeft || !cleanRight) return null;

  const association = arrowAssociation(cleanLeft, cleanRight);
  if (association) return association;

  if (RIGHT_HAND_VERBS.test(cleanRight)) {
    return `${cleanLeft} ${cleanRight}`;
  }

  const leftWords = cleanLeft.split(/\s+/).filter(Boolean);
  const rightWords = cleanRight.split(/\s+/).filter(Boolean);
  const looksLikeChange = leftWords.length <= 4 && rightWords.length <= 4;
  if (looksLikeChange) {
    return `from ${cleanLeft} to ${cleanRight}`;
  }

  return `${cleanLeft}, followed by ${cleanRight}`;
}

function joinAsSteps(chains) {
  if (chains.length <= 1) return chains[0] || '';
  if (chains.length === 2) return `${chains[0]}, then ${chains[1]}`;
  return `${chains.slice(0, -1).join(', ')}, then ${chains.at(-1)}`;
}

function contextualArrowPair(left, right) {
  const functionalScope = /^Functional scope\s+—\s*(.+)$/i.exec(left);
  if (functionalScope) {
    return `Functional scope expands from ${functionalScope[1]} to ${right.replace(/^Enterprise scope\s+—\s*/i, 'an enterprise scope: ')}`;
  }

  const scope = /^(Data|Time|User) scope\s+—\s*(.+)$/i.exec(left);
  if (scope) {
    return `${scope[1]} scope ranges from ${scope[2]} to ${right}`;
  }

  if (/Raw, messy, multi-source$/i.test(left)) {
    return 'Raw, messy, multi-source data becomes clean and consistent';
  }
  if (/continuous$/i.test(left) && /^bins$/i.test(right)) {
    return 'continuous values become bins';
  }
  if (/^(Weekly high-spend families|Weekend bulk buyers|Dormant one-time shoppers)$/i.test(left)) {
    return `For ${left.toLowerCase()}, use ${right}`;
  }
  if (/unstable: slightly different sample$/i.test(left) && /^different tree$/i.test(right)) {
    return 'a slightly different sample produces a different tree';
  }
  if (/Streaming ingestion \(Kafka$/i.test(left) && /^D W$/i.test(right)) {
    return 'streaming ingestion moves data from Kafka to the data warehouse';
  }
  if (/products as rows$/i.test(left) && /^products as columns$/i.test(right)) {
    return 'a pivot swaps rows for columns, so products become columns';
  }
  if (/^magnitude \(/i.test(left) && /^(low to high)$/i.test(right)) {
    return 'magnitude ranges from low to high';
  }
  if (/^sequential \(/i.test(left) && /^(one hue, light to dark)$/i.test(right)) {
    return 'sequential colour uses one hue from light to dark';
  }

  return null;
}

function contextualArrowChain(value, chains) {
  const context = value.trim();
  if (/^Shape:/i.test(context) || /^The pattern is:/i.test(context)) {
    return joinAsSteps(chains);
  }
  if (/^Structure the answer as/i.test(context)) {
    return 'Structure the answer as mechanism, example, and consequence';
  }
  if (/^Marks are in the/i.test(context)) {
    return 'Marks are in the label-to-features-to-evaluation-to-action chain';
  }
  if (/^Prepare the three families/i.test(context)) {
    return 'Prepare the three families, each with symptom, root cause, mitigation, and one concrete example';
  }

  if (/^DIKW note:/i.test(context)) {
    return 'Data becomes Information, which becomes Knowledge, which becomes Wisdom';
  }
  if (/^Memory hook: C-T-P-D/i.test(context)) {
    return 'Collect, transform, present, and decide';
  }
  if (/^SELECTION\s*→/i.test(context)) {
    return 'The mining pipeline runs selection, preprocessing, transformation, mining, and evaluation';
  }
  if (/^sessions\s*→/i.test(context) && /paid orders/i.test(context)) {
    return 'The purchase funnel moves from sessions to product views, add-to-cart, and paid orders';
  }
  if (/^monthly sales\s*→/i.test(context)) {
    return 'Monthly sales roll up to quarterly sales and then annual sales';
  }
  if (/^annual\s*→\s*quarter/i.test(context)) {
    return 'Drill down from annual to quarter, month, and the individual invoice';
  }
  if (/^label\s*→\s*features/i.test(context)) {
    return 'Start with the label, then prepare features, train, evaluate, and act';
  }
  if (/^Frequent itemsets\s*→/i.test(context)) {
    return 'Generate frequent itemsets, then generate rules, then keep only rules above minimum confidence';
  }
  if (/^pilot\s*→\s*template\s*→\s*scale$/i.test(context)) {
    return 'Scale in phases: pilot, then template, then scale';
  }
  if (/^situation\s*→\s*built/i.test(context)) {
    return joinAsSteps(chains);
  }
  if (/^connect\s*→\s*model\s*→\s*visualise/i.test(context)) {
    return 'Connect the data, model it, visualise it, publish it, and schedule refreshes';
  }
  if (/^The marker checks whether you can put sources\s*→/i.test(context)) {
    return chains.join(', ');
  }
  if (/Layered warehouse \(/i.test(context)) {
    return 'staging, core, and mart layers';
  }
  if (/^ELT pattern:/i.test(context)) {
    return 'In the ELT pattern, load raw data to staging, then transform it in the warehouse';
  }
  if (/^Streaming ingestion/i.test(context)) {
    return 'Streaming ingestion moves data from Kafka to the data warehouse';
  }
  if (/^Basic\s+—/i.test(context)) {
    return 'Basic flow: sources feed the warehouse, which feeds users';
  }
  if (/^With staging\s+—/i.test(context)) {
    return 'With staging: sources feed staging and ETL, which feed the warehouse, which feeds users';
  }
  if (/^Core banking/i.test(context)) {
    return 'Data flows from core banking through nightly ETL and staging into the EDW, then into dependent marts and dashboards';
  }
  if (/^SOURCES\s*→/i.test(context)) {
    return 'Sources flow through ETL into the warehouse or cube, then through the BI tool to a decision';
  }

  if (/\bsources?\b/i.test(context) && /\b(?:staging|ETL|warehouse|model|governance)\b/i.test(context)) {
    const middle = chains.slice(1, -1);
    const middleText = middle.length ? ` through ${middle.join(', ')}` : '';
    const lastText = chains.length > 2 ? ` to ${chains.at(-1)}` : '';
    return `The flow runs from ${chains[0]}${middleText}${lastText}`;
  }

  return null;
}

function replaceArrowChains(value) {
  const chains = value.split(/→/).map(chain => chain.trim()).filter(Boolean);
  if (chains.length === 1) return value;

  const contextual = contextualArrowChain(value, chains);
  if (contextual) return contextual;

  if (chains.length === 2) {
    const pair = contextualArrowPair(chains[0], chains[1]);
    if (pair) return pair;
    return arrowConnector(chains[0], chains[1])
      || `${chains[0]}, followed by ${chains[1]}`;
  }
  return joinAsSteps(chains);
}

function replaceContextualArrowPatterns(value) {
  return value
    .replace(/Raw, messy, multi-source\s*→\s*clean, consistent/gi, 'Raw, messy, multi-source data becomes clean and consistent')
    .replace(/discretisation\s*\(continuous\s*→\s*bins\)/gi, 'discretisation (continuous values become bins)')
    .replace(/Weekly high-spend families\s*→\s*loyalty top-up, fresh-produce offers/gi, 'For weekly high-spend families, use loyalty top-up and fresh-produce offers')
    .replace(/Weekend bulk buyers\s*→\s*volume discounts, larger pack sizes/gi, 'For weekend bulk buyers, use volume discounts and larger pack sizes')
    .replace(/Dormant one-time shoppers\s*→\s*win-back voucher, reactivation email/gi, 'For dormant one-time shoppers, use a win-back voucher and a reactivation email')
    .replace(/unstable: slightly different sample\s*→\s*different tree/gi, 'unstable: a slightly different sample produces a different tree')
    .replace(/Streaming ingestion\s*\(Kafka\s*→\s*DW\)/gi, 'Streaming ingestion moves data from Kafka to the data warehouse')
    .replace(/products as rows\s*→\s*products as columns/gi, 'a pivot swaps rows for columns, so products become columns')
    .replace(/magnitude\s*\(low\s*→\s*high\)/gi, 'magnitude ranges from low to high')
    .replace(/sequential\s*\(one hue,\s*light\s*→\s*dark\)/gi, 'sequential colour uses one hue from light to dark')
    .replace(/DIKW note: Data\s*→\s*Information\s*→\s*Knowledge\s*→\s*Wisdom is a common 1-mark question elsewhere; keep it in your head, one line each/gi, 'DIKW note: Data becomes Information, which becomes Knowledge, which becomes Wisdom')
    .replace(/DIKW note: Data\s*→\s*Information\s*→\s*Knowledge\s*→\s*Wisdom/gi, 'DIKW note: Data becomes Information, which becomes Knowledge, which becomes Wisdom')
    .replace(/Memory hook: C-T-P-D\s*—\s*Collect\s*→\s*Transform\s*→\s*Present\s*→\s*Decide/gi, 'Memory hook: C-T-P-D — Collect, transform, present, and decide')
    .replace(/SELECTION\s*→\s*PREPROCESSING\s*→\s*TRANSFORMATION\s*→\s*MINING\s*→\s*EVALUATION/gi, 'The mining pipeline runs selection, preprocessing, transformation, mining, and evaluation')
    .replace(/sessions\s*→\s*(?:product views|views)\s*→\s*(?:add-to-cart|carts)\s*→\s*paid orders/gi, 'The purchase funnel moves from sessions to product views, add-to-cart, and paid orders')
    .replace(/sessions\s*→\s*(?:product views|views)\s*→\s*(?:add-to-cart|carts)/gi, 'The purchase funnel moves from sessions to views and add-to-cart')
    .replace(/^\s*→\s*paid orders\s*\(funnel bars\)/gim, 'Paid orders complete the funnel')
    .replace(/monthly sales\s*→\s*quarterly sales\s*→\s*annual sales/gi, 'Monthly sales roll up to quarterly sales and then annual sales')
    .replace(/annual\s*→\s*quarter\s*→\s*month\s*→\s*the individual invoice/gi, 'Drill down from annual to quarter, month, and the individual invoice')
    .replace(/label\s*→\s*features\s*→\s*train\s*→\s*evaluate\s*→\s*act/gi, 'Start with the label, prepare features, train, evaluate, and act')
    .replace(/Frequent itemsets\s*→\s*generate rules\s*→\s*keep only rules above minimum confidence/gi, 'Generate frequent itemsets, generate rules, and keep only rules above minimum confidence')
    .replace(/pilot\s*→\s*template\s*→\s*scale/gi, 'Scale in phases: pilot, template, and scale')
    .replace(/situation\s*→\s*what was built\s*→\s*which best practice it demonstrates\s*→\s*the transferable lesson/gi, 'Situation, what was built, which best practice it demonstrates, and the transferable lesson')
    .replace(/situation\s*→\s*built\s*→\s*practice demonstrated\s*→\s*lesson/gi, 'Situation, what was built, the practice demonstrated, and the lesson')
    .replace(/connect\s*→\s*model\s*→\s*visualise\s*→\s*publish\s*→\s*schedule/gi, 'Connect the data, model it, visualise it, publish it, and schedule refreshes')
    .replace(/connect\s*→\s*model\s*→\s*visualise/gi, 'Connect the data, model it, and visualise it')
    .replace(/^\s*→\s*publish\s*→\s*schedule/gim, 'Publish it and schedule refreshes')
    .replace(/The marker checks whether you can put sources\s*→\s*ETL\s*→\s*model\s*→\s*tool\s*→\s*dashboard\s*→\s*governance/gi, 'The marker checks whether you can put sources, ETL, model, tool, dashboard, and governance')
    .replace(/Layered warehouse\s*\(staging\s*→\s*core\s*→\s*mart\)/gi, 'Layered warehouse with staging, core, and mart layers')
    .replace(/ELT pattern: Load raw to staging\s*→\s*transform in-warehouse \(SQL\/dbt\)/gi, 'ELT pattern: load raw data to staging and transform it in the warehouse (SQL/dbt)')
    .replace(/Basic\s+—\s*Sources\s*→\s*warehouse\s*→\s*users/gi, 'Basic flow: sources feed the warehouse, which feeds users')
    .replace(/With staging\s+—\s*Sources\s*→\s*staging\/ETL\s*→\s*warehouse\s*→\s*users/gi, 'With staging: sources feed staging and ETL, which feed the warehouse, which feeds users')
    .replace(/Core banking \(OLTP\)\s*→\s*nightly ETL\s*→\s*staging\s*→\s*EDW with 10 years history in star schema \(fact: deposits\/withdrawals; dims: branch, product, date, customer segment\)\s*→\s*dependent marts for branch & product reporting\s*→\s*dashboards/gi, 'Data flows from core banking through nightly ETL and staging into the EDW, which keeps 10 years of history in a star schema with deposit and withdrawal facts and branch, product, date, and customer-segment dimensions, then into dependent marts for branch and product reporting and dashboards')
    .replace(/SOURCES\s*→\s*ETL\s*→\s*WAREHOUSE \/ CUBE\s*→\s*\[ BI TOOL \]\s*→\s*DECISION/gi, 'Sources flow through ETL into the warehouse or cube, then through the BI tool to a decision');
}

function replaceArrows(value) {
  return value
    .replace(/\bimplication\s+([A-Za-z])\s*→\s*([A-Za-z])/gi, 'implication that $1 is associated with $2')
    .replace(/\bsupport\s*\(\s*([A-Za-z])\s*→\s*([A-Za-z])\s*\)/gi, 'support of $1 and $2')
    .replace(/\bconfidence\s*\(\s*([A-Za-z])\s*→\s*([A-Za-z])\s*\)/gi, 'confidence of $1 and $2')
    .replace(/\bM\s*\/\s*F\s*→\s*1\s*\/\s*2\b/gi, 'male or female becomes one or two')
    .replace(/\b50% more likely than chance\s*→\s*positive association\b/gi, '50% more likely than chance indicates a positive association')
    .replace(/\bHigh confidence with low support\s*→\s*/gi, 'High confidence with low support means the ')
    .replace(/\blift\s*=\s*1\s*→\s*X and Y independent\b/gi, 'When lift equals 1, X and Y are independent')
    .replace(/\blift\s*>\s*1\s*→\s*positive association\b/gi, 'When lift is greater than 1, there is a positive association')
    .replace(/\blift\s*<\s*1\s*→\s*they substitute\b/gi, 'When lift is less than 1, they substitute')
    .replace(/\b(lift)\s*(=|>|<|≥|≤)\s*1\s*→\s*([^;.\n]+)/gi, 'When lift $2 1, $3')
    .replace(/\b(lift)\s*(=|>|<|≥|≤)\s*1\s*→\s*/gi, 'When lift $2 1, ')
    .replace(/\b(?:Year|Quarter|Month|Day|Country|Province|City)(?:\s*→\s*(?:Year|Quarter|Month|Day|Country|Province|City))+\b/gi, match => match.split('→').map(part => part.trim()).join(' to '))
    .replace(/\b(rows|columns)\s*→\s*(rows|columns)\b/gi, '$1 to $2')
    .replace(/\b(low|high|daily|monthly|annual|quarterly|light|dark)\s*→\s*(low|high|daily|monthly|annual|quarterly|light|dark)\b/gi, '$1 to $2')
    .replace(/\bfact\s*→\s*dimensions\b/gi, 'fact tables relate to dimensions')
    .replace(/⇒/g, ' therefore ')
    .replace(/⇔|↔/g, ' is related to ')
    .replace(/←/g, ' ')
    .replace(/→/g, ' → ');
}

function replaceSymbols(value) {
  return value
    .replace(/≥/g, ' is greater than or equal to ')
    .replace(/≤/g, ' is less than or equal to ')
    .replace(/≠/g, ' is not equal to ')
    .replace(/×/g, ' times ')
    .replace(/∪/g, ' combined with ')
    .replace(/∩/g, ' intersected with ')
    .replace(/\s*~\s*/g, ' approximately ')
    .replace(/\s*±\s*/g, ' plus or minus ')
    .replace(/\b([A-Z]{2,4})\s*\/\s*([A-Z]{2,4})\b/g, '$1 or $2')
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/\s*=\s*/g, ' equals ')
    .replace(/\s*>\s*/g, ' is greater than ')
    .replace(/\s*<\s*/g, ' is less than ');
}

function replaceAcronyms(value) {
  let output = value;
  output = output.replace(/\b([A-Z])-([A-Z])-([A-Z])-([A-Z])\b/g, '$1 $2 $3 $4');
  output = output.replace(/\b([A-Z])-([A-Z])-([A-Z])\b/g, '$1 $2 $3');
  output = output.replace(/\b([A-Z])-([A-Z])\b/g, '$1 $2');

  for (const [acronym, spoken] of ACRONYMS) {
    output = output.replace(new RegExp(`\\b${acronym}\\b`, 'g'), spoken);
  }
  return output;
}

function tidyPunctuation(value) {
  return value
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])\s*([,.;:!?])/g, '$2')
    .replace(/(?:\s*,\s*){2,}/g, ', ')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function normalizeSpeech(value = '', options = {}) {
  const kind = options.kind || 'text';
  let text = String(value ?? '')
    .replace(/\r/g, '')
    .replace(/[★☆]/g, ' ')
    .replace(EMOJI_RE, ' ')
    .replace(/\[\s*BI TOOL\s*\]/gi, 'BI tool')
    .replace(/\[(?:draw|diagram|instruction|note|shape)\b[^\]]*\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  text = text.replace(BOX_DRAWING_RE, ' ');
  text = removeNarrationAnnotations(text);
  text = stripStructuralNumber(text, kind);
  text = replaceSectionReferences(text, options.sectionNames);
  text = replaceContextualArrowPatterns(text);
  text = replaceArrows(text);
  text = replaceArrowChains(text);
  text = text
    .replace(/[▲▼◀▶]/g, ' ')
    .replace(/[·•]/g, ', ')
    .replace(/[↑↓]/g, ' ');

  text = replaceSymbols(text);
  text = replaceAcronyms(text);
  text = text.replace(ARROW_RE, ' ');

  return tidyPunctuation(text);
}

function profileSignature(profile) {
  return [
    profile.provider,
    profile.modelVersion,
    profile.voice,
    profile.languageCode,
    Number(profile.pace).toFixed(2),
    profile.encoding,
    profile.ssmlProfile,
    Number(profile.pronunciationVersion || 1)
  ].join('|');
}

function createSegment(value, kind, sectionNames) {
  const text = normalizeSpeech(value, { kind, sectionNames });
  if (!text) return null;
  const textHash = hashString(text);
  return {
    id: `seg-${textHash}`,
    text,
    textHash,
    chars: text.length,
    static: false
  };
}

function narrationForPart(part, sectionNames) {
  if (part.type === 'table') {
    const header = createSegment(
      (part.header ?? []).map(cell => cell.text).filter(Boolean).join(' '),
      'table-cell',
      sectionNames
    );
    const rows = (part.rows ?? []).map(row => createSegment(
      row.map(cell => cell.text).filter(Boolean).join(' '),
      'table-cell',
      sectionNames
    ));
    return {
      type: 'table',
      header: header?.id || null,
      rows: rows.map(row => row?.id || null),
      source: { header, rows }
    };
  }

  if (part.type === 'diagram') {
    const lines = (part.lines ?? []).map(line => createSegment(line, 'text', sectionNames));
    return {
      type: 'diagram',
      lines: lines.map(line => line?.id || null),
      source: { lines }
    };
  }

  const segment = createSegment(part.text || '', 'text', sectionNames);
  return {
    type: part.type,
    text: segment?.id || null,
    source: { text: segment }
  };
}

export function buildNarrationManifest(entries = [], options = {}) {
  const profile = {
    ...DEFAULT_NARRATION_PROFILE,
    ...(options.profile || {})
  };
  const sectionNames = options.sectionNames || new Map();
  const profileHash = hashString(profileSignature(profile));
  const primeEntries = Math.max(0, Number(options.primeEntries ?? 3));
  const primeEntryIds = new Set(options.primeEntryIds || []);
  const segments = new Map();
  const entryNarration = {};

  const register = (segment, prime) => {
    if (!segment) return null;
    const existing = segments.get(segment.id);
    const version = hashString(`${profileHash}|${segment.textHash}`);
    if (!existing) {
      segments.set(segment.id, {
        ...segment,
        version,
        prime: Boolean(prime)
      });
    } else if (prime) {
      existing.prime = true;
    }
    return segment.id;
  };

  entries.forEach((entry, entryIndex) => {
    const prime = primeEntryIds.size
      ? primeEntryIds.has(entry.id)
      : entryIndex < primeEntries;
    const titleValue = entry.kind === 'question'
      ? (entry.questionText || entry.speechTitle || '')
      : (entry.speechTitle || entry.title || '');
    const title = createSegment(titleValue, entry.kind === 'question' ? 'question' : 'heading', sectionNames);
    const titleId = register(title, prime);
    const parts = (entry.parts || []).map(part => narrationForPart(part, sectionNames));

    parts.forEach(part => {
      if (part.source?.header) register(part.source.header, prime);
      (part.source?.rows || []).forEach(row => register(row, prime));
      (part.source?.lines || []).forEach(line => register(line, prime));
      if (part.source?.text) register(part.source.text, prime);
    });

    entryNarration[entry.id] = {
      title: titleId,
      parts: parts.map(part => ({
        type: part.type,
        text: part.text || null,
        header: part.header || null,
        rows: part.rows || [],
        lines: part.lines || []
      }))
    };
  });

  const serializedSegments = Object.fromEntries(
    [...segments.values()]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(segment => [segment.id, segment])
  );

  return {
    manifest: {
      version: 2,
      profile,
      profileHash,
      cloudEnabled: Boolean(options.cloudEnabled),
      staticAssets: false,
      primedAssets: 0,
      generatedAt: new Date().toISOString(),
      totalChars: Object.values(serializedSegments).reduce((sum, segment) => sum + segment.chars, 0),
      segmentCount: Object.keys(serializedSegments).length,
      segments: serializedSegments
    },
    entryNarration
  };
}

export function collectEntrySegmentIds(entryNarration = {}) {
  const ids = new Set();
  if (entryNarration.title) ids.add(entryNarration.title);
  (entryNarration.parts || []).forEach(part => {
    if (part.text) ids.add(part.text);
    if (part.header) ids.add(part.header);
    (part.rows || []).forEach(id => { if (id) ids.add(id); });
    (part.lines || []).forEach(id => { if (id) ids.add(id); });
  });
  return [...ids];
}

export function narrationAssetName(segment) {
  return `${segment.id}-${segment.version}.mp3`;
}

// ============================================================================
// AI Transcript Manifest (parallel to deterministic narration)
// ============================================================================

export const DEFAULT_AI_TRANSCRIPT_PROFILE = Object.freeze({
  provider: 'groq',
  modelVersion: 'qwen/qwen3.8-27b',
  voice: 'qwen',
  languageCode: 'en-US',
  pace: 1.0,
  encoding: 'mp3',
  ssmlProfile: 'plain-v1',
  pronunciationVersion: 2
});

function aiProfileSignature(profile) {
  return [
    profile.provider,
    profile.modelVersion,
    profile.voice,
    profile.languageCode,
    Number(profile.pace).toFixed(2),
    profile.encoding,
    profile.ssmlProfile,
    Number(profile.pronunciationVersion || 1)
  ].join('|');
}

function createAiSegment(value, kind) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  const textHash = hashString(text);
  return {
    id: `aiseg-${textHash}`,
    text,
    textHash,
    chars: text.length,
    static: false
  };
}

export function buildAiTranscriptManifest(entries = [], options = {}) {
  const profile = {
    ...DEFAULT_AI_TRANSCRIPT_PROFILE,
    ...(options.profile || {})
  };
  const profileHash = hashString(aiProfileSignature(profile));
  const segments = new Map();
  const entryNarration = {};

  const register = (segment, prime) => {
    if (!segment) return null;
    const existing = segments.get(segment.id);
    const version = hashString(`${profileHash}|${segment.textHash}`);
    if (!existing) {
      segments.set(segment.id, {
        ...segment,
        version,
        prime: Boolean(prime)
      });
    } else if (prime) {
      existing.prime = true;
    }
    return segment.id;
  };

  entries.forEach((entry, entryIndex) => {
    const prime = entryIndex < (options.primeEntries ?? 0);
    // Combine all entry parts into one note for the AI
    const noteParts = [];
    const titleValue = entry.kind === 'question'
      ? (entry.questionText || entry.speechTitle || '')
      : (entry.speechTitle || entry.title || '');
    noteParts.push(`TITLE: ${titleValue}`);
    for (const part of entry.parts || []) {
      if (part.type === 'text' && part.text) {
        noteParts.push(part.text);
      } else if (part.type === 'table' && part.header) {
        noteParts.push(`TABLE: ${part.header.map(c => c.text).join(' | ')}`);
        for (const row of part.rows || []) {
          noteParts.push(row.map(c => c.text).join(' | '));
        }
      } else if (part.type === 'diagram' && part.lines) {
        noteParts.push(`DIAGRAM: ${part.lines.join(' -> ')}`);
      }
    }
    const fullNote = noteParts.join('\n\n');

    const aiSegment = createAiSegment(fullNote, entry.kind === 'question' ? 'question' : 'heading');
    const aiSegId = register(aiSegment, prime);

    entryNarration[entry.id] = {
      transcript: aiSegId,
      parts: (entry.parts || []).map(part => ({
        type: part.type,
        text: part.type === 'text' ? aiSegId : null,
        header: part.type === 'table' ? aiSegId : null,
        rows: part.type === 'table' ? (part.rows || []).map(() => aiSegId) : [],
        lines: part.type === 'diagram' ? (part.lines || []).map(() => aiSegId) : []
      }))
    };
  });

  const serializedSegments = Object.fromEntries(
    [...segments.values()]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(segment => [segment.id, segment])
  );

  return {
    manifest: {
      version: 2,
      profile,
      profileHash,
      cloudEnabled: false,
      staticAssets: false,
      primedAssets: 0,
      generatedAt: new Date().toISOString(),
      totalChars: Object.values(serializedSegments).reduce((sum, segment) => sum + segment.chars, 0),
      segmentCount: Object.keys(serializedSegments).length,
      segments: serializedSegments
    },
    entryNarration
  };
}

export function collectAiEntrySegmentIds(entryNarration = {}) {
  const ids = new Set();
  if (entryNarration.transcript) ids.add(entryNarration.transcript);
  return [...ids];
}

export function aiTranscriptAssetName(segment) {
  return `${segment.id}-${segment.version}.mp3`;
}
