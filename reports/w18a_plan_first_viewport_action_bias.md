# W18A Plan First-Viewport Action Bias

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make Plan open on guided intake, not recap.

## Goal

The consultant should see Customer, Website, Conversation Notes, and Run IDB before reading the full Story Bar. The Story Bar remains available, but on Plan it behaves as a compact context strip once setup context exists.

## What Changed

- Plan now renders the Plan content before Story Bar.
- Story Bar is tab-aware.
- On Plan, Story Bar auto-collapses when customer, website, notes, or SC objective exists.
- Manual Story Bar collapse or expand is preserved through `storyBarCollapseManual`.
- Review, ROI / Competitive, Run, and Trace still render Story Bar before the tab body so context remains available during validation and live storytelling.

## Consultant Test

1. Open IDB on Plan.
2. Enter customer, website, and notes.
3. Confirm Guided Intake remains the first major Plan surface.
4. Confirm Story Bar appears compact below the intake area.
5. Click Expand on Story Bar.
6. Confirm the manual expanded state is preserved.
7. Move to Review.
8. Confirm Review still starts with contextual Story Bar, Guided Step, and Execution Plan Preview.

## No Regression

- No live writes.
- No automatic creation.
- No lane/proof/toggle changes.
- No N/LLM approval authority.
- Create remains disabled.
