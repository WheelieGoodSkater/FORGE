# W211 Upload Manifest - Toggle-Aware Naming Guardrails

## Upload These Files

1. `scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
   - Upload this to the active NetSuite scheduled runner script file.
   - Purpose: rewrites non-manufacturing naming before record naming/result capture so Dealer Hardgoods without Manufacturing/WIP cannot return Finished Good, Production Line, Ingredient Blend, BOM, Assembly, Work Order, Routing, WIP, or Manufacturing Line names.

2. `idb-drawer.user.js`
   - Update Tampermonkey with this file.
   - Purpose: extends the W151 completed-result import guard so a completed result is rejected if returned names violate selected build toggles.

## Do Not Upload

- No W144 Suitelet change is required for W211.
- No Suitelet deployment parameter change is required for W211.
- No visual NetSuite test is required before upload.

## Smoke After Upload

Use one normal consultant Build with:

- Customer / Prospect Name: `Summit Outdoor Supply`
- Website: `https://www.summitoutdoorsupply.com`
- Conversation Notes: `Regional outdoor gear distributor is struggling to keep seasonal inventory aligned across retail, ecommerce, and wholesale channels. Buyers need better visibility into item availability, replenishment timing, and channel demand before committing to large seasonal orders.`
- Create new item: on
- Manufacturing: off
- WIP: off

Expected returned names should use dealer/distribution vocabulary such as:

- `Summit Outdoor Supply Channel Availability SKU`
- `Summit Outdoor Supply Dealer Replenishment Flow`
- `Summit Outdoor Supply Allocation Support SKU`

They should not include:

- `Finished Good`
- `Ingredient`
- `Ingredient Blend`
- `Production Line`
- `BOM`
- `Assembly`
- `Work Order`
- `Routing`
- `WIP`
- `Manufacturing Line`

## Validation Completed

- `npm run harness:toggle-aware-naming-w211`
- `npm run harness:one-click-production-build-automation-w208`
- `npm run harness:production-flow-hardening-w209`
- `npm run harness:consultant-first-ui-cleanup-w210`
- `npm run check`
- `npm run validate`
