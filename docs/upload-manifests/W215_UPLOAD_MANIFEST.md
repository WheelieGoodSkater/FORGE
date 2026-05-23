# W215 Upload Manifest

## Purpose

W215 aligns governed runner result JSON roles with IDB's W214 operating-mode contracts so import, display, and partial-result UX no longer assume one fixed five-record output shape.

## Upload Scope

Upload/update only:

- `idb-drawer.user.js`

No NetSuite Suitelet, W144 adapter, or runner upload is required for W215.

## What Changed

- Added W215 runner output role mapping for semantic roles such as:
  - `hero_sku`
  - `style_sku`
  - `product_sku`
  - `finished_or_assembly_item`
  - `finished_food_or_batch_item`
  - `availability_or_replenishment_flow`
  - `style_matrix_or_availability_flow`
  - `dealer_availability_or_replenishment_flow`
  - `replenishment_or_availability_flow`
  - `component_item`
  - `ingredient_or_component_item`
  - `bom_or_assembly_structure`
  - `work_order_or_wip_object`
  - `routing`
  - `work_center`
  - `location_or_channel_context`
  - `location_planning_context`
  - `lot_or_availability_context`
- W151 now maps semantic runner roles before checking mode-specific required records, numeric ids, supported NetSuite URLs, and naming guardrails.
- Manufacturing modes no longer require the old matrix/proof record slot when the resolved W214 contract does not require it.
- Partial manufacturing/WIP results can import only when required core records are valid and the runner explicitly marks the result partial.
- Admin/debug mode can show missing BOM/assembly or missing WIP-detail warnings; normal consultant copy stays simple and does not claim full support.

## Preserved Boundaries

- One-click Build demo records preserved.
- Saved W144 admin config preserved.
- Automatic runner submit, runnerTaskId capture, result polling, and W151 import guard preserved.
- Real Open links still require valid imported numeric ids and supported NetSuite URLs.
- Handoff JSON is still rejected by completed-result import.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- N/LLM remains advisory only.
- Image lookup remains disabled by default.

## Validation

Run from `/path/to/workspace/intelligent demo builder drawer`:

```bash
npm run harness:runner-output-role-mapping-w215
npm run harness:operating-mode-resolver-w214
npm run harness:toggle-aware-naming-w211
npm run harness:website-grounded-orchestration-w212
npm run harness:consultant-story-roi-competitive-w213
npm run check
npm run validate
```

Expected:

- W215: `pass; 14/14 checks`
- W214: `pass; 13/13 checks`
- W211: `PASS (7/7)`
- W212: `PASS (10/10)`
- W213: `pass; 12/12 checks`
- check: pass
- validate: `Checks: 1914/1914`

## Evidence Artifacts

- `tools/run_runner_output_role_mapping_partial_import_w215_harness.js`
- `data/w215_runner_output_role_mapping_partial_import.json`
- `trace_samples/w215_runner_output_role_mapping_partial_import_trace.json`
- `reports/w215_runner_output_role_mapping_partial_import.md`

## Visual Testing Decision

No broad visual NetSuite testing is required for W215. This is a runner-result role mapping, W151 validation, and partial-result admin/debug UX pass. Use targeted visual testing only after live Review/Run partial-result copy or real Open-link behavior changes.
