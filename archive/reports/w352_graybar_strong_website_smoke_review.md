# W352: Graybar Strong-Website Smoke Review

## Baseline

W352 reviews the Graybar Electric smoke uploaded after W351:

- Trace: `archive/trace_samples/w352_graybar_strong_website_smoke_version_drift_trace.json`
- Prospect: Graybar Electric
- Website: `https://www.graybar.com/`
- Exported at: `2026-05-30T12:40:08.849Z`
- Events: 23

## Decision

Do not treat this as a clean W352 pass.

The NetSuite build/import path passed, but the smoke was run on a stale drawer install:

- Live trace marker: `Drawer 1.0.4 / W346`
- Required baseline after W350/W351: `Drawer 1.0.5 / W350`

That explains the visible `Buyer: Buyer`, `Pain: Pain`, `Proof: Proof`, and `Value: Value` copy leakage in the screenshots. Current repo source renders the same Graybar trace without those consultant-facing prefix leaks, so this is a deployment/version drift problem, not a W350 code regression.

There is a second important finding: Graybar is a strong real website, but the trace still classifies website evidence as low because the drawer was in local fallback mode:

- Resolver mode: `local_fallback_only`
- Resolver status: `fallback_ready`
- Failure state: `thin`
- Token configured: `false`

So the current website evidence grade is honest for what the drawer could actually see, but it is not a true measure of the public website's quality. The plan needs a resolver/configuration block before website-confidence smoke tests can prove stronger evidence.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Build/import completion | Pass | `completed_result_imported`, W151 accepted, import ready. |
| Final naming import | Pass | `dcc_final_names_imported`, final names imported. |
| Open-link authority | Pass | Five records have numeric ids, NetSuite URLs, `safeToOpen`, and `verified_openable`. |
| W341 runner naming | Pass | W341 prospect-specific proof naming active for Graybar. |
| W342 trace marker | Pass | W342 runner naming verification active. |
| W350 installed baseline | Fail | Trace and screenshots show `Drawer 1.0.4 / W346`, not `Drawer 1.0.5 / W350`. |
| W350 visible copy cleanup | Blocked in live smoke | Live stale drawer leaks note prefixes; current repo source renders clean. |
| Strong website evidence | Blocked | Resolver stayed in local fallback mode with thin evidence. |
| No-write boundaries | Pass | No IDB writes and no drawer transaction writes remain true. |

## Returned Records

- Customer: Graybar Electric Customer Account, internal id `3422`
- Sales Order: SO2702, internal id `84029`
- Product SKU: Graybar Electric Machine Unit - RIBUTION-SB6QVY-G2E, internal id `5345`
- Availability/Replenishment Flow: Graybar Branch Availability / Replenishment Flow - RIBUTION-SB6QVY-G2E, internal id `5346`
- Supporting SKU: Graybar Safe Substitute Fulfillment Support SKU - RIBUTION-SB6QVY-G2E, internal id `5347`

## Root Cause

Two separate issues were exposed:

1. Deployment drift: Tampermonkey was not running the current drawer even though the repo source was current.
2. Resolver limitation: the drawer could not collect strong website evidence because it only had local fallback evidence available.

## Updated Plan

1. W353: Add a pre-smoke live install gate.
   - The drawer should make stale installs impossible to miss before an operator runs a smoke.
   - Trace/Plan should clearly block broader smoke evidence if the visible drawer marker does not match the expected baseline.
   - The guard should preserve all no-write and no-fake-link boundaries.

2. W354: Add a website resolver readiness gate.
   - Separate "website is weak" from "resolver could not fetch enough evidence."
   - If the public website is expected to be strong but resolver mode is `local_fallback_only`, the drawer should show a resolver/configuration limitation rather than implying the website itself is weak.
   - Keep N/LLM advisory only.

3. W355: Re-run Graybar with both gates satisfied.
   - Required installed marker: `Drawer 1.0.5 / W350` or newer.
   - Required resolver state: hosted/remote evidence available, or explicit operator-provided website evidence.
   - Grade whether Graybar can move from low evidence to confirmed or higher-confidence website evidence.

4. W356: Continue broader smoke matrix.
   - Resume adjacent distribution/electrical smokes only after the live install and resolver readiness gates are proven.

## Immediate Operator Steps

Before the next smoke:

1. In Tampermonkey, force update or reinstall the drawer from the GitHub raw URL.
2. Refresh NetSuite.
3. Confirm the header shows `Drawer 1.0.5 / W350` or newer.
4. Open Trace and confirm the exported trace marker also reports the same visible drawer version.
5. Do not grade website confidence as a product failure while resolver mode is `local_fallback_only`.

## Next Recommended Prompt

```text
Move through W353: Pre-smoke live install and resolver readiness gate.

Use W352 Graybar as the failing evidence. Add a pre-smoke guard so broader smoke tests cannot be mistaken as valid when the live Tampermonkey drawer is stale or the website resolver is only in local fallback mode. Preserve W345 Parkway, W349 Border States, W350 copy cleanup, and W351 TriState baselines.

Goals:
- Make stale drawer installs visually obvious before smoke testing.
- Distinguish "website evidence is weak" from "resolver could not fetch strong evidence."
- Keep build/import confidence separate from website evidence confidence.
- Keep all no-write, no-transaction-write, no-fake-link, and validation boundaries unchanged.

Deliverables:
- Scoped drawer UX/status guard.
- W353 report.
- Harness proving stale-version smoke is blocked, current-version smoke remains allowed, resolver fallback is labeled correctly, and W350 copy cleanup still holds.
- Updated package script registration.
- Operator steps for re-running Graybar after W353.
```
