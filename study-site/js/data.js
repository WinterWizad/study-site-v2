/**
 * Study Materials Data - BIM 8th Semester
 * BI Unit 1 + Full Syllabus
 */

const STUDY_DATA = {
  // Subject metadata
  subjects: {
    bi: {
      id: 'bi',
      code: 'IT 249',
      name: 'Business Intelligence',
      fullName: 'Business Intelligence',
      credits: 3,
      hours: 48,
      marks: 60,
      passMarks: 30,
      nature: 'Required (Core)',
      color: '#2563eb',
      icon: 'chart-bar',
      description: 'Enable students to understand the role and importance of Business Intelligence in modern organisations; learn key concepts and techniques in data warehousing, data mining and data visualisation; gain hands-on familiarity with popular BI tools; and develop the skill of analysing and interpreting data to support decision-making.',
      examPattern: '60 marks / 30 pass | Group A: 10×1 | Group B: 5×3 | Group C: 3×5 | Group D: 2×10',
      syllabusSource: 'TU FOM BIM 8th Semester Syllabus 2025 (verified against PDF)',
      modelQuestionSource: 'TU/FOM Model Question 2026 (official)',
      units: [
        { id: 1, title: 'Introduction to Business Intelligence', hours: 5, marks2026: 6, difficulty: '★★☆☆☆', status: 'complete' },
        { id: 2, title: 'Data Warehousing', hours: 8, marks2026: 11, difficulty: '★★★☆☆', status: 'pending' },
        { id: 3, title: 'Data Mining', hours: 8, marks2026: 9, difficulty: '★★★★☆', status: 'pending' },
        { id: 4, title: 'Data Visualization', hours: 7, marks2026: 7, difficulty: '★★☆☆☆', status: 'pending' },
        { id: 5, title: 'BI Tools and Technologies', hours: 12, marks2026: 10, difficulty: '★★★☆☆', status: 'pending' },
        { id: 6, title: 'BI Implementation', hours: 8, marks2026: 25, difficulty: '★★★★☆', status: 'pending' }
      ],
      readings: [
        'Sherman, R. (2014). Business Intelligence Guidebook: From Data Integration to Analytics. Morgan Kaufmann.',
        'Provost, F. & Fawcett, T. (2013). Data Science for Business. O\'Reilly.',
        'Kimball, R. & Ross, M. (2013). The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling. Wiley.',
        'Han, J., Kamber, M. & Pei, J. (2011). Data Mining: Concepts and Techniques. Morgan Kaufmann.',
        'Tufte, E. R. (2001). The Visual Display of Quantitative Information. Graphics Press.'
      ]
    },
    de: {
      id: 'de',
      code: 'IT 250',
      name: 'Digital Economy',
      fullName: 'Digital Economy',
      credits: 3,
      hours: 48,
      marks: 100,
      passMarks: 50,
      nature: 'Information Technology and Computing',
      color: '#16a34a',
      icon: 'globe',
      description: 'This course deals with the introduction to digital economy, fundamentals of digital economy, digital markets, strategy and innovation, digital transformation, economics of information, and digitalization from a Nepalese perspective.',
      examPattern: '100 marks / 50 pass | Group A: 10×2 | Group B: 6×5 | Group C: 3×10 | Group D: 1×20',
      status: 'planned'
    },
    cc: {
      id: 'cc',
      code: 'IT 277',
      name: 'Cloud Computing',
      fullName: 'Cloud Computing',
      credits: 3,
      hours: 48,
      marks: 60,
      passMarks: 30,
      nature: 'Elective',
      color: '#f59e0b',
      icon: 'cloud',
      description: 'This course provides both theoretical and practical knowledge of cloud computing. It covers key concepts and practices related to designing, implementing, and managing cloud-based systems.',
      examPattern: '60 marks / 30 pass | Group A: 10×1 | Group B: 5×3 | Group C: 3×5 | Group D: 2×10',
      status: 'planned'
    },
    iem: {
      id: 'iem',
      code: 'IT 248',
      name: 'IT Entrepreneurship & Management',
      fullName: 'IT Entrepreneurship and Management',
      credits: 3,
      hours: 48,
      marks: 100,
      passMarks: 50,
      nature: 'Information Technology and Computing',
      color: '#dc2626',
      icon: 'briefcase',
      description: 'Equip students with knowledge and skills to launch and manage successful IT-based startups through real-world case studies and experiential learning.',
      examPattern: '100 marks / 50 pass | Group A: 10×2 | Group B: 6×5 | Group C: 3×10 | Group D: 1×20',
      status: 'planned'
    }
  },

  // BI Unit 1 Complete Content
  biUnit1: {
    subjectId: 'bi',
    unitId: 1,
    title: 'Introduction to Business Intelligence',
    hours: 5,
    marks2026: 6,
    difficulty: '★★☆☆☆',
    examYield: 'Medium — always present, never large. Cheap marks.',
    prerequisites: 'None. This unit is the vocabulary the rest of the paper assumes.',
    syllabusBullets: [
      'Definition and scope of BI',
      'Importance of BI in decision-making',
      'Overview of BI tools and technologies'
    ],
    whyMatters: 'Every other answer in the paper borrows its vocabulary. You cannot answer the 20-mark case ("how does Amazon use BI?") without being able to say what BI *is*. Get the definitions exact here and you get free marks in Groups A and D simultaneously.',

    sections: [
      {
        id: 'definition',
        title: 'The Definition — Write This Version',
        type: 'definition',
        content: `**Business Intelligence (BI) is the set of processes, technologies and tools that collect data from multiple sources, transform it into a reliable, query-ready form, and present it as information that managers use to make faster and better decisions.**`,
        breakdown: [
          { part: 'Processes', meaning: 'ETL, reporting cycles, governance', why: 'BI is a discipline, not a product' },
          { part: 'Technologies & tools', meaning: 'data warehouse, OLAP, dashboards, Tableau/Power BI', why: 'the syllabus\' Unit 2 and Unit 5' },
          { part: 'Transformation', meaning: 'raw, messy, multi-source → clean, consistent', why: 'this is the work nobody sees' },
          { part: 'Decision', meaning: 'the output is a *decision*, not a chart', why: 'the point of the whole course' }
        ],
        memoryHook: 'C-T-P-D: Collect → Transform → Present → Decide',
        trap: 'The most common mistake: writing "BI is software like Power BI". That is a *tool used by* BI. A tool-only answer to a definition question loses the mark.'
      },
      {
        id: 'scope',
        title: 'Scope of BI — How to Answer "List Any Two"',
        type: 'concept',
        content: '"Scope" means **how far BI reaches** — both across the organisation and across levels of analysis. Students lose this mark because "scope" sounds like "features" and they list tool names.',
        analyticalLadder: [
          { level: 1, name: 'Descriptive', question: 'What happened?', capability: 'dashboards, reports', example: 'last month\'s sales by branch' },
          { level: 2, name: 'Diagnostic', question: 'Why did it happen?', capability: 'drill-down, OLAP, root-cause', example: 'which product drove the drop' },
          { level: 3, name: 'Predictive', question: 'What will happen?', capability: 'forecasting, data mining models', example: 'next quarter\'s demand' },
          { level: 4, name: 'Prescriptive', question: 'What should we do?', capability: 'optimisation, recommendation', example: 'reorder quantities per store' }
        ],
        orgScope: [
          'Functional scope — one department (sales, HR, finance) → enterprise scope — one governed data warehouse feeding every function',
          'Data scope — internal transactional data → external data (market, competitor, social, web)',
          'Time scope — historical reporting → real-time/near-real-time monitoring',
          'User scope — analyst-authored reports → self-service BI for managers on mobile'
        ],
        nepalAnchor: 'A Nepali commercial bank\'s BI scope typically runs from *branch-level daily deposit and loan reports* (descriptive, functional) to *NPL early-warning dashboards and customer churn scoring* (predictive, enterprise). Same discipline, different rung of the ladder.',
        safeAnswer: 'BI\'s scope spans descriptive reporting, diagnostic drill-down, predictive forecasting and prescriptive recommendation, across functions from a single department to the whole enterprise.',
        diagram: 'analytical-ladder'
      },
      {
        id: 'importance',
        title: 'Why BI Matters in Decision-Making',
        type: 'concept',
        content: 'First, why *data* matters (this was literally a 1-marker): Because decisions made on intuition are **unverifiable and unrepeatable**; data makes a decision traceable to evidence, comparable across periods, and correctable when wrong. In one line: *data converts opinion into evidence.*',
        importancePoints: [
          { num: 1, title: 'Faster decisions', justification: 'pre-aggregated, query-ready data removes the wait for a report', example: 'branch manager sees yesterday\'s position today' },
          { num: 2, title: 'Better-quality decisions', justification: 'one governed version of the truth removes conflicting spreadsheets', example: 'finance and sales quote the same revenue figure' },
          { num: 3, title: 'Single source of truth', justification: 'central warehouse + definitions (Unit 2)', example: '"active customer" defined once' },
          { num: 4, title: 'Trend and pattern discovery', justification: 'historical data reveals seasonality and anomalies', example: 'Dashain–Tihar demand spikes, visible in advance' },
          { num: 5, title: 'Competitive advantage / cost control', justification: 'spot loss-making products and idle inventory early', example: 'discontinue a product line before the year-end loss' }
        ],
        memoryHook: 'F-B-S-T-C — Faster, Better, Single truth, Trends, Competitive edge',
        trap: '"Importance" questions want **consequence**, not definition. "BI means business intelligence" earns zero of three. Each point must say *what improves as a result*.',
        whatBIDoesNotFix: 'BI improves the *evidence*; it does not improve the *decision-maker*. Poor data quality, unclear ownership and unexploded recommendations (dashboards nobody acts on — the "BI shelfware" problem) all survive a perfect warehouse. Examiners like this sentence in 5-markers and in the case\'s ethics part.',
        table: 'importance-table'
      },
      {
        id: 'tools',
        title: 'Overview of BI Tools and Technologies',
        type: 'concept',
        content: 'You need two things here: the **stack** (in order) and **two tool names** (that is literally a 1-marker: "list any two BI tools").',
        biStack: [
          { layer: 'Sources', items: ['ERP/POS', 'CRM', 'Excel', 'Web/API', 'Sensors'] },
          { layer: 'Integration', items: ['ETL (extract, transform, load)'] },
          { layer: 'Storage', items: ['Data Warehouse / Data Marts'] },
          { layer: 'Analysis', items: ['OLAP', 'Mining', 'Statistics', 'Queries'] },
          { layer: 'Presentation', items: ['Dashboards', 'Reports', 'Alerts', 'Mobile'] }
        ],
        stackDiagram: 'bi-stack',
        toolCategories: [
          { category: 'Visualisation / dashboard BI', description: 'drag-and-drop analysis and dashboards over a warehouse', tools: ['Tableau', 'Microsoft Power BI', 'Qlik Sense', 'Google Looker Studio'], examValue: 'the two the syllabus names' },
          { category: 'Enterprise reporting tools', description: 'pixel-perfect, scheduled, paginated reports (invoices, statutory returns)', tools: ['SSRS', 'Crystal Reports', 'JasperReports'], examValue: 'the "traditional" side of C4' },
          { category: 'OLAP / cube engines', description: 'pre-computed multidimensional stores that BI tools query', tools: ['SSAS (Tabular/Multidimensional)', 'Oracle Essbase', 'Mondrian'], examValue: 'Unit 5 builds on this' },
          { category: 'Cloud-native BI', description: 'same analysis, no server to run', tools: ['Amazon QuickSight', 'Power BI Service', 'Looker', 'Looker Studio'], examValue: 'cheap example in an answer' },
          { category: 'Open-source BI', description: 'low-cost self-service', tools: ['Apache Superset', 'Metabase', 'Redash'], examValue: 'one line if asked for alternatives' },
          { category: 'Embedded analytics', description: 'dashboards inside another product', tools: ['Power BI Embedded', 'Tableau Embedded'], examValue: 'recognise the term' }
        ],
        trap: 'The 1-marker says *"List any two BI tools"*. "Excel" and "SQL" are not BI tools in this context — Excel is a spreadsheet and SQL is a language. Microsoft Power BI and Tableau are the safe two, every time.',
        safeAnswer: 'Microsoft Power BI and Tableau.',
        handsOnWorkflow: [
          { step: 1, name: 'Connect', description: 'point the tool at the warehouse/cube/file; choose import (in-memory) or direct query (live)', why: 'import is fast, direct query is fresh — the classic trade-off' },
          { step: 2, name: 'Model', description: 'define relationships (fact → dimensions), create measures and calculated columns', why: 'this is where the star schema from Unit 2 pays off' },
          { step: 3, name: 'Visualise', description: 'drag fields onto a canvas; the tool generates the chart, you choose the type', why: 'Unit 4\'s principles apply here, not different ones' },
          { step: 4, name: 'Publish / share', description: 'publish to a workspace or server; set row-level security and permissions', why: 'separates a personal workbook from a governed asset' },
          { step: 5, name: 'Schedule / refresh / govern', description: 'refresh cadence, usage monitoring, certified datasets', why: 'the difference between a demo and a BI implementation (Unit 6)' }
        ],
        memoryHook: 'C-M-V-P-S — Connect, Model, Visualise, Publish, Schedule. Five steps, and they map onto the five clauses of the definition.',
        nepalReality: 'Most Nepali mid-size organisations run BI on **Excel + Power BI** against a SQL database, with Tableau in larger banks and telecoms. Say that instead of pretending everyone has a full warehouse — it reads like someone who has seen the inside of a Nepali office.'
      }
    ],

    skeletons: [
      {
        q: 'A1',
        question: 'List any two scope of business intelligence.',
        marks: 1,
        answer: `BI's scope ranges from **descriptive reporting** (what happened) through **diagnostic drill-down** (why) to **predictive forecasting** and **prescriptive recommendation**; organisationally it extends from a single department's reports to enterprise-wide, governed analytics.`,
        words: 28
      },
      {
        q: 'A4',
        question: 'What is data analysis?',
        marks: 1,
        answer: `Data analysis is the process of inspecting, cleaning and modelling data to discover useful information, draw conclusions and support decision-making.`,
        note: 'Do **not** swap in a definition of data mining here. Mining is a *technique within* analysis: algorithmic pattern discovery in large datasets. If the question says "analysis", keep it general.'
      },
      {
        q: 'A5',
        question: 'Why is data considered as important factor for decision making?',
        marks: 1,
        answer: `Because data-based decisions are evidence-based: data makes a decision traceable to facts, comparable over time, and correctable when outcomes differ — unlike intuition, which cannot be verified or repeated.`
      },
      {
        q: 'B1',
        question: 'Discuss any three importance of business intelligence.',
        marks: 3,
        answer: `Business intelligence matters because it converts scattered operational data into decision-ready evidence. **First, it speeds up decisions** — pre-aggregated warehouse data removes the wait for manual reports, so managers act within the reporting cycle rather than after it. **Second, it improves decision quality** by giving every function a single governed version of the truth, ending the situation where finance and sales quote different revenue figures. **Third, it exposes trends and anomalies** — seasonality, declining products, idle inventory — early enough to act on. Together these shift management from reactive reporting to proactive control.`,
        note: 'Structure: 1 opening line + three points, each with a consequence + 1 closing line. ~100 words. Each point = claim + "because/how" clause + concrete consequence. Three bare claims = 1.5/3 at best.'
      }
    ],

    traps: [
      { name: '"BI = Power BI / Tableau"', reason: 'confuses tool with discipline; ruins the definition and the case', fix: 'always say processes + technologies + decisions' },
      { name: 'Listing tool names when asked for *scope*', reason: 'answers a different question', fix: 'scope = ladder + organisational reach' },
      { name: '"Importance" answered with definitions', reason: 'no consequence = no marks', fix: 'every point needs "…so that…"' },
      { name: 'Data analysis vs data mining mixed up', reason: 'guarantees a lost 1-mark, and weakens Unit 3', fix: 'analysis = general; mining = algorithmic patterns in big data' },
      { name: 'Forgetting that BI is only as good as its data', reason: 'loses the evaluation line in 5-markers and the ethics part of Group D', fix: '"garbage in, garbage out — BI improves evidence, not the decision-maker"' },
      { name: 'Writing 80 words for a 1-mark question', reason: 'burns Group D time', fix: '1 mark = one sentence, ≤30 words, move on' }
    ],

    selfTest: [
      { q: 'Define BI in one sentence containing the words *process*, *technologies* and *decision*.', marks: '1 mark' },
      { q: 'Name the four levels of analytical scope and give the question each answers.', marks: '3 marks' },
      { q: 'Give any three importances of BI, each with a consequence.', marks: '3 marks' },
      { q: 'What is the difference between data analysis and data mining?', marks: '1–3 marks, depending on paper mood' },
      { q: 'Name the five stages of the BI stack from source to decision.', marks: '3 marks' },
      { q: 'A Kathmandu retail chain has POS data from 40 outlets, one Excel report per outlet, and managers who argue about whose number is right. Name the *first* BI problem to fix and which stack stage it belongs to.', marks: '5 marks — mini case' }
    ],

    sixtySecondCheck: [
      'Write the BI definition from memory (all four parts)',
      'Draw the five-stage BI stack',
      'Name three importance points, each with a consequence',
      'Name two BI tools **and** two ETL tools',
      'Give one line distinguishing data analysis from data mining'
    ],

    diagrams: [
      { id: 'analytical-ladder', title: 'Analytical Ladder (Descriptive → Diagnostic → Predictive → Prescriptive)', type: 'svg', description: 'Four-level ladder showing analytical maturity' },
      { id: 'bi-stack', title: 'BI Stack (Sources → Integration → Storage → Analysis → Presentation)', type: 'svg', description: 'Five-layer BI architecture stack' },
      { id: 'diwk-hierarchy', title: 'DIKW Hierarchy (Data → Information → Knowledge → Wisdom)', type: 'svg', description: 'Classic DIKW pyramid' }
    ]
  },

  // Full BI Syllabus
  biSyllabus: {
    subjectId: 'bi',
    courseTitle: 'Business Intelligence',
    courseCode: 'IT 249',
    semester: 8,
    nature: 'Required (core)',
    fullMarks: 60,
    passMarks: 30,
    creditHours: 3,
    curriculum: 'BIM, effective from 2021',
    totalLectureHours: 48,
    source: 'TU, Faculty of Management, Office of the Dean - BIM 8th Semester Syllabus 2025',
    pdfSource: 'fomecd.edu.np/syllabuses/BIM 8th Semester Syllabus 2025.pdf',
    verified: true,
    courseObjective: 'Enable students to understand the role and importance of Business Intelligence in modern organisations; learn key concepts and techniques in data warehousing, data mining and data visualisation; gain hands-on familiarity with popular BI tools; and develop the skill of analysing and interpreting data to support decision-making.',
    courseDescription: 'Introduces the concepts, techniques and tools used in business intelligence and data analytics, and how BI transforms data into insights for organisational decision-making.',
    units: [
      {
        id: 1,
        title: 'Introduction to Business Intelligence',
        hours: 5,
        bullets: [
          'Definition and scope of BI',
          'Importance of BI in decision-making',
          'Overview of BI tools and technologies'
        ],
        marks2026: 6,
        difficulty: '★★☆☆☆',
        status: 'complete'
      },
      {
        id: 2,
        title: 'Data Warehousing',
        hours: 8,
        bullets: [
          'Introduction to data warehousing concepts',
          'Data warehouse architecture',
          'ETL (Extract, Transform, Load) processes',
          'Data modelling for BI'
        ],
        marks2026: 11,
        difficulty: '★★★☆☆',
        status: 'pending'
      },
      {
        id: 3,
        title: 'Data Mining',
        hours: 8,
        bullets: [
          'Introduction to data mining concepts',
          'Data preprocessing techniques',
          'Classification and clustering algorithms',
          'Association rule mining'
        ],
        marks2026: 9,
        difficulty: '★★★★☆',
        status: 'pending'
      },
      {
        id: 4,
        title: 'Data Visualization',
        hours: 7,
        bullets: [
          'Principles of data visualization',
          'Tools and techniques for data visualization',
          'Dashboard design and best practices'
        ],
        marks2026: 7,
        difficulty: '★★☆☆☆',
        status: 'pending'
      },
      {
        id: 5,
        title: 'BI Tools and Technologies',
        hours: 12,
        bullets: [
          'Overview of popular BI tools (Tableau, Power BI)',
          'Hands-on experience with BI tools for analysis and reporting',
          'Introduction to OLAP'
        ],
        marks2026: 10,
        difficulty: '★★★☆☆',
        status: 'pending'
      },
      {
        id: 6,
        title: 'BI Implementation',
        hours: 8,
        bullets: [
          'Best practices for implementing BI solutions',
          'Challenges and considerations in BI implementation',
          'Case studies of successful BI implementations'
        ],
        marks2026: 25,
        difficulty: '★★★★☆',
        status: 'pending'
      }
    ],
    suggestedReadings: [
      'Sherman, R. (2014). *Business Intelligence Guidebook: From Data Integration to Analytics.* Morgan Kaufmann.',
      'Provost, F. & Fawcett, T. (2013). *Data Science for Business.* O\'Reilly.',
      'Kimball, R. & Ross, M. (2013). *The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling.* Wiley.',
      'Han, J., Kamber, M. & Pei, J. (2011). *Data Mining: Concepts and Techniques.* Morgan Kaufmann.',
      'Tufte, E. R. (2001). *The Visual Display of Quantitative Information.* Graphics Press.'
    ],
    examPattern: {
      fullMarks: 60,
      passMarks: 30,
      time: '3 Hours',
      groups: [
        { name: 'Group A', format: '10 × 1 = 10', description: 'Brief answer questions (attempt all)' },
        { name: 'Group B', format: 'any 5 of 6 × 3 = 15', description: 'Short answer questions' },
        { name: 'Group C', format: 'any 3 of 4 × 5 = 15', description: 'Long answer questions' },
        { name: 'Group D', format: '2 × 10 = 20', description: 'Comprehensive answer / case / situation analysis' }
      ]
    },
    hoursBreakdown: [
      { unit: 1, title: 'Introduction', hours: 5, marks: 6, weight: 'Medium' },
      { unit: 2, title: 'Data Warehousing', hours: 8, marks: 11, weight: 'High' },
      { unit: 3, title: 'Data Mining', hours: 8, marks: 9, weight: 'High' },
      { unit: 4, title: 'Data Visualization', hours: 7, marks: 7, weight: 'Medium' },
      { unit: 5, title: 'BI Tools & Technologies', hours: 12, marks: 10, weight: 'High' },
      { unit: 6, title: 'BI Implementation', hours: 8, marks: 25, weight: 'Highest' }
    ]
  },

  // Model Question for BI
  biModelQuestion: {
    subjectId: 'bi',
    year: 2026,
    fullMarks: 60,
    passMarks: 30,
    time: '3 Hours',
    groups: {
      A: {
        name: 'Group A',
        format: '10 × 1 = 10',
        questions: [
          { num: 1, text: 'Define Business Intelligence (BI).', unit: 1 },
          { num: 2, text: 'Give two benefits of BI in decision-making.', unit: 1 },
          { num: 3, text: 'What is a data warehouse?', unit: 2 },
          { num: 4, text: 'What does ETL stand for?', unit: 2 },
          { num: 5, text: 'Define data mining in one sentence.', unit: 3 },
          { num: 6, text: 'Name one classification algorithm and one clustering algorithm.', unit: 3 },
          { num: 7, text: 'State one principle of effective data visualization.', unit: 4 },
          { num: 8, text: 'Give one popular BI tool.', unit: 5 },
          { num: 9, text: 'What is OLAP used for?', unit: 5 },
          { num: 10, text: 'Define metadata in the context of BI.', unit: 2 }
        ]
      },
      B: {
        name: 'Group B',
        format: '5 × 3 = 15',
        questions: [
          { num: 11, text: 'Explain the role of ETL in a BI system.', unit: 2 },
          { num: 12, text: 'Describe the star schema and its main components.', unit: 2 },
          { num: 13, text: 'What is data preprocessing and why is it important for data mining?', unit: 3 },
          { num: 14, text: 'Briefly explain the difference between supervised and unsupervised learning.', unit: 3 },
          { num: 15, text: 'List three best practices for dashboard design.', unit: 4 },
          { num: 16, text: 'Outline key challenges organizations face when implementing BI solutions.', unit: 6 }
        ]
      },
      C: {
        name: 'Group C',
        format: '3 × 5 = 15',
        questions: [
          { num: 17, text: 'Describe a typical data warehouse architecture, naming its major layers and functions.', unit: 2 },
          { num: 18, text: 'Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each.', unit: 3 },
          { num: 19, text: 'Explain association rule mining, including definitions of support and confidence, and give a simple example of an association rule from retail transactions.', unit: 3 },
          { num: 20, text: 'Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose.', unit: 4 }
        ]
      },
      D: {
        name: 'Group D',
        format: '2 × 10 = 20',
        questions: [
          { num: 21, text: 'A mid-size retail company wants to implement a BI solution to improve sales forecasting and inventory planning. Propose an end-to-end BI approach covering data sources, ETL strategy, data modeling, choice of BI tools, visualization/dashboarding, and governance. Explain why each component is chosen and how they integrate to deliver business value.', units: [2, 6] },
          { num: 22, text: 'A healthcare provider plans to deploy a BI platform. Discuss major implementation best practices and potential challenges — technical, organizational, and data-related. Provide a phased implementation plan (high level) with key milestones.', unit: 6 }
        ]
      }
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STUDY_DATA;
}