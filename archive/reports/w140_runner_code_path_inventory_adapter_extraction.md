# W140 Runner Code Path Inventory And Adapter Extraction

Status: runner_code_path_inventory_adapter_boundary_ready

## Decision

PASS_ADAPTER_BOUNDARY_READY__IMPLEMENT_NETSUITE_SIDE_ADAPTER_NEXT

## Code-Path Inventory

- Primary runner: /path/to/workspace/Demo Command Center V4 Master/suitelet_runtime_package_current/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js
- Legacy Suitelet UI reference: /path/to/workspace/Demo Command Center V4 Master/suitelet_runtime_package_current/scai_sl_demo_reset_v4_0_0sandbox_mccormick_cpg_auth_lock_2026_05_06_d.js
- Extracted adapter: /path/to/workspace/intelligent demo builder drawer/tools/idb_governed_runner_adapter_v1.js
- Runner entry found: true
- Runner param reader found: true
- Runner record.create count: 10
- Runner record.submitFields count: 11
- Drawer write signatures: 0

## Existing Runner Capabilities

- read scheduled runner params: readRunnerParams, execute
- resolve anchor customer for sales order import: mustFindByExternalId, buildSoCsv
- create or adopt fresh hero inventory item: getOrCreateFreshHeroItem, createFreshHeroItem, adoptFreshHeroItem
- create or resolve component inventory items and manufacturing records: ensureManufacturingAnchors, ensureInventoryItemByExternalId, ensureAssemblyItemByExternalId, ensureBomByExternalId, ensureBomRevisionByExternalId
- create demo transaction through CSV import task: buildSoCsv, saveCsvToFileCabinet, submitCsvImport
- apply generated names to runner-owned anchors: applyNamingToAnchors

## Current Gaps For W139 Result Contract

- Customer-specific create/resolve is not a clean exported runner boundary yet; current runner resolves the anchor customer for CSV import.
- Demo transaction internal id is not synchronously returned by the CSV import submit path; current runner returns/imports a CSV task id, then record existence must be resolved after import completion.
- Matrix/proof item is represented by hero or manufacturing item anchors; a W139 role-level result adapter must map the chosen proof item explicitly.
- The legacy Suitelet starts and previews runner configuration, but it should remain legacy/reference-only for IDB.
- The final generated names JSON must be assembled by an adapter/result-capture layer after runner execution, not by the drawer.

## Adapter Design

- Module: tools/idb_governed_runner_adapter_v1.js
- Input schema: idb.governed-runner-adapter-input.v1
- Normalized result schema: idb.governed-runner-result-normalized.v1
- Adapter drawer authority: none
- Adapter input valid: true
- Normalized result valid: true

## Implementation Steps

1. Keep the IDB drawer as request/export/import only.
2. Create a NetSuite-side adapter entry point that accepts the W139 confirmed IDB build request and resolves runtime config server-side.
3. Call the existing scheduled runner logic through governed NetSuite execution, not from the drawer.
4. Add customer-specific create/resolve to the runner boundary or pre-run adapter because the current runner only resolves the anchor customer.
5. Resolve the completed Sales Order internal id after CSV import completion before returning the IDB final generated names JSON.
6. Map hero/proof/component role outputs explicitly and reject missing numeric ids or unsupported URLs.
7. Import final generated names into IDB only after the governed result JSON passes link authority validation.

## Regression Harness Updates

- Add adapter module syntax check.
- Add W140 harness to preflight.
- Validate runner source inventory still finds execute, ensureDemoRecords, item creation, CSV import submit, and search-by-external-id paths.
- Validate adapter rejects invalid W139 requests and unsupported URLs.
- Validate drawer write signature count remains zero.
- Validate W140 report keeps visual testing deferred until actual governed write execution.

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after NetSuite-side adapter write: Yes.
- Broader visual NetSuite testing required: No.

Reason: W140 inventories and extracts the adapter boundary only. Visual NetSuite testing is required after the NetSuite-side adapter actually writes or resolves records and returns real URLs.

## Best Next Codex Prompt

Move through W141: NetSuite-Side Governed Runner Adapter Skeleton. Treat IDB as the primary consultant-facing product and the old DCC Suitelet UI as legacy. Build the NetSuite-side governed runner adapter skeleton that accepts the W139 confirmed IDB build request JSON, validates the W140 gates, resolves runner runtime config server-side, calls or queues the existing governed runner/internal build logic, and returns write-disabled dry-run results without drawer writes. Do not enable governed sandbox writes yet. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, and no active Open links without real URLs. Output adapter skeleton, validation gates, dry-run smoke, trace samples, W141 report, visual testing decision, and best next Codex prompt.
