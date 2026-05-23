# W96 Consultant Value Compression

## Decision

COMPLETE / VALUE VIEW COMPRESSED / NO WRITE AUTHORITY.

## What Changed

- Kept the default ROI / Competitive view to a single live answer card:
  - one ROI answer,
  - one NetSuite answer,
  - one caution.
- Moved `Why this ROI`, `Competitive detail and NetSuite proof stack`, `Unsupported-claim blocker`, and coaching detail behind one collapsed audit section.
- Preserved all evidence in the trace/export model through `roiCompetitiveReview`.
- Preserved DCC handoff as the primary execution artifact.

## Consultant Result

The consultant can now answer the buyer's value question without reading an audit wall. The audit detail still exists when needed, but it no longer competes with the live answer.

## Validator Gates

- Live value answer remains visible first.
- ROI answer, NetSuite answer, and caution are visible in the default card.
- Audit details are collapsed by default.
- Unsupported-claim blocker remains present but is not open by default.
- `roiCompetitiveReview` remains in trace export.
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes.
- Notes remain story-only.
- Consultant confirmation remains required.
- DCC owns object generation.
- W92 state authority remains unchanged.

## Next Prompt

Move through W97: Run Selector Chip Interaction. Move Open / Prove / Handle objection / Close value to the top of Run as selector chips that dynamically update the live Say / Show / Close script, while preserving W92 state authority, DCC handoff boundaries, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output compressed Run interaction changes, trace coverage, validator gates, W97 report, and best next Codex prompt.
