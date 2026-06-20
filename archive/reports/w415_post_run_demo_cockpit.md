# W415 Post-run Demo Cockpit and Executable Consultant Flow Hardening

## Summary

W415 turns the successful post-run state into one consultant-first Demo Cockpit. The goal is simple: after the consultant enters customer, website, notes, and toggles, then runs FORGE, the returned NetSuite proof should be usable without assembling the story across Build, ROI / Competitive, Run, and Trace.

The W415 cockpit now appears at the top of Run once completed imported records exist. It puts the usable pieces first:

- customer and selected story
- build-ready status and verified Open-link count
- ordered returned records with real Open links
- one embedded story/proof block
- one top ROI point with baseline caution
- one competitive battlecard
- one claim caution and source-confidence reminder

No live smoke was run in W415. No upload or deployment was performed. No runtime package was created.

## UX Review Used

Subagent review completed before implementation. The read-only review recommended one primary post-run surface with:

- customer/lane and build status above the fold
- ordered Open links for returned records
- one story/proof block
- one ROI point
- one competitive objection/handle
- collapsed full script, trace/operator evidence, website confidence detail, proof stack, and admin/debug detail

W415 implements that recommendation by composing existing trusted drawer models instead of changing record creation or lane/source-pack logic.

## Implementation

Changed:

- Added `renderW415DemoCockpit(...)` in `idb-drawer.user.js`.
- Rendered the Demo Cockpit above the supporting Run path after completed imported records are available.
- Renamed the former first Run card to `Supporting NetSuite path` so the cockpit is primary and the existing path/live-control detail remains available.
- Added compact W415 cockpit CSS.
- Exported `renderW415DemoCockpit` through test hooks.
- Mirrored the drawer into `src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js`.
- Added `archive/tools/run_w415_post_run_demo_cockpit_harness.js`.
- Registered `harness:post-run-demo-cockpit-w415`.

Not changed:

- No runner, adapter, source-pack, record creation, completed-result import validation, or Open-link authority behavior changed.
- No NetSuite transaction write path changed.
- No fake Open links were created.
- N/LLM remains advisory-only.
- W386/W397/W403/W408 package/archive artifacts were not mutated.

## Trace Inputs

- RideNow Powersports: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515279117.json`
- R.E. Michel Company: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780515597715.json`

These are post-run UX validation inputs only. W415 does not rerun smoke.

## Pass / Fail Table

| Gate | Result | Notes |
| --- | --- | --- |
| Demo Cockpit renderer present | Pass | `renderW415DemoCockpit(...)` is exported for harness validation. |
| FileCabinet mirror synced | Pass | Root and FileCabinet drawer copies match. |
| Cockpit first in Run | Pass | Cockpit renders before supporting NetSuite path. |
| Above-fold cockpit essentials | Pass | Story, records, top ROI, competitive battlecard, and caution are visible. |
| Ordered Open records visible | Pass | RideNow and R.E. Michel both preserve verified Open links. |
| ROI buyer value, not demo risk | Pass | Cockpit avoids `demo risk` language. |
| Competitive battlecard practical/advisory | Pass | Battlecard includes objection/watch-out without unsupported competitor claims. |
| Run support collapsed | Pass | Imported records, full script, and audit remain collapsed. |
| Open-link authority preserved | Pass | Open links remain verified NetSuite URLs only. |
| Confidence/source separation | Pass | Public evidence/advisory/source caution remain separated. |
| W414 naming hardening preserved | Pass | Returned labels and lane-id priority hardening remain intact. |
| W413 UX baseline preserved | Pass | Presenter Flow and Build CTA cleanup remain intact. |
| No runner/source-pack/adapter mutation | Pass | W415 is drawer presentation only. |
| No live smoke/no upload | Pass | No smoke, upload, deployment, or runtime package in W415. |
| No-regression gates | Pass | W415, W414, and W413 harnesses pass. |

## Verification Results

Commands:

```bash
node --check idb-drawer.user.js
node --check "src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js"
node --check archive/tools/run_w415_post_run_demo_cockpit_harness.js
npm run harness:post-run-demo-cockpit-w415
npm run harness:naming-and-executable-cockpit-review-w414
npm run harness:consultant-ux-design-gate-w413
```

Results:

- W415 post-run demo cockpit harness: 16/16 passed.
- W414 naming and executable cockpit review harness: 11/11 passed.
- W413 consultant UX design gate harness: 19/19 passed.

## Recommendation

Lock W415 as the post-run Demo Cockpit baseline. The next practical work should stay executable and narrow:

1. Review the cockpit visually in the drawer with RideNow and R.E. Michel style completed results.
2. Patch any remaining density/copy issue if the cockpit still feels too busy.
3. Then continue the controlled smoke series only after the consultant flow is visibly simple enough to demo.
