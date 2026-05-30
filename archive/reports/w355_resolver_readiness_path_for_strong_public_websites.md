# W355: Resolver Readiness Path For Strong Public Websites

## Baseline

W355 uses W354 Graybar as the live evidence baseline:

- Trace: `archive/trace_samples/w354_graybar_resolver_limited_clarity_rerun_trace.json`
- Live marker in W354: `Drawer 1.0.6 / W353`
- Build/import/Open-link gates: pass
- Website resolver state: `local_fallback_only / thin`
- Website evidence UI: resolver-limited, not website-weak

## Decision

Add the smallest safe resolver-readiness path: operator-supplied public website/category evidence.

When hosted/remote resolver evidence is unavailable and the resolver is still `local_fallback_only`, the operator can paste public website/category text into a visible optional field. That evidence can improve website confidence only when it contains enough category, product, distribution, and demand signals. Conversation notes alone cannot raise website confidence.

## What Changed

- Drawer marker advances to `Drawer 1.0.7 / W355`.
- The setup form exposes `Optional website/category evidence` outside the admin/debug legacy fields.
- Local fallback now evaluates pasted website/category evidence as `operator_supplied_website_evidence`.
- Strong Graybar evidence can move from resolver-limited to recommended website evidence.
- If no stronger website evidence is supplied, W353 resolver-limited labeling remains unchanged.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Current marker | Pass | Source marker is `Drawer 1.0.7 / W355`. |
| Resolver-limited fallback without supplied evidence | Pass | W354 Graybar remains resolver-limited with `local_fallback_only / thin`. |
| Strong supplied website evidence | Pass | Graybar supplied evidence moves to `recommended`, `high`, not resolver-limited. |
| Notes cannot raise website confidence | Pass | Conversation notes remain story-only and do not replace website/category evidence. |
| Build/import confidence separation | Pass | Website confidence does not alter completed-result import or Open-link validation. |
| W350 note-prefix cleanup | Pass | Consultant-facing copy remains prefix-clean. |
| No-write boundaries | Pass | No drawer transaction writes, no SuiteScript invocation, no fake Open links. |

## Operator Steps

1. Push origin so Tampermonkey receives `idb-drawer.user.js` version `1.0.7`.
2. Refresh NetSuite and confirm the header shows `Drawer 1.0.7 / W355`.
3. If the Plan says `Resolver limited`, click `Edit request`.
4. Open `Optional website/category evidence`.
5. Paste public website/category text such as homepage category language, product categories, branch/location availability language, or public catalog language.
6. Rebuild/refresh the plan and confirm whether website confidence moves from resolver-limited to recommended or still needs confirmation.
7. Build/import/Open-link confidence remains separate; do not use website confidence as proof of record creation.

## Graybar Example Evidence

```text
Graybar public website describes electrical distribution products including wire, cable, conduit, lighting, switchgear, automation, safety and industrial supplies. The site supports branch locations, product catalog availability, order fulfillment, pickup and delivery for contractors and commercial accounts.
```

Expected result:

- Website read: recommended/high
- Product family: Electrical Distribution Branch Fulfillment
- Demand moment: branch availability and fulfillment confidence
- Resolver-limited label disappears only because stronger website/category evidence was supplied

## Recommendation

Proceed to one W356 Graybar evidence-input rerun before resuming the broader matrix. After W356 proves the operator evidence workflow live, resume broader smoke testing and use resolver-limited as an accepted honest state whenever no stronger website evidence is supplied.

## Next Recommended Prompt

```text
Move through W356: Live Graybar operator website-evidence rerun.

Use W355 as the baseline. Push/deploy the drawer update, confirm Drawer 1.0.7 / W355, then rerun Graybar twice: first with no supplied website/category evidence to confirm resolver-limited remains honest, then with the W355 Graybar public website evidence pasted into Optional website/category evidence.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- W356 evidence review report.
- Pass/fail table comparing no-supplied-evidence vs supplied-evidence Graybar.
- Confirmation that strong supplied website evidence moves beyond resolver-limited only when supplied.
- Recommendation on resuming the broader smoke matrix.
```
