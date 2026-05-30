# W358: Graybar No-Paste Advisory Confidence Live Smoke

## Baseline

W358 uses W357 as the installed baseline.

- Live trace: `archive/trace_samples/w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json`
- Exported at: `2026-05-30T16:57:24.970Z`
- Visible drawer marker: `Drawer 1.0.8 / W357`
- Prospect: Graybar Electric
- Website: `https://www.graybar.com/`
- Optional website/category evidence: blank

## Critical Review

This smoke passes the W357 product intent.

The public website read remains resolver-limited because the local fallback resolver returned `thin` evidence. That is correct and should not be inflated. The important improvement is that the drawer no longer makes Graybar look like a weak public website. Instead, it separates:

- build/import proof: verified,
- public website read: resolver-limited/low,
- N/LLM advisory inference: supported/high,
- Open links: verified only from imported NetSuite records.

The advisory tier is visible enough to guide the consultant talk track, but the UI still says to confirm public evidence before ROI claims. That preserves the core no-fake-proof boundary.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Installed version | Pass | Live header and trace show `Drawer 1.0.8 / W357`. |
| No-paste condition | Pass | `intake.websiteEvidence` is blank and `operatorSuppliedWebsiteEvidenceW355` is null. |
| Public read honesty | Pass | Website evidence is `local_fallback_only / fallback_ready`, `thin`, and `Resolver limited`. |
| Advisory tier | Pass | N/LLM advisory is `Advisory supported / High` with electrical distribution signals. |
| Build/import proof | Pass | Runner result is `completed_result_imported`; final names are imported. |
| Open-link proof | Pass | Five display-ready records have numeric IDs, verified Open authority, and NetSuite URLs. |
| Confidence separation | Pass | Plan shows build/import, website read, advisory, and Open-link chips separately. |
| Run claim safety | Pass | Run proof CTA says advisory can guide talk track but is not public website proof. |
| No-write boundary | Pass | Trace keeps `noTransactionWritesFromIdb`, `noIdbWrites`, and no fake Open links. |

## Focused Screenshot Review

Only the requested surfaces were reviewed:

- Plan confidence: visually separates `Build/import verified`, `Website read: Resolver limited`, `Advisory: Supported / High`, and `Open links verified`.
- Website Read details: hides technical resolver details behind the evidence-details section and explains advisory support without calling it public proof.
- Build/Open links: shows records ready, imported proof records, and real Open links.
- Run proof CTA: keeps the live action claim-safe and advisory-only.

No broad visual regression sweep is needed from this smoke. The reviewed surfaces match the W357 intent.

## Decision

Proceed with broader smoke matrix using the W357 language as accepted.

Hosted resolver configuration is still valuable later because it can turn strong public sites into fetched public evidence instead of advisory inference, but it is not blocking the next matrix. The current normal path is consultant-safe: resolver-limited is honest, advisory is useful, and imported NetSuite proof remains the only source of Open-link proof.

## Next Recommended Prompt

```text
Move through W359: Resume broader smoke matrix with W357 advisory confidence accepted.

Use W358 Graybar no-paste advisory confidence smoke as the baseline. Run the next broader smoke candidate without optional website/category evidence unless the test is explicitly diagnostic. Before smoke, run the W347 deployment sync guard. Review only the focused surfaces: Plan confidence, Website Read details, Build/Open links, and Run proof CTA.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- W359 smoke evidence review report.
- Pass/fail table for public read, advisory inference, build/import, Open links, and Run claim safety.
- Recommendation: continue matrix, patch one focused issue, or configure hosted resolver.
```
