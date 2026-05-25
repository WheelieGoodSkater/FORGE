# W281 Adapter Profile Readiness Contract Migration

## Purpose

W281 executes the W280-selected adapter profile/readiness migration slice without changing connected build behavior, consultant UI, endpoint behavior, dataset switching, or runtime authority.

## What Changed

- Added contract-shaped adapter profile/readiness constants inside `idb-drawer.user.js`.
- Reshaped drawer-owned adapter endpoint helpers to use W271-style account-host and Suitelet-path normalization while keeping the Tampermonkey runtime self-contained.
- Reshaped adapter profile list selection to return profile objects with derived `fullEndpointUrl` consistently.
- Moved W262 readiness display copy into a shared drawer-local W271-shaped copy table so readiness copy stays aligned with `src/contracts/adapterProfiles.js`.

## What Stayed Drawer-Owned

- The Tampermonkey drawer still owns runtime helper execution.
- `idb-drawer.user.js` does not import `src/contracts/adapterProfiles.js` or `src/contracts/adapterReadinessBridge.js` at runtime.
- Connected W264 submit/refresh/import remains drawer-owned and unchanged in behavior.
- W265 retry safety remains unchanged.
- Normal consultant Build UI remains unchanged.

## Preserved Profile Values

- Script: `IDB W144 Customer Proof Pilot Suitelet`
- Title: `IDB W24 Customer Proof Pilot Suitelet`
- Deployment script id: `customdeployidb_governed_runner_adapter`
- Status: `Released`
- Deployed: `true`
- Execute as role: `Current Role`
- Log level: `Error`
- Path: `/app/site/hosting/scriptlet.nl?script=6702&deploy=2`
- Default account host: `td3021666.app.netsuite.com`

## Guardrails

- No runtime `require`.
- No external dependency.
- No bundler requirement.
- No network dependency for contract loading.
- No local storage write added for contract loading.
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update.
- Endpoint/profile/raw/admin diagnostics stay hidden from normal consultant UI.
- Future dataset/account switching remains host plus path driven.

## Validation

The W281 harness verifies:

- W280 selected source anchors remain present or are mapped to migrated equivalents.
- Released W144 profile values are unchanged.
- Endpoint derivation still uses account host plus Suitelet path.
- Future dataset/account host switching remains data-driven.
- W262 readiness states remain equivalent for preview-only, ready, submitted, waiting, records-ready, and imported paths.
- W263 readiness trace/export remains field-compatible.
- The drawer remains self-contained with no runtime module import or contract-loading side effect.
- W264 submit/refresh/import and W265 retry safety remain unchanged.
- W279 bridge and W280 closure/readiness packet remain available.

## Visual Testing Decision

No broad visual regression pass is required for W281 because the migration is helper-shape and parity-focused. Normal Build UI copy, buttons, layout, and connected workflow are explicitly guarded by harnesses.
