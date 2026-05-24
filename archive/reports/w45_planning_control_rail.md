# W45 Planning Control Rail

Decision: COMPLETE / PLANNING CONTROL RAIL READY / NO TRANSACTION WRITE

## What Changed

W45 ports the DCC planning-control lesson into the W24 pilot Proof Item writer. The Suitelet now returns a `planningContext` and `planningControlPlan`, so the reviewed packet can show what item planning behavior will be used before a proof item is created or updated.

The default is intentionally stable:

- Policy: `stable_manual_planning`
- Auto planning calculations: off by default
- Replenishment method: optional, only set when configured

## Runtime Parameters

- `custscript_idb_planning_policy` - optional planning policy label.
- `custscript_idb_disable_auto_planning` - optional checkbox to explicitly disable or preserve auto planning behavior.
- `custscript_idb_default_replenishment_method` - optional replenishment method/list value for proof item setup.

## Guardrails

- No hidden planning changes: the plan returns the policy, field intent, and write behavior.
- Customer still writes first.
- Proof Item still requires Customer ID and URL.
- Vendor attach remains lookup/configuration-first and never creates vendors silently.
- Transaction context remains disabled.

## SuiteScript Behavior

When stable manual planning is active, the pilot attempts to set:

- `autoleadtime = false`
- `autoreorderpoint = false`
- `autopreferredstocklevel = false`
- `autosafetystocklevel = false`

When a replenishment method is configured, the pilot attempts to set:

- `supplyreplenishmentmethod`

All field writes use guarded `safeSetValue` behavior so account-specific field availability does not turn into an HTML 500.

## Evidence Added

- `idb.planning-control-rail.v1`
- `idb.planning-control-plan.v1`
- Harness scenario: default stable manual planning is visible and applied.
- Harness scenario: explicit runtime policy can preserve automation and carry replenishment method.

## Blunt Finding

This is the right level of planning control for the current pilot. It is not trying to replicate the entire DCC planning engine yet; it creates a visible rail so consultants and admins know whether proof items are being stabilized or left to existing planning automation.

The next move should consolidate account context, vendor attach, and planning control into one stronger proof-item writer instead of adding more records.

## Next Block

W46: Proof Item Write V2
