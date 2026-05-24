# W2 UX Guided Flow Audit

Generated: 2026-05-10

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Audit the consultant path from fresh SC request to Review packet, then remove obvious noise without changing write, lane, proof, or toggle authority.

## Consultant Flow Reviewed

1. Consultant enters NetSuite demo environment.
2. Consultant opens IDB.
3. Consultant enters customer/prospect, website, and conversation notes.
4. Consultant clicks Run IDB.
5. IDB recommends the lane, builds the packet, and sends the consultant to Review.
6. Consultant uses ROI / Competitive only when value or competitor questions come up.
7. Consultant uses Run for live story guidance.
8. Consultant exports trace and clears the session after the prospect/demo handoff.

## UX Findings

- Plan has the right ingredients, but it still risks showing the consultant too many repeated cues at once.
- The Story Bar should remain the orientation anchor: prospect, lane, proof, state, and clear-session controls.
- Setup Builder should own the intake and Run IDB action.
- Guided Step should remain a small bridge between tabs, not a second full instruction panel.
- Lane selection should stay available as manual override, but it should not compete with Run IDB as the primary motion.
- Review should stay direct: exact record/transaction names first, adapter details collapsed.
- ROI / Competitive should remain a dedicated workspace, with audit detail expandable.
- Run should be the live-demonstration cockpit, not another planning page.

## Implemented In This Block

- Removed the duplicate Plan-page Next action card.
- Kept the Story Bar, Guided Step, Setup Builder, and manual lane override.
- Kept all create-disabled gates and SuiteScript write-path locks.

## UX Recommendations For W3-W8

- W3 should review code coupling around intake, resolver, packet generation, and trace export before more UI changes.
- W4 should strengthen website-first confidence reasons so the consultant trusts the recommendation.
- W5 should make Run IDB the single primary CTA once customer, website, and notes are present.
- W6 should compress Review rows into a direct build list with only key fields visible by default.
- W7 should make ROI / Competitive easier to use by showing one value thesis, one proof stack, and one objection path above the fold.
- W8 should make Run more action-oriented: Open, Prove, Handle Objection, Close Value.

## No-Regression Confirmation

- Main create remains disabled.
- The drawer still supports cross-tab session continuity.
- Clear all / Clear session remains visible.
- Manual lane override remains available.
- N/LLM remains advisory only.

