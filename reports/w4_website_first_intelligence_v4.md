# W4 Website-First Intelligence V4

Generated: 2026-05-10

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Harden website-first lane selection and naming so IDB picks the industry family from website evidence first, then uses conversation notes to shape story, ROI, competitive framing, and run coaching.

## Implemented

- Added segmented intake scoring:
  - website score
  - notes score
  - fallback score
- Added `laneSignalBreakdown` with total score, primary source, confidence, source contributions, and evidence reasons.
- Updated `suggestedLaneFromIntake` so weak website-backed guesses are not treated the same as strong website authority.
- Updated recommendation evidence chips to show source and confidence.
- Updated low-confidence action copy from `Run IDB` to `Review signal` so consultants see when the model wants a human check before accepting the lane.

## Current Known-Case Expectations

- `vans.com` should route to Apparel & Accessories from website authority.
- `milkbone.com` should route to Products CPG from website authority.
- `gordonandsmith.com` should route to Dealer Hardgoods & Channel Fulfillment from website authority.
- Unknown websites should not pretend to be high-confidence. Notes can support the story, but weak evidence stays visible.

## Why This Matters

Before W4, the resolver combined website, notes, SC objective, competitor, and decision criteria into one signal bucket. That made it possible for conversation notes to overpower the website. W4 makes the hierarchy explicit:

1. Website signal picks the lane when strong.
2. Conversation notes shape value, exceptions, and run coaching.
3. Fallback account/industry terms are only supporting evidence.

## No-Regression Confirmation

- Main create remains disabled.
- Lane set remains unchanged.
- Proof anchors remain unchanged.
- DCC toggles remain unchanged.
- N/LLM remains advisory only.

