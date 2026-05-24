# W37 Website Evidence Intake + N/LLM Advisory Bridge

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make website intelligence stronger for unknown or opaque websites without hardcoding every brand. The website remains the authority for lane, proof, product seed, product family, and demand moment. Conversation notes remain the authority for pain, ROI, competitive framing, objections, exceptions, and live run coaching.

## What Changed

- Added optional `websiteEvidence` intake so consultants can paste homepage, category, product, navigation, title, meta, or SC-provided website evidence when a URL/domain is not enough.
- Added `websiteEvidenceBridge(state)` as the governed review-only bridge for future N/LLM website summaries.
- Added website evidence into `websiteResolverSource`, `websiteSignalProfile`, N/LLM enrichment, record-naming advisory, setup plan, adapter bridge request, and trace payloads.
- Added opaque-site harness cases so URL-only failures can be improved with website evidence instead of brittle one-off domain hardcoding.
- Tightened Apparel classifier language so generic bag/outdoor gear language does not pull hardgoods into Apparel unless style, size, color, footwear, or apparel evidence is actually present.

## Harness Results

- `npm run harness:website` passes `13/13`.
- New opaque outdoor hardgoods case routes to Dealer Hardgoods through pasted website evidence.
- New opaque footwear/apparel case routes to Apparel & Accessories through pasted website evidence.

## Stronger Website Intelligence Path

1. Known official domain: highest confidence.
2. Website/category tokens from URL/domain/customer name.
3. Pasted website evidence from consultant or SC request.
4. Future N/LLM advisory website evidence summary.
5. Conversation notes only after package identity is resolved.
6. Industry fallback only when evidence is still weak.

## N/LLM Boundary

N/LLM can recommend category tokens, product seed, product family, demand moment, confidence, and source basis. It cannot create records, invoke SuiteScript, approve writes, change lane authority, change proof anchors, change DCC toggles, reorder the packet, or hide create blockers.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- SuiteScript direct-write pilot remains separate and governed.
- Notes do not own product identity.
- Manual lane override remains available.

## Next

W38 should use the stronger website evidence model with the W34 pilot result import path, then capture one sandbox Customer + Proof Item response without enabling transaction writes.
