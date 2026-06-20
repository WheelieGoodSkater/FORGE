# W416 Consultant Day-In-Life Simplification

## Summary

W416 responds to the live usability regression: the drawer had too many visible surfaces, and consultants could click into Build, ROI / Competitive, Run, and Trace before the current request or build state made those surfaces useful.

The new rule is:

1. Enter customer, website, notes, and toggles.
2. Confirm the recommended demo path.
3. Build records and wait for verified returned links.
4. Use the Demo Cockpit.
5. Use support views only when troubleshooting or exporting evidence.

No live smoke was run in W416. No upload or deployment was performed. No runtime package was created.

## What Changed

- Added `consultantDayInLifeStageW416(...)` as the stage model for the primary drawer flow.
- Added `renderW416ConsultantDayInLife(...)` so the main drawer body is one executable surface, not a tab hunt.
- Collapsed legacy workflow tabs into `Support views`.
- Removed live action chips from blocked Run state.
- Kept W415 Demo Cockpit as the primary post-run outcome when imported records and verified Open links exist.
- Added W416 harness coverage for default/no-brief, prepared/unconfirmed, confirmed/no-records, the Herr trace state, and completed returned-record traces.

No runner, adapter, source-pack, record creation, completed-result import validation, or Open-link authority behavior changed.

## What Stayed Out Of Scope

- No runner changes.
- No adapter changes.
- No source-pack changes.
- No record creation behavior changes.
- No completed-result import validation changes.
- No Open-link authority changes.
- No fake Open links.
- N/LLM remains advisory-only.

## Review Input

The W416 review used:

- User screenshots showing default Plan, premature Build, premature ROI, blocked Run, and Trace surfaces.
- Latest Herr trace: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781970431176.json`.
- Prior completed traces used by W415 for post-run cockpit validation.

The Herr trace showed the consultant bouncing across Plan, Build, ROI, Run, and Trace without a clear next action. W416 changes that path so the primary drawer surface says what stage FORGE is in and what to do next.

## Pass / Fail Table

| Gate | Result | Notes |
| --- | --- | --- |
| W416 stage model exported | Pass | `consultantDayInLifeStageW416(...)` and day-in-life renderer are available to harnesses. |
| FileCabinet mirror synced | Pass | Root and FileCabinet drawer copies match. |
| Default state only shows request entry | Pass | No fake CPG demo path, ROI coach, Build Demo Records, or live controls before brief. |
| Premature tabs collapsed into support | Pass | Static five-tab workflow is no longer the primary surface. |
| Prepared/unconfirmed primary action is confirm | Pass | User sees confirm path, not build/run/ROI. |
| Confirmed/no-records primary action is build | Pass | User sees build/readiness, with value/evidence support collapsed. |
| Herr trace routes to build state | Pass | The latest trace routes to build/readiness instead of tab-hopping surfaces. |
| Completed records route to cockpit | Pass | Returned verified records make W415 Demo Cockpit primary. |
| Blocked Run hides live controls | Pass | No Open/Prove/Handle/Close chips when records do not exist. |
| Runtime boundary preserved | Pass | No runner/source-pack/adapter/import/Open-link authority changes. |
| No-regression gates | Pass | W416, W415, and W414 harnesses pass. |

## Verification Results

Commands:

```bash
node --check idb-drawer.user.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js"
node --check archive/tools/run_w416_consultant_day_in_life_simplification_harness.js
npm run harness:consultant-day-in-life-simplification-w416
npm run harness:post-run-demo-cockpit-w415
npm run harness:naming-and-executable-cockpit-review-w414
```

Results:

- W416 consultant day-in-life simplification harness: 12/12 passed.
- W415 post-run demo cockpit harness: 16/16 passed.
- W414 naming and executable cockpit review harness: 11/11 passed.

## Recommendation

Lock W416 as the current consultant-flow baseline. The next pass should be visual QA only: open the drawer in NetSuite, verify the first screen now reads as one path, and only then run another controlled smoke. If another smoke fails, the drawer should show a single recovery path, not expose ROI/Run as if proof exists.
