# W412: First Two Larger-Smoke Review and UX Cleanup Plan

Date: 2026-06-03

Use W411 Larger Smoke-Series Candidate Packet as the locked smoke candidate baseline. Keep W410 Larger Smoke-Series Design Gate, W409 Comfortable Lane Hardening Matrix, W408 HVAC/Mechanical readiness delta package, W403 Wholesale Janitorial readiness delta package, W397 Building Materials readiness delta package, W386 source-pack readiness evidence package, and W379-W383 source-pack-ready lane baselines locked.

## Summary

W412 reviews the first two larger-smoke results:

- RideNow Powersports trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515279117.json`
- R.E. Michel Company trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515597715.json`

No additional live smoke was run in W412. No upload or deployment was performed. No source packs, runner, adapter, or record creation behavior were changed.

The integration layer is holding: both traces returned five verified NetSuite Open links and preserved verified-import-only link authority.

The consultant UX and lane-story layer needs cleanup before the rest of the series is used as a high-confidence UX read. ROI/Competitive is too boxy, too text-heavy, and still reads like generated coaching instead of a consultant flow. Run repeats the same Say / Show / Close story across selected script and Live Script First. Build's Live Proof CTA is cramped because the three proof/safe-claim/stop blocks sit side by side.

## Smoke Evidence Review

| Smoke | Intended W411 slot | Actual selected lane | Website read | Advisory | Open links | Result |
| --- | --- | --- | --- | --- | --- | --- |
| RideNow Powersports | Dealer Hardgoods control | Industrial Distribution & Branch Fulfillment | Resolver limited / Low | Supported / High | 5 verified | Integration pass; lane/story specificity fail |
| R.E. Michel Company | HVAC / Mechanical adjacent supply | Parts & Service / Field Service | Resolver limited / Low | Supported / High | 5 verified | Integration pass; HVAC validation miss; Parts/Service signal captured |

### RideNow Powersports

Trace findings:

- Selected lane: `industrial_distribution`
- Selected story: `Industrial Distribution & Branch Fulfillment`
- Proof anchor: `Inventory / Fulfillment`
- Website evidence: `needs_confirmation`, resolver-limited / low
- Advisory inference: supported / high
- Imported records: 5
- Verified Open links: 5

Returned records:

- Customer: `RideNow Powersports Customer Account`
- Sales Order: `SO2707`
- Product SKU: `RideNow Powersports Channel Availability SKU`
- Availability/Replenishment Flow: `RideNow Powersports Branch Availability / Replenishment Flow`
- Supporting SKU: `RideNow Powersports Safe Substitute Fulfillment Support SKU`

Assessment:

- Open-link authority is good.
- Completed build/import posture appears good from the returned navigation objects.
- Dealer Hardgoods did not hold as the active lane. The story drifted to generic branch distribution.
- ROI/Competitive copy used broad `Inventory / Fulfillment` language and did not tell a powersports dealer story strongly enough.

### R.E. Michel Company

Trace findings:

- Selected lane: `parts_service`
- Selected story: `Parts & Service / Field Service`
- Proof anchor: `Work Order / Parts Availability`
- Website evidence: `needs_confirmation`, resolver-limited / low
- Advisory inference: supported / high
- Imported records: 5
- Verified Open links: 5

Returned records:

- Customer: `R.E. Michel Company Customer Account`
- Sales Order: `SO2708`
- Product SKU: `R.E. Michel Company Channel Availability SKU`
- Branch Availability / Replenishment Flow: `R E Branch Availability / Replenishment Flow`
- Fulfillment Support SKU: `R E Safe Substitute Fulfillment Support SKU`

Assessment:

- Open-link authority is good.
- This did not validate the intended HVAC lane. It effectively became a Parts/Service smoke because the notes emphasized parts, warranty, and branch uncertainty.
- There is a visible story/record mismatch: the selected story talks about work orders, installed equipment, truck/warehouse parts, warranty, and technician dispatch, but the returned record labels are still product SKU and branch availability/replenishment.
- R.E. Michel can count as a useful Parts/Service-adjacent smoke signal, but it should not be counted as the clean HVAC smoke.

## UX Findings

### ROI / Competitive

Current issue:

- The surface still feels like stacked coaching boxes.
- The first card is too long and truncates the best sentence.
- The flow answers are present, but not ordered like a consultant's live thought process.
- Largest value to prove is phrased as internal demo risk instead of buyer value.
- Competitive pressure is advisory-safe, but it does not clearly tell the consultant where to steer or where to object-handle.

Required cleanup:

- Replace the box stack with a clearer consultant flow:
  - Say first.
  - Ask next.
  - Show proof.
  - Largest value to prove.
  - Objection to handle.
  - Competitive watch-out.
  - Claim caution.
- Keep each top item to one strong sentence plus optional short support copy.
- Move long talk track, competitive prep, website read, source confidence, proof stack, and claim guardrails lower and collapsed.
- Rewrite largest-value language away from "demo risk" and toward buyer outcomes:
  - RideNow: protect unit promise confidence, deposit/reservation trust, and location availability before the salesperson commits.
  - R.E. Michel: protect contractor promise confidence by proving branch stock, backorder, replacement, and pickup/delivery readiness before the counter commitment.
- Keep measured-savings claims blocked unless a customer baseline exists.

### Run

Current issue:

- The numbered NetSuite path and Open pills are working.
- Say / Show / Close under the selected control is useful.
- Selected Script and Live Script First repeat the same content, creating scroll and making the presenter wonder which script is primary.

Required cleanup:

- Keep Say / Show / Close as the primary presenter script under the selected live control.
- Replace Selected Script with a compact "Presenter objective" or selected-control summary.
- Collapse Live Script First by default or remove duplicated lines when the selected Say / Show / Close cards are visible.
- Keep imported proof records collapsed by default.
- Keep verified Open links only where link authority is `verified_openable`.

### Build

Current issue:

- Live Proof CTA uses three columns: Proof Action, Safe Claim, Stop.
- The text is too long for narrow drawer width, creating scroll and cramped copy.

Required cleanup:

- Convert Live Proof CTA to three horizontal rows:
  - Proof action: open the returned records and prove only the imported path.
  - Safe claim: records are ready to inspect; ROI still needs customer baseline.
  - Stop: no ROI/write/availability claim beyond evidence.
- Keep each row compact with a small label and one sentence.
- Preserve Evidence confidence, Receipt, Next, Say this live, Guided demo sequence, N/LLM advisory, and evidence receipt, but collapse lower support details by default.

## Lane / Source Story Findings

RideNow:

- Expected W411 lane: Dealer Hardgoods.
- Actual selected lane: Industrial Distribution.
- Root cause appears to be resolver-limited website evidence with advisory inference over-weighting generic availability, order, product, parts, and status terms.
- Action: do not count RideNow as a clean Dealer Hardgoods lane pass until Dealer Hardgoods selection holds or the lane is manually confirmed before build.

R.E. Michel:

- Expected W411 lane: HVAC/Mechanical.
- Actual selected lane: Parts/Service.
- Root cause appears to be notes that combine HVAC supply with service/parts/warranty language, plus resolver-limited website evidence.
- Action: count this as a useful Parts/Service-adjacent integration signal, not a clean HVAC proof. Replace or rerun the HVAC slot with a cleaner HVAC supply candidate if the series must validate HVAC specifically.

## Remaining Smoke Recommendation

Do not run General Parts next unless a second Parts/Service smoke is desired. R.E. Michel already behaved like the Parts/Service slot.

Recommended remaining three:

1. Replacement HVAC/Mechanical candidate, with notes that emphasize counter/branch HVAC supply, contractor account, quote/order, branch stock, equipment/replacement part availability, backorder, will-call/pickup, and jobsite delivery, but do not emphasize technician dispatch or first-time fix.
2. Meridian Bioscience for Life Sciences / Regulated Supply & Release.
3. Yost Foods for Food/Beverage / Batch and Promotion Readiness.

Recommended order:

1. Patch W413 UX cleanup first if the remaining smokes are meant to evaluate consultant usability.
2. Run replacement HVAC/Mechanical smoke with Manufacturing off / WIP off.
3. Run Meridian Bioscience with Manufacturing off / WIP off.
4. Run Yost Foods with Manufacturing only if explicitly needed and WIP off unless separately approved.

If speed matters more than UX read quality, the remaining three can still be run before the UI patch, but mark ROI/Competitive, Run duplication, and Build CTA layout as known issues in every review.

## Pass / Fail

| Gate | Result | Evidence |
| --- | --- | --- |
| RideNow trace parsed | Pass | W412 harness parsed selected lane, website confidence, advisory state, Run script, and five records. |
| R.E. Michel trace parsed | Pass | W412 harness parsed selected lane, website confidence, advisory state, Run script, and five records. |
| Verified Open links preserved | Pass | Both traces include five `verified_openable` NetSuite links. |
| No fake Open links | Pass | All reviewed links are returned NetSuite record URLs with verified link authority. |
| Website confidence separation | Pass | Both traces show resolver-limited / low public website evidence and advisory-supported / high N/LLM inference. |
| RideNow lane specificity | Fail | Intended Dealer Hardgoods slot selected Industrial Distribution. |
| R.E. Michel HVAC specificity | Fail | Intended HVAC slot selected Parts/Service. |
| ROI/Competitive flow readability | Fail | Current layout is too boxy, verbose, and generic for live consultant use. |
| Run duplication | Fail | Say / Show / Close content is repeated in Selected Script and Live Script First. |
| Build Live Proof CTA density | Fail | Three-column CTA is cramped and increases scroll. |
| Completed-result import validation preservation | Pass | W412 made no completed-result import validation changes. |
| No additional live smoke | Pass | W412 was trace-review only. |
| No upload/deployment | Pass | No upload or deployment was performed. |
| W411 baseline preservation | Pass | W411 report and harness remain present. |

## Validation Commands

```bash
node --check archive/tools/run_w412_first_two_smoke_review_ux_cleanup_plan_harness.js
npm run harness:first-two-smoke-review-ux-cleanup-plan-w412
npm run harness:larger-smoke-candidate-packet-w411
npm run harness:larger-smoke-series-design-gate-w410
npm run harness:comfortable-lane-hardening-matrix-w409
```

## Verification Results

```text
node --check archive/tools/run_w412_first_two_smoke_review_ux_cleanup_plan_harness.js: passed
W412 first two smoke review UX cleanup plan harness: 16/16 passed
W411 larger smoke candidate packet harness: 17/17 passed
W410 larger smoke-series design gate harness: 17/17 passed
W409 comfortable lane hardening matrix harness: 17/17 passed
```

## Recommendation

Patch the targeted consultant UX issues before the remaining three smokes if those smokes are meant to judge demo readiness:

1. ROI/Competitive flow redesign.
2. Run duplication cleanup.
3. Build Live Proof CTA horizontal-row layout.

Then run a replacement HVAC/Mechanical candidate, Meridian Bioscience, and Yost Foods. Treat RideNow and R.E. Michel as successful integration/Open-link smokes with lane specificity issues that need story/source review.
