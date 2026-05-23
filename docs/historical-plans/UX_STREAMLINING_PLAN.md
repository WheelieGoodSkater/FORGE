# Drawer UX Streamlining Plan

Generated: 2026-05-09

## Current Review

The current drawer is directionally right: it captures customer context, recommends Food / Beverage CPG Manufacturing from the Georgetown Foods notes, preserves the `Finished Good` proof anchor, and now renders a draft-only setup plan inherited from Demo Command Center V4.

The adoption risk is no longer whether the drawer has enough intelligence. The risk is that the drawer is becoming too long for a consultant to use live without hunting for the next action.

## Screenshot Findings

What is working:

- The consultant can enter customer, website, and conversation notes directly inside NetSuite.
- Suggested lane and proof path are visible and match the conversation context.
- The setup plan shows the same V4-style path: Customer Record, Sales Order View, proof anchor, and supporting proof records.
- Draft-only status is visible before any creation adapter exists.
- Live controls and trace export are present without leaving the working page.

What needs to be streamlined:

- Demo setup summary repeats information that also appears in Setup plan, Operating lane, Proof path, and Today's moves.
- The six-lane grid remains large after a lane is selected.
- Setup plan record rows are useful but should not always consume first-screen space.
- Validate Live, Live Controls, Guardrails, and Trace are all permanently visible, which turns the drawer into a scroll panel instead of a cockpit.
- Trace export is operational plumbing and should sit behind a utility state, not compete with demo execution.
- The first viewport should answer: who is this for, what lane are we in, what proof path is active, what is the next action?

## UX Objective

Turn the drawer into a stateful consultant cockpit with compact first-screen guidance and details on demand.

The target first viewport should show:

1. Current page signal.
2. Compact demo setup summary with edit affordance.
3. Selected lane and proof anchor.
4. Recommended next action.
5. One primary action for the current state.

Everything else should be available through state tabs, disclosure rows, or utility controls.

## Blocking Objectives

### UX-1: Information Architecture Gate

Introduce explicit drawer states:

- `Plan`: customer, website, notes, suggested lane, setup readiness.
- `Review`: setup objects, dependencies, assumptions, missing fields.
- `Run`: current move, proof path, live controls, guardrails.
- `Trace`: export, local event summary, reset.

No new creation behavior should be added until these states are in place.

### UX-2: Compact Setup Header

Replace the tall setup form as the default view after setup is saved.

Required behavior:

- Show customer, website domain, selected lane, and setup status in a compact summary.
- Keep edit mode available.
- Keep Apply suggested lane visible only when a meaningful suggestion differs from current lane.
- Avoid repeating the full setup summary under the fields unless the consultant asks to review it.

### UX-3: Lane Grid Compression

After a lane is selected, show the selected lane as a compact card and move the six-lane grid behind `Change lane`.

Required behavior:

- The six-lane authority remains available.
- Proof anchor remains visible.
- Changing lanes is always deliberate and traceable.

### UX-4: Reviewable Object Plan

Move the setup plan into the `Review` state with a compact count/status summary in `Plan`.

Required behavior:

- Show required records, supporting records, and missing context on review.
- Keep `draft_only` visible.
- Do not expose a live create button until the creation adapter exists.
- Keep the DCC V4 record path visible before any future creation adapter can use it.

### UX-5: Run Controls Priority

In `Run`, prioritize one recommended move and collapse secondary controls.

Required behavior:

- The primary recommended action is visually dominant.
- Redirect, Confirm, Pressure-test, and Summarize remain available.
- Guardrails appear as compact warnings, not a permanent full card unless a risk is selected.

### UX-6: Trace As Utility

Move trace export into the `Trace` state or footer utility row.

Required behavior:

- Export JSON remains one click from the utility state.
- Trace event count and last action are visible.
- Clearing trace remains deliberate.

## Prompt Order Update

Prompt C becomes the next blocking implementation prompt before expanding object templates or adapter work.

The correct next block is:

`Prompt C: Consultant Review UX - First Viewport Compression`

Timebox: one implementation pass.

Goal: reorganize the drawer into Plan, Review, Run, and Trace states, compact the default view, preserve six-lane authority, preserve draft-only setup planning, and keep all current trace behavior.

Boundaries:

- No new lanes.
- No proof-anchor changes.
- No automatic lane switch.
- No live NetSuite record creation.
- No creation adapter implementation.
- No loss of customer, website, conversation notes, setup plan, lane selection, live controls, guardrails, or trace export.

Validation must prove:

- The UX streamlining plan is present.
- The prompt chain names the UX gate.
- The first viewport objective is documented.
- Creation remains draft-only until a supported adapter exists.
