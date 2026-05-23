# W9-W18 UX-First Write Replan

Generated: 2026-05-10
Decision: COMPLETE / PLAN UPDATED / CREATE STILL DISABLED

## Current Test Finding

The Gordon and Smith run is directionally strong, but the Review, ROI / Competitive, and Run surfaces are now carrying too much text by default. The consultant needs a guided decision surface, not a technical scroll. The next release therefore moves UX compression ahead of the write branch.

## Planning Change

W9-W13 now focus on the live consultant experience before any new SuiteScript write implementation:

1. Review becomes execution-first.
2. Story Bar becomes collapsible.
3. ROI / Competitive becomes summary-first with expandable detail.
4. Run becomes live-control-first.
5. Scenario QA validates Gordon and Smith, Vans, Milk-Bone, weak website, and weak-notes cases before write work resumes.

W14-W18 then return to write enablement through a controlled branch:

1. Isolate the write branch and runtime flags.
2. Pilot Customer write first.
3. Pilot Proof Item write second.
4. Add confirmation, result, and partial-failure UX.
5. Package the five-consultant controlled pilot.

## UX Directives For W9-W13

- Execution Plan Preview before record listing.
- Record list collapsed by default after the summary.
- Create Readiness reduced to one compact strip; repetitive gate details move behind expansion.
- Story Bar collapsible with a persistent mini summary.
- ROI most important appears first in ROI / Competitive.
- Competitive most important appears second in ROI / Competitive.
- Detailed ROI audit, proof stack, objections, and discovery are expandable.
- Run tab live controls first, then Top 3 moves, then presenter script, then optional detail.
- Clear all and Clear session remain visible and understandable.

## Roles

- Consultant UX Director Agent: owns first-viewport hierarchy, Redwood polish, reduced scrolling, and live-demo clarity.
- Packet Contract Agent: ensures collapsed Review still preserves exact packet, dependency, field, and trace information.
- Code Review Sentinel Agent: blocks risky coupling, duplicate state, and hidden behavior regressions.
- Session State Engineer Agent: owns Story Bar collapse state, cross-tab persistence, and clear-session reset.
- Story And Value Agent: owns compact ROI, competitive, Top 3 moves, and presenter guidance.
- N/LLM Advisory Architect Agent: defines advisory-only enrichment for ROI, competitive, and naming detail.
- SuiteScript Write Agent: resumes in W14 with create-disabled main and pilot-only write branch.
- Validation And Evidence Agent: updates validator coverage and evidence reports.
- Pilot Enablement Agent: validates usability for five consultants.
- Release Conductor Agent: owns stop/go gates and context closure.

## No-Regression Rules

- Main create remains disabled.
- No automatic live writes from the drawer.
- No lane, proof-anchor, DCC toggle, packet-order, or website-first authority regression.
- N/LLM remains advisory only.
- Transaction context remains post-parent-result gated.
- No unsupported lane writes.
- No hidden writes, silent retry, silent deletion, or untraceable partial failure.
- Competitive language stays workflow-based unless verified facts are available.

## Acceptance Standard

The next implementation pass succeeds only when a consultant can:

1. Open Review and immediately see what might happen to records.
2. Understand why it matters without reading all record details.
3. Move to Run without scrolling through repetitive readiness gates.
4. Use ROI / Competitive from a short executive summary, then expand detail only when needed.
5. Run the live story from controls, Top 3 moves, and script without losing the thread.

## Next Prompt

Prompt W9-W10: Review Compression And Collapsible Story Bar

Objective: compress Review into an execution-first decision surface and make the Story Bar collapsible before any write-path work resumes.

Boundaries:
- Do not enable writes.
- Do not change lane/proof/toggle authority.
- Do not change packet order.
- Keep N/LLM advisory only.
- Preserve active session and clear-session behavior.
