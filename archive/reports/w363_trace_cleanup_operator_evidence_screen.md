# W363: Trace Cleanup And Operator Evidence Screen

W363 uses W362 as the baseline and keeps the work scoped to consultant/operator UX. No runner, adapter, record creation, import validation, Open-link authority, or drawer write path changed.

## What Changed

- Drawer marker advances to `Drawer 1.0.11 / W363`.
- Trace now opens as an operator evidence screen with the current drawer marker, imported-record status, Open-link verification, public website read, advisory state, and export actions.
- Old checkpoint markers, runner naming markers, adapter profile detail, packet mode, and website resolver detail are collapsed under `Evidence details and markers`.
- Full trace export remains unchanged for support.
- ROI/Competitive is lighter: the W362 competitive cockpit is now a compact `Competitive lens`, the older Competitive Prep block is collapsed, and the duplicate expanded Live Value Answer is collapsed.

## Pass / Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Trace shows current operator evidence | Pass | Drawer marker, record import, Open-link, public read, advisory state, and export controls are visible. |
| Old trace checkpoint noise is reduced | Pass | W341/W342/W332/W339/internal marker detail is collapsed. |
| Full support export remains available | Pass | Export trace and Copy operator summary remain visible; full event count remains visible. |
| ROI/Competitive tab is less crowded | Pass | Competitive lens is compact; detailed competitive prep and expanded value answer are collapsed. |
| W362 competitive layer remains advisory-only | Pass | No competitor-specific claims are promoted without confirmation. |
| No-regression boundaries | Pass | No drawer writes, transaction writes, fake Open links, runner changes, adapter changes, record creation changes, or validation weakening. |

## Baseline Regression Review

- W358 Graybar remains resolver-limited plus advisory-supported.
- W359 Fastenal remains public-read recommended/high.
- W360 MSC remains needs-confirmation public read plus advisory-supported.
- W361 Run/Value cockpit remains intact.
- W362 competitive intelligence remains advisory-only and consultant-safe.

## Recommendation

No live smoke is required for W363 unless the operator wants one quick visual sanity check after Tampermonkey updates. The next best block is a focused lane expansion readiness pass, because the drawer now has a cleaner day-of-demo cockpit and a cleaner operator evidence screen.

## Next Prompt Block

```text
Move through W364: Lane expansion readiness and smoke-minimizing growth plan.

Use W363 as the baseline. Do not run new live smoke unless a new lane behavior needs real NetSuite proof. Identify the next 2-3 industry lanes or prospect types that can reuse the current distribution proof path safely, define the minimum lane-pack copy/model changes, and create a smoke-minimizing validation plan.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior unless a lane expansion requires an explicit later block.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- Lane expansion readiness report.
- Candidate lane/prospect matrix.
- Harness proving existing Graybar, Fastenal, MSC, W361, W362, and W363 baselines do not regress.
- Recommendation: one targeted smoke, broaden lane packs, or configure hosted resolver.
```
