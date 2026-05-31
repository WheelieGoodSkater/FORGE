# W368: Final Dealer Hardgoods Live Smoke And Expansion Handoff

W368 reviews the RidgeLine Powersports & Equipment broader Dealer Hardgoods live smoke and closes the Run-path polish issue found during visual review. The attached smoke trace was captured on `Drawer 1.0.13 / W367`; the source now advances to `Drawer 1.0.14 / W368` for the scoped Run visual-flow patch. No runner, adapter, record creation, completed-result import validation, or Open-link authority behavior changed.

## Smoke Candidate

- Name: RidgeLine Powersports & Equipment
- Website: `https://www.ridgelinepowersports.com`
- Sales rep notes: "Talked to ops guy maybe Jason or Justin. They sell ATVs, mowers, trailers, parts, service stuff, maybe some outdoor power equipment. Main issue is stores don't know what inventory is actually available and they keep calling around before promising parts or units. They said suppliers are slow and some stuff is allocated but I didn't get the exact process. Wants to see how NetSuite would help with customer/order/product visibility and maybe replenishment. Competitor maybe QuickBooks, spreadsheets, dealer portal, not sure. Need demo to show availability and how they can stop overpromising."

## Evidence

- Trace: `archive/trace_samples/w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json`
- Prospect: RidgeLine Powersports & Equipment
- Lane: Dealer Hardgoods & Channel Fulfillment
- Build result: completed result imported
- Records: 5 display-ready records with verified Open-link authority
- Public read: needs confirmation / medium
- Advisory: supported / high

## What Changed

- Run NetSuite path no longer uses ASCII arrow characters or tiny `>` markers.
- Run path is now a vertical visual flow with numbered nodes and a connector rail, which fits the drawer better than a cramped card row.
- Dealer/channel proof path no longer renders `->` text; it uses compact proof-step chips.
- Value cockpit, live controls, Say / Show / Close presenter steps, selected script, collapsed imported proof records, and proof guardrails are preserved.

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Value density | Pass | Top Value surface remains a five-card cockpit: Next move, NetSuite answer, ROI answer, Caution, and Competitive pressure. |
| Run professionalism | Pass after W368 patch | W367 smoke exposed the cramped arrow-like path. W368 replaces it with a visual numbered flow and proof-step chips. |
| Dealer/channel story quality | Pass | RidgeLine story stays grounded in dealer availability, allocation, replenishment timing, supplier lead-time risk, and channel fulfillment. |
| Claim safety | Pass | Website read remains needs-confirmation; ROI and availability claims require customer baseline/evidence confirmation. |
| Open-link preservation | Pass | Five real imported NetSuite Open links are preserved; no fake Open links introduced. |
| Confidence separation | Pass | Public website evidence, advisory inference, build/import proof, and Open-link authority stay separated. |
| No-regression gates | Pass | No drawer transaction writes, runner changes, adapter changes, record creation changes, source pack mutation, or completed-result validation weakening. |

## Smoke-Minimizing Expansion Handoff

Fixture-first is enough when the change is limited to copy, lane vocabulary, Value/Run/Trace layout, collapsed support details, advisory wording, or report/harness packaging.

Live smoke is required only when a change touches integration risk: runner/adapter transport, result polling/import, completed-result validation, supported Open-link authority, record creation/write paths, deployment sync, or a new lane whose record spine cannot be proven from existing imported fixtures.

For industry expansion, use this order:

1. Author or polish the lane from website/category evidence and messy sales notes.
2. Validate with archived traces and synthetic fixtures first.
3. Add a lane-specific harness with Open-link preservation, confidence separation, claim safety, and no-write gates.
4. Run live smoke only if the fixture/harness cannot answer whether real imported NetSuite records support the story.

## Recommendation

No additional live smoke is recommended right now. Lock Dealer Hardgoods after installing the W368 Run visual-flow patch. Move into industry expansion with fixture-first validation and live smoke only for true integration-risk changes.

## Boundary Confirmation

- No new drawer transaction write paths.
- No fake Open links.
- Runner, adapter, and record creation behavior unchanged.
- Completed-result import validation unchanged.
- N/LLM remains advisory only.
- No lane/source pack mutation.
