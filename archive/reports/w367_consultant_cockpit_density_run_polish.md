# W367: Consultant Cockpit Density And Run Polish

W367 uses W366 Summit Outdoor Supply as the live dealer/channel baseline, with W358 Graybar, W359 Fastenal, W360 MSC, W361 cockpit, W362 competitive lens, W363 Trace cleanup, and W365 dealer fixture polish as locked regression baselines. No new live smoke was run because the change is scoped to consultant-facing rendering and does not touch runner, adapter, record creation, completed-result import validation, or Open-link authority.

## What Changed

- Drawer marker advances to `Drawer 1.0.13 / W367`.
- Live Value Answer is now a short cockpit of decision cards: Next move, NetSuite answer, ROI answer, Caution, and Competitive pressure.
- Longer talk track, discovery, proof moves, dealer/channel lens, competitive prep, and audit/support details are collapsed by default.
- Run starts with a more scannable NetSuite path and a short instruction to open imported records in order.
- Say / Show / Close now renders as active presenter steps under the selected live control.
- Imported proof records remain collapsed by default while preserving real Open record links.
- Proof guardrails, website read, competitive cue, and audit/support details remain lower or collapsed so the live cockpit stays usable.

## Harness Baselines

| Baseline | Role | Result |
| --- | --- | --- |
| Summit Outdoor Supply W366 | Live Dealer Hardgoods baseline | Pass |
| Graybar W358 | Resolver-limited/advisory baseline | Pass |
| Fastenal W359 | Public-read recommended baseline | Pass |
| MSC W360 | Needs-confirmation baseline | Pass |

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Value density | Pass | Top Value surface contains five decision cards and pushes longer talk track/detail into closed sections. |
| Run professionalism | Pass | Run leads with a clearer NetSuite path, explicit imported-record order, live controls, presenter steps, and selected script. |
| Claim safety | Pass | Caution and competitive pressure stay advisory/confirmation-oriented; no buyer-specific competitive claims are promoted as proof. |
| Open-link preservation | Pass | Imported proof records stay collapsed by default, and real verified Open record links remain available inside the details. |
| Confidence separation | Pass | Public website read, advisory inference, build/import proof, and Open-link authority remain separate surfaces. |
| No-regression gates | Pass | No drawer transaction writes, fake Open links, runner changes, adapter changes, record creation changes, or completed-result import validation changes. |

## Recommendation

Lock Dealer Hardgoods for one broader live smoke. W366 proved the live dealer/channel proof spine, and W367 removes the main day-of-demo usability blocker without changing integration behavior. The next smoke should stay focused on cockpit readability, real Open-link authority, public/advisory separation, and dealer/channel claim safety.

## Boundary Confirmation

- No new drawer transaction write paths.
- No fake Open links.
- Runner, adapter, and record creation behavior unchanged.
- Completed-result import validation unchanged.
- N/LLM remains advisory only.
