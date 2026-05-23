# W186 Completed Runner Result Import CTA From Poll Handoff

Decision: completed_result_import_cta_from_poll_handoff_ready

## Completed-Result Import CTA Contract

- Source: W185 runnerTaskId poll handoff.
- CTA: Import completed runner result.
- Enabled only after W151 accepts completed runner result JSON with numeric internal ids, supported NetSuite URLs, and internal runner ownership.
- Pending, missing runnerTaskId, adapter-error, malformed completed result, and Build handoff JSON remain non-mutating.
- Open links remain hidden before import.

## Guarded Harness

| Gate | Result |
| --- | --- |
| Pending result non-mutating | PASS |
| Missing runnerTaskId non-mutating | PASS |
| Adapter error non-mutating | PASS |
| Malformed completed result rejected | PASS |
| Handoff JSON rejected | PASS |
| Completed W151-valid result enables CTA only | PASS |
| No-regression boundaries preserved | PASS |
| Visual testing blocked until import | PASS |

## Trace Samples

- /path/to/workspace/intelligent demo builder drawer/trace_samples/w186_completed_runner_result_import_cta_from_poll_handoff_trace.json

## Visual Testing Decision

Blocked until completed runner result JSON is imported. No Open-link visual testing is requested in W186.

## Best Next Codex Prompt

Move through W187: Completed Runner Result Import Commit From Poll CTA. Use the W186 completed runner result import CTA to commit final generated names into IDB only after the operator chooses Import completed runner result and W151 accepts numeric internal ids, supported NetSuite URLs, and internal runner ownership. Keep pending, missing runnerTaskId, adapter-error, malformed completed result, and handoff JSON non-mutating. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and only after import prepare targeted Open-link visual testing. Output import commit contract, guarded harness, trace samples, W187 report, visual testing decision targeted-only after import, and best next Codex prompt.
