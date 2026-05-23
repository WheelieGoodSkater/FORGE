# G3 Execution Plan Preview

Generated: 2026-05-09

Decision: COMPLETE

## Objective

Add a plain-language execution plan before any adapter can create records.

## Implemented

- Added `executionPlanPreview(packet)`.
- Added `renderExecutionPlanPreview(...)` to the Review tab.
- Review now includes:
  - What IDB will prepare.
  - What consultant should verify.
  - What the governed write path would create later.
- The adapter creation preview is collapsed under details and explicitly locked.
- Trace export now includes `executionPlanPreview`.

## No Regression

- Direct build packet remains intact.
- ROI / Competitive stays contained to its tab.
- Run remains execution-focused.
- Creation remains blocked.
- Adapter payload remains dry-run and review-only.

## LLM Injection Point

Future LLM can convert the direct build packet into a concise execution plan, but it cannot:

- Change lane authority.
- Change proof anchor.
- Enable creation.
- Remove adapter confirmation.
- Remove consultant review.

## Next Block

G4 should define the formal prompt contracts for lane suggestion, object naming, ROI / Competitive, Run Coach, and governed creation/write-path preview.
