# W353: Resolver-Limited Website Evidence Clarity Gate

## Baseline

W353 uses the paired W352 Graybar evidence:

- Stale first run: `archive/trace_samples/w352_graybar_strong_website_smoke_version_drift_trace.json`
- Corrected rerun: `archive/trace_samples/w352_graybar_current_drawer_resolver_fallback_rerun_trace.json`
- Corrected live marker: `Drawer 1.0.5 / W350`
- Resolver state in both traces: `local_fallback_only / thin`

The stale install issue is resolved. W353 focuses only on website evidence clarity: Graybar has a strong real public website, but the drawer could only see thin local fallback evidence. The consultant-facing UI should describe that as resolver-limited, not as proof that the website itself is weak.

## Decision

Proceed with a scoped drawer UX/status copy change.

The current installed drawer marker now advances to `Drawer 1.0.6 / W353`. When website evidence is `local_fallback_only / thin`, the drawer now says:

- `Website read: Resolver limited`
- `Website read: Resolver limited / Low`
- `FORGE could not fetch enough website/category evidence in local fallback mode. Treat this as resolver-limited, not as proof that the public website is weak.`

Build/import status remains separate and still shows verified imported records when the completed-result import is valid.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Current drawer marker | Pass | Source marker is `Drawer 1.0.6 / W353`. |
| Graybar resolver-limited clarity | Pass | Corrected W352 rerun renders resolver-limited website evidence instead of website-weak language. |
| Build/import confidence separation | Pass | Graybar still shows build/import verified while website read is resolver-limited. |
| W350 note-prefix cleanup | Pass | Graybar, Parkway, Border States, and TriState rendered surfaces do not leak `Buyer:`, `Pain:`, `Proof:`, `Value:`, `Competitive:`, `Decision criteria:`, or `Stop:` prefixes. |
| Imported proof record guidance | Pass | Run and Build continue to use imported proof records and real Open-link authority. |
| W151/W214/W245 validation | Pass | Completed-result import, semantic mode, and display-ready Open-link boundaries are unchanged. |
| No-write boundaries | Pass | No drawer write paths, no transaction writes, and no fake Open links were added. |

## No-Regression Boundaries

W353 does not change runner behavior, adapter behavior, record creation behavior, completed-result import validation, Open-link validation, or drawer write authority.

Preserved baselines:

- W345 Parkway W344 successful smoke
- W349 Border States controlled live smoke
- W350 consultant note-prefix cleanup
- W351 TriState broader smoke
- W352 Graybar paired evidence review

## Operator Steps For Graybar Rerun

1. Push origin so Tampermonkey can receive `idb-drawer.user.js` version `1.0.6`.
2. In Tampermonkey, confirm the installed script shows version `1.0.6`.
3. Refresh NetSuite and confirm the drawer header shows `Drawer 1.0.6 / W353`.
4. Run Graybar again with the same strong-website notes.
5. On Plan, confirm build/import is verified and website evidence says `Resolver limited` if resolver mode is still `local_fallback_only / thin`.
6. Export the trace and attach it before grading W354.

## Recommendation

Run one Graybar rerun after deploy. If the resolver remains `local_fallback_only / thin`, accept the resolver-limited label as correct and decide whether W354 should configure hosted/remote resolver evidence or continue broader smoke testing with explicit resolver-limited language.

## Next Recommended Prompt

```text
Move through W354: Re-run Graybar with resolver-limited clarity installed.

Use W353 as the baseline. Push/deploy the drawer update, confirm the live header shows Drawer 1.0.6 / W353, then rerun Graybar. Review the trace and screenshots to verify the UI now says resolver-limited when the resolver is local_fallback_only / thin, while build/import remains verified and Open links remain real.

Boundaries:
- No new drawer write paths.
- No transaction writes from the drawer.
- No fake Open links.
- Do not weaken W151/W214/W245 completed-result validation.
- Do not change runner, adapter, or record creation behavior.
- Keep N/LLM advisory only.

Deliverables:
- W354 evidence review report.
- Pass/fail table for Graybar rerun.
- Regression review against W345, W349, W350, W351, W352, and W353.
- Decision: configure hosted resolver/explicit website evidence next, or continue broader smoke matrix with resolver-limited language accepted.
```
