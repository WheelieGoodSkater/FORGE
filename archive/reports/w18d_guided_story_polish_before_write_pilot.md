# W18D Guided Story Polish Before Write Pilot

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Polish the consultant path before actual write execution.

## Goal

Reduce repeated story text and make each tab answer one live-demo question.

## What Changed

- Added a `Live question` line to the guided step.
- Shortened guided-step copy across Plan, Review, ROI / Competitive, Run, and Trace.
- Made Story Bar tab-aware beyond Plan:
  - Plan collapses when intake context exists.
  - Review remains full-context by default.
  - ROI / Competitive, Run, and Trace default to compact Story Bar unless the consultant manually expands it.
- Preserved manual Story Bar expand/collapse override.

## One Question Per Tab

| Tab | Live Question | Primary Job |
| --- | --- | --- |
| Plan | What do I enter? | Capture prospect, website, and notes. |
| Review | What will IDB prepare? | Verify execution plan, packet, toggles, and locked write state. |
| ROI / Competitive | Why does this matter? | Value sell and answer competitive pressure. |
| Run | What do I say next? | Open, prove, handle objection, and close value. |
| Trace | What evidence do I keep? | Export packet/trace and reset. |

## Consultant Test

1. Upload the latest `idb-drawer.user.js`.
2. Open Plan after entering customer, website, and notes.
3. Confirm the guided step asks `What do I enter?`.
4. Move to Review and confirm the live question is `What will IDB prepare?`.
5. Move to ROI / Competitive and confirm Story Bar is compact and the live question is `Why does this matter?`.
6. Move to Run and confirm Story Bar is compact and the live question is `What do I say next?`.
7. Move to Trace and confirm Story Bar is compact and the live question is `What evidence do I keep?`.
8. Expand Story Bar manually and confirm the preference is preserved.

## No Regression

- No live writes.
- No automatic creation.
- No lane/proof/toggle changes.
- No N/LLM approval authority.
- Create remains disabled.
- Transaction context remains gated until Customer and Proof Item result IDs and URLs exist.
