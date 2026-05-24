# W99 One-Run Pilot Retest Packet After Compression

## Decision

PASS / ONE-RUN RETEST READY / USER VISUAL FEEDBACK REQUIRED.

## File To Upload

Use this file in Tampermonkey:

`/path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js`

Expected script name: `Intelligent Demo Builder Drawer`

SHA-256:

`b42aa7db892d4c6ba56ebb491f6e4b4f6568b5762d3d292ca5647c50a0e50210`

## Exact Sales Request Fields

Customer: Ariat International

Website: `https://www.ariat.com/`

Conversation notes:

`Buyer says style, size, color, replenishment timing, and channel availability are hard to keep aligned for seasonal boot and apparel launches. The team uses spreadsheets and disconnected inventory views, which makes customer promise risky when demand shifts close to launch.`

Website evidence:

`Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail/ecommerce categories.`

SC objective:

`Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise for a seasonal boot and apparel launch.`

Known competitor:

`Spreadsheets, disconnected inventory reports, and existing order tools. They are also comparing broader ERP options.`

Decision criteria:

`Show a clear path from customer/prospect context to item style/SKU readiness, channel availability, replenishment timing, and customer promise.`

## Screenshot Checklist

- Plan first viewport: Ariat, Apparel & Accessories, confidence, DCC pack, W98 Request summary, one primary action.
- Review first viewport: DCC handoff/export area, selected pack/scenario, blockers or confirmed status, export button.
- ROI / Competitive first viewport: one ROI answer, one NetSuite answer, one blocker/caution; audit collapsed.
- Run first viewport: Open / Prove / Handle objection / Close value selector chips above Say / Show / Close.
- Trace first viewport: export/reset/checklist only, with DCC handoff and trace JSON export visible.

## Required Exports

- `idb-dcc-runner-handoff-packet-*.json`
- `intelligent-demo-builder-trace-*.json`

## Operator Comparison Checklist

- Customer/prospect equals Ariat International.
- Website equals `https://www.ariat.com/`.
- Selected lane is `apparel_accessories`.
- Selected pack is `apparelAccessories`.
- Selected scenario is `Style-to-Availability Readiness`.
- Family/proof path maps to style/SKU matrix or DCC apparel/accessories.
- Write mode is review-only/export-only.
- DCC-owned config params are present or marked for operator review.
- Scheduled runner preview params are present enough for manual review.
- DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics.
- No IDB button submits, queues, invokes SuiteScript, or writes a transaction.

## Scoring Rubric

Score each 1-5. Passing average is 4.0, with no category below 3.

- One active drawer / no duplicate button.
- Plan request summary clarity.
- State authority consistency across Plan, Review, export, and trace.
- Review DCC handoff export clarity.
- ROI / Competitive live value clarity.
- Run selector chip usefulness.
- Trace evidence checklist clarity.
- Operator field mapping clarity.
- No-submit/no-write safety clarity.

## Stop / Go

Go for W100 evidence review only if all five screenshots, DCC handoff JSON, trace JSON, and operator notes are provided, and no write/submit/queue behavior appears.

No-go if any visible lane, confirmed lane, exported lane, or DCC pack disagree; if any required export is missing; or if the compressed UI still buries the next action in audit text.

## Validator Gates

- W99 contract present and inherits W92, W96, W97, and W98.
- Exact file to upload and hash are present.
- Realistic sales request fields are complete.
- Plan, Review, ROI / Competitive, Run, and Trace first-viewport expectations are listed.
- Required DCC handoff JSON and trace JSON exports are listed.
- Operator comparison checklist is present.
- Scoring rubric and stop/go criteria are present.
- No-write, no-SuiteScript, no-transaction-write, notes-story-only, consultant-confirmation, and DCC-owned object generation boundaries are preserved.

## Next Prompt

Move through W100: Grade One-Run Pilot Retest Evidence After Compression. Use the user-provided W99 Plan/Review/ROI/Run/Trace first-viewport screenshots, idb-dcc-runner-handoff-packet JSON, intelligent-demo-builder trace JSON, consultant notes, operator comparison notes, and scoring rubric to grade the compressed one-run retest. Verify W92 state authority, W96 value compression, W97 Run selector chips, W98 intake-to-review compression, DCC handoff boundaries, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output scored results, UX remediation, operator mapping remediation, pilot unlock/no-go decision, W100 report, validator gates, and best next Codex prompt.
