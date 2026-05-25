# W271 Adapter Profile And Readiness Contract Extraction

Date: 2026-05-25

## Summary

W271 adds a focused adapter profile/readiness contract module:

- `src/contracts/adapterProfiles.js`

The module mirrors the W263 released governed runner adapter profile and W262 readiness-state language so future dataset/account switching can happen through a structured contract instead of scattered drawer-only helpers.

## Contract Scope

The contract includes:

- released W144 governed runner adapter profile
- NetSuite account host normalization
- Suitelet path normalization
- full endpoint URL derivation from host + path
- selected profile application to adapter config
- readiness-state evaluation for:
  - `ready_to_build_records`
  - `smoke_preview_only`
  - `adapter_not_configured`
  - `build_submitted`
  - `waiting_for_runner_result`
  - `records_ready_to_import`
  - `records_imported`

## Released Adapter Profile

- Script: `IDB W144 Customer Proof Pilot Suitelet`
- Title: `IDB W24 Customer Proof Pilot Suitelet`
- Deployment script id: `customdeployidb_governed_runner_adapter`
- Status: `Released`
- Deployed: true
- Execute as role: `Current Role`
- Log level: `Error`
- Path: `/app/site/hosting/scriptlet.nl?script=6702&deploy=2`
- Default account host: `td3021666.app.netsuite.com`

## Behavior Boundary

This block does not change:

- normal consultant UI
- connected W144 submit/refresh/import behavior
- adapter endpoint behavior
- record creation authority
- W144 deployment

The drawer still owns runtime behavior for this block; the new module creates a parity-backed extraction point for the next optimization phase.

## Guardrails

- No drawer-created records.
- No drawer transaction writes.
- No direct drawer record creation.
- Approved W144/server adapter-only record creation remains the boundary.
- Endpoint/profile setup stays hidden from normal consultant UI.
