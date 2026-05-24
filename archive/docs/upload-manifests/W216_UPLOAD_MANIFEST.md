# W216 Upload Manifest

## Scope
- Work block: W216 Consultant-Facing Partial Result Review Polish.
- Primary script: `idb-drawer.user.js`.
- Harness: `tools/run_consultant_partial_result_review_polish_w216_harness.js`.
- Report: `reports/w216_consultant_partial_result_review_polish.md`.
- Trace: `trace_samples/w216_consultant_partial_result_review_polish_trace.json`.
- Data artifact: `data/w216_consultant_partial_result_review_polish.json`.

## Upload Decision
- Upload/update the Tampermonkey drawer script: `idb-drawer.user.js`.
- No W144 adapter upload is needed.
- No runner upload is needed.
- No SuiteScript upload is needed for W216.
- No image lookup enablement is included.

## Preserved Boundaries
- W151 import guard remains active.
- Runner output roles still map through the W214/W215 semantic contract.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.

## Consultant UI Result
- Complete imports show: `Build results are ready.`
- Partial manufacturing imports show: `Core build records are ready. Manufacturing setup detail was not returned.`
- Partial WIP imports show: `Core build records are ready. WIP detail was not returned.`
- Partial food batch/WIP imports show: `Food batch records are ready. WIP detail was not returned.`
- Normal consultant UI hides W144 endpoint, runnerTaskId, raw JSON, W151 language, semantic guard/mode contract language, and admin/debug diagnostics.

## Admin/Debug Result
- Admin/debug can show resolved mode, confidence, mapped roles, and missing manufacturing/WIP details.
- Missing BOM/assembly, work order/WIP object, routing, and work center diagnostics remain admin/debug-only.

## Validation
- `npm run harness:consultant-partial-result-review-w216` -> PASS 13/13.
- `npm run harness:runner-output-role-mapping-w215` -> PASS 14/14.
- `npm run harness:operating-mode-resolver-w214` -> PASS 13/13.
- `npm run harness:toggle-aware-naming-w211` -> PASS 7/7.
- `npm run harness:website-grounded-orchestration-w212` -> PASS 10/10.
- `npm run harness:consultant-story-roi-competitive-w213` -> PASS 12/12.
- `npm run check` -> PASS.
- `npm run validate` -> PASS 1914/1914.

## Visual Testing Decision
- No broad visual testing was run for W216.
- This block is copy/model separation plus harness-backed Review/Run rendering coverage.
