# W261 Post-Install Smoke Evidence Capture And Release Signoff

Status: review-only evidence capture ready

## Purpose

Use this packet after the W260 Tampermonkey update smoke. It records whether the update is safe to keep, needs attention, or should be rolled back. It does not change runtime authority.

## Source Release Packet

- Source: W260 install-ready release packet
- Install target: `idb-drawer.user.js`
- Update/install only: `idb-drawer.user.js`
- Update/install `idb-drawer.user.js` only.
- Do not update: W144 adapter, runner, SuiteScript deployment, image lookup settings, or lane-pack contract source

## Evidence Capture Fields

Capture each field as pass/fail/note:

1. Tampermonkey updated with `idb-drawer.user.js` only.
2. W144, runner, SuiteScript deployment, image lookup settings, and lane-pack contract source were not updated.
3. Runtime authority unchanged: no drawer-created records, no drawer transaction writes, no live runner invocation, and no W144 deployment update.
4. Launcher icon opens the drawer.
5. Compact FORGE header shows logo, version, `Bug / Enhancement`, and close control.
6. `Bug / Enhancement` remains a safe placeholder/no-op.
7. Pre-import Review/Run blocks fake Open links.
8. Valid completed import shows returned record names, lane-aware labels, supported Open links, and `Build results are ready.`
9. W258 `Live proof CTA` appears after valid import.
10. W256 script, W257 guided sequence, and W254 evidence receipt remain expandable.
11. Weak/conflicting evidence asks for confirmation before claims.
12. Rollback decision is recorded if any targeted smoke item fails.

## Release Signoff Outcomes

- `ready_to_keep`: all required smoke fields pass.
- `needs_attention`: at least one required smoke field fails or is missing.
- `rollback_recommended`: install target or runtime authority boundaries fail.

## Guardrails

- Evidence capture is local and review-only.
- No upload, external URL, network call, tracking call, local storage write, install action, or runtime dependency is introduced.
- W259 feedback placeholder remains no-op and future-ready; no feedback URL is added.
- W260 release packet remains available and unchanged in purpose.
- Normal consultant UI must not expose raw JSON, stack traces, internal arrays, runner task ids, schema names, admin diagnostics, or install-like actions.
- W252 proposal review remains admin-only; W253/W259/W260 packets remain review-only; W254 receipt remains consultant-safe.
- N/LLM remains advisory-only and uncertainty-visible.

## Visual Testing Decision

Targeted post-install smoke evidence capture is recommended after the Tampermonkey update. Broad NetSuite visual regression is not required for W261 because this adds review-only evidence capture, signoff logic, report, trace, and harness coverage without changing the runtime UI.
