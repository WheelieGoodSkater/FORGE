# W366: Targeted Dealer/Channel Live Smoke Review

W366 reviews the Summit Outdoor Supply targeted dealer/channel smoke against the W365 fixture-only baseline. The live drawer marker was current at `Drawer 1.0.12 / W365`. No optional website/category evidence was used.

## Evidence

- Trace: `archive/trace_samples/w366_summit_outdoor_dealer_channel_live_smoke_trace.json`
- Prospect: Summit Outdoor Supply
- Website: `https://www.summitoutdoorsupply.com`
- Lane: Dealer Hardgoods & Channel Fulfillment
- Build result: completed result imported
- Records: 5 display-ready records with verified Open-link authority
- Public read: resolver-limited local fallback
- Advisory: supported / high

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Live marker current | Pass | Trace shows `Drawer 1.0.12 / W365`. |
| Dealer/channel specificity | Pass | Plan and Run use Dealer Hardgoods / Dealer Channel Availability, allocation position, replenishment timing, supplier lead-time risk, and channel fulfillment language. |
| Public/advisory separation | Pass | Public website read remains resolver-limited; advisory support is visible but advisory-only. |
| Build/import proof | Pass | Completed result imported through the existing W151/W214/W245 guard chain. |
| Open links | Pass | 5 verified Open links are present; no fake Open links are introduced. |
| Run claim safety | Pass with UX follow-up | Run warns to confirm real dealer allocation and supplier lead-time evidence before ROI or availability claims. |
| Trace operator evidence | Pass | Trace is clean: version, records imported, Open-link count, public/advisory state, and export controls are visible. |
| Value density | Needs W367 | Live Value Answer is still too text-rich for a consultant day-of-demo cockpit. |
| Run polish | Needs W367 | Run has the right model but still feels dense and less professional than the desired cockpit experience. |

## Critical Findings

1. Dealer/channel story is viable.
   The smoke proves the story can move beyond generic branch distribution. The lane language now talks about dealer/channel availability, allocation, replenishment, supplier lead-time exposure, and channel promise risk.

2. Resolver-limited honesty remains correct.
   Summit's public site was not fetched deeply. The UI does not call the site weak; it says resolver-limited and keeps advisory support separate from public proof.

3. Build/import trust is intact.
   The imported proof spine is stable: customer, sales order, product SKU, availability/replenishment flow, and supporting SKU all remain verified Open-link records.

4. The Value tab is too rich for live use.
   The Live Value Answer still reads like a paragraph-heavy coaching report. It should become a short decision cockpit: a few compact chips/cards, then collapsed supporting detail.

5. The Run tab is directionally right but not yet polished.
   The NetSuite path and live controls are useful, but the path cards are narrow, the arrows feel cramped, and Say / Show / Close cards still compete with the selected script. Run should feel like a guided cockpit, not a compressed audit page.

## Recommendation

Do not lock Dealer Hardgoods broadly yet. The smoke passes the trust gates, but one focused UX pass should happen first so consultants can actually use the lane live without parsing too much text.

Proceed to W367 before broader dealer/channel smoke:

- Compress Live Value Answer into short top-level decision chips.
- Make Value supporting evidence collapsible by default.
- Make Run path flow more professional and less cramped.
- Convert Say / Show / Close into cleaner click targets or a compact active-step strip.
- Keep imported proof records collapsed but easy to open.
- Keep the Live Proof CTA / audit material collapsed.
- Preserve all W151/W214/W245 validation, Open-link authority, public/advisory/build confidence separation, and no-write boundaries.

## Boundaries Preserved

- No new drawer transaction write paths.
- No fake Open links.
- No runner, adapter, or record creation behavior changed.
- No completed-result import validation weakened.
- N/LLM remains advisory only.

## Next Prompt Block

Move through W367: Consultant cockpit density and Run polish.

Use W366 Summit Outdoor Supply as the live dealer/channel baseline, with W358 Graybar, W359 Fastenal, W360 MSC, W361 cockpit, W362 competitive lens, W363 Trace cleanup, and W365 dealer fixture polish as locked regression baselines. Do not run new live smoke unless the UX change creates real integration risk.

Goals:
- Compress Live Value Answer so it works as a day-of-demo cockpit, not a coaching report.
- Turn the top Value area into short decision chips/cards: Next move, NetSuite answer, ROI answer, Caution, and Competitive pressure.
- Keep longer talk track, competitive prep, and audit details collapsed by default.
- Polish Run so the NetSuite path flow is professional, scannable, and not cramped.
- Make Say / Show / Close feel like active presenter steps under the selected live control.
- Keep imported proof records collapsed by default while preserving real Open links.
- Keep proof guardrails, website read, and audit/support details lower and collapsed where appropriate.
- Preserve public evidence, advisory inference, build/import proof, and Open-link authority separation.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Scoped Value and Run UX polish.
- W367 report and harness using Summit, Graybar, Fastenal, and MSC baselines.
- Pass/fail table for Value density, Run professionalism, claim safety, Open-link preservation, confidence separation, and no-regression gates.
- Recommendation: lock Dealer Hardgoods for one broader live smoke, patch one issue, or continue cockpit polish.
