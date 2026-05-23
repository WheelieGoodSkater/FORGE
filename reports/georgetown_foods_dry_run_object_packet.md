# Georgetown Foods Dry-Run Object Packet

Generated: 2026-05-09

Source trace: `/path/to/downloads/intelligent-demo-builder-trace-1778344929240.json`

Decision: GO for review-only packet. STOP for live creation until a supported adapter exists.

## Customer Context

- Customer: georgetown foods
- Website: `https://georgetownfoods.example`
- Notes: packaged beverages, ingredient readiness, packaging timing, line continuity, finished goods availability, and replenishment risk for upcoming promotions.

## Lane Decision

- Lane: Food / Beverage CPG Manufacturing
- Demo Command Center V4 family: `foodManufacturing`
- Scenario: Promotion-Driven Food Manufacturing
- Mode: Balanced
- Toggles: `createNewHeroItem=true`, `enableManufacturing=true`, `enableWip=false`
- Proof anchor: Finished Good
- Current page context: NetSuite page / low confidence
- Recommended opening move: Customer Record

## Draft Records

| Sequence | Record | Role | Status | Why |
| --- | --- | --- | --- | --- |
| 1 | Customer Record | customer | draft | Anchor the Georgetown Foods account story and discovery context. |
| 2 | Sales Order View | transaction | draft | Show promotion-driven demand and finished-good customer commitment. |
| 3 | Finished Good | proof anchor | draft | Keep Food / Beverage proof centered on the packaged beverage item. |
| 4 | Ingredient / Packaging Structure | supporting proof | draft | Represent ingredient readiness and package timing risk. |
| 5 | Packaging & Line Details | supporting proof | draft | Support line continuity and packaging availability proof. |
| 6 | Production Setup | supporting proof | draft | Preserve the manufacturing setup path without live writes. |

## Creation Gate

- Adapter status: not connected.
- Creation allowed: false.
- Consultant confirmation required: true.
- Safe next action: review draft records before any creation adapter is used.

## Non-Regression Confirmation

- No live creation.
- No proof-anchor change.
- No new lane.
- No fixture append.
- No unsupported object creation.
