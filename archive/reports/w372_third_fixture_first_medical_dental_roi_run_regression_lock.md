# W372: Fixture-First Third Industry Lane And ROI/Run UX Regression Lock

W372 continues fixture-first industry expansion while treating W371 ROI/Competitive flow and Run clickable path polish as locked UX baselines. It adds Specialty Medical / Dental Equipment & Supplies as the third adjacent fixture lane after Apparel/Retail and Parts/Service.

No live smoke was run in W372.

## Fixture Candidate

- Name: Northstar Dental Supply & Equipment
- Website: https://www.northstardentalsupply.com
- Poorly created sales rep notes: "Talked to office ops person maybe Melanie or Melissa. They sell dental supplies, chairs, sterilization stuff, handpieces, small equipment, maybe service too. Main issue is clinics ask for product availability and they don't know what is in stock, what is backordered, or what can ship from which location. Some items have compliance or warranty info but I didn't get details. They use QuickBooks maybe, spreadsheets, maybe ecommerce orders. Need demo around customer order, item availability, substitute product, equipment/warranty info, and replenishment. Competitor maybe Shopify, QuickBooks, dental distributor portal, not sure."

## Scoped Change

- Drawer marker advances to `Drawer 1.0.18 / W372`.
- Added a fixture-first `medicalDentalStoryPolishW372` story layer for Specialty Medical / Dental Equipment & Supplies.
- Added a drawer-local Medical/Dental Supply lane definition so the fixture can exercise consultant story, ROI, Run, and trace surfaces without changing live runner, adapter, record creation, or source lane-pack behavior.
- Preserved W371 ROI / Competitive flow: Talk track, Discovery, Proof move, Largest value to prove, Objection handle, and Claim caution.
- Preserved W371 Run path behavior: numbered path nodes are real Open links only when verified link authority exists.

## Medical/Dental Story Contract

The Medical/Dental story must talk about:

- Clinic supply availability.
- Dental or medical equipment and supplies.
- Regulated or warranty-sensitive items.
- Substitute products.
- Replenishment.
- Backorder risk.
- Multi-location stock.
- Equipment history.
- Customer promise confidence.

The Medical/Dental story must not leak:

- Dealer Hardgoods language such as dealer allocation, supplier portals, channel fulfillment, or dealer/channel proof path.
- Apparel/Retail language such as style/color/size variants, seasonal assortment, store/ecommerce promise, or Apparel/retail proof path.
- Parts/Service language such as work order dispatch, technician truck stock, first-time fix, or Parts/service proof path.

## Pass / Fail Table

| Gate | Result | Evidence |
| --- | --- | --- |
| Medical/Dental industry distinctness | PASS | Northstar fixture uses clinic supply, dental equipment, substitute product, multi-location stock, backorder, replenishment, equipment history, and warranty language. |
| Cross-lane anti-leak wording | PASS | Northstar avoids Dealer Hardgoods, Apparel/Retail, and Parts/Service leak terms; Bayview, Harbor, Summit, and RidgeLine remain distinct. |
| W371 ROI/Competitive flow preservation | PASS | All scenarios retain the flow-first ROI / Competitive surface. |
| Largest-value-to-prove clarity | PASS | ROI row remains labeled `Largest value to prove` and includes baseline capture guidance. |
| Competitive objection/watch-out clarity | PASS | Competitive row remains `Objection handle` and competitor pressure remains advisory unless confirmed. |
| Run path clickable Open-link preservation | PASS | Numbered Run path nodes remain clickable only for verified Open links. |
| Claim safety | PASS | Savings, availability, substitute, warranty, compliance, and competitor claims require customer/source confirmation. |
| Confidence separation | PASS | Public website/category evidence, N/LLM advisory inference, build/import proof, and Open-link authority stay separate. |
| No fake Open links | PASS | Non-verified Open-link states remain non-clickable; no placeholder links are introduced. |
| No-regression gates | PASS | No runner, adapter, record creation, transaction write, completed-result import validation, or source lane-pack behavior changed. |

## Smoke-Minimizing Expansion Checklist v3

Fixture-only story polish is enough when:

- The work changes lane vocabulary, presenter flow, collapsed support detail, or UX layout only.
- Representative messy notes and website/category evidence can exercise the story.
- Imported proof records can model the Run path and Open-link authority without live runner changes.
- Locked live baselines already prove completed-result import and Open-link integration.

A second fixture is needed when:

- The lane has multiple likely operating models.
- The first fixture cannot prove anti-leak wording across Value, Run, Trace, and collapsed details.
- Competitive pressure is too generic to tell whether the objection path is lane-specific.
- Claim-safety wording depends on terms not represented in the first fixture.

Source lane packs may need scoped mutation only when:

- Drawer-local story polish cannot produce a correct lane selection or proof anchor.
- More than one fixture proves the same missing lane-pack vocabulary or record role.
- The report identifies exact source-pack fields to change and why fixture-only work is insufficient.
- The change is explicitly scoped after fixture proof.

Live smoke is truly required only when:

- Runner, adapter, record creation, completed-result import, or Open-link authority behavior changes.
- The lane needs real NetSuite record-shape proof that fixtures cannot model.
- The UI depends on a returned live-runner field not covered by locked traces or fixture records.
- There is a real integration-risk change, not story polish.

## Recommendation

Lock Medical/Dental fixture-first story and continue fixture-first expansion. Do not run live smoke unless a future change introduces runner/import/Open-link integration risk.
