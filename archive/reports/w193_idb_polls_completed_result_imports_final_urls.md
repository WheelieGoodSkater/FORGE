# W193: IDB Polls Completed Result And Imports Final URLs

Decision: PASS_IDB_POLLS_W191_W192_RESULT_AND_IMPORTS_FINAL_URLS

## Polling Import Contract
- W190 Check runner result polls the W191 result-capture endpoint.
- W191 reads W192 File Cabinet result capture JSON by runnerTaskId/idempotency token.
- W151 validates numeric ids, supported NetSuite URLs, and internal runner ownership.
- IDB commits final names locally only after import; the drawer creates no records and performs no transaction writes.

## Guarded Harness
```json
{
  "pendingPollNonMutating": true,
  "completedPollRequiresImportChoice": true,
  "w151AcceptedCompletedJson": true,
  "importCommittedFinalUrls": true,
  "buildShowsRealImportedNames": true,
  "runShowsRealImportedNames": true,
  "verifiedOpenLinksReady": true,
  "malformedResultBlocked": true,
  "noDrawerWrites": true,
  "noDrawerTransactionWrites": true
}
```

## Visual Testing Decision
After W193 import, the only visual test needed is targeted clicking of the five imported Open links. Broad drawer visual testing remains blocked/not needed.

## Best Next Codex Prompt
Move through W194: Targeted Real Imported Open-Link Verification From W193. Use the W193 imported final URLs from real W191/W192 result capture to run only the targeted operator visual verification: click Customer, demo transaction, hero item, matrix/proof item, and component item Open links, prove each lands on an actual NetSuite record page, and reject Notice/Error/placeholder pages. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and do not broaden visual testing. Output exact operator steps, screenshots needed, pass/fail evidence review, trace samples, W194 report, and production-readiness next prompt.
