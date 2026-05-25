# W254 Evidence Receipt Trail For Consultant Story Trust

## Scope
- Adds a compact evidence receipt trail to the consultant Review/Run story surface after valid import.
- Receipts explain lane confidence, website/category evidence, returned Open target, conversation-note role, N/LLM limits, and uncertainty gate.
- Receipt rows are generated from structured lane-pack resolution, W245 normalized returned records, website evidence, and N/LLM advisory metadata.

## Guardrails
- Receipt UI is consultant-safe and does not expose raw JSON, stack traces, contract schema names, runner task ids, or admin diagnostics.
- Receipt renders only after valid returned records exist.
- W252 proposal review remains admin-only and W253 acceptance packet remains review-only.
- N/LLM remains advisory-only with no write authority, no record creation, and visible uncertainty.
- W218 success wording, W220 recovery wording, and fake Open-link blocking remain preserved.

## Validation
- `archive/tools/run_w254_evidence_receipt_trail_harness.js`
- `archive/trace_samples/w254_evidence_receipt_trail_trace.json`
