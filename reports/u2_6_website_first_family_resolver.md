# U2.6 Website-First Family Resolver

Generated: 2026-05-09

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make the website the easiest and strongest practical signal for obvious industry-family routing before generic words such as inventory, fulfillment, replenishment, or availability pull the demo into the wrong lane.

## Implemented

- Added `WEBSITE_LANE_HINTS`.
- Added `websiteLaneHint(state)`.
- Website hints now boost the matching lane and slightly suppress non-matching lanes.
- Vans-style footwear, apparel, skateboarding, style, size, color, and accessories signals route to Apparel & Accessories.
- Gordon & Smith-style surf/skate hardgoods and wholesale/dealer signals route to Dealer Hardgoods & Channel Fulfillment.
- Industrial Distribution is suppressed for Vans/apparel/footwear signals unless branch, warehouse, transfer, supplier lead, multi-location, or distribution-center signals are present.
- Recommendation evidence now includes a website signal chip when the website hint drives the lane.

## Source Basis

- Vans public website presents footwear, clothing/apparel, accessories, skateboarding, style, size, and color-oriented retail signals.
- Gordon & Smith public website presents surfboards, skateboards, custom surfboard orders, accessories, apparel, and dealer-style hardgoods signals.

## No-Regression Confirmation

- Create remains disabled.
- Manual override remains available.
- Seven authorized lanes remain unchanged.
- Proof anchors remain unchanged.
- Website-first resolver is advisory and does not create records.

## Next Recommended Block

U7 should use the website-first resolved family as the source lane for Creation Packet Contract V2.
