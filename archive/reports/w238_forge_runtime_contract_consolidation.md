# W238: FORGE Runtime Contract Consolidation And Build Lifecycle Refactor Plan

## Goal

FORGE has crossed from prototype into product. The next work should reduce regression risk before adding more feature blocks.

The key finding is that the drawer now resolves dynamic operating modes, but important parts of the adapter/result path still assume the older fixed five-record output shape.

## Critical Inventory

- `idb-drawer.user.js` is still the whole product in one large userscript: UI, state, resolver, import guard, trace, copy, branding, and harness-facing contracts.
- `netsuite/idb_governed_runner_adapter_w144_suitelet.js` still validates fixed legacy required records: customer, demo transaction, hero item, matrix/proof item, and component item.
- `normalizeCompletedRunnerResult` in the adapter still maps completed output into fixed slots and first component item.
- Run guidance can omit returned records because the navigation model uses a sliced pivot list.
- The runner still contains fallback naming branches, which is acceptable only if FORGE validates the completed result against mode-aware roles before display.

## Recommended Direction

1. Introduce canonical contract modules for operating modes, record roles, import states, and NetSuite link validation.
2. Preserve the single Tampermonkey install artifact, but generate it from smaller source modules.
3. Refactor W144 adapter validation to honor `requiredRecordRoles`, `optionalRecordRoles`, and `invalidRecordRoles`.
4. Normalize runner results into a dynamic `records[]` role array.
5. Render Build and Run from the imported role array, not legacy fixed slots.
6. Move historical artifacts into archive folders after the runtime contract is stable.

## Build Lifecycle State Machine

| State | Consultant copy | Primary action |
| --- | --- | --- |
| ready_to_build | Ready to build. | Build records |
| submitted | Build submitted. | Wait for records |
| waiting_for_runner | Records are being prepared. | Check status |
| completed_result_found | Records are ready to import. | Bring back records |
| imported | Build results are ready. | Open returned records |
| partial | Core build records are ready. Some detail was not returned. | Use available records |
| failed_recoverable | Build stopped safely. | Ask admin to review and retry |

## No-Regression Boundaries

- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- Numeric internal ids and supported NetSuite URLs remain required before Open links.
- Admin/debug diagnostics stay separate from consultant copy.
- Image lookup remains disabled by default.

## Next Implementation Block

W239 should create the source contract modules and a compatibility adapter around the existing userscript behavior. It should not yet change live NetSuite behavior.

