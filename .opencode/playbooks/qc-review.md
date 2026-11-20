# QC Review Playbook (the gate between subjects)

Run after a subject's notes, answers and cheat sheet exist. Write results to `_qc/<subject>-review.md`. Six checks, each with evidence.

## 0. Official-paper coverage (the acceptance test) ⭐
For every question in `<subject>/model-question.md` (or the real board paper where no model question exists), can the notes answer it **from the unit that question belongs to, alone**? Format:

| Q | Question (short) | Unit | Answerable from that unit alone? |
|---|---|---|---|
| C18 | Decision tree vs naive Bayes | 3 | ✅ §3.4 |
| C20 | Design a monthly sales dashboard | 4 | ✅ §4.5 |

Any ❌ is a **blocking defect** — the unit is not done, regardless of how well it scored on checks 1-5. Fix by adding the missing section, then re-run the table.

## 1. Coverage matrix
Every syllabus bullet → the note line that covers it. Format:

| Syllabus bullet | Where covered | Verdict |
|---|---|---|
| Definition and scope of BI | unit-1 §1.1, §1.2 | ✅ |
| Overview of BI tools | unit-1 §1.5 | ✅ |

Unmapped bullet = **open gap**. Gaps are listed, never quietly dropped.

## 2. Factual cross-check
Every definition and mechanism checked against a second independent source (hamronotes chapter notes, tupapers, standard text). Conflicts recorded as `⚠ sources differ` with both positions. No silent pick.

## 3. Marks-length audit
For each high-probability question: does the model answer fit its mark value per the contract (1 → ≤30 words; 2 → 45-60; 3 → 80-120; 5 → 180-250; 10 → 330-420; 20 → 600-800)? Over-length answers are as bad as under-length ones - they cost time in Group D. **Check the subject's own paper size first:** IT 249 and IT 277 are 60-mark papers (1/3/5); IT 248 and IT 250 are 100-mark papers (2/5/10).

## 4. Consistency sweep
Course code, unit numbering, lecture hours, and terminology identical across every file in the subject. Watch specifically: "data mart vs data warehouse", "OLAP vs OLTP", "classification vs clustering", "Type 1 vs Type 2 hypervisor".

## 5. Real-example sanity
Nepal examples are real and correctly attributed. No invented adoption figures, no invented company practices. Unverifiable → removed or labelled.

## Output format

```
# QC — <subject>
Date:
Papers used:
## Defects found (numbered)
## Fixed
## Still open (with reason)
## Verdict: verified / verified with N open gaps
```

Report the defect list to the user — including what changed — before starting the next subject.
