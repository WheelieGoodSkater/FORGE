# W369: Fixture-First Industry Expansion And Lane-Story UI Polish

W369 starts industry expansion after the W368 Dealer Hardgoods live-smoke closeout. It uses W368 Run visual-flow polish as the locked UI baseline, treats W366 Summit Outdoor Supply and W368 RidgeLine Powersports & Equipment as live Dealer Hardgoods proof baselines, and keeps W358 Graybar, W359 Fastenal, W360 MSC, W361 cockpit, W362 competitive lens, W363 Trace cleanup, W365 dealer fixture polish, and W367 cockpit density as regression baselines.

No live smoke was run. This block is fixture-first and scoped to consultant-facing story/UI polish.

## Fixture Candidate

- Name: Harbor & Finch Outfitters
- Website: `https://www.harborfinchoutfitters.com`
- Sales rep notes: "Met with retail ops person, maybe Dana. They sell apparel, bags, outdoor lifestyle stuff, some seasonal items and online orders. Main issue sounded like they don't know what sizes/colors are actually available across store and ecommerce, and they keep making promises then finding out inventory is wrong. Lots of spreadsheets and Shopify reports maybe. They care about margin, stockouts, transfers, and not disappointing customers. Need a demo around item availability, variants, maybe replenishment. I didn't get exact systems. Could be Shopify plus spreadsheets, maybe Lightspeed, maybe QuickBooks."

## What Changed

- Drawer marker advances to `Drawer 1.0.15 / W369`.
- Added a fixture-first `apparelRetailStoryPolishW369` story layer for Apparel & Accessories / Specialty Retail.
- Apparel story now emphasizes style, size/color availability, seasonal assortment, store/ecommerce promise, replenishment timing, margin exposure, and transfer risk.
- Value includes an Apparel/retail lens collapsed by default so the day-of-demo cockpit stays dense.
- Run includes an Apparel/retail proof path collapsed by default and preserves the W368 numbered NetSuite visual flow.
- Competitive pressure remains advisory and apparel-specific: Shopify reports, Lightspeed, QuickBooks plus spreadsheets, ecommerce inventory apps, and manual store transfer sheets.

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Industry distinctness | Pass | Harbor & Finch story uses apparel/retail vocabulary instead of Dealer Hardgoods language. |
| Value density | Pass | Live Value Answer remains a compact five-card cockpit with support details collapsed. |
| Run professionalism | Pass | Run keeps visual NetSuite path, live controls, Say / Show / Close presenter steps, selected script, and collapsed support sections. |
| Claim safety | Pass | ROI and availability claims require customer-confirmed size/color, store/ecommerce, transfer, and margin baselines. |
| Open-link preservation | Pass | Fixture includes five verified Open-link records; imported proof records remain collapsed by default. |
| Confidence separation | Pass | Website/category evidence, advisory inference, build/import proof, and Open-link authority remain separate. |
| Anti-leak wording | Pass | Apparel/Retail copy avoids Dealer Hardgoods leaks such as dealer allocation, supplier portals, channel fulfillment, and dealer/channel proof path language. |
| No-regression gates | Pass | No drawer transaction writes, fake Open links, runner changes, adapter changes, record creation changes, completed-result validation weakening, or source lane-pack mutation. |

## Smoke-Minimizing Expansion Checklist

Use this checklist for the next industry expansion block:

1. Start with one messy sales-note fixture and website/category evidence.
2. Prove industry-distinct vocabulary before considering any source-pack change.
3. Validate Value density and Run professionalism against W368 visual-flow baseline.
4. Assert anti-leak language from the previous lane.
5. Preserve public evidence, advisory inference, build/import proof, and Open-link authority separation.
6. Use archived live baselines for no-regression proof.
7. Run live smoke only if fixture/harness evidence cannot answer a real integration-risk question.

## Recommendation

Lock fixture-first Apparel/Retail story and prepare a second fixture-only industry lane. No live smoke is recommended for the next block unless runner, adapter, import validation, Open-link authority, write path, or deployment sync behavior changes.

## Boundary Confirmation

- No live smoke in W369.
- No new drawer transaction write paths.
- No fake Open links.
- Runner, adapter, and record creation behavior unchanged.
- Completed-result import validation unchanged.
- N/LLM remains advisory only.
- Source lane packs were not mutated.
