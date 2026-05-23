# W112 Operator Preview Retest After Copy Helper

Generated: 2026-05-17T21:41:06.783Z

Decision: PASS / OPERATOR PREVIEW RETEST READY / USER AND OPERATOR FEEDBACK REQUIRED

## Objective

Run one hands-on operator preview retest using the W111 preview URL/operator copy helper before any governed DCC invocation design proceeds.

## File To Upload

- `/path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js`
- SHA-256: `30f73ccc903fffc59a6210f064153b7382c6a77b517332f64212a2ff13d3f2ec`

## Sales Request

- Prospect: Ariat International
- Website: https://www.ariat.com/
- Business pain: Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.
- Requested proof: Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.
- Decision criteria: Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.
- Timeline / urgency: Internal proof review needed in 2-4 weeks before the next buying committee checkpoint.
- Competitor / incumbent: Spreadsheets, disconnected inventory reports, and incumbent order tools; broader ERP options are also being compared.
- Website/category evidence: Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.

## Expected Screenshots

| Screen | Must Show |
| --- | --- |
| plan | 30-second plan shows Ariat International, Apparel & Accessories, confidence, DCC pack, and one next action.; Sales request intake is concise, not audit-heavy.; No duplicate Story Bar or duplicate IDB drawer appears. |
| reviewCopyHelper | Build Control Center appears first.; DCC handoff export button is visible.; Preview URL and operator copy section is visible.; Preview URL text, query params, and Copy-safe parameter text are visible.; No open, submit, queue, write, or invoke button is visible. |
| roiCompetitive | Live Value Answer shows one ROI answer, one NetSuite answer, and one caution/blocker.; Value story is driven by notes/business pain and does not require website-only certainty.; Audit detail remains collapsed by default. |
| run | Open / Prove / Handle objection / Close value selector chips are at the top.; Changing chips updates selected script copy.; Script stays aligned to style/SKU readiness. |
| trace | Trace Actions Only card is visible.; Export DCC handoff and Export JSON are visible.; Pilot evidence checklist requires Plan, Review, DCC handoff JSON, trace JSON, and operator notes. |

## Required Exports

- idb-dcc-runner-handoff-packet-*.json from Review
- intelligent-demo-builder-trace-*.json after consultant flow
- intelligent-demo-builder-trace-*.json after operator evidence is pasted back into IDB

## Manual DCC Suitelet Preview Comparison

1. Export the DCC handoff JSON from IDB Review.
2. Open Review > Preview URL and operator copy.
3. Copy the Preview URL text or Copy-safe parameter text. Do not click or open from IDB.
4. Manually open the Demo Command Center Suitelet in sandbox.
5. Compare Suitelet form params to the DCC handoff JSON and W111 copy-safe parameter text.
6. Verify DCC-owned config params exist in the DCC deployment/config surface. Record match/missing/unclear only; do not paste secrets.
7. Compare scheduled runner preview params to the handoff JSON. Do not submit, queue, invoke SuiteScript, or write.
8. Return to IDB Review and paste operator evidence: operator name, param/config/runner statuses, handoff filename, trace filename, notes.
9. Mark preview approved only if Suitelet params, DCC config, runner preview, filenames, and notes are all captured and matching.
10. If anything is missing or unclear, reject preview and write the exact remediation note.

## Stop / Go

Go only if screenshots, DCC handoff JSON, trace JSON, final trace after operator evidence, and operator comparison notes are complete, average score is at least 4, no category is below 3, and no automatic no-go condition occurs.

## Validator Gates

| Status | Gate | Detail |
| --- | --- | --- |
| PASS | w112_inherits_w110_w111_readiness | {"w110":"dcc_handoff_parity_locked","w111":"preview_url_operator_copy_ready"} |
| PASS | w112_file_to_upload_hash_present | {"absolutePath":"/path/to/workspace/intelligent demo builder drawer/idb-drawer.user.js","sha256":"30f73ccc903fffc59a6210f064153b7382c6a77b517332f64212a2ff13d3f2ec","modifiedAt":"2026-05-17T17:48:39.947Z","tampermonkeyName":"Intelligent Demo Builder Drawer","instruction":"In Tampermonkey, open Intelligent Demo Builder Drawer, replace the full script with idb-drawer.user.js, save, refresh NetSuite, and confirm exactly one IDB launcher appears."} |
| PASS | w112_sales_request_fields_complete | {"prospect":"Ariat International","website":"https://www.ariat.com/","businessPain":"Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.","requestedProof":"Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.","decisionCriteria":"Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.","timelineUrgency":"Internal proof review needed in 2-4 weeks before the next buying committee checkpoint.","competitorIncumbent":"Spreadsheets, disconnected inventory reports, and incumbent order tools; broader ERP options are also being compared.","optionalWebsiteCategoryEvidence":"Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories."} |
| PASS | w112_expected_screenshots_include_review_copy_helper | ["plan","reviewCopyHelper","roiCompetitive","run","trace"] |
| PASS | w112_required_exports_and_operator_steps_complete | {"exports":["idb-dcc-runner-handoff-packet-*.json from Review","intelligent-demo-builder-trace-*.json after consultant flow","intelligent-demo-builder-trace-*.json after operator evidence is pasted back into IDB"],"steps":10,"fields":8} |
| PASS | w112_scoring_stop_go_blocks_submit_or_mismatch | ["Duplicate IDB launcher or drawer appears.","Visible lane, confirmed lane, exported lane, DCC pack, or scenario disagree.","DCC handoff JSON is missing.","Trace JSON is missing.","Preview URL/operator copy section is missing.","Operator evidence is not pasted back into IDB.","Any IDB control appears to open DCC, submit, queue, invoke SuiteScript, or write.","Operator must guess how Suitelet params map to handoff JSON."] |
| PASS | w112_no_regression_preserved | {"w110ParityLockPreserved":true,"w92StateAuthorityPreserved":true,"w105W107PreviewOnlyApprovalPreserved":true,"noIdbWrites":true,"noSuiteScriptInvocationFromIdb":true,"noTransactionWrites":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"notesStoryOnly":true,"consultantConfirmationRequired":true,"dccOwnsObjectGeneration":true} |
| PASS | w112_next_prompt_ready | Move through W113: Grade Operator Preview Retest Evidence. Use the W112 screenshots, DCC handoff JSON, trace JSON, final trace after operator evidence intake, and operator comparison notes to grade the hands-on operator preview retest. Verify W110 parity lock, W92 state authority, W111 copy helper usefulness, W105-W107 preview-only approval behavior, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output scored results, go/no-go for governed DCC invocation design, exact remediation, W113 report, validator gates, and best next Codex prompt. |

## Best Next Codex Prompt

```text
Move through W113: Grade Operator Preview Retest Evidence. Use the W112 screenshots, DCC handoff JSON, trace JSON, final trace after operator evidence intake, and operator comparison notes to grade the hands-on operator preview retest. Verify W110 parity lock, W92 state authority, W111 copy helper usefulness, W105-W107 preview-only approval behavior, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output scored results, go/no-go for governed DCC invocation design, exact remediation, W113 report, validator gates, and best next Codex prompt.
```
