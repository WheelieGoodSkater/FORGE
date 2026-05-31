# W364: Lane Expansion Readiness And Smoke-Minimizing Growth Plan

W364 uses W363 as the baseline and is intentionally a planning/readiness block. No drawer runtime marker, runner, adapter, record creation behavior, import validation, Open-link authority, or drawer write path changed.

## Current Baseline

- Graybar proves the resolver-limited public-read path can remain consultant-safe while N/LLM advisory support guides the story.
- Fastenal proves a no-paste public-read recommended/high path can support the current Industrial Distribution & Branch Fulfillment lane.
- MSC proves the medium public-read path can ask for confirmation while keeping advisory support, build/import proof, and Open links separate.
- W361 keeps Run as a day-of-demo cockpit.
- W362 keeps competitive intelligence advisory-only and compact.
- W363 keeps Trace as operator evidence instead of stale checkpoint noise.

## Expansion Principle

Expand only where the current returned-record spine can still be honest:

Customer Account -> Sales Order -> Product/SKU -> Availability/Replenishment Flow -> Supporting SKU

That means the next lanes should reuse the existing NetSuite proof record roles, Open-link gates, import validation, and advisory-only N/LLM layer. New live smoke is only useful when the lane needs a different proof object, record role, or runner-created data shape.

## Prioritized Lane Plan

| Rank | Lane or Prospect Type | Why It Is Safe | Minimum Change | Smoke Need |
| --- | --- | --- | --- | --- |
| 1 | Dealer Hardgoods & Channel Fulfillment | Closest adjacent use of Product/SKU availability, allocation, replenishment, and channel fulfillment without manufacturing writes. | Copy/model polish only: dealer/channel language, allocation pressure, supplier lead-time pressure, channel promise guardrails. | No immediate live smoke. Use locked traces plus synthetic lane fixtures first; one targeted smoke after copy passes. |
| 2 | Apparel & Accessories Channel Availability | Existing lane exists and can reuse customer, sales order, product/SKU, and availability/replenishment records if the first pass stays at style/SKU story guidance. | Copy/model polish only at first: style/SKU matrix language, size/color allocation, launch/channel availability. Keep Open links tied to real imported proof records. | Wait until Dealer Hardgoods fixture passes. Then one targeted smoke only if style/SKU wording must appear in returned names. |
| 3 | Products CPG Retail Replenishment | Can reuse sales-order and inventory readiness story, but finished-good/promotion language may tempt manufacturing or unsupported shelf claims. | Review-only lane-pack/copy proposal. Keep manufacturing off unless evidence explicitly requires it. | Wait. Do fixture-only readiness first; live smoke only after dealer/apparel stabilize. |

## What Should Wait

- Food / Beverage CPG Manufacturing, Industrial Equipment Manufacturing, and Life Sciences should wait for separate runner/adapter evidence because their proof anchors imply manufacturing, quality, assembly, lot/release, or WIP behaviors beyond the current distribution proof path.
- Hosted resolver work should wait unless public-read confidence becomes the main blocker again. The current split between public evidence, advisory inference, and build/import proof is good enough for lane-readiness planning.

## Smoke-Minimizing Validation Plan

1. Add fixture-only lane readiness harnesses for Dealer Hardgoods, Apparel & Accessories, and Products CPG using the locked Graybar, Fastenal, and MSC records.
2. Prove each candidate preserves:
   - public website evidence separate from advisory inference,
   - build/import proof separate from website confidence,
   - real Open links only after validated imported records,
   - W361 Run cockpit,
   - W362 competitive lens,
   - W363 operator Trace cleanup.
3. Run one targeted live smoke only after the fixture harness identifies a lane whose copy/model behavior is ready and whose proof object still maps safely to the existing returned records.

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| W361 cockpit preserved | Pass | Run still starts with NetSuite path, then live controls and Say / Show / Close chips. |
| W362 competitive layer preserved | Pass | Competitive lens remains advisory-only and compact. |
| W363 Trace cleanup preserved | Pass | Trace keeps operator evidence visible and old marker noise collapsed. |
| Build/import validation preserved | Pass | Completed-result import and Open-link gates are unchanged. |
| Lane expansion does not invent proof | Pass | Next lanes reuse the current returned-record spine or stay review-only. |
| Smoke minimized | Pass | Next live smoke is deferred until fixture-only lane readiness proves a safe candidate. |

## Recommendation

Proceed next with a fixture-only Dealer Hardgoods & Channel Fulfillment lane polish block. It is the closest expansion from the current distribution proof path and gives the strongest trust gain without new runner, adapter, or transaction behavior.

## Next Prompt Block

```text
Move through W365: Dealer Hardgoods fixture-only lane polish.

Use W364 as the baseline. Do not run live smoke. Add the smallest copy/model polish needed for Dealer Hardgoods & Channel Fulfillment to reuse the current imported proof record spine safely.

Goals:
- Make dealer/channel availability, allocation, replenishment, and supplier lead-time pressure feel distinct from generic branch distribution.
- Keep public evidence, advisory inference, build/import proof, and Open-link authority separate.
- Preserve W361 Run cockpit, W362 competitive lens, and W363 operator Trace cleanup.
- Keep the lane fixture-only until the harness proves the story is ready.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Scoped Dealer Hardgoods copy/model polish.
- W365 report and harness.
- Fixture proof using locked Graybar, Fastenal, and MSC records adapted only at the story layer.
- Recommendation on whether one targeted live dealer/channel smoke is worth running.
```
