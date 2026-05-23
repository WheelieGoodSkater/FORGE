# V3-V4 Website Product Naming Engine And N/LLM Prompt Contract V2

Generated: 2026-05-09

Decision: COMPLETE / CREATE STILL DISABLED

## V3 Objective

Make website-derived product naming visible, traceable, and usable in record/transaction previews before any write path is enabled.

## V3 Completed

- Added `data/website_product_naming_contract.json`.
- Added `websiteProductNamingEvidence` in the drawer.
- Added visible naming source to the Story Bar.
- Added Website product naming cards in Plan and Review.
- Added product seed, product family, demand moment, authority, confidence, evidence, fallback reason, and N/LLM recommendation state.
- Continued to use website-derived product seeds for transaction, proof-anchor, and supporting record names.

## V4 Objective

Define N/LLM advisory prompt contracts for the next intelligence layer without granting authority over lanes, proof anchors, toggles, or creation.

## V4 Completed

- Added `data/llm_prompt_contracts_v2.json`.
- Added request contract version `idb.llm-prompt-contracts.v2` to the drawer enrichment request.
- Added advisory tasks:
  - classify weak websites
  - enrich product names
  - extract story pain
  - draft ROI audit
  - draft competitive framing
  - draft run script
- Added naming evidence to the N/LLM enrichment request.
- Added per-record `nllmCanImproveName` and naming source.

## N/LLM Roles

- Web Signal Agent: classify weak or unknown websites.
- Object Naming Agent: improve product seed, family, demand moment, and record names.
- Story Intelligence Agent: extract pain, exceptions, and decision-to-land.
- ROI Audit Agent: generate auditable ROI with assumptions.
- Competitive Strategy Agent: create safe workflow-based NetSuite win framing.
- Packet Contract Agent: review SuiteScript packet readiness without invoking writes.

## Boundaries Preserved

- No live writes enabled.
- No SuiteScript invocation added.
- No lane changes.
- No proof-anchor changes.
- No DCC toggle changes.
- No packet order changes.
- N/LLM remains advisory only.

## Next Recommended Block

V5 should implement the Conversation Pain Story Mapper so conversation notes become a structured pain summary, top three moves, exceptions, and decision-to-land payload that the ROI / Competitive and Run tabs can share.
