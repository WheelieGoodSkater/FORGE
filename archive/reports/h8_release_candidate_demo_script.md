# H8 Release Candidate Demo Script

Generated: 2026-05-09

Decision: COMPLETE

## Objective

Give the consultant a practical controlled-pilot script that proves the drawer can intake a new SC request, produce a ready demo packet, value-sell the story, handle competitive pressure safely, and export trace evidence without enabling live record creation.

## Script A: Food / Beverage CPG Manufacturing

### Intake

- Customer: Liquid Death
- Website: `https://www.liquiddeath.com`
- Conversation notes: Mostly focusing on getting ingredients from multiple vendors into different locations, lot traceability, and retail beverage replenishment.
- SC objective: Prove beverage replenishment readiness from ingredient and lot context through finished-good availability.
- Known competitor: incumbent planning spreadsheets
- Decision criteria: The prospect needs confidence that ingredient readiness, lot traceability, and finished-good availability are visible before retail demand is missed.

### Expected IDB Result

- Lane: Food / Beverage CPG Manufacturing.
- Proof anchor: Finished Good.
- Product signal: Sparkling Water Variety 12-Pack or beverage-ready fallback.
- Review rows lead with:
  - Customer will be Liquid Death.
  - Sales Order will be Liquid Death - retail beverage replenishment Demo Order.
  - Finished Good will be Liquid Death Sparkling Water Variety 12-Pack.
  - Ingredient / Packaging Structure will be Liquid Death Canned Beverage Readiness Structure.
- Creation remains blocked.

### Consultant Story

Open by stating that the proof is not another report; it is a connected NetSuite path from ingredient and lot readiness to the finished good the customer cares about.

Move through:

1. Customer context.
2. Finished Good proof.
3. Packaging and line readiness.

Close by saying the value is catching readiness risk before the business moment is already missed.

## Script B: Apparel & Accessories

### Intake

- Customer: Trail Ridge Outfitters
- Website: `https://www.trailridgeoutfitters.example`
- Conversation notes: New seasonal apparel launch with jackets, hats, color-size variants, regional allocation, and store replenishment pressure.
- SC objective: Prove style, size, color, and allocation readiness before launch.
- Known competitor: none entered.
- Decision criteria: Buyer wants confidence that size/color variants and allocation can be managed without spreadsheet handoffs.

### Expected IDB Result

- Lane: Apparel & Accessories.
- Proof anchor: Style / SKU Matrix.
- Product signal: Core Style Color-Size Matrix.
- Review rows lead with:
  - Customer will be Trail Ridge Outfitters.
  - Sales Order will be Trail Ridge Outfitters - seasonal collection launch Demo Order.
  - Style / SKU Matrix will be Trail Ridge Outfitters Core Style Color-Size Matrix.
  - Size / Color Variants will be Trail Ridge Outfitters Core Style Color-Size Matrix Variants.
- Creation remains blocked.
- Apparel must not route to Industrial Equipment Manufacturing.

### Consultant Story

Open with collection launch risk. Prove that NetSuite can keep style, size, color, allocation, and replenishment in one workflow path instead of a manual launch tracker.

## Script C: Objection Handling

Use the Run tab and select `Handle objection`.

If the prospect says a competitor or spreadsheet can do this:

- Do not claim the competitor cannot.
- Do not cite unsupported market facts.
- Say: "The point of this proof is not another disconnected planning view. It is whether the team can see the customer, transaction, item, and readiness proof in one NetSuite path while decisions are still actionable."

If the prospect asks about ROI:

- Go to ROI / Competitive.
- Use the ROI thesis and value agenda.
- Tie value back to missed demand, readiness risk, manual reconciliation, and faster decision confidence.

## Script D: Trace And Reset

1. Go to Trace.
2. Export JSON.
3. Confirm trace includes:
   - `dryRunObjectPacket`.
   - `roiCompetitiveReview`.
   - `nllmEnrichmentRequest`.
   - `adapterBridgeRequest`.
4. Click `Clear all`.
5. Confirm customer and packet reset.
6. Log out and back into NetSuite.
7. Confirm stale customer context is not visible.

## Stop / Go

GO when both scripts pass and creation remains disabled.

STOP when apparel falls into another lane, competitive copy makes factual claims without evidence, or any create path becomes active.
