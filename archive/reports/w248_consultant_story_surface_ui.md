# W248 Consultant Story Surface UI Wiring

Status: implemented and harnessed.

W248 wires the W247 compact consultant story surface into Review and Run after a valid completed import. The surface stays buyer-facing and confidence-aware while leaving internal diagnostics in admin/debug areas only.

## UI Surface

The rendered story surface shows:

- open target
- proof move
- safe claim
- do-not-claim guardrail
- buyer-facing so what
- N/LLM advisory confidence and uncertainty

## Guardrails

- Story surface renders only after valid imported records exist.
- Fake Open links remain blocked before valid import.
- Weak evidence shows confirmation guidance instead of silently treating a fallback lane pack as truth.
- Normal consultant UI avoids raw schemas, role arrays, stack traces, and admin diagnostics.
- W218 success wording and W220 recovery wording are preserved.

## Artifacts

- Harness: `archive/tools/run_w248_consultant_story_surface_ui_harness.js`
- Trace: `archive/trace_samples/w248_consultant_story_surface_ui_trace.json`
