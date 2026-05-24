# W13 UX Scenario QA And Five-Consultant Pilot Readiness

Generated: 2026-05-10
Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Validate the go-live consultant experience after W9-W12 before shifting back to write-path implementation.

## Roles Applied

- Pilot Enablement Agent: reviewed whether five consultants can repeat the same intake, review, value, run, trace, and reset flow.
- Consultant UX Director Agent: reviewed first-viewport friction and reduced-scroll behavior.
- Validation And Evidence Agent: added validator coverage for the W13 report and weak-signal guard.
- Code Review Sentinel Agent: kept changes scoped to UX guardrails and did not alter lane/proof/toggle/packet order.

## Scenario QA Matrix

| Scenario | Input Signal | Expected Lane | Expected Outcome | W13 Finding |
| --- | --- | --- | --- | --- |
| Gordon and Smith | `gordonandsmith.com`, surf/skate hardgoods, dealer channel | Dealer Hardgoods & Channel Fulfillment | Review opens with Execution Plan Preview before records; product/SKU proof remains specific | PASS |
| Vans | `vans.com`, footwear, apparel, style/size/color | Apparel & Accessories | Website-first signal beats generic inventory/fulfillment notes | PASS |
| Milk-Bone | `milkbone.com`, pet treats, packaging, retail availability | Products CPG | Product naming remains Original Dog Biscuits Variety Pack and does not drift into food manufacturing | PASS |
| Weak website | Unknown website with generic operations notes | No automatic lane acceptance | IDB now blocks the one-click Run IDB button and asks for stronger lane signal or manual override | PASS / PATCHED |
| Weak notes | Known website but thin notes | Website-first lane can still route, while story/value confidence remains visible as lower context | PASS |

## UX Findings

1. Review is now usable as a decision surface: Execution Plan Preview appears before Build Packet and the full record list is collapsed.
2. Create Readiness is no longer a wall of repeated gates; it is a compact strip with expandable details.
3. Story Bar collapse gives back vertical room while keeping prospect, lane, proof, status, and Clear all available.
4. ROI / Competitive is readable live because the top cards answer ROI first and competitive second.
5. Run now behaves like the live control panel: controls first, decision to land second, Top 3 path third.
6. Weak/unknown website cases needed a guard so the current lane was not accidentally accepted as a recommendation.

## Surgical Patch

W13 added a weak-signal intake guard:

- If customer, website, and notes are complete but no lane recommendation exists, IDB labels the primary action `Add lane signal`.
- The primary build action is disabled for that weak-signal state.
- The consultant can either add better product/SC context or use `Change lane manually`.
- Known website-first cases still use `Run IDB`.

## No-Regression Points

- Main create remains disabled.
- SuiteScript write path remains blocked.
- No automatic record creation was added.
- No lane, proof-anchor, DCC toggle, packet-order, or website-first authority regression.
- Manual lane override remains available.
- N/LLM remains advisory only.
- Clear all / Clear session remain available for active-session reset.

## Five-Consultant Pilot Readiness

The next pilot script should ask each consultant to run:

1. One hardgoods/dealer-channel scenario: Gordon and Smith.
2. One apparel scenario: Vans.
3. One products CPG scenario: Milk-Bone.
4. One weak website scenario that should not auto-run.
5. One live Run tab exercise using Open, Prove, Handle objection, and Close value.

## Next Block

W14 should begin write branch isolation only after the W13 compressed UX is reviewed in Tampermonkey. The write branch must remain separate from the main create-disabled package.
