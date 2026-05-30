# W362: Consultant-Safe Competitive Intelligence Layer

W362 uses W358 Graybar, W359 Fastenal, W360 MSC, and the W361 Run/Value cockpit as locked baselines. No new live smoke is required because the change is scoped to consultant-facing advisory rendering and does not touch runner, adapter, record creation, completed-result import validation, or Open-link authority.

## What changed

- Drawer marker advances to `Drawer 1.0.10 / W362`.
- Added `competitiveAdvisoryModelW362`, an advisory-only competitive layer using lane, prospect, URL/domain, request language, public-read status, and existing value story context.
- Value now includes a compact Competitive cockpit directly below the Live Value Answer chips.
- Run now includes a compact Competitive cue below Say / Show / Close chips and before the selected script.
- Competitive copy separates likely alternatives from claim authority: standard market/workflow pressure can guide the story, but competitor-specific claims require buyer confirmation.

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Advisory competitive model exists | Pass | W362 emits `idb.w362-consultant-safe-competitive-intelligence.v1`. |
| Standard alternatives visible | Pass | Graybar, Fastenal, and MSC surfaces show standard alternatives or workflow pressure without asserting buyer usage. |
| Claim safety preserved | Pass | Every competitive surface includes advisory-only and confirmation guardrails. |
| Run placement respects W361 cockpit | Pass | NetSuite path remains first; Live controls and Say / Show / Close remain before Competitive cue. |
| Value placement respects W361 cockpit | Pass | Live Value Answer remains first; Competitive cockpit follows as a concise advisory layer. |
| Confidence separation preserved | Pass | Public evidence, advisory inference, build/import proof, and Open links remain separate. |
| No-regression boundaries | Pass | No drawer writes, transaction writes, fake Open links, runner changes, adapter changes, or validation weakening. |

## Baseline Review

- Graybar remains resolver-limited plus advisory-supported; competitive guidance is advisory only.
- Fastenal remains public-read recommended/high; competitive guidance uses public evidence plus advisory context, without turning into proof of competitor usage.
- MSC remains needs-confirmation public read plus advisory-supported; competitive guidance does not upgrade website confidence or build/import proof.
- Completed-result import and Open-link gates remain W151/W214/W245 guarded.

## Recommendation

Proceed to W363 trace cleanup next. The consultant day-of-demo cockpit now has value, run, and competitive guidance in a usable order; the Trace screen is the remaining area that still feels like old checkpoint noise.

## Next Prompt Block

Move through W363: Trace cleanup and operator evidence screen simplification.

Use W358 Graybar, W359 Fastenal, W360 MSC, W361 Run/Value cockpit, and W362 competitive advisory as locked baselines. Redesign the Trace screen so it is useful for operators without surfacing old checkpoint noise.

Goals:
- Keep version/current block, record-import status, public-read/advisory state, Open-link verification, and export controls visible.
- Collapse or remove stale checkpoint labels and old internal markers from the normal Trace view.
- Preserve full trace export detail for support/audit.
- Do not change runner, adapter, record creation, import validation, Open-link authority, or drawer write boundaries.

Deliverables:
- Scoped Trace UX cleanup.
- W363 report and harness using locked traces.
- Pass/fail table for visible trace clarity, export preservation, confidence separation, and no-regression gates.
- Recommendation: one targeted live smoke or broader lane expansion.
