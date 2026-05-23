# W214 Upload Manifest

## Purpose

W214 adds a semantic Build Operating Mode resolver and dynamic mode-specific record contract so IDB no longer treats every completed build as the same five-record output.

## Upload Scope

Upload/update only:

- `idb-drawer.user.js`

No NetSuite Suitelet, W144 adapter, or runner upload is required for W214.

## What Changed

- Added/finished the W214 Build Operating Mode resolver for:
  - `retail_availability`
  - `apparel_style_matrix`
  - `dealer_hardgoods_replenishment`
  - `distribution_replenishment`
  - `discrete_manufacturing`
  - `wip_manufacturing`
  - `food_batch_manufacturing`
- Confirmed Build request JSON now carries `resolvedOperatingMode`, `modeConfidence`, `selectedToggles`, `namingAuthority`, dynamic required/optional/invalid roles, story inputs, and result validation expectations.
- W151 import validation now uses mode-specific required roles instead of hard-requiring the old five-record shape for every mode.
- Final result import can surface manufacturing/WIP records such as BOM, assembly, work order, routing, work center, and WIP object when the runner returns them.
- Manufacturing or WIP missing details can be represented as an explicit partial result with admin/debug warnings instead of inaccurate consultant completion copy.
- Known domains are authoritative over noisy notes/category text for operating-mode resolution.

## Preserved Boundaries

- One-click Build demo records preserved.
- Saved W144 admin config preserved.
- Automatic runner submit, runnerTaskId capture, result polling, and W151 import guard preserved.
- Real Open links still require valid imported numeric ids and supported NetSuite URLs.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- Image lookup remains disabled by default.

## Validation

Run from `/path/to/workspace/intelligent demo builder drawer`:

```bash
npm run harness:operating-mode-resolver-w214
npm run harness:toggle-aware-naming-w211
npm run harness:website-grounded-orchestration-w212
npm run harness:consultant-story-roi-competitive-w213
npm run check
npm run validate
```

Expected:

- W214: `pass; 13/13 checks`
- W211: `PASS (7/7)`
- W212: `PASS (10/10)`
- W213: `pass; 12/12 checks`
- check: pass
- validate: `Checks: 1914/1914`

## Evidence Artifacts

- `tools/run_operating_mode_resolver_dynamic_record_contract_w214_harness.js`
- `data/w214_operating_mode_resolver_dynamic_record_contract.json`
- `trace_samples/w214_operating_mode_resolver_dynamic_record_contract_trace.json`
- `reports/w214_operating_mode_resolver_dynamic_record_contract.md`

## Visual Testing Decision

No broad visual NetSuite testing is required for W214. This is a resolver, request-contract, result-import guard, and admin/debug display-model pass. Use targeted visual testing only after a real runner result import changes live Open-link behavior.
