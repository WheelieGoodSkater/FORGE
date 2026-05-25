# W278 Story Coaching Surface Bridge

W278 adds `src/contracts/storyCoachingBridge.js` as a behavior-preserving bridge between drawer-produced consultant story surfaces and the W273 `storyCoachingSurfaces.js` contract module.

## Scope

- Validates W254 evidence receipt packets.
- Validates W255 first-glance story packets.
- Validates W256 live-demo script packets.
- Validates W257 guided demo sequence packets.
- Delegates consultant-safe overclaim, advisory-only, and uncertainty checks to W273 helpers.

## Guardrails

- Runtime behavior unchanged.
- Normal consultant UI unchanged.
- Visible Review/Run copy and layout unchanged.
- Returned record names, lane-aware labels, and Open-link authority unchanged.
- Weak/conflicting evidence remains confirmation-first.
- Connected W264 submit/refresh/import unchanged.
- Lane resolution unchanged.
- Record creation authority unchanged.
- N/LLM remains advisory-only and uncertainty-visible.
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update.

## Validation

The W278 harness verifies:

- The bridge exists and validates against `src/contracts/storyCoachingSurfaces.js`.
- W254/W255/W256/W257 outputs remain field-compatible.
- Valid imported records keep returned names, lane-aware labels, and supported Open-link authority.
- Weak/conflicting evidence remains confirmation-first.
- W273 guardrail helper remains authoritative.
- Normal consultant UI remains unchanged and hides raw diagnostics/admin surfaces.
- W276 and W277 bridges remain available.
- Connected W264 submit/refresh/import remains unchanged.
- No runtime authority changes, drawer-created records, or drawer transaction writes are introduced.

## Visual Testing Decision

No broad visual regression pass is required for W278 because this block adds a contract bridge and archived parity coverage without changing visible Review/Run UI.
