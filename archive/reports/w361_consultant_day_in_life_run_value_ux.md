# W361: Consultant Day-In-The-Life Run And Value UX Redesign

W361 uses the locked W358 Graybar, W359 Fastenal, and W360 MSC traces as the baseline. No new live smoke is required because the change is scoped to consultant-facing rendering and does not touch runner, adapter, record creation, completed-result import validation, or Open-link authority.

## What changed

- Drawer marker advances to `Drawer 1.0.9 / W361`.
- Value now starts with a Live Value Answer cockpit: Next move, NetSuite answer, ROI answer, and Caution chips appear before the longer coaching surface.
- Run now starts with a compact NetSuite path flow before the live controls.
- Run keeps the four live controls and adds Say / Show / Close chips directly under them.
- Imported proof records are collapsed by default, while real Open links remain available in the details.
- Live Proof CTA is moved into a collapsed Proof guardrails and evidence receipt section so it remains audit/support evidence instead of the first live-demo object.

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Run starts with NetSuite path flow | Pass | Customer, Sales Order, Product SKU, and Availability/Replenishment Flow render before Live controls. |
| Live controls remain usable | Pass | Open, Prove, Handle objection, and Close value remain visible. |
| Say / Show / Close is faster to scan | Pass | Chips sit under the selected control and mirror the selected script. |
| Imported records are less noisy | Pass | Record list is collapsed by default; verified Open links remain inside the details. |
| Proof CTA is no longer dominant | Pass | Proof guardrails and receipt are collapsed as support detail. |
| Value answer is easier to use live | Pass | Next move, NetSuite answer, ROI answer, and Caution are promoted above the talk track. |
| Confidence separation preserved | Pass | Public evidence, advisory inference, build/import proof, and Open links remain separate. |
| No-regression boundaries | Pass | No new drawer writes, transaction writes, fake links, runner changes, adapter changes, or validation weakening. |

## Baseline Regression Review

- Graybar still represents the resolver-limited plus advisory-supported branch.
- Fastenal still represents public-read recommended/high without optional website evidence.
- MSC still represents needs-confirmation public read plus advisory-supported/high.
- Completed-result imports still require the W151/W214/W245 guard chain and verified supported NetSuite URLs.
- N/LLM remains advisory only.

## Product Plan

1. W361 closes the immediate consultant cockpit need: the Run surface now leads with what to open, how to move, and what to say.
2. W362 should add the competitive intelligence layer. Goal: use N/LLM advisory signals and lane/prospect context to surface likely competitors, pressure points, and NetSuite contrast without making unsupported buyer claims.
3. W363 should clean the Trace screen. Goal: keep version, evidence export, imported-record status, and sync confidence; collapse or remove old checkpoint noise.
4. W364 should start lane expansion packaging. Goal: turn the now-stable distribution lane pattern into a repeatable lane authoring template for adjacent industries.

## Recommendation

Proceed to W362 competitive intelligence layer before more live smoke. This is the next highest trust gain because the existing smoke matrix already proves the core build/import/Open-link path, while the day-of-demo story still needs stronger competitive context.

## Next Prompt Block

Move through W362: N/LLM-assisted competitive intelligence layer.

Use W358 Graybar, W359 Fastenal, W360 MSC, and W361 Run/Value cockpit as locked baselines. Add consultant-safe competitive intelligence that helps the operator tell a sharper industry story without inventing buyer-specific claims.

Goals:
- Surface likely competitor or alternative-workflow pressure for the prospect type and lane.
- Keep competitive insight advisory-only unless evidence is explicit.
- Weave competitive pressure into Value and Run without overwhelming the cockpit.
- Preserve public evidence, advisory inference, build/import proof, and Open-link separation.
- Preserve W350 note-prefix cleanup and W357 advisory-only boundaries.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Scoped competitive intelligence model/UX change.
- W362 report and harness using Graybar, Fastenal, and MSC locked traces.
- Pass/fail table for competitive relevance, claim safety, Run/Value placement, confidence separation, and no-regression gates.
- Recommendation: targeted live smoke, trace cleanup, or lane expansion package.
