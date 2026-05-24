# W101 Source Authority Refactor

## Decision

COMPLETE / SOURCE AUTHORITY SEPARATED / HANDOFF CONSISTENCY FIXED.

## What Changed

- Added `sourceAuthorityModel` to separate identity, value, and build ownership.
- Website evidence now owns lane, category, naming hints, product family, and DCC pack suggestion.
- Consultant notes and SC context own ROI, competitive framing, objections, and run guidance.
- Consultant confirmation owns final lane and DCC handoff readiness.
- DCC owns object generation.
- Fixed the blocked/confirmed contradiction by allowing confirmed state authority to make the DCC handoff ready even when website evidence originally required confirmation.

## Validator Gates

- Source authority model exists.
- Trace export includes source authority.
- Handoff readiness follows consultant confirmation plus state authority.
- Brief preparation is required before handoff.
- No IDB writes, SuiteScript invocation, or transaction writes.

## Next Prompt

Move through W102: N/LLM Value Story Advisor. Build an advisory-only value story model where ROI and competitive guidance are generated from consultant notes, SC objective, BANT/MEDDICC, decision criteria, known competitor/incumbent, and confirmed lane. Website evidence may support context but must not block value guidance by itself. Preserve no invented competitor claims, no measured savings without baseline, no write authority, no SuiteScript invocation, consultant confirmation required, and DCC ownership of object generation. Output value advisor contract, compressed ROI/Competitive UI, validator gates, W102 report, and best next Codex prompt.
