# W260 Install-Ready Release Packet And Consultant Smoke Script

Status: ready for targeted install smoke

## Install Target

Update/install `idb-drawer.user.js` only.

Do not update:

- W144 adapter
- runner
- SuiteScript deployment
- image lookup settings
- lane-pack contract source

No live runner invocation is needed for this smoke. No drawer-created records or drawer transaction writes are enabled.

## Consultant/Admin Smoke Script

Use this after updating Tampermonkey with the current `idb-drawer.user.js`:

1. Launcher opens drawer: click the FORGE launcher icon and confirm the drawer opens.
2. Compact header visible: confirm the header shows FORGE logo, running version, `Bug / Enhancement`, and close control.
3. Bug / Enhancement placeholder: click or inspect the button and confirm it remains a safe no-op with no URL, network call, storage write, tracking call, or install action.
4. Pre-import fake-link block: before a valid completed import, confirm Review/Run does not offer usable fake Open links.
5. Valid import story ready: with a valid completed import, confirm returned record names, lane-aware labels, supported Open links, and `Build results are ready.` are visible.
6. Live proof CTA visible: confirm Review/Run shows open target, proof action, safe claim, stop guardrail, and evidence confidence.
7. Coaching and receipt expandable: confirm W256 script, W257 guided sequence, and W254 evidence receipt remain expandable below the first-glance story.
8. Weak evidence confirmation: confirm weak or conflicting evidence asks for lane confirmation before claims.

## Rollback Note

If the targeted smoke fails, reinstall the prior Tampermonkey script version, disable the updated copy, and do not update W144, runner, SuiteScript deployment, image lookup settings, or lane-pack source.

## Guardrails

- Normal consultant UI must not expose raw JSON, stack traces, internal arrays, runner task ids, schema names, admin diagnostics, or install-like actions.
- W259 feedback placeholder remains no-op and future-ready; no real feedback URL is added.
- Runtime authority is unchanged: no drawer-created records, no drawer transaction writes, no live runner invocation, and no W144 deployment update.
- W252 proposal review remains admin-only; W253/W259 acceptance packets remain review-only; W254 receipt remains consultant-safe.
- N/LLM remains advisory-only and uncertainty-visible.
- W218 success wording, W220 recovery wording, and fake Open-link blocking before valid import remain preserved.

## Visual Testing Decision

Targeted post-install smoke is recommended after Tampermonkey update. Broad NetSuite visual regression is not required for W260 because this block adds an archived release packet, smoke script, trace, and harness without changing drawer runtime UI behavior.
