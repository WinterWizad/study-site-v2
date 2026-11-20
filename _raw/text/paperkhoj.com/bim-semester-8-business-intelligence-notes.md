# Unit 1: Introduction to Business Intelligence — IT 249 Business Intelligence Study Notes | Paper Khoj
_Source: https://paperkhoj.com/bim/semester-8/business-intelligence/notes_

[Home](/)/[BIM](/bim)/[Semester 8](/bim/semester-8)/[IT 249](/bim/semester-8/business-intelligence/papers)/Study notes

IT 249

# Business Intelligence

TU BIM · Semester 8 · BIM curriculum effective from 2021

Requirementrequired

Credits3

Study Guide6 units available
[Past papers](/bim/semester-8/business-intelligence/papers)[Practice sets](/bim/semester-8/business-intelligence/practice-sets)[Syllabus](/bim/semester-8/business-intelligence/syllabus)[Chapter questions](/bim/semester-8/business-intelligence/chapter-questions)[Study notes](/bim/semester-8/business-intelligence/notes)

## Chapter notes

Authoritative study guide across 6 syllabus units

Open a unit to read its study notes.

### Syllabus Units

Unit 1Introduction to Business Intelligence

→

Unit 2Data Warehousing

→

Unit 3Data Mining

→

Unit 4Data Visualization

→

Unit 5BI Tools and Technologies

→

Unit 6BI Implementation

→

## Unit 1: Introduction to Business Intelligence· 5 LHs· ~6 marks

Print Unit[Suggest correction](/feedback?course_code=IT+249&chapter_unit=Unit+1&chapter_title=Introduction+to+Business+Intelligence)

Pass path: Learn the definition of Business Intelligence (BI), the 4 stages of the analytical maturity curve (Descriptive, Diagnostic, Predictive, Prescriptive), and the high-level BI architecture.
Top path: Contrast tactical operational reporting with strategic BI decision systems, evaluate real-time stream analytics vs batch processing, and analyze ROI calculation for enterprise BI investments.

### Part 1: Core Concepts (2 Marks)

- ★ Business Intelligence (BI): An umbrella term that combines architectures, data integration tools, databases, analytical tools, and visualization applications to enable business users to transform raw operational data into actionable strategic insights.

- ★ The Four Tiers of Analytics:

- Descriptive Analytics: What happened? (Historical reporting, KPI dashboards).

- Diagnostic Analytics: Why did it happen? (Drill-down, root-cause OLAP).

- Predictive Analytics: What will happen? (Statistical forecasting, machine learning models).

- Prescriptive Analytics: What should we do about it? (Optimization algorithms, simulation models).

- ★ Key Performance Indicator (KPI): A quantifiable metric that reflects the critical success factors of an organization and measures progress toward specific operational or strategic goals.

### Part 2: Structural Frameworks (10 Marks)

#### 1. Business Intelligence Architecture: Framework, Value Chain, and Executive Decision Support

- Introduction: Define BI. Explain that modern enterprises suffer from being “data rich but information poor” (DRIP syndrome). BI bridges this chasm by delivering the right information to the right decision-makers at the right time.

#### Comprehensive BI Architectural Pipeline

BI End-to-End Architecture

- Data Sourcing Layer: Operational OLTP databases (ERP, CRM, e-commerce transactions), flat files, legacy systems, external web APIs, and IoT telemetries.

- Data Integration / ETL Layer: Extracting raw data from disparate heterogeneous sources, Transforming data (cleaning, standardizing dates, deduplicating keys), and Loading into centralized stores.

- Data Storage & Warehouse Layer: Enterprise Data Warehouses (EDW), Operational Data Stores (ODS), and departmental Data Marts modeled via dimensional schemas.

- Analytics & Processing Layer: OLAP multidimensional analytical servers, data mining engines, and predictive statistical algorithms.

- Presentation & Visualization Layer: Executive dashboards, automated threshold alerts, mobile BI apps, ad-hoc SQL query interfaces (Power BI, Tableau).

- Importance of BI in Contemporary Decision-Making:

- Eliminates gut-feeling guesswork by anchoring decisions in empirical data.

- Compresses cycle times for operational reporting from weeks to seconds.

- Enables cross-departmental alignment around a Single Source of Truth (SSOT).

- Identifies emerging customer churn patterns before revenues collapse.

- Conclusion: BI is not merely a software suite; it is an organizational capability converting historical data assets into enduring competitive advantage.

### Part 3: Distinction Tables

Criteria |
Operational Systems (OLTP) |
Business Intelligence Systems (BI / OLAP) |

Primary Objective |
Run day-to-day core transactional operations smoothly |
Support long-term management decision analysis |

User Base |
Frontline operational clerks, customers, cashiers |
Executives, business analysts, data scientists |

Data Nature |
Current, real-time snapshot; highly volatile and updated in-place |
Historical, summarized, non-volatile, periodic batch loads |

Query Type |
Simple, highly predictable, rapid read/write lookups |
Complex, multi-table aggregations scanning millions of records |

Database Design |
Normalized (3NF) to maximize write speed and eliminate anomalies |
De-normalized Star/Snowflake schemas optimized for analytical reads |

### Part 4: Worked Problems & Exam Traps

- Problem 1 (Easy): Classify each of the following business questions into one of the four tiers of analytics (Descriptive, Diagnostic, Predictive, Prescriptive):

- “Which 10 products generated the highest gross revenue last month?”

- “Why did delivery times surge by 40% in our Biratnagar distribution hub in November?”

- “What is the expected customer churn rate next quarter if competitor pricing drops by 5%?”

- “What is the optimal truck dispatch route schedule to minimize fuel cost while meeting 100% of delivery deadlines?”

- Solution:

- Highest gross revenue: Descriptive Analytics (summarizes past events).

- Why delivery times surged: Diagnostic Analytics (analyzes root causes).

- Expected churn rate: Predictive Analytics (forecasts future probabilities).

- Optimal truck routing: Prescriptive Analytics (recommends optimal action).

- Problem 2 (Exam-Level ROI Justification): How can a Chief Information Officer (CIO) quantitatively calculate the Return on Investment (ROI) for a Rs. 5,000,000 enterprise BI software implementation?

- Solution:

- Quantifiable Cost Savings (Direct Tangible Benefits):

- Reduction in manual reporting labor: 5 data analysts saving 15 hours/week at Rs. 500/hr =5×15×52×500=Rs. 1,950,000= 5 \times 15 \times 52 \times 500 = \text{Rs. } 1,950,000=5×15×52×500=Rs. 1,950,000 annually.

- Inventory holding cost reduction: Optimizing supply chains cuts dead stock holding costs by Rs. 2,000,000 annually.

- Churn prevention: Early intervention saves Rs. 1,500,000 in customer lifetime revenue annually.

- Total Annual Tangible Benefits =1,950,000+2,000,000+1,500,000=Rs. 5,450,000= 1,950,000 + 2,000,000 + 1,500,000 = \text{Rs. } 5,450,000=1,950,000+2,000,000+1,500,000=Rs. 5,450,000 per year.

- Payback Period:

Swipe to see the full formula↔

Payback Period=Initial InvestmentAnnual Benefits=5,000,0005,450,000≈0.92 years (approx. 11 months)\text{Payback Period} = \frac{\text{Initial Investment}}{\text{Annual Benefits}} = \frac{5,000,000}{5,450,000} \approx 0.92 \text{ years (approx. 11 months)}Payback Period=Annual BenefitsInitial Investment​=5,450,0005,000,000​≈0.92 years (approx. 11 months)

- ROI over 3 years (assuming Rs. 500,000 annual maintenance):

Swipe to see the full formula↔

Net Benefit=(5,450,000×3)−(5,000,000+1,500,000)=16,350,000−6,500,000=Rs. 9,850,000\text{Net Benefit} = (5,450,000 \times 3) - (5,000,000 + 1,500,000) = 16,350,000 - 6,500,000 = \text{Rs. } 9,850,000Net Benefit=(5,450,000×3)−(5,000,000+1,500,000)=16,350,000−6,500,000=Rs. 9,850,000

Swipe to see the full formula↔

ROI=9,850,0006,500,000×100%≈151.5%\text{ROI} = \frac{9,850,000}{6,500,000} \times 100\% \approx 151.5\%ROI=6,500,0009,850,000​×100%≈151.5%

- Problem 3 (Twist / Case Scenario): A company installs Power BI licenses for all its 100 managers, but 6 months later, nobody uses the system and managers continue emailing around manual Excel spreadsheets. What went wrong?

- Solution:

- The organization treated BI as a pure software purchase rather than a cultural transformation.

- Common failure modes: Lack of data literacy training, missing executive sponsorship, dirty unvalidated underlying data that caused managers to lose trust in dashboard figures, and failure to decommission legacy Excel workflows.

- Successful BI adoption requires data governance, data stewardship, and change management.

- Students lose marks here because they define BI as just “installing Tableau”, or they confuse transactional OLTP databases with analytical BI systems.
