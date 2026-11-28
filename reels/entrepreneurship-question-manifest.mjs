// Audited IT Entrepreneurship question manifest.
//
// The official TU/FOM model question 2026 is the authoritative source for this paper.
// Unlike BI (which has both board and model papers with overlapping codes), this subject
// only has the model question as the official reference — the 2026 board paper used the
// same 100/50 structure with the same question codes, so the model question is the
// acceptance test. Identity is `model-<code>` since paper is implied.
//
// `officialQuestion` is copied verbatim from the model question (including the paper's grammar).
// `displayQuestion` is the wording shown in Quick Reels. For questions that already have a
// source-note heading, that display wording stays exactly as written in the note.
// For mapped questions without a dedicated note heading, the official wording is used
// unchanged and the answer comes from the listed source-note sections.
//
// `sourceHeadingOccurrence` is one-based and disambiguates repeated note headings.
// It defaults to 1; Unit 1's A1 and A2 each appear once in the teaching section and
// again under Answer Skeletons.
//
// `sourceKind: 'question-heading'` means the note already has a canonical question
// heading (the `### A1 · "..." [2] 🎯 2-mark` pattern). `sourceKind: 'section'` means the question
// is mapped by the official files but the note carries its answer inside a normal source
// section. Those section-backed questions are inserted at that section's source position,
// so adding them does not move existing source content.
//
// Split questions (C20, C21) are represented as two manifest entries sharing the same
// official code but with distinct units and answer sections.
//
// Note: The entrepreneurship unit files include `🎯 X-mark` suffixes in question headings
// (e.g., `A1 · "Define entrepreneurship." [2] 🎯 2-mark`). The manifest sourceHeading
// must match exactly what `marked.lexer` extracts, including the suffix.

export const ENTREPRENEURSHIP_QUESTION_MANIFEST = [
  // ============================================================
  // GROUP A — 10 × 2 = 20 marks
  // ============================================================
  {
    id: 'model-a1',
    unit: 1,
    paper: 'model',
    code: 'A1',
    marks: '2',
    officialQuestion: 'Define entrepreneurship.',
    displayQuestion: 'Define entrepreneurship.',
    sourceKind: 'question-heading',
    sourceHeading: 'A1 · "Define entrepreneurship." [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a2',
    unit: 1,
    paper: 'model',
    code: 'A2',
    marks: '2',
    officialQuestion: 'What is an entrepreneurship ecosystem?',
    displayQuestion: 'What is an entrepreneurship ecosystem?',
    sourceKind: 'question-heading',
    sourceHeading: 'A2 · "What is an entrepreneurship ecosystem?" [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a3',
    unit: 2,
    paper: 'model',
    code: 'A3',
    marks: '2',
    officialQuestion: 'List any two techniques for creative thinking.',
    displayQuestion: 'List any two techniques for creative thinking.',
    sourceKind: 'question-heading',
    sourceHeading: 'A3 · "List any two techniques for creative thinking." [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a4',
    unit: 2,
    paper: 'model',
    code: 'A4',
    marks: '2',
    officialQuestion: 'What do you mean by target market?',
    displayQuestion: 'What do you mean by target market?',
    sourceKind: 'question-heading',
    sourceHeading: 'A4 · "What do you mean by target market?" [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a5',
    unit: 3,
    paper: 'model',
    code: 'A5',
    marks: '2',
    officialQuestion: 'What is Business Model Canvas?',
    displayQuestion: 'What is Business Model Canvas?',
    sourceKind: 'question-heading',
    sourceHeading: 'A5 · "What is Business Model Canvas?" [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a6',
    unit: 4,
    paper: 'model',
    code: 'A6',
    marks: '2',
    officialQuestion: 'What is intellectual property right (IPR)?',
    displayQuestion: 'What is intellectual property right (IPR)?',
    sourceKind: 'question-heading',
    sourceHeading: 'A6 · "What is intellectual property right (IPR)?" [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a7',
    unit: 5,
    paper: 'model',
    code: 'A7',
    marks: '2',
    officialQuestion: 'List any two funding sources for startups.',
    displayQuestion: 'List any two funding sources for startups.',
    sourceKind: 'question-heading',
    sourceHeading: 'A7 · "List any two funding sources for startups." [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a8',
    unit: 5,
    paper: 'model',
    code: 'A8',
    marks: '2',
    officialQuestion: 'What is digital marketing?',
    displayQuestion: 'What is digital marketing?',
    sourceKind: 'question-heading',
    sourceHeading: 'A8 · "What is digital marketing?" [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a9',
    unit: 6,
    paper: 'model',
    code: 'A9',
    marks: '2',
    officialQuestion: 'Define leadership style.',
    displayQuestion: 'Define leadership style.',
    sourceKind: 'question-heading',
    sourceHeading: 'A9 · "Define leadership style." [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a10',
    unit: 6,
    paper: 'model',
    code: 'A10',
    marks: '2',
    officialQuestion: 'What do you mean by corporate social responsibility (CSR)?',
    displayQuestion: 'What do you mean by corporate social responsibility (CSR)?',
    sourceKind: 'question-heading',
    sourceHeading: 'A10 · "What do you mean by corporate social responsibility (CSR)?" [2] 🎯 2-mark',
    sourceHeadingOccurrence: 1
  },

  // ============================================================
  // GROUP B — any 6 of 7 × 5 = 30 marks
  // ============================================================
  {
    id: 'model-b11',
    unit: 1,
    paper: 'model',
    code: 'B11',
    marks: '5',
    officialQuestion: 'Explain any three key characteristics of successful entrepreneurs.',
    displayQuestion: 'Explain any three key characteristics of successful entrepreneurs.',
    sourceKind: 'question-heading',
    sourceHeading: 'B11 · "Explain any three key characteristics of successful entrepreneurs." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b12',
    unit: 2,
    paper: 'model',
    code: 'B12',
    marks: '5',
    officialQuestion: 'How do you identify market needs for a new IT idea?',
    displayQuestion: 'How do you identify market needs for a new IT idea?',
    sourceKind: 'question-heading',
    sourceHeading: 'B12 · "How do you identify market needs for a new IT idea?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b13',
    unit: 2,
    paper: 'model',
    code: 'B13',
    marks: '5',
    officialQuestion: 'Write a short note on competitor analysis.',
    displayQuestion: 'Write a short note on competitor analysis.',
    sourceKind: 'question-heading',
    sourceHeading: 'B13 · "Write a short note on competitor analysis." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b14',
    unit: 2,
    paper: 'model',
    code: 'B14',
    marks: '5',
    officialQuestion: 'Discuss the roles of trend analysis in idea generation.',
    displayQuestion: 'Discuss the roles of trend analysis in idea generation.',
    sourceKind: 'question-heading',
    sourceHeading: 'B14 · "Discuss the roles of trend analysis in idea generation." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b15',
    unit: 4,
    paper: 'model',
    code: 'B15',
    marks: '5',
    officialQuestion: 'Explain taxation basics for IT startups in Nepal.',
    displayQuestion: 'Explain taxation basics for IT startups in Nepal.',
    sourceKind: 'question-heading',
    sourceHeading: 'B15 · "Explain taxation basics for IT startups in Nepal." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b16',
    unit: 5,
    paper: 'model',
    code: 'B16',
    marks: '5',
    officialQuestion: 'What is the role of CRM in startups?',
    displayQuestion: 'What is the role of CRM in startups?',
    sourceKind: 'question-heading',
    sourceHeading: 'B16 · "What is the role of CRM in startups?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b17',
    unit: 6,
    paper: 'model',
    code: 'B17',
    marks: '5',
    officialQuestion: 'Explain the conflict resolution techniques within the team.',
    displayQuestion: 'Explain the conflict resolution techniques within the team.',
    sourceKind: 'question-heading',
    sourceHeading: 'B17 · "Explain the conflict resolution techniques within the team." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },

  // ============================================================
  // GROUP C — any 3 of 4 × 10 = 30 marks
  // ============================================================
  {
    id: 'model-c18',
    unit: 5,
    paper: 'model',
    code: 'C18',
    marks: '10',
    officialQuestion: 'What are the different sources of funding for startups? Explain any three.',
    displayQuestion: 'What are the different sources of funding for startups? Explain any three.',
    sourceKind: 'question-heading',
    sourceHeading: 'C18 · "What are the different sources of funding for startups? Explain any three." [10] 🎯 10-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-c19',
    unit: 6,
    paper: 'model',
    code: 'C19',
    marks: '10',
    officialQuestion: 'Explain different leadership styles used in startups.',
    displayQuestion: 'Explain different leadership styles used in startups.',
    sourceKind: 'question-heading',
    sourceHeading: 'C19 · "Explain different leadership styles used in startups." [10] 🎯 10-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-c20a',
    unit: 6,
    paper: 'model',
    code: 'C20',
    marks: '5',
    officialQuestion: 'How do you motivate employees in startups? Explain the digital marketing and sales techniques.',
    displayQuestion: 'How do you motivate employees in startups?',
    sourceKind: 'question-heading',
    sourceHeading: 'C20a · "How do you motivate employees in startups?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1,
    note: 'Split from C20 — motivation half (Unit 6). C20 is two questions welded into one sentence; answer as two headed halves.'
  },
  {
    id: 'model-c20b',
    unit: 5,
    paper: 'model',
    code: 'C20',
    marks: '5',
    officialQuestion: 'How do you motivate employees in startups? Explain the digital marketing and sales techniques.',
    displayQuestion: 'Explain the digital marketing and sales techniques.',
    sourceKind: 'question-heading',
    sourceHeading: 'C20b (half) · "Explain the digital marketing and sales techniques." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1,
    note: 'Split from C20 — digital marketing & sales half (Unit 5). C20 is two questions welded into one sentence; answer as two headed halves.'
  },
  {
    id: 'model-c21a',
    unit: 6,
    paper: 'model',
    code: 'C21',
    marks: '5',
    officialQuestion: 'Discuss about ethical marketing strategies. What are the essential elements of a business plan?',
    displayQuestion: 'Discuss about ethical marketing strategies.',
    sourceKind: 'question-heading',
    sourceHeading: 'C21a · "Discuss about ethical marketing strategies." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1,
    note: 'Split from C21 — ethical marketing half (Unit 6). C21 is two questions welded into one sentence; answer as two headed halves.'
  },
  {
    id: 'model-c21b',
    unit: 3,
    paper: 'model',
    code: 'C21',
    marks: '5',
    officialQuestion: 'Discuss about ethical marketing strategies. What are the essential elements of a business plan?',
    displayQuestion: 'What are the essential elements of a business plan?',
    sourceKind: 'question-heading',
    sourceHeading: 'C21(b) · "What are the essential elements of a business plan?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1,
    note: 'Split from C21 — business plan elements half (Unit 3). C21 is two questions welded into one sentence; answer as two headed halves.'
  },

  // ============================================================
  // GROUP D — 1 × 20 = 20 marks (case with 4 sub-parts)
  // ============================================================
  {
    id: 'model-d22a',
    unit: 2,
    paper: 'model',
    code: 'D22',
    marks: '5',
    officialQuestion: 'Analyze the following case carefully and answer the questions that follow: Suppose you are appointed as a promoting manager of a new ride-sharing app idea like Pathao in Nepal. Now express your idea to answer the following questions. a. Explain the steps you will follow for idea generation.',
    displayQuestion: 'Explain the steps you will follow for idea generation.',
    sourceKind: 'question-heading',
    sourceHeading: 'D22(a) · "Explain the steps you will follow for idea generation." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-d22b',
    unit: 2,
    paper: 'model',
    code: 'D22',
    marks: '5',
    officialQuestion: 'Analyze the following case carefully and answer the questions that follow: Suppose you are appointed as a promoting manager of a new ride-sharing app idea like Pathao in Nepal. Now express your idea to answer the following questions. b. How do you analyze the market?',
    displayQuestion: 'How do you analyze the market?',
    sourceKind: 'question-heading',
    sourceHeading: 'D22(b) · "How do you analyze the market?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-d22c',
    unit: 3,
    paper: 'model',
    code: 'D22',
    marks: '5',
    officialQuestion: 'Analyze the following case carefully and answer the questions that follow: Suppose you are appointed as a promoting manager of a new ride-sharing app idea like Pathao in Nepal. Now express your idea to answer the following questions. c. How do you ensure the benefit and trust to rider?',
    displayQuestion: 'How do you ensure the benefit and trust to rider?',
    sourceKind: 'question-heading',
    sourceHeading: 'D22(c) · "How do you ensure the benefit and trust to rider?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-d22d',
    unit: 4,
    paper: 'model',
    code: 'D22',
    marks: '5',
    officialQuestion: 'Analyze the following case carefully and answer the questions that follow: Suppose you are appointed as a promoting manager of a new ride-sharing app idea like Pathao in Nepal. Now express your idea to answer the following questions. d. What might be the complexities due to policy and law of our country?',
    displayQuestion: 'What might be the complexities due to policy and law of our country?',
    sourceKind: 'question-heading',
    sourceHeading: 'D22(d) · "What might be the complexities due to policy and law of our country?" [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  }
];

export const ENTREPRENEURSHIP_QUESTION_MANIFEST_BY_ID = new Map(
  ENTREPRENEURSHIP_QUESTION_MANIFEST.map(question => [question.id, question])
);

export const ENTREPRENEURSHIP_QUESTION_UNIT_COUNTS = ENTREPRENEURSHIP_QUESTION_MANIFEST.reduce((counts, question) => {
  counts[question.unit] = (counts[question.unit] ?? 0) + 1;
  return counts;
}, {});