# U2.5 Run IDB Intake Resolver

Generated: 2026-05-09

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make the normal entry flow simple: consultant opens IDB, enters prospect, website, and conversation notes, then clicks `Run IDB`. IDB resolves the industry family, applies the lane, builds the packet, and moves to Review.

## Implemented

- Primary intake action is now `Run IDB`.
- Manual lane selection is hidden unless the consultant clicks `Change lane manually`.
- The old always-visible lane wall is removed from the normal entry flow.
- Durable goods, hardgoods, wholesale fulfillment, surfboard, skateboard, Gordon & Smith, and related surf/skate product signals now boost Dealer Hardgoods & Channel Fulfillment.
- Generic fulfillment language no longer overpowers hardgoods/dealer signals into Industrial Distribution unless branch, warehouse, transfer, or distribution-center context is present.
- Product preview recognizes Gordon & Smith-style surf/skate hardgoods and proposes `Custom Surfboard and Skateboard SKU`.

## Flow

1. Open IDB in the demo environment.
2. Enter customer/prospect.
3. Enter website.
4. Enter conversation notes.
5. Click `Run IDB`.
6. IDB resolves the family, builds the packet, and opens Review.

## No-Regression Confirmation

- Create remains disabled.
- Manual override remains available.
- No lane/proof anchor changed.
- SuiteScript write path remains gated.

## Next Recommended Block

U7 can now use the simplified intake resolver as the source for the Creation Packet Contract V2.
