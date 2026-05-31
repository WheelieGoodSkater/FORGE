# W370: Second Fixture-First Industry Lane And Cross-Lane Story Separation

W370 proves the fixture-first expansion pattern can support a second adjacent lane without running live smoke. It uses W369 Apparel/Retail as the locked industry-expansion baseline, W368 Dealer Hardgoods Run visual-flow polish as the locked live-smoke baseline, and keeps Summit, RidgeLine, Graybar, Fastenal, MSC, W361, W362, W363, W365, W367, and W369 as regression gates.

No live smoke was run in W370.

## Fixture Candidate

- Name: Bayview Commercial Kitchen Service
- Website: https://www.bayviewkitchenservice.com
- Poorly created sales rep notes: "Talked to service manager maybe Rick or Rich. They repair restaurant equipment, ovens, refrigeration, dish machines, maybe sell parts too. Big problem is techs show up without the right parts or nobody knows if parts are in the truck, warehouse, or on order. They use spreadsheets, QuickBooks maybe, some dispatch app maybe ServiceTitan but not sure. They care about first-time fix, warranty, emergency calls, backordered parts, and not losing time calling around. Need demo to show customer equipment history, work order, parts availability, maybe replenishment or purchasing. I did not get exact systems."

## Scoped Change

- Drawer marker advances to `Drawer 1.0.16 / W370`.
- Added a fixture-first `partsServiceStoryPolishW370` story layer for Parts & Service / Field Service.
- Added a drawer-local Parts & Service lane definition so the fixture can exercise the consultant story surface without changing live runner, adapter, record creation, or source lane-pack behavior.
- Run remains W368 visual NetSuite path first, followed by live controls, Say / Show / Close, selected script, collapsed imported proof records, collapsed guardrails, and collapsed support detail.
- Value remains W367 cockpit dense with Next move, NetSuite answer, ROI answer, Caution, and Competitive pressure.

## Parts/Service Story Contract

The Parts/Service story must talk about:

- Work orders.
- Customer equipment history and installed equipment.
- Technician readiness.
- Truck and warehouse parts availability.
- First-time fix risk.
- Warranty exposure.
- Emergency response.
- Backordered parts.
- Service margin.

The Parts/Service story must not leak:

- Dealer Hardgoods language such as dealer allocation, supplier portals, channel fulfillment, or dealer/channel proof path.
- Apparel/Retail language such as style/color/size variants, seasonal assortment, or store/ecommerce promise.

## Pass / Fail Table

| Gate | Result | Evidence |
| --- | --- | --- |
| Parts/Service industry distinctness | PASS | Bayview fixture uses work order, installed equipment, truck/warehouse parts, backorder, warranty, first-time fix, and service margin language. |
| Cross-lane anti-leak wording | PASS | Bayview avoids Dealer Hardgoods and Apparel/Retail leak terms; Harbor keeps Apparel/Retail story; RidgeLine and Summit keep Dealer Hardgoods story. |
| Value density | PASS | Live Value Answer remains decision-chip based with Next move, NetSuite answer, ROI answer, Caution, and Competitive pressure. |
| Run professionalism | PASS | W368 visual NetSuite path remains active; no ASCII arrow path is used in the Run cockpit. |
| Claim safety | PASS | Parts/Service safe claim requires confirmed work order, installed equipment, parts location, warranty, backorder, and service-margin evidence before ROI or first-time-fix claims. |
| Open-link preservation | PASS | Fixture imported proof records preserve verified Open-link authority; no Open link is rendered without supported URL authority. |
| Confidence separation | PASS | Public website/category evidence, N/LLM advisory inference, build/import proof, and Open-link authority stay separated. |
| No-regression gates | PASS | No runner, adapter, record creation, transaction write, or completed-result import validation behavior was changed. |

## Smoke-Minimizing Expansion Checklist v2

Fixture-only story work is enough when:

- The change is copy, lane story, collapsed support details, or presenter-step polish.
- The harness can provide representative messy sales notes, website/category evidence, and imported proof records.
- Open-link behavior is already covered by fixture imported records or locked live baselines.
- Existing live baselines already prove the integration path for record import and Open links.

A second fixture is needed when:

- The lane language is still too close to an existing lane.
- The lane has more than one plausible operating model, such as service-only versus service-plus-parts sales.
- The first fixture cannot prove anti-leak wording across Value, Run, Trace, and collapsed details.
- The report cannot explain whether source lane packs should remain untouched.

Live smoke is truly required only when:

- Runner, adapter, record creation, completed-result import, or Open-link authority behavior changes.
- A new lane requires real NetSuite record-shape proof that fixtures cannot model.
- The UI depends on data returned only by the live runner and not represented in locked traces.
- There is a credible integration-risk change, not just story polish.

Evidence required before mutating lane/source packs:

- At least one fixture proving lane-specific vocabulary, proof path, and anti-leak wording.
- A harness that compares the new lane against Dealer Hardgoods, Apparel/Retail, and distribution baselines.
- A report explaining why drawer-local story polish is insufficient.
- Explicit scope approval to mutate lane/source packs after fixture proof.

## Recommendation

Lock Parts/Service fixture-first story and continue fixture-first expansion. Prepare a third fixture-only lane before any further live smoke, unless a future change creates real integration risk.
