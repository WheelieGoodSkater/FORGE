# ROI / Competitive Containment And Guided Execution Plan

Generated: 2026-05-09

Decision: COMPLETE

## Findings

- ROI / Competitive content was technically useful but appeared too broadly through the Story Bar.
- Consultants need value selling support, but it should be a deliberate tab choice, not repeated on every surface.
- Run should stay execution-focused and should not repeat the ROI thesis.
- The next architecture move is guided execution: context entry, build review, value support, live run, trace, then adapter planning.

## Implemented

- Removed ROI and Competitive cards from the global Story Bar.
- Kept ROI / Competitive inside the dedicated ROI / Competitive tab.
- Cleaned the ROI / Competitive tab so it explains when to use it:
  - Why now.
  - ROI thesis.
  - Why NetSuite.
  - Value agenda.
  - Competitive review.
  - Objections.
  - Discovery questions.
- Removed repeated ROI thesis language from Run.
- Added `NEXT_24_HOUR_GUIDED_EXECUTION_PLAN.md`.

## No Regression

- ROI / Competitive trace export remains available.
- Run Coach remains customer-aware.
- Review direct build packet remains intact.
- Creation remains locked.
- Apparel & Accessories remains an authorized lane.

## Next

Upload the updated `idb-drawer.user.js` into Tampermonkey and run a visual smoke confirming that only the ROI / Competitive tab contains ROI and competitive content.
