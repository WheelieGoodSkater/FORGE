# W411: Larger Smoke-Series Candidate Packet

Date: 2026-06-03

Use W410 Larger Smoke-Series Design and Controlled Execution Gate as the locked smoke-design baseline. Keep W409 Comfortable Lane Hardening Matrix, W408 HVAC/Mechanical readiness delta package, W403 Wholesale Janitorial readiness delta package, W397 Building Materials readiness delta package, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W411 builds the actual candidate packet for the larger smoke series. It does not run live smoke.

No live smoke in W411. No upload or deployment was performed. No runtime upload package was created. No source packs were mutated.

The candidate packet follows W410's five-slot minimum smoke design:

1. Dealer Hardgoods control.
2. HVAC/Mechanical packaged adjacent supply.
3. Parts & Service operations.
4. Life Sciences regulated/QA-sensitive.
5. Food/Beverage manufacturing-sensitive with WIP off unless explicitly scoped.

Candidate quality rules:

- Website/category evidence owns lane identity.
- Messy notes shape pain, ROI, objections, and demo flow only.
- N/LLM remains advisory-only.

## Candidate Packet

### 1. Dealer Hardgoods Control

- Prospect name: RideNow Powersports
- Website: `https://www.ridenow.com/`
- Intended lane: Dealer Hardgoods / Dealer Channel Availability
- Toggle posture: Manufacturing off / WIP off
- Public website anchor: RideNow presents powersports inventory and dealer locations, including motorcycles, UTVs, ATVs, and watercraft.
- Why it belongs: Dealer/channel hardgoods control with unit inventory, model availability, dealer promise, and fulfillment confidence.
- Near-neighbor confusion risk: Building Materials generic branch availability or Apparel/Retail generic inventory.
- Expected proof roles: customer, sales order, product/SKU, dealer availability or replenishment flow, allocation/supporting SKU where available.
- Expected Open-link authority: Open links only after verified imported NetSuite records return.
- ROI baseline caution: do not claim measured savings without a customer-confirmed baseline.
- Competitive/advisory caution: competitor watch-outs remain advisory unless confirmed; avoid unsupported dealer-system feature claims.
- Stop conditions: wrong lane selection into generic distribution, fake Open links, Manufacturing/WIP enabled, or completed-result import validation regression.
- Poorly created sales rep notes:
  "Talked to sales manager maybe Brent or Brett at a powersports group. They sell motorcycles, ATVs, side by sides, watercraft, used stuff, maybe parts and service too. Problem sounded like stores say a unit is available then find out it is reserved, at another location, has a setup issue, or the customer already put money down. They use dealer system plus spreadsheets maybe. Need demo around customer, deal/order, product or unit availability, allocation/reserve status, and replenishment or transfer. Competitors maybe dealer portal, Lightspeed, spreadsheets, not sure. Main thing is stop promising a unit they cannot really deliver."

### 2. HVAC / Mechanical Adjacent Supply

- Prospect name: R.E. Michel Company
- Website: `https://www.remichel.com/`
- Intended lane: HVAC / Mechanical Contractor Supply & Service Readiness
- Toggle posture: Manufacturing off / WIP off
- Public website anchor: R.E. Michel lists HVAC equipment, refrigeration supplies, motors, duct/register/grille products, tools, valves, pipe/fittings, controls, and related HVAC categories.
- Why it belongs: HVAC contractor supply with equipment, replacement parts, branch stock, warranty/replacement, backorder/replenishment, and pickup/delivery readiness.
- Near-neighbor confusion risk: Building Materials contractor supply or Parts/Service dispatch/truck-stock story.
- Expected proof roles: customer, contractor account, job or service order, HVAC equipment availability, replacement/service part, branch/location stock.
- Expected Open-link authority: Open links only after verified imported NetSuite records return.
- ROI baseline caution: do not claim measured savings without a customer-confirmed baseline.
- Competitive/advisory caution: Ferguson, Johnstone, vendor portals, counter POS, QuickBooks, and spreadsheets are advisory watch-outs unless confirmed.
- Stop conditions: Building Materials lane selection, Parts/Service dispatch overfit, fake Open links, Manufacturing/WIP enabled, or completed-result import validation regression.
- Poorly created sales rep notes:
  "Spoke with counter ops person maybe Maria or Mario. They sell HVAC units, motors, duct stuff, controls, refrigerant maybe, replacement parts and contractor supplies. Branches get calls from contractors asking if a part or unit is there and sometimes nobody knows if it is reserved, backordered, warranty replacement, or at another branch. They mentioned vendor portals and a counter system but I did not get names. Need demo for contractor account, quote/order, equipment availability, replacement part, branch stock, backorder and pickup or jobsite delivery. Competitors maybe Ferguson, Johnstone, spreadsheets, not confirmed."

### 3. Parts & Service Operations

- Prospect name: General Parts Group
- Website: `https://generalparts.com/`
- Intended lane: Parts & Service / Field Service Operations
- Toggle posture: Manufacturing off / WIP off
- Public website anchor: General Parts describes commercial kitchen equipment repair, maintenance, OEM parts, refrigeration, HVAC, warewashing, and field service coverage.
- Why it belongs: service operations with work orders, installed equipment, service parts, parts availability, warranty, emergency response, and first-time-fix pressure.
- Near-neighbor confusion risk: HVAC contractor supply or Medical/Dental equipment availability.
- Expected proof roles: customer, work order, installed equipment, service part, truck/warehouse availability context, warranty/backorder context.
- Expected Open-link authority: Open links only after verified imported NetSuite records return.
- ROI baseline caution: do not claim measured savings without a customer-confirmed baseline.
- Competitive/advisory caution: dispatch apps, QuickBooks, spreadsheets, OEM parts portals, and service systems are advisory unless confirmed.
- Stop conditions: HVAC supply lane overfit, missing work-order proof path, fake Open links, Manufacturing/WIP enabled, or completed-result import validation regression.
- Poorly created sales rep notes:
  "Talked with service coordinator maybe Allison. They repair restaurant equipment, refrigeration, dish machines, ovens, fryers, maybe some HVAC. Techs sometimes roll without the part or nobody knows if it is in the van, warehouse, on order, or covered by warranty. Emergency calls get messy and people call around before telling customer ETA. Systems maybe dispatch app plus parts site plus spreadsheets. Need demo around customer site, equipment history, work order, service part availability, warranty or backorder, and first-time fix confidence. Competitors maybe ServiceTitan, OEM portals, spreadsheets, not sure."

### 4. Life Sciences Regulated / QA-Sensitive

- Prospect name: Meridian Bioscience
- Website: `https://www.meridianbioscience.com/`
- Intended lane: Life Sciences / Regulated Supply & Release
- Toggle posture: Manufacturing off / WIP off unless explicit regulated manufacturing scope is approved later
- Public website anchor: Meridian Bioscience presents life science reagents, diagnostic assay materials, molecular reagents, and ISO/quality-oriented product material.
- Why it belongs: regulated supply/release pressure with lot/release readiness, approved inventory, expiration, validation documentation, traceability, and shipment confidence.
- Near-neighbor confusion risk: Medical/Dental equipment/supply or Food/Beverage QA/batch language.
- Expected proof roles: customer, sales order, lot/release record, approved inventory item, expiration/shelf-life context, QA/validation documentation.
- Expected Open-link authority: Open links only after verified imported NetSuite records return.
- ROI baseline caution: do not claim measured savings without a customer-confirmed baseline.
- Competitive/advisory caution: SAP, quality systems, spreadsheets, and distributor portals are advisory unless confirmed.
- Stop conditions: Medical/Dental substitute overfit, Food/Beverage batch overfit, fake Open links, Manufacturing/WIP enabled unexpectedly, or completed-result import validation regression.
- Poorly created sales rep notes:
  "Talked to quality ops person maybe Nina. They make or distribute reagents, assay materials, diagnostic stuff, maybe kits and lab instrument materials. Customer service wants to promise shipment but does not always know if lot is released, docs are ready, expiration is okay, or approved inventory is at the right site. They use quality system maybe SAP maybe spreadsheets, I did not get exact. Need demo around customer order, item, lot/release, approved inventory, expiration, validation paperwork, and shipment confidence. Competitors maybe SAP, quality portal, spreadsheets, not confirmed."

### 5. Food/Beverage Manufacturing-Sensitive

- Prospect name: Yost Foods
- Website: `https://www.yostfoods.com/`
- Intended lane: Food/Beverage / Batch and Promotion Readiness
- Toggle posture: Manufacturing on only if candidate setup explicitly requires it; WIP off unless separately approved
- Public website anchor: Yost Foods describes custom food ingredient manufacturing, bases, purees, marinades, production lines, batches, packaging formats, and large-scale production support.
- Why it belongs: food/batch lane with ingredient readiness, packaging timing, batch/line continuity, finished-good readiness, and promotion/customer promise confidence.
- Near-neighbor confusion risk: Life Sciences QA/release or Industrial Equipment component/build readiness.
- Expected proof roles: customer, sales order, finished food or batch item, ingredient/component item, formula/batch structure, lot/availability context.
- Expected Open-link authority: Open links only after verified imported NetSuite records return.
- ROI baseline caution: do not claim measured savings without a customer-confirmed baseline.
- Competitive/advisory caution: co-packer systems, spreadsheets, production trackers, and ERP competitors are advisory unless confirmed.
- Stop conditions: Life Sciences lot/release overfit, Industrial Equipment assembly overfit, WIP routing enabled unexpectedly, fake Open links, or completed-result import validation regression.
- Poorly created sales rep notes:
  "Talked to plant planning person maybe Joel or Jill. They do custom food ingredients, sauces or bases or marinades maybe, packaging in totes, pails, bags, not totally sure. Sales promises a production or ship date and then planning finds ingredient is short, packaging is late, batch slot moved, or finished goods are not ready. They have spreadsheets and maybe old ERP, maybe production tracker. Need demo around customer order, finished item, ingredients, packaging, batch or line readiness, and promotion shipment confidence. Competitors maybe spreadsheets, co-packer portal, SAP maybe, not confirmed."

## Run Order

Recommended run order:

1. RideNow Powersports.
2. R.E. Michel Company.
3. General Parts Group.
4. Meridian Bioscience.
5. Yost Foods.

Reasoning:

- Start with Dealer Hardgoods as the control.
- Move to HVAC next because it is the newest packaged lane.
- Then pressure service operations.
- Then pressure regulated authority separation.
- Finish with manufacturing-sensitive Food/Beverage with WIP guarded.

## Execution Preconditions

Do not run this packet until:

- user explicitly approves smoke execution.
- installed drawer/runtime version is confirmed.
- target environment and build setup are confirmed.
- W410, W409, W408, W403, W397, and W386 harnesses still pass.
- no upload/deployment is being performed.
- no new runner or adapter changes are introduced.
- completed-result import validation remains unchanged.
- Open-link authority remains verified-import-only.
- Manufacturing/WIP toggle policy is confirmed for each candidate.

## Evidence Capture Checklist

For each future smoke capture:

- drawer version and block marker.
- candidate name, website, and notes.
- selected lane and source-pack confidence.
- website/category evidence state.
- advisory inference state.
- Build/Run result state.
- returned records and Open-link count.
- Run path and clickable Open-link behavior.
- ROI/Competitive flow state.
- proof guardrails and confidence separation.
- trace export path.
- pass/fail against intended lane.
- runner/import/Open-link errors.

## Stop Rules

Stop the series if:

- completed-result import validation regresses.
- fake Open links appear.
- real Open links are lost for verified imported records.
- wrong lane selection causes unsafe live build behavior.
- Manufacturing/WIP is enabled unexpectedly.
- runner or adapter behavior changes unexpectedly.
- source-pack gap makes remaining smoke misleading.
- upload/deployment is accidentally introduced.

## Boundary Preservation

- No live smoke in W411.
- No upload or deployment.
- No runtime upload package creation.
- No source-pack mutation in W411.
- No package creation in W411.
- W386, W397, W403, and W408 packages were not mutated.
- No fake Open links.
- No new drawer transaction write paths.
- No runner, adapter, record creation, completed-result import validation, or Open-link authority changes.
- Open-link authority remains verified-import-only.
- N/LLM remains advisory-only.
- W393 WIP routing best-effort diagnostics were not weakened.
- Manufacturing/WIP is not defaulted into non-manufacturing lanes.

## Validation Commands

```bash
node --check archive/tools/run_w411_larger_smoke_candidate_packet_harness.js
npm run harness:larger-smoke-candidate-packet-w411
npm run harness:larger-smoke-series-design-gate-w410
npm run harness:comfortable-lane-hardening-matrix-w409
npm run harness:hvac-mechanical-readiness-delta-package-w408
npm run harness:wholesale-janitorial-readiness-delta-package-w403
npm run harness:building-materials-readiness-delta-package-w397
npm run harness:pack-ready-artifact-package-w386
```

## Verification Results

```text
node --check archive/tools/run_w411_larger_smoke_candidate_packet_harness.js: passed
W411 larger smoke candidate packet harness: 17/17 passed
W410 larger smoke-series design gate harness: 17/17 passed
W409 comfortable lane hardening matrix harness: 17/17 passed
W408 HVAC/Mechanical readiness delta package harness: 13/13 passed
W403 Wholesale Janitorial readiness delta package harness: 13/13 passed
W397 Building Materials readiness delta package harness: 13/13 passed
W386 pack-ready artifact package harness: 8/8 passed
```

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| W410 design baseline preserved | Pass | W411 harness verified W410 pass result and design posture. |
| Five candidate packet complete | Pass | W411 harness verified five candidates. |
| Candidate fields complete | Pass | W411 harness verified required fields per candidate. |
| Poorly created notes present | Pass | W411 harness verified messy notes. |
| Lane intent and near-neighbor risk documented | Pass | W411 harness verified intended lane and confusion risk. |
| Manufacturing/WIP policy documented | Pass | W411 harness verified toggle posture. |
| Open-link authority preservation | Pass | W411 harness verified verified-import-only posture. |
| ROI and competitive caution documented | Pass | W411 harness verified baseline/advisory caution. |
| Stop rules documented | Pass | W411 harness verified stop rules. |
| Execution preconditions documented | Pass | W411 harness verified preconditions. |
| No live smoke/no upload boundary | Pass | W411 harness verified boundary. |
| No runtime package creation | Pass | W411 harness verified no W411 package. |
| No source-pack mutation | Pass | W411 harness verified no source mutation. |
| Package baseline preservation | Pass | W411 harness verified W386/W397/W403/W408 packages exist. |
| No-regression gates | Pass | W411 harness passed 17/17. |

## Recommendation

Lock W411 candidate packet. Run no smoke until explicit user approval.
