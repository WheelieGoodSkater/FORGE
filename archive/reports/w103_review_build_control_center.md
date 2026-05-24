# W103 Review As Build Control Center

## Decision

COMPLETE / REVIEW BUILD CONTROL CENTER READY / DCC HANDOFF PRIMARY.

## What Changed

- Review now leads with `Build control center`.
- The first viewport emphasizes handoff status, selected pack, scenario, execution mode, export lane, value readiness, DCC-prepared objects, blocker, and export.
- DCC pack labels are consultant-facing.
- Operator checklist and exact params remain available behind collapsed details.
- DCC handoff remains export-only; IDB does not invoke SuiteScript or write transactions.

## Validator Gates

- Build control center is present.
- Selected DCC pack uses consultant-facing labels.
- DCC-prepared objects are visible in the first Review card.
- Operator checklist remains available.
- DCC handoff remains primary evidence.
- No IDB writes, SuiteScript invocation, or transaction writes.

## Best Next Codex Prompt

Move through W104: DCC Invocation Readiness. Define the governed path for IDB to invoke the Demo Command Center only after consultant confirmation, type-to-confirm, and review-only preview. Preserve DCC runner mechanics, keep transaction writes blocked, and keep DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics. Output invocation contract, safety gates, rollback plan, validator gates, W104 report, and best next Codex prompt.
