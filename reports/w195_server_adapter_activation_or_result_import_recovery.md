# W195 Server Adapter Call Activation Or Result Import Recovery

Decision: PASS_ACTIVATION_OR_RECOVERY_PACKET_READY

## Current Run Finding

The current operator screenshot is blocked before server adapter. No runnerTaskId exists, result capture has not started, no completed runner result JSON is imported, and no Open links should be tested.

## Exact Operator Inputs

| Field | Value | Notes |
| --- | --- | --- |
| Approved endpoint URL | https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID | Paste the deployed W144 governed runner adapter Suitelet URL, not the legacy DCC UI URL. |
| CREATE_ENABLED | true | Enable only on the sandbox W144 adapter deployment. Roll back by setting these false. |
| GOVERNED_SANDBOX_WRITE_ENABLED | true | Enable only on the sandbox W144 adapter deployment. Roll back by setting these false. |
| QUEUE_SUBMIT_ENABLED | true | Enable only on the sandbox W144 adapter deployment. Roll back by setting these false. |
| Sandbox allowlist | TD3021666 | The current account must be in the allowlist before the one-call button is eligible. |
| Current sandbox account | TD3021666 | The current account must be in the allowlist before the one-call button is eligible. |
| Operator review decision | operator_approved_queue_submit | Must be approved before the one call. |
| Type to confirm | QUEUE GOVERNED SANDBOX RUNNER | Must match exactly. |
| Authorization phrase | AUTHORIZE ONE SANDBOX ADAPTER CALL | Must match exactly. |

## Activation Steps

| Step | Action |
| --- | --- |
| 1 | Keep visual Open-link testing stopped until Build shows five imported Open links. |
| 2 | Deploy or confirm the W144 governed runner adapter Suitelet endpoint. |
| 3 | Set CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED true on sandbox only. |
| 4 | Enter the endpoint URL, sandbox allowlist/current account, operator name, queue approval, and authorization phrase in Build. |
| 5 | Submit exactly one approved server adapter call. |
| 6 | If runnerTaskId is returned, use Check runner result until W191 returns completed W192 result JSON. |
| 7 | If a completed W151-valid runner result JSON is already available, use Import completed runner result instead of resubmitting. |
| 8 | Only after import, run targeted Open-link verification. |

## Recovery Import Steps

| Step | Action |
| --- | --- |
| 1 | Use Trace > Completed Runner Result Import only with completed W191/W192 result JSON. |
| 2 | Do not paste the Build handoff packet; W151 must reject it. |
| 3 | Confirm JSON includes numeric ids and supported NetSuite URLs for customer, demo transaction, hero item, matrix/proof item, and component item. |
| 4 | Click Import completed runner result. |
| 5 | Verify Build and Run show imported names and five active Open links before any visual click test. |

## Harness Evidence

- Current blocked state preserved: PASS
- Ready no-submit request constructed: PASS
- One-call runnerTaskId capture modeled: PASS
- Completed result recovery import modeled: PASS
- No visual testing until imported links: PASS

## Visual Testing Decision

Do not run Open-link visual testing from the current state. It becomes targeted-only after Build shows imported final names and five active Open links.

## Next Production-Readiness Prompt

Move through W196: Approved Server Adapter One-Call Operator Execution And RunnerTaskId Evidence. Use the W195 activation packet to execute exactly one approved W144 sandbox server adapter call from Build with the real deployed endpoint, server flags true, sandbox allowlist, operator approval, idempotency token, and one-call authorization phrase. Capture runnerTaskId plus pending result capture or adapter error. Do not import final names, do not create records from the drawer, do not request Open-link visual testing, and do not return fake URLs. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output execution evidence, runnerTaskId/error evidence, trace samples, W196 report, and next prompt.
