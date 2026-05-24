# W27 Visual Pilot Website Package Rubric

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Turn the Redwood design work and the Trek Bikes pilot finding into a practical consultant visual rubric, then tighten website-first package naming so new sites do not fall back to generic or cross-lane object names.

## Findings From Current Run

- Trek Bikes routed directionally toward Dealer Hardgoods and Channel Fulfillment, which is the right family for a bicycle dealer/distribution story.
- The package naming was not strong enough. The object preview still used weak labels like `Trek Bikes Finished Good` and food/beverage phrases like `ingredient and lot readiness`.
- This is the important architecture lesson: website evidence should choose the package and record-name seed; conversation notes should shape the story, ROI, objections, and run coaching.

## Changes Made

- Added `trekbikes.com` as a Dealer Hardgoods website signal.
- Set the expected package to `Bicycle Dealer Hardgoods`.
- Set the expected product seed to `Bicycle SKU`.
- Set the expected demand moment to `dealer bicycle availability`.
- Added anti-leak rules so Dealer Hardgoods does not inherit Food / Beverage object language unless the website itself proves a food, beverage, ingredient, or lot-controlled context.
- Added Trek Bikes to resolver expectations.

## Expected Trek Output

- Customer: `Trek Bikes`
- Sales Order View: `Trek Bikes - dealer bicycle availability Demo Order`
- Product / SKU: `Trek Bikes Bicycle SKU`
- Inventory / Fulfillment: `Trek Bikes Bicycle Dealer Hardgoods Inventory / Fulfillment`

## Five-Consultant Visual Pilot Rubric

| Surface | Consultant Question | Pass Signal |
|---|---|---|
| Plan | Can I enter the brief and run IDB without fighting the UI? | Guided intake appears first and the Story Bar stays compact. |
| Review | Can I understand what IDB will prepare before reading every record? | Execution Plan Preview appears before the full record list. |
| ROI / Competitive | Can I answer why this matters and why NetSuite wins quickly? | Top ROI and competitive point are summarized first, with details expandable. |
| Run | Can I keep talking live without scrolling? | Live controls, top-three path, script, and exceptions are first. |
| Trace | Can I export and reset safely after the demo? | Export JSON, export packet, clear trace, and clear session are obvious. |
| Write readiness | Can I tell whether creation is blocked, validated, or enabled? | Gate status and exact write list are compact and not repeated. |

## Next Blocks

### W28: Website Package Classifier V2

Goal: extract package, product family, product seed, demand moment, and anti-leak tags from new websites before packet freeze.

### W29: N/LLM Record Naming Advisory Contract

Goal: use N/LLM only when local evidence is medium/low, the product seed is generic, or a new website needs a better record-name proposal.

### W30: Pilot Write Result UX

Goal: turn W24 sandbox pilot responses into a compact result card with created/updated Customer and Proof Item links.

### W31: Transaction Context Pilot Gate

Goal: prepare Sales Order context writing only after Customer and Proof Item IDs/URLs exist.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- No automatic creation from Tampermonkey.
- No Sales Order write in main.
- N/LLM remains advisory only.
- Redwood token and component alignment from W25-W26 remains intact.
