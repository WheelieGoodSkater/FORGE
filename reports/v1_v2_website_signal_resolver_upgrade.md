# V1-V2 Website Signal Contract And Website-First Resolver Upgrade

Generated: 2026-05-09

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make the prospect website the primary source of truth for lane selection and record naming, while preserving conversation notes as the story, ROI, competitive, and run-coaching input.

## What Changed

- Added `data/website_signal_contract.json`.
- Upgraded website lane hints into website signal profiles with:
  - source authority
  - lane ID
  - evidence
  - product seed
  - product family
  - demand moment
  - confidence
- Updated resolver scoring so website-primary signals beat generic note terms.
- Added Milk-Bone as a Products CPG website signal with pet-treat packaged-goods naming.
- Updated product naming so records use website-derived product seeds when the website signal matches the selected lane.
- Added Milk-Bone to website resolver expectations.

## Current Website-First Guard Cases

- Milk-Bone -> Products CPG / Sales Order View / Original Dog Biscuits Variety Pack.
- Vans -> Apparel & Accessories / Style / SKU Matrix / Core Skate Shoe Style Matrix.
- Gordon & Smith -> Dealer Hardgoods & Channel Fulfillment / Product / SKU / Custom Surfboard and Skateboard SKU.
- Keebler -> Food / Beverage CPG Manufacturing / Finished Good / Cookie Variety Pack.
- Liquid Death -> Food / Beverage CPG Manufacturing / Finished Good / Sparkling Water Variety 12-Pack.

## N/LLM Placement

N/LLM should be used after this local website-first contract to:

- classify weak or unknown websites,
- summarize category and product evidence,
- improve record names,
- extract pain from conversation notes,
- generate auditable ROI,
- generate safe competitive framing,
- generate run scripts and exceptions.

N/LLM must not:

- approve writes,
- change lane contracts,
- change proof anchors,
- change DCC toggles,
- invent measured ROI,
- invent sourced competitor claims.

## Boundaries Preserved

- No live writes enabled.
- No SuiteScript execution added.
- No lane list changes.
- No proof-anchor changes.
- No DCC toggle changes.
- No packet order changes.

## Next Recommended Block

V3 should build the Website Product Naming Engine into a more explicit model: show the website-derived product seed in the Plan/Review evidence, let N/LLM enrich weak names, and keep a visible fallback reason when the product seed is local-only.
