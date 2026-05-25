# W279 Adapter Profile Readiness Bridge

W279 adds `src/contracts/adapterReadinessBridge.js` as a behavior-preserving bridge between drawer-produced W262/W263 adapter readiness/profile outputs and the W271 `adapterProfiles.js` contract module.

## Scope

- Validates the released W144 governed runner adapter profile.
- Validates endpoint derivation from account host plus Suitelet path.
- Validates future dataset/account host switching.
- Validates W262 readiness states.
- Validates W263 readiness trace/export profile fields.

## Guardrails

- Runtime behavior unchanged.
- Normal consultant Build UI unchanged.
- Connected W264 submit/refresh/import unchanged.
- W265 retry safety unchanged.
- Returned record import unchanged.
- Lane resolution unchanged.
- Adapter endpoint/profile behavior unchanged.
- Endpoint/profile setup remains hidden from normal consultant UI.
- Record creation authority unchanged.
- N/LLM remains advisory-only and uncertainty-visible.
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update.

## Validation

The W279 harness verifies:

- The bridge exists and validates against `src/contracts/adapterProfiles.js`.
- The released W144 governed runner adapter profile remains field-compatible.
- The endpoint derives from account host plus Suitelet path.
- Future dataset/account host can swap without runtime logic changes.
- W262 readiness states remain field-compatible for preview-only, ready, submitted, waiting, records ready, and imported paths.
- W263 readiness trace/export profile fields remain field-compatible.
- Normal consultant UI hides endpoint/profile/admin diagnostics.
- W276, W277, and W278 bridges remain available.
- Connected W264 submit/refresh/import remains unchanged.
- W265 retry safety remains unchanged.
- No runtime authority changes, drawer-created records, or drawer transaction writes are introduced.

## Visual Testing Decision

No broad visual regression pass is required for W279 because this block adds a contract bridge and archived parity coverage without changing normal consultant Build UI.
