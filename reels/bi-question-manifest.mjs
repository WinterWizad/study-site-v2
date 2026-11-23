// Audited BI question manifest.
//
// The board paper and the official model paper reuse the same A/B/C/D codes.
// A question identity therefore includes the paper, not only its code.
//
// `officialQuestion` is copied from `question-bank.md` or `model-question.md`.
// `displayQuestion` is the wording shown in Quick Reels. For questions that
// already have a source-note heading, that display wording stays exactly as
// written in the note. For mapped questions that do not yet have a note
// heading, the official wording is used unchanged and the answer comes from
// the listed source-note sections.
//
// `sourceHeadingOccurrence` is one-based and disambiguates repeated note
// headings. It defaults to 1; Unit 1's A1 and A4 each appear once in the
// teaching section and again under Answer Skeletons.
//
// `sourceKind: 'question-heading'` means the note already has a canonical
// question heading. `sourceKind: 'section'` means the question is mapped by the
// official files but the note carries its answer inside a normal source
// section. Those section-backed questions are inserted at that section's
// source position, so adding them does not move existing source content.

export const BI_QUESTION_MANIFEST = [
  {
    id: 'board-a1',
    unit: 1,
    paper: 'board',
    code: 'A1',
    marks: '1',
    officialQuestion: 'List any two scope of business intelligence.',
    displayQuestion: 'List any two scope of business intelligence.',
    sourceKind: 'question-heading',
    sourceHeading: 'A1 · "List any two scope of business intelligence." [1]',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'board-a4',
    unit: 1,
    paper: 'board',
    code: 'A4',
    marks: '1',
    officialQuestion: 'What is data analysis?',
    displayQuestion: 'What is data analysis?',
    sourceKind: 'question-heading',
    sourceHeading: 'A4 · "What is data analysis?" [1]',
    sourceHeadingOccurrence: 1
  },
  {
    id: 'board-a5',
    unit: 1,
    paper: 'board',
    code: 'A5',
    marks: '1',
    officialQuestion: 'Why is data considered as important factor for decision making?',
    displayQuestion: 'Why is data considered as important factor for decision making?',
    sourceKind: 'question-heading',
    sourceHeading: 'A5 · "Why is data considered as important factor for decision making?" [1]'
  },
  {
    id: 'board-b1',
    unit: 1,
    paper: 'board',
    code: 'B1',
    marks: '3',
    officialQuestion: 'Discuss any three importance of business intelligence.',
    displayQuestion: 'Discuss any three importance of business intelligence.',
    sourceKind: 'question-heading',
    sourceHeading: 'B1 · "Discuss any three importance of business intelligence." [3]'
  },
  {
    id: 'board-a2',
    unit: 2,
    paper: 'board',
    code: 'A2',
    marks: '1',
    officialQuestion: 'Why data in data warehouse must be non volatile?',
    displayQuestion: 'Why must warehouse data be non-volatile?',
    sourceKind: 'question-heading',
    sourceHeading: 'A2 · "Why must warehouse data be non-volatile?" [1]'
  },
  {
    id: 'board-a3',
    unit: 2,
    paper: 'board',
    code: 'A3',
    marks: '1',
    officialQuestion: 'How does data transformation improve the quality and usability of data in a warehouse?',
    displayQuestion: 'How does transformation improve data quality?',
    sourceKind: 'question-heading',
    sourceHeading: 'A3 · "How does transformation improve data quality?" [1]'
  },
  {
    id: 'board-a6',
    unit: 2,
    paper: 'board',
    code: 'A6',
    marks: '1',
    officialQuestion: 'What is Data Modelling?',
    displayQuestion: 'What is Data Modelling?',
    sourceKind: 'question-heading',
    sourceHeading: 'A6 · "What is Data Modelling?" [1]'
  },
  {
    id: 'board-b2',
    unit: 2,
    paper: 'board',
    code: 'B2',
    marks: '3',
    officialQuestion: 'Explain the ETL process.',
    displayQuestion: 'Explain the ETL process.',
    sourceKind: 'question-heading',
    sourceHeading: 'B2 · "Explain the ETL process." [3]'
  },
  {
    id: 'board-c2',
    unit: 2,
    paper: 'board',
    code: 'C2',
    marks: '5',
    officialQuestion: 'Illustrate and explain data warehouse architecture.',
    displayQuestion: 'Illustrate and explain DW architecture.',
    sourceKind: 'question-heading',
    sourceHeading: 'C2 · "Illustrate and explain DW architecture." [5]'
  },
  {
    id: 'board-a7',
    unit: 3,
    paper: 'board',
    code: 'A7',
    marks: '1',
    officialQuestion: 'Define the concept of association rule in datamining.',
    displayQuestion: 'Define the concept of association rule in data mining.',
    sourceKind: 'question-heading',
    sourceHeading: 'A7 · "Define the concept of association rule in data mining." [1] 🎯 1-mark'
  },
  {
    id: 'board-b3',
    unit: 3,
    paper: 'board',
    code: 'B3',
    marks: '3',
    officialQuestion: 'What is the importance of clustering algorithm? Explain with example.',
    displayQuestion: 'What is the importance of clustering algorithm? Explain with example.',
    sourceKind: 'question-heading',
    sourceHeading: 'B3 · "What is the importance of clustering algorithm? Explain with example." [3] 🎯 3-mark'
  },
  {
    id: 'board-c3',
    unit: 3,
    paper: 'board',
    code: 'C3',
    marks: '5',
    officialQuestion: '"A Retail Company wants to analyze customer data to improve sales", explain with example how classification algorithm can be applied to achieve this objective?',
    displayQuestion: 'A Retail Company wants to analyze customer data to improve sales — explain with example how classification algorithm can be applied.',
    sourceKind: 'question-heading',
    sourceHeading: 'C3 · "A Retail Company wants to analyze customer data to improve sales — explain with example how classification algorithm can be applied." [5] 🎯 5-mark'
  },
  {
    id: 'board-a8',
    unit: 4,
    paper: 'board',
    code: 'A8',
    marks: '1',
    officialQuestion: 'What is Data Visualization?',
    displayQuestion: 'What is Data Visualization?',
    sourceKind: 'question-heading',
    sourceHeading: 'A8 · "What is Data Visualization?" [1] 🎯 1-mark'
  },
  {
    id: 'board-b4',
    unit: 4,
    paper: 'board',
    code: 'B4',
    marks: '3',
    officialQuestion: 'Discuss any three factor that should be consider to design an effective dashboard for executives.',
    displayQuestion: 'Discuss any three factor that should be consider to design an effective dashboard for executives.',
    sourceKind: 'question-heading',
    sourceHeading: 'B4 · "Discuss any three factor that should be consider to design an effective dashboard for executives." [3] 🎯 3-mark'
  },
  {
    id: 'board-b6',
    unit: 4,
    paper: 'board',
    code: 'B6',
    marks: '3',
    officialQuestion: 'How poor visualization choices can mislead users? Explain with an example.',
    displayQuestion: 'How poor visualization choices can mislead users? Explain with an example.',
    sourceKind: 'question-heading',
    sourceHeading: 'B6 · "How poor visualization choices can mislead users? Explain with an example." [3] 🎯 3-mark'
  },
  {
    id: 'board-a9',
    unit: 5,
    paper: 'board',
    code: 'A9',
    marks: '1',
    officialQuestion: 'List any two BI tools.',
    displayQuestion: 'List any two BI tools.',
    sourceKind: 'question-heading',
    sourceHeading: 'A9 · "List any two BI tools." [1] 🎯 1-mark'
  },
  {
    id: 'board-a10',
    unit: 5,
    paper: 'board',
    code: 'A10',
    marks: '1',
    officialQuestion: 'What is the limitation of OLAP?',
    displayQuestion: 'What is the limitation of OLAP?',
    sourceKind: 'question-heading',
    sourceHeading: 'A10 · "What is the limitation of OLAP?" [1] 🎯 1-mark'
  },
  {
    id: 'board-b5',
    unit: 5,
    paper: 'board',
    code: 'B5',
    marks: '3',
    officialQuestion: 'How does OLAP differ from traditional database queries in terms of analysis capabilities?',
    displayQuestion: 'How does OLAP differ from traditional database queries in terms of analysis capabilities?',
    sourceKind: 'question-heading',
    sourceHeading: 'B5 · "How does OLAP differ from traditional database queries in terms of analysis capabilities?" [3] 🎯 3-mark'
  },
  {
    id: 'board-c4',
    unit: 5,
    paper: 'board',
    code: 'C4',
    marks: '5',
    officialQuestion: 'Compare Business Intelligence tools with traditional reporting tools. What makes BI more powerful? Explain.',
    displayQuestion: 'Compare Business Intelligence tools with traditional reporting tools. What makes BI more powerful? Explain.',
    sourceKind: 'question-heading',
    sourceHeading: 'C4 · "Compare Business Intelligence tools with traditional reporting tools. What makes BI more powerful? Explain." [5] 🎯 5-mark'
  },
  {
    id: 'board-c1',
    unit: 6,
    paper: 'board',
    code: 'C1',
    marks: '5',
    officialQuestion: 'Explain challenges in BI implementation with example.',
    displayQuestion: 'Explain challenges in BI implementation with example.',
    sourceKind: 'question-heading',
    sourceHeading: 'C1 · "Explain challenges in BI implementation with example." [5] 🎯 5-mark'
  },

  {
    id: 'model-a1',
    unit: 1,
    paper: 'model',
    code: 'A1',
    marks: '1',
    officialQuestion: 'Define Business Intelligence (BI).',
    displayQuestion: 'Define Business Intelligence (BI).',
    sourceKind: 'section',
    sourceHeading: '1.1 The BI Definition — Write This Version',
    answerHeadings: ['1.1 The BI Definition — Write This Version'],
    answerMode: 'direct'
  },
  {
    id: 'model-a2',
    unit: 1,
    paper: 'model',
    code: 'A2',
    marks: '1',
    officialQuestion: 'Give two benefits of BI in decision-making.',
    displayQuestion: 'Give two benefits of BI in decision-making.',
    sourceKind: 'section',
    sourceHeading: '1.3 Why BI Matters in Decision-Making',
    answerHeadings: [
      'First, Why Data Matters (this was a 1-marker)',
      'The Five Importance Points (the 3-marker "discuss any three importance")'
    ],
    answerMode: 'direct',
    includeAnswerHeadings: true
  },
  {
    id: 'model-a3',
    unit: 2,
    paper: 'model',
    code: 'A3',
    marks: '1',
    officialQuestion: 'What is a data warehouse?',
    displayQuestion: 'What is a data warehouse?',
    sourceKind: 'section',
    sourceHeading: '2.1 What a Data Warehouse Is',
    answerHeadings: ['2.1 What a Data Warehouse Is'],
    answerMode: 'direct'
  },
  {
    id: 'model-a4',
    unit: 2,
    paper: 'model',
    code: 'A4',
    marks: '1',
    officialQuestion: 'What does ETL stand for?',
    displayQuestion: 'What does ETL stand for?',
    sourceKind: 'section',
    sourceHeading: '2.3 ETL Processes',
    answerHeadings: ['2.3.1 Extract', '2.3.2 Transform', '2.3.3 Load'],
    answerMode: 'direct',
    includeAnswerHeadings: true
  },
  {
    id: 'model-a10',
    unit: 2,
    paper: 'model',
    code: 'A10',
    marks: '1',
    officialQuestion: 'Define metadata in the context of BI.',
    displayQuestion: 'Define metadata in BI context.',
    sourceKind: 'question-heading',
    sourceHeading: 'A10 · "Define metadata in BI context." [1]'
  },
  {
    id: 'model-b11',
    unit: 2,
    paper: 'model',
    code: 'B11',
    marks: '3',
    officialQuestion: 'Explain the role of ETL in a BI system.',
    displayQuestion: 'Explain the role of ETL in a BI system.',
    sourceKind: 'section',
    sourceHeading: '2.3 ETL Processes',
    answerHeadings: ['2.3.1 Extract', '2.3.2 Transform', '2.3.3 Load'],
    answerMode: 'direct',
    includeAnswerHeadings: true
  },
  {
    id: 'model-b12',
    unit: 2,
    paper: 'model',
    code: 'B12',
    marks: '3',
    officialQuestion: 'Describe the star schema and its main components.',
    displayQuestion: 'Describe the star schema and its main components.',
    sourceKind: 'section',
    sourceHeading: '2.4 Data Modelling',
    answerHeadings: ['2.4.1 Fact vs Dimension Tables', '2.4.2 Star vs Snowflake'],
    answerMode: 'direct',
    includeAnswerHeadings: true
  },
  {
    id: 'model-c17',
    unit: 2,
    paper: 'model',
    code: 'C17',
    marks: '5',
    officialQuestion: 'Describe a typical data warehouse architecture, naming its major layers and functions.',
    displayQuestion: 'Describe a typical data warehouse architecture, naming its major layers and functions.',
    sourceKind: 'section',
    sourceHeading: '2.2 Data Warehouse Architecture — Draw This Diagram',
    answerHeadings: ['2.2 Data Warehouse Architecture — Draw This Diagram'],
    answerMode: 'section',
    includeAnswerHeadings: true
  },
  {
    id: 'model-a5',
    unit: 3,
    paper: 'model',
    code: 'A5',
    marks: '1',
    officialQuestion: 'Define data mining in one sentence.',
    displayQuestion: 'Define data mining in one sentence.',
    sourceKind: 'section',
    sourceHeading: '3.1 What Data Mining Is — And What It Is Not 🎯 1-mark',
    answerHeadings: ['3.1 What Data Mining Is — And What It Is Not 🎯 1-mark'],
    answerMode: 'direct'
  },
  {
    id: 'model-a6',
    unit: 3,
    paper: 'model',
    code: 'A6',
    marks: '1',
    officialQuestion: 'Name one classification algorithm and one clustering algorithm.',
    displayQuestion: 'Name one classification algorithm and one clustering algorithm.',
    sourceKind: 'section',
    sourceHeading: 'Algorithms Worth Naming (Name + One Property Each)',
    answerHeadings: ['Algorithms Worth Naming (Name + One Property Each)'],
    answerMode: 'direct'
  },
  {
    id: 'model-b13',
    unit: 3,
    paper: 'model',
    code: 'B13',
    marks: '3',
    officialQuestion: 'What is data preprocessing and why is it important for data mining?',
    displayQuestion: 'What is data preprocessing and why is it important for data mining?',
    sourceKind: 'question-heading',
    sourceHeading: 'B13 · "What is data preprocessing and why is it important for data mining?" [3] 🎯 3-mark'
  },
  {
    id: 'model-b14',
    unit: 3,
    paper: 'model',
    code: 'B14',
    marks: '3',
    officialQuestion: 'Briefly explain the difference between supervised and unsupervised learning.',
    displayQuestion: 'Briefly explain the difference between supervised and unsupervised learning.',
    sourceKind: 'section',
    sourceHeading: '3.3 Classification and Clustering — The Distinction The Paper Tests Directly 🎯 3-mark / 🎯 5-mark',
    answerHeadings: ['3.3 Classification and Clustering — The Distinction The Paper Tests Directly 🎯 3-mark / 🎯 5-mark'],
    answerMode: 'direct'
  },
  {
    id: 'model-c18',
    unit: 3,
    paper: 'model',
    code: 'C18',
    marks: '5',
    officialQuestion: 'Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each.',
    displayQuestion: 'Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each.',
    sourceKind: 'question-heading',
    sourceHeading: 'C18 · Model Question — "Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each." [5] 🎯 5-mark'
  },
  {
    id: 'model-c19',
    unit: 3,
    paper: 'model',
    code: 'C19',
    marks: '5',
    officialQuestion: 'Explain association rule mining, including definitions of support and confidence, and give a simple example of an association rule from retail transactions.',
    displayQuestion: 'Explain association rule mining, including definitions of support and confidence, and give a simple example of an association rule from retail transactions.',
    sourceKind: 'section',
    sourceHeading: '3.4 Association Rule Mining — A7 Lives Here 🎯 1-mark / 🎯 5-mark',
    answerHeadings: ['3.4 Association Rule Mining — A7 Lives Here 🎯 1-mark / 🎯 5-mark'],
    answerMode: 'section',
    includeAnswerHeadings: true
  },
  {
    id: 'model-a7',
    unit: 4,
    paper: 'model',
    code: 'A7',
    marks: '1',
    officialQuestion: 'State one principle of effective data visualization.',
    displayQuestion: 'State one principle of effective data visualization.',
    sourceKind: 'section',
    sourceHeading: 'Principle 1 — Encode With the Channels the Eye Reads Accurately',
    answerHeadings: ['Principle 1 — Encode With the Channels the Eye Reads Accurately'],
    answerMode: 'direct'
  },
  {
    id: 'model-b15',
    unit: 4,
    paper: 'model',
    code: 'B15',
    marks: '3',
    officialQuestion: 'List three best practices for dashboard design.',
    displayQuestion: 'List three best practices for dashboard design.',
    sourceKind: 'section',
    sourceHeading: 'The Three Factors to Write (B4)',
    answerHeadings: ['The Three Factors to Write (B4)'],
    answerMode: 'direct'
  },
  {
    id: 'model-c20',
    unit: 4,
    paper: 'model',
    code: 'C20',
    marks: '5',
    officialQuestion: 'Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose.',
    displayQuestion: 'Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose.',
    sourceKind: 'question-heading',
    sourceHeading: 'C20 · Model Question — "Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose." [5] 🎯 5-mark'
  },
  {
    id: 'model-a8',
    unit: 5,
    paper: 'model',
    code: 'A8',
    marks: '1',
    officialQuestion: 'Give one popular BI tool.',
    displayQuestion: 'Give one popular BI tool.',
    sourceKind: 'question-heading',
    sourceHeading: 'A8 · Model Question — "Give one popular BI tool." [1] 🎯 1-mark'
  },
  {
    id: 'model-a9',
    unit: 5,
    paper: 'model',
    code: 'A9',
    marks: '1',
    officialQuestion: 'What is OLAP used for?',
    displayQuestion: 'What is OLAP used for?',
    sourceKind: 'question-heading',
    sourceHeading: 'A9 · Model Question — "What is OLAP used for?" [1] 🎯 1-mark'
  },
  {
    id: 'model-b16',
    unit: 6,
    paper: 'model',
    code: 'B16',
    marks: '3',
    officialQuestion: 'Outline key challenges organizations face when implementing BI solutions.',
    displayQuestion: 'Outline key challenges organizations face when implementing BI solutions.',
    sourceKind: 'question-heading',
    sourceHeading: 'B16 · "Outline key challenges organizations face when implementing BI solutions." [3] 🎯 3-mark'
  },
  {
    id: 'model-d21',
    unit: 6,
    paper: 'model',
    code: 'D21',
    marks: '10',
    officialQuestion: 'A mid-size retail company wants to implement a BI solution to improve sales forecasting and inventory planning. Propose an end-to-end BI approach covering data sources, ETL strategy, data modeling, choice of BI tools, visualization/dashboarding, and governance. Explain why each component is chosen and how they integrate to deliver business value.',
    displayQuestion: '"A mid-size retail company wants to implement a BI solution to improve sales forecasting and inventory planning. Propose an end-to-end BI approach covering data sources, ETL strategy, data modelling, choice of BI tools, visualization/dashboarding, and governance. Explain why each component is chosen and how they integrate to deliver business value."',
    sourceKind: 'question-heading',
    sourceHeading: 'D21 · Retailer End-to-End [10] 🎯 10-mark'
  },
  {
    id: 'model-d22',
    unit: 6,
    paper: 'model',
    code: 'D22',
    marks: '10',
    officialQuestion: 'A healthcare provider plans to deploy a BI platform. Discuss major implementation best practices and potential challenges — technical, organizational, and data-related. Provide a phased implementation plan (high level) with key milestones.',
    displayQuestion: '"A healthcare provider plans to deploy a BI platform. Discuss major implementation best practices and potential challenges — technical, organizational, and data-related. Provide a phased implementation plan (high level) with key milestones."',
    sourceKind: 'question-heading',
    sourceHeading: 'D22 · Healthcare Phased Plan [10] 🎯 10-mark'
  }
];

export const BI_QUESTION_MANIFEST_BY_ID = new Map(
  BI_QUESTION_MANIFEST.map(question => [question.id, question])
);

export const BI_QUESTION_UNIT_COUNTS = BI_QUESTION_MANIFEST.reduce((counts, question) => {
  counts[question.unit] = (counts[question.unit] ?? 0) + 1;
  return counts;
}, {});
