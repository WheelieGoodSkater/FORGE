# W252 Lane Pack Review UI Wiring And Install Smoke Acceptance

## Scope
- Render W251 proposed lane-pack diffs in a compact admin-safe review surface.
- Keep proposal review read-only with no install action, no contract mutation, and no drawer-created records.
- Add an install smoke acceptance checklist for launcher visibility, Review/Run story gating, returned names, lane-aware labels, weak-evidence confirmation, and compact Suitelet header balance.
- Polish the Suitelet/header logo size so the FORGE logo is professional and proportionate.

## Guardrails
- N/LLM remains advisory-only.
- Unsafe proposals do not render as installable.
- Normal consultant UI hides raw diagnostics and install-like actions.
- W218 success wording, W220 recovery wording, and fake Open-link blocking remain stable.

## Validation
- `archive/tools/run_w252_lane_pack_review_ui_install_smoke_harness.js`
- `archive/trace_samples/w252_lane_pack_review_ui_install_smoke_trace.json`
