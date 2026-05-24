# W5 One-Action Intake And Run IDB

Generated: 2026-05-10

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make Run IDB the moment where the consultant accepts the lane, freezes the product seed, and creates a stable packet identity for the rest of the session.

## Implemented

- Added `acceptedPacket` to drawer state.
- Added `buildAcceptedPacketContext` to freeze:
  - packet ID
  - accepted timestamp
  - intake signature
  - selected lane
  - proof anchor
  - product seed
  - product family
  - naming authority
  - naming confidence
  - recommended move
  - page type
- Clicking `Run IDB` now creates the accepted packet before moving to Review.
- Editing customer, website, notes, SC context, or manual lane selection clears the accepted packet so stale identity cannot carry into a new prospect.

## Consultant Flow

1. Enter customer/prospect.
2. Enter website.
3. Enter conversation notes or SC context.
4. Click Run IDB.
5. IDB freezes the accepted lane, product seed, packet ID, and Review packet context.

## No-Regression Confirmation

- Main create remains disabled.
- Manual lane override remains available.
- Clear all / Clear session behavior remains intact.
- N/LLM remains advisory only.

