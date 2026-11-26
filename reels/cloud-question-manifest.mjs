// Audited IT 277 Cloud Computing question manifest.
//
// The official TU/FOM model question 2026 is the only authoritative artifact
// for this elective. Identity is `model-<code>` since the paper is implied.
//
// `officialQuestion` is copied verbatim from the model question. `displayQuestion`
// is the wording shown in Quick Reels; it matches the source-note wording.
//
// `sourceKind: 'question-heading'` points at a teaching answer heading.
// `sourceKind: 'section'` is used where the note has no standalone question
// heading: B12, C19, D21 and D22 are answered from complete note sections.
// Source headings include the note's 🎯 mark suffix so the extractor can match
// them exactly and disambiguate repeated teaching/skeleton copies.

export const CLOUD_QUESTION_MANIFEST = [
  // ============================================================
  // GROUP A — 10 × 1 = 10 marks
  // ============================================================
  {
    id: 'model-a1',
    unit: 1,
    paper: 'model',
    code: 'A1',
    marks: '1',
    officialQuestion: 'Define Cloud Computing.',
    displayQuestion: 'Define Cloud Computing.',
    sourceKind: 'question-heading',
    sourceHeading: 'A1 · "Define Cloud Computing." [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a2',
    unit: 2,
    paper: 'model',
    code: 'A2',
    marks: '1',
    officialQuestion: 'What do you mean by SaaS?',
    displayQuestion: 'What do you mean by SaaS?',
    sourceKind: 'question-heading',
    sourceHeading: 'A2 · "What do you mean by SaaS?" [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a3',
    unit: 2,
    paper: 'model',
    code: 'A3',
    marks: '1',
    officialQuestion: 'Define private cloud.',
    displayQuestion: 'Define private cloud.',
    sourceKind: 'question-heading',
    sourceHeading: 'A3 · "Define private cloud." [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a4',
    unit: 1,
    paper: 'model',
    code: 'A4',
    marks: '1',
    officialQuestion: 'What is Cloud Storage?',
    displayQuestion: 'What is Cloud Storage?',
    sourceKind: 'question-heading',
    sourceHeading: 'A4 · "What is Cloud Storage?" [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a5',
    unit: 2,
    paper: 'model',
    code: 'A5',
    marks: '1',
    officialQuestion: 'Define SOA.',
    displayQuestion: 'Define SOA.',
    sourceKind: 'question-heading',
    sourceHeading: 'A5 · "Define SOA." [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a6',
    unit: 4,
    paper: 'model',
    code: 'A6',
    marks: '1',
    officialQuestion: 'What is Virtualization?',
    displayQuestion: 'What is Virtualization?',
    sourceKind: 'question-heading',
    sourceHeading: 'A6 · "What is Virtualization?" [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a7',
    unit: 6,
    paper: 'model',
    code: 'A7',
    marks: '1',
    officialQuestion: 'What do you mean by Virtual Machine Security?',
    displayQuestion: 'What do you mean by Virtual Machine Security?',
    sourceKind: 'question-heading',
    sourceHeading: 'A7 · "What do you mean by Virtual Machine Security?" [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a8',
    unit: 5,
    paper: 'model',
    code: 'A8',
    marks: '1',
    officialQuestion: 'What is parallel computing?',
    displayQuestion: 'What is parallel computing?',
    sourceKind: 'question-heading',
    sourceHeading: 'A8 · "What is parallel computing?" [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a9',
    unit: 6,
    paper: 'model',
    code: 'A9',
    marks: '1',
    officialQuestion: 'What do you mean by Security Monitoring?',
    displayQuestion: 'What do you mean by Security Monitoring?',
    sourceKind: 'question-heading',
    sourceHeading: 'A9 · "What do you mean by Security Monitoring?" [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-a10',
    unit: 7,
    paper: 'model',
    code: 'A10',
    marks: '1',
    officialQuestion: 'Define AppEngine.',
    displayQuestion: 'Define AppEngine.',
    sourceKind: 'question-heading',
    sourceHeading: 'A10 · "Define AppEngine." [1] 🎯 1-mark',
    sourceHeadingOccurrence: 1
  },

  // ============================================================
  // GROUP B — 6 questions, attempt any 5 × 3 = 15 marks
  // ============================================================
  {
    id: 'model-b11',
    unit: 2,
    paper: 'model',
    code: 'B11',
    marks: '3',
    officialQuestion: 'Compare PaaS with IaaS. What do you mean by public cloud?',
    displayQuestion: 'Compare PaaS with IaaS. What do you mean by public cloud?',
    sourceKind: 'question-heading',
    sourceHeading: 'B11 · "Compare PaaS with IaaS. What do you mean by public cloud?" [3] 🎯 3-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b12',
    unit: 1,
    paper: 'model',
    code: 'B12',
    marks: '3',
    officialQuestion: 'Describe advantages and disadvantages of cloud computing.',
    displayQuestion: 'Describe advantages and disadvantages of cloud computing.',
    sourceKind: 'section',
    sourceHeading: '1.5 Benefits and Challenges — B12 🎯 3-mark',
    answerHeadings: ['1.5 Benefits and Challenges — B12 🎯 3-mark'],
    answerMode: 'section'
  },
  {
    id: 'model-b13',
    unit: 4,
    paper: 'model',
    code: 'B13',
    marks: '3',
    officialQuestion: 'Explain the different types of Hypervisor.',
    displayQuestion: 'Explain the different types of Hypervisor.',
    sourceKind: 'question-heading',
    sourceHeading: 'B13 · "Explain the different types of Hypervisor." [3] 🎯 3-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b14',
    unit: 4,
    paper: 'model',
    code: 'B14',
    marks: '3',
    officialQuestion: 'Discuss types of virtualization with example.',
    displayQuestion: 'Discuss types of virtualization with example.',
    sourceKind: 'question-heading',
    sourceHeading: 'B14 · "Discuss types of virtualization with example." [3] 🎯 3-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b15',
    unit: 5,
    paper: 'model',
    code: 'B15',
    marks: '3',
    officialQuestion: 'Describe the parallel efficiency of MapReduce.',
    displayQuestion: 'Describe the parallel efficiency of MapReduce.',
    sourceKind: 'question-heading',
    sourceHeading: 'B15 · "Describe the parallel efficiency of MapReduce." [3] 🎯 3-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-b16',
    unit: 6,
    paper: 'model',
    code: 'B16',
    marks: '3',
    officialQuestion: 'What are common data security issues in cloud computing?',
    displayQuestion: 'What are common data security issues in cloud computing?',
    sourceKind: 'question-heading',
    sourceHeading: 'B16 · "What are common data security issues in cloud computing?" [3] 🎯 3-mark',
    sourceHeadingOccurrence: 1
  },

  // ============================================================
  // GROUP C — 4 questions, attempt any 3 × 5 = 15 marks
  // ============================================================
  {
    id: 'model-c17',
    unit: 2,
    paper: 'model',
    code: 'C17',
    marks: '5',
    officialQuestion: 'Explain the Cloud services requirements with example.',
    displayQuestion: 'Explain the Cloud services requirements with example.',
    sourceKind: 'question-heading',
    sourceHeading: 'C17 · "Explain the Cloud services requirements with example." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-c18',
    unit: 6,
    paper: 'model',
    code: 'C18',
    marks: '5',
    officialQuestion: 'Explain the concept of cloud security.',
    displayQuestion: 'Explain the concept of cloud security.',
    sourceKind: 'question-heading',
    sourceHeading: 'C18 · "Explain the concept of cloud security." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'model-c19',
    unit: 5,
    paper: 'model',
    code: 'C19',
    marks: '5',
    officialQuestion: 'Describe the working of MapReduce architecture.',
    displayQuestion: 'Describe the working of MapReduce architecture.',
    sourceKind: 'section',
    sourceHeading: '5.2 The MapReduce Model',
    answerHeadings: ['5.2 The MapReduce Model'],
    answerMode: 'section',
    includeAnswerHeadings: true
  },
  {
    id: 'model-c20',
    unit: 6,
    paper: 'model',
    code: 'C20',
    marks: '5',
    officialQuestion: 'Describe security architecture in cloud computing.',
    displayQuestion: 'Describe security architecture in cloud computing.',
    sourceKind: 'question-heading',
    sourceHeading: 'C20 · "Describe security architecture in cloud computing." [5] 🎯 5-mark',
    sourceHeadingOccurrence: 1
  },

  // ============================================================
  // GROUP D — 2 × 10 = 20 marks
  // ============================================================
  {
    id: 'model-d21',
    unit: 4,
    paper: 'model',
    code: 'D21',
    marks: '10',
    officialQuestion: 'Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples.',
    displayQuestion: 'Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples.',
    sourceKind: 'section',
    sourceHeading: '4.10 D21 · "Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples." [10] 🎯 10-mark',
    answerHeadings: ['4.10 D21 · "Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples." [10] 🎯 10-mark'],
    answerMode: 'section',
    includeAnswerHeadings: true
  },
  {
    id: 'model-d22',
    unit: 6,
    paper: 'model',
    code: 'D22',
    marks: '10',
    officialQuestion: 'Explain risks and mitigation strategies in cloud computing security.',
    displayQuestion: 'Explain risks and mitigation strategies in cloud computing security.',
    sourceKind: 'section',
    sourceHeading: '6.8 D22 · "Explain risks and mitigation strategies in cloud computing security." [10] 🎯 10-mark',
    answerHeadings: ['6.8 D22 · "Explain risks and mitigation strategies in cloud computing security." [10] 🎯 10-mark'],
    answerMode: 'section',
    includeAnswerHeadings: true
  }
];
