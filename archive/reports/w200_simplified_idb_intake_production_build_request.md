# W200 Report: Simplified IDB Intake And Production Build Request Contract

Status: PASS

## Simplified IDB Intake Architecture

- Required consultant inputs: customer/prospect name, website, conversation notes.
- IDB infers lane, proof path, demo scenario, build story, and initial record naming intent.
- Adapter endpoint, flags, runner IDs, mapping, folders, result capture, and operator controls are admin/debug only.

## Confirmed Build Request JSON Contract

- Generated from the three inputs plus confirmed inferred path and idempotency token.
- Requires Customer, demo transaction/Sales Order, hero item, matrix/proof item, and component item.
- Keeps W151 completed-result import guard before any final generated names mutation.

## Regression Harness Updates

- PASS: consultant readiness requires only the three production inputs - setupReadiness no longer makes proof/objective fields required.
- PASS: production consultant intake contract exists - W200 adds the three-input contract and required record set.
- PASS: confirmed build request includes simplified intake and admin/debug contract - The request JSON names the consultant contract and hidden adapter configuration.
- PASS: normal consultant form shows only customer website and notes - Legacy objective/decision fields are retained only inside admin/debug details.
- PASS: server adapter controls are hidden behind admin/debug - W144 endpoint/flags/operator fields are not part of the normal consultant workflow.
- PASS: handoff-only export is de-emphasized - Build handoff remains available as debug evidence, not the primary production action.
- PASS: existing W144 runnerTaskId path remains intact - W200 does not remove the current W144 adapter call and runnerTaskId capture path.
- PASS: W151 import guard and link authority remain required - Open links still wait for completed runner result import.
- PASS: package exposes W200 harness - The regression harness is runnable by name.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. No Open-link visual testing is useful while the runner result writer is missing.

## Best Next Codex Prompt

Move through W201: Governed Runner Completed Result Writer For Active V4 Runner. Patch the active scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js path to write W151-valid completed runner result JSON with numeric ids and supported NetSuite URLs into the configured result capture folder after successful server-side runner execution, then prove IDB polling can retrieve it without drawer writes.
