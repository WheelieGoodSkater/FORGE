# W263 Deployed Adapter Profile Readiness Trace

## Purpose

Connect FORGE to the released W144 governed runner adapter deployment through a saved adapter profile, while keeping dataset/account switching explicit and keeping normal consultant UI free of endpoint/admin details.

## Released Adapter Profile

- Script: `IDB W144 Customer Proof Pilot Suitelet`
- Title: `IDB W24 Customer Proof Pilot Suitelet`
- Deployment script id: `customdeployidb_governed_runner_adapter`
- Status: `Released`
- Deployed: `true`
- Execute as role: `Current Role`
- Log level: `Error`
- Path: `/app/site/hosting/scriptlet.nl?script=6702&deploy=2`
- Current account endpoint: `https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2`

## Dataset Switching

The account host is stored on the adapter profile and the endpoint is derived from:

`accountHost + suiteletPath`

Future datasets/accounts can swap the profile host without changing normal consultant runtime logic.

## Motion Observation

The earlier Motion run was a valid preview smoke:

- Motion lane confirmed.
- Industrial distribution selected.
- Manufacturing off.
- WIP off.
- Previous blocker was missing endpoint.
- No runner task captured.
- No completed result imported.

With the released deployed adapter profile selected and all existing gates true, W262 readiness should become `ready_to_build_records`.

## Guardrails

- Normal consultant UI hides endpoint/profile/admin details.
- No drawer-created records.
- No drawer transaction writes.
- Record creation must go through the approved W144/server adapter path.
- No W144 deployment update in this block.

## Visual Testing Decision

No broad visual test is required for W263. Run a targeted Tampermonkey smoke after updating `idb-drawer.user.js` to confirm the Build tab now shows `Build records` when the released adapter profile is active.
