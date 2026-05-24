# Redwood UX Tightening Notes

Generated: 2026-05-09

Prompt: M1 - Redwood UX Tightening

Decision: PASS for implementation preflight. Live NetSuite visual smoke still required before Monday release.

## Changes

- Reduced drawer width from 430px to 410px for a quieter NetSuite companion footprint.
- Reduced header height and removed the heavy gradient treatment.
- Tightened tab height, card padding, chip spacing, textarea height, and action button sizing.
- Converted the top summary into a compact two-column grid with a full-width next-action row.
- Removed the repeated long setup summary from the setup form.
- Kept saved setup in compact read mode by default.
- Show `Apply suggested lane` only when the suggested lane differs from the selected lane.
- Tightened setup-plan record rows for better scanability in Review.

## Preserved Behavior

- Plan / Review / Run / Trace state navigation remains intact.
- Six-lane authority remains available behind `Change lane`.
- Customer, website, and conversation notes still save locally.
- Lane suggestion still requires consultant confirmation.
- Setup plan remains draft-only.
- Trace export remains browser-local and includes the dry-run object packet.
- No creation adapter implementation was added.

## Remaining UX Work For M2

- Review should expose assumptions and stop/go status with less prose.
- Run should make the recommended move and selected action feel like one guided moment.
- Guardrails should become more compact and easier to scan during a live demo.
