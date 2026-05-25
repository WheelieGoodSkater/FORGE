# W251 Lane Pack Authoring Diff Review And N/LLM Draft Intake Hardening

## Scope
- Add structured lane-pack proposed-change diff review for N/LLM-drafted packs.
- Show changed website evidence, record roles, vocabulary, live-demo story fields, and N/LLM advisory limits.
- Keep proposals review-only and non-installable until a human-reviewed contract source change is made.
- Reject proposals that grant write authority, allow creation, hide uncertainty, override website evidence, or make guaranteed/measured ROI claims.
- Polish the floating launcher icon visibility while preserving its click target and placement.

## Guardrails
- N/LLM remains advisory-only.
- Proposed packs remain archived fixtures unless a future human-reviewed change installs them.
- W218 success wording, W220 recovery wording, pre-import fake Open-link blocking, and weak-evidence confirmation remain stable.

## Validation
- `archive/tools/run_w251_lane_pack_authoring_diff_review_harness.js`
- `archive/fixtures/w251_lane_pack_diff_review_fixture.json`
- `archive/trace_samples/w251_lane_pack_authoring_diff_review_trace.json`
