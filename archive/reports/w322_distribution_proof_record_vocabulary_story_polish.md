# W322: Distribution Proof Record Vocabulary And Story Surface Polish

## Purpose

W321 proved the FORGE live writeback connection can submit, poll, resolve the current sidecar, validate W151/W214/W245, import returned records, and show supported Open links after valid import. W322 keeps that connection frozen and polishes the product-facing layer: distribution proof vocabulary and sales-useful story coaching.

## Protected Baseline

Connection Steward owns these unchanged surfaces:

- W144 submit
- Refresh/poll
- Sidecar lookup and stale-result rejection
- Completed-result validation
- Finish build/import
- Open-link authority
- No drawer-created records
- No drawer transaction writes

## Distribution Proof Record Vocabulary

Proof Architect and Vocabulary Guard own the consultant-facing labels.

Distribution-safe record roles:

- Customer: buyer/account anchor.
- Sales Order: demand and promise context.
- Product SKU: the sellable inventory proof point.
- Branch Availability / Replenishment Flow: proof that branch availability, supplier timing, and replenishment action are visible.
- Fulfillment Support SKU: supporting item context for fulfillment, substitution, or service-readiness discussion.

Blocked consultant-facing terms for distribution demos:

- Finished/Assembly Item
- Formula or Batch Structure
- Ingredient
- Component Item
- Work Order
- Routing
- WIP

Acceptable fallback when NetSuite returns a generic `inventoryitem`:

- If the runner role is product/hero/finished assembly shaped, display `Product SKU`.
- If the runner role is matrix/formula/replenishment shaped, display `Branch Availability / Replenishment Flow`.
- If the runner role is component/support shaped, display `Fulfillment Support SKU`.
- Preserve the raw NetSuite record type and numeric id for validation and Open-link authority.

## Story Surface Polish

Story Strategist and QA Story Runner own the conversation-to-demo layer.

For distribution demos, the story should:

- Start with the buyer trust problem: can the branch make a believable availability promise before the order is placed?
- Use returned records as the proof path, not as generic generated names.
- Show Product SKU first, then branch availability/replenishment, then fulfillment support.
- Answer objections by returning to supported Open links and evidence receipt.
- Frame value as fewer missed promises, faster counter-sales decisions, better replenishment timing, and margin protection.
- Keep no-claim caution visible: no measured ROI, no record-creation claim, no write-action claim, and no availability claim beyond returned records and confirmed buyer evidence.

## Guardrails

- W144 submit/refresh/import behavior unchanged.
- Connected build authority unchanged.
- W151/W214/W245 validation unchanged.
- Finish build/import unchanged.
- Returned record Open links remain supported only after valid import.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- No source lane-pack mutation in W322.

## Selected Next Block

W323: Industry Expansion Story Pack And First-Call Differentiation Harness.

The next step should use the same protected connection baseline and build richer sales-call storytelling across reusable industry/sub-industry patterns.
