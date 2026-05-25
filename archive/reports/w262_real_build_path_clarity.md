# W262 Real Build Path Clarity

## Purpose

Stabilize the visible FORGE release as `V1.0.0` and remove consultant confusion between smoke/preview mode and actual record creation.

## Consultant Path

The normal Build flow stays:

- Customer / Prospect Name
- Website
- Conversation Notes
- Create new item / Manufacturing / WIP toggles
- Build records
- Refresh build status
- Finish build after returned records are ready
- Review/Run returned names, lane-aware labels, and supported Open links

## Preview Boundary

When the approved server build setup is not ready, normal UI says:

`Preview ready. Record creation is not enabled in this install.`

Smoke testing can continue without creating records. Normal UI must not show internal adapter diagnostics such as blocked before server adapter, operator gate, server flags, transport boundary, no submit, or invocation from drawer.

## Adapter-Ready Boundary

When approved adapter readiness is true, the normal Build card shows the real `Build records` action. The drawer client still does not create records directly; record creation goes through the approved server adapter path.

## Preservation

- W218 success wording remains represented by the Records ready/Finish build path.
- W220 recovery wording remains represented by the existing import recovery surface.
- Fake Open-link blocking remains preserved before valid completed import.
- W245 canonical import normalization remains the source of returned names, labels, and supported Open links.
- W260 remains an install/update-only `idb-drawer.user.js` packet.
- W261 remains the evidence capture/signoff packet for post-install smoke.

## Visual Testing Decision

Code harness validation is sufficient for this block. Targeted visual smoke should be performed after installing the updated `idb-drawer.user.js` in Tampermonkey.
