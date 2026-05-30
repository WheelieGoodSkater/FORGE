# W357: N/LLM-Assisted Website Confidence Without Operator Paste Dependency

## Baseline

W357 uses the paired W356 Graybar traces:

- No supplied evidence: `archive/trace_samples/w356_graybar_no_supplied_website_evidence_trace.json`
- Supplied evidence: `archive/trace_samples/w356_graybar_supplied_website_evidence_trace.json`

The W356 finding was intentionally critical: W355 proved that a pasted website/category summary can move Graybar from resolver-limited to recommended/high, but that should remain a diagnostic fallback. A normal consultant flow should not require a separate pasted website summary for a known public company.

## Decision

Add a distinct N/LLM-assisted advisory confidence tier.

W357 keeps fetched public website evidence separate from N/LLM advisory inference:

- Public website read: actual resolver/fetched/operator-supplied website evidence.
- Advisory inference: N/LLM-ready support from URL/domain plus request/product/category language.
- Build/import proof: completed runner result, imported records, and verified Open links.

Advisory inference can make the no-paste Graybar flow clearer, but it cannot confirm public website evidence, create records, validate Open links, or support ROI claims by itself.

## What Changed

- Drawer marker advances to `Drawer 1.0.8 / W357`.
- Added `nllmAssistedWebsiteConfidenceW357`.
- Plan confidence now separates:
  - build/import proof,
  - public website read,
  - advisory inference.
- Website Read card now puts resolver details behind `Evidence details`.
- Run proof surfaces can show advisory support while preserving claim-safe copy.
- W355 optional website/category evidence remains available as an advanced diagnostic fallback.

## Graybar No-Paste Result

Expected no-paste behavior:

- Public read: resolver-limited.
- Advisory: supported/high.
- Build/import: verified when imported records exist.
- Open links: verified only from imported NetSuite records.
- Claims: public website and ROI claims still require confirmation.

This resolves the W356 product issue: Graybar no longer looks like a weak website simply because the resolver is local fallback, but FORGE also does not pretend it fetched strong public evidence.

## Pass/Fail Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Current marker | Pass | Source marker is `Drawer 1.0.8 / W357`. |
| No-paste Graybar public read | Pass | Remains resolver-limited. |
| No-paste Graybar advisory tier | Pass | N/LLM advisory shows supported/high. |
| Notes cannot confirm website | Pass | Advisory cannot become confirmed public evidence. |
| W355 supplied fallback | Pass | Supplied website evidence still moves to recommended/high only when supplied. |
| Build/import separation | Pass | Advisory does not change completed-result import or Open-link gates. |
| Run claim safety | Pass | Advisory can guide talk track but not ROI/proof claims. |
| No-write boundaries | Pass | No drawer transaction writes, no runner/adapter changes, no fake Open links. |

## Visual Scope For Future Smoke

Future screenshot review should focus only on:

- Plan confidence card: separate build/import, public read, advisory inference.
- Website Read details: primary line vs hidden resolver details.
- Build result/Open links: real imported records only.
- Run proof CTA: advisory copy remains claim-safe.

Avoid repeating full-page screenshot passes unless there is a visible layout, overflow, or consultant-copy issue.

## Recommendation

Run one W358 Graybar no-paste live smoke after deploy. If the live drawer shows:

- `Drawer 1.0.8 / W357`,
- public read resolver-limited,
- advisory supported/high,
- build/import and Open links still verified,

then resume the broader smoke matrix. Hosted resolver configuration can still be a later improvement, but W357 should remove the immediate false-negative website read problem for strong public companies.

## Next Recommended Prompt

```text
Move through W358: Live Graybar no-paste advisory confidence smoke.

Use W357 as the baseline. Push/deploy the drawer update, confirm Drawer 1.0.8 / W357, then rerun Graybar without using Optional website/category evidence. Review the trace and focused screenshots only for Plan confidence, Website Read details, Build result/Open links, and Run proof CTA.

Boundaries:
- No new drawer transaction write paths.
- No fake Open links.
- Do not change runner, adapter, or record creation behavior.
- Do not weaken completed-result import validation.
- Keep N/LLM advisory only.

Deliverables:
- W358 evidence review report.
- Pass/fail table proving public read remains resolver-limited while advisory support is visible.
- Confirmation that build/import and Open links stay separate from advisory confidence.
- Recommendation: resume broader smoke matrix or configure hosted resolver next.
```
