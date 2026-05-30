# W354: Graybar Resolver-Limited Clarity Rerun Review

## Baseline

W354 reviews the Graybar rerun after W353 was installed.

- Evidence trace: `archive/trace_samples/w354_graybar_resolver_limited_clarity_rerun_trace.json`
- Exported at: `2026-05-30T14:06:02.232Z`
- Events: `21`
- Prospect: Graybar Electric
- Website: `https://www.graybar.com/`
- Live drawer marker: `Drawer 1.0.6 / W353`

## Decision

W354 passes the resolver-limited clarity gate.

The drawer now clearly separates:

- Build/import confidence: verified.
- Open-link authority: verified.
- Website evidence: resolver-limited because FORGE could not fetch enough website/category evidence in local fallback mode.

This is the right consultant-safe state. It avoids implying Graybar's public website is weak while keeping ROI and website-category claims confirmation-first.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Live install marker | Pass | Trace and screenshots show `Drawer 1.0.6 / W353`. |
| Build/import completion | Pass | `completed_result_imported`; W151 accepted; import ready. |
| Final naming import | Pass | `dcc_final_names_imported`; final names imported. |
| Open-link authority | Pass | Five records have numeric ids, NetSuite URLs, `safeToOpen`, and `verified_openable`. |
| W341 runner naming | Pass | Prospect-specific proof naming active for Graybar. |
| W342 trace marker | Pass | Runner naming verification marker active. |
| Resolver-limited clarity | Pass | Trace reports `displayText: Resolver limited`, `resolverLimited: true`, `local_fallback_only / thin`. |
| Build/import confidence separation | Pass | Plan shows build/import verified while website read remains resolver-limited. |
| W350 note-prefix cleanup | Pass | Consultant-facing copy does not leak note prefixes. |
| No-write boundaries | Pass | No IDB writes, SuiteScript invocation, transaction writes, or fake Open links. |

## Returned Records

- Customer: Graybar Electric Customer Account, internal id `3422`
- Sales Order: SO2702, internal id `84029`
- Product SKU: Graybar Electric Machine Unit - RIBUTION-SF571Y-SVY, internal id `5445`
- Availability/Replenishment Flow: Graybar Branch Availability / Replenishment Flow - RIBUTION-SF571Y-SVY, internal id `5446`
- Supporting SKU: Graybar Safe Substitute Fulfillment Support SKU - RIBUTION-SF571Y-SVY, internal id `5447`

## Regression Review

Preserved:

- W345 Parkway W344 successful live smoke baseline
- W349 Border States controlled live smoke
- W350 consultant note-prefix cleanup
- W351 TriState broader smoke
- W352 Graybar paired evidence finding
- W353 resolver-limited website evidence clarity gate

No runner, adapter, record creation, completed-result validation, Open-link validation, or drawer write authority changed in W354.

## Recommendation

Proceed with the broader smoke matrix using W353 resolver-limited wording as accepted behavior.

The smallest next improvement is not a build/import patch. It is a resolver-readiness block: either configure hosted/remote resolver evidence or add an explicit operator-provided website evidence path so strong public websites can be graded as strong instead of resolver-limited.

## Next Recommended Prompt

```text
Move through W355: Resolver readiness path for strong public websites.

Use W354 Graybar as the baseline. Build the smallest safe path that lets FORGE distinguish a strong public website from local-fallback-only resolver limitation before smoke grading. Preserve W353 resolver-limited clarity, W350 note-prefix cleanup, and all W151/W214/W245 completed-result and Open-link validation boundaries.

Goals:
- Add an operator-safe way to provide or verify stronger website/category evidence when the resolver is local_fallback_only / thin.
- Keep resolver-limited labeling when no stronger evidence is available.
- Do not let website confidence override build/import validation.
- Keep N/LLM advisory only.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.

Deliverables:
- Scoped resolver-readiness or explicit website-evidence plan/change.
- W355 report and harness.
- Graybar proof that strong website evidence can move beyond resolver-limited only when stronger evidence is actually supplied.
- Recommendation on resuming the broader smoke matrix.
```
