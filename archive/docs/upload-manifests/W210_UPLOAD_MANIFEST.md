# W210 Upload Manifest

## What W210 Changes

W210 makes the normal Intelligent Demo Builder flow read like a production consultant tool. The consultant should see the intake, simple toggles, Build demo records, simple build status, Run demo, and Open links after records exist.

Admin/debug details are still available only behind debug mode. The normal consultant flow should not show W144 endpoint setup, server flags, sandbox allowlist, operator phrases, idempotency tokens, runner task ids, raw result JSON, retry diagnostics, or debug handoff controls.

Image lookup remains disabled by default. The governed runner and W144 adapter path remain the owner of record creation.

## Upload Required

Upload this file to Tampermonkey:

- `idb-drawer.user.js`

No W144 Suitelet upload is required for W210 if the current W208/W209 W144 adapter is already deployed and working.

No runner upload is required for W210 if the W209 image-lookup-disabled runner is already deployed and working.

## Normal Consultant Test

1. Open NetSuite with the updated Tampermonkey script enabled.
2. Enter Customer / Prospect Name.
3. Enter Website.
4. Enter Conversation Notes.
5. Choose simple toggles as needed:
   - Create new item
   - Manufacturing
   - WIP
6. Click `Build demo records`.
7. The Build tab should show simple status language only:
   - Ready to build
   - Building records
   - Still building
   - Records ready
   - Build needs admin setup
   - Build failed, ask admin
8. If the runner is still processing and a status control appears, click `Check status`.
9. If completed records are ready and a finish control appears, click `Finish build`.
10. Open the Run tab and confirm final generated names and Open links appear only after the completed runner result imports.

## Admin / Debug Only

These controls should not appear in the normal consultant flow:

- W144 endpoint
- server flags
- sandbox allowlist
- operator phrases
- idempotency token
- runnerTaskId
- raw adapter response
- completed runner result JSON textarea
- debug handoff export
- retry/error diagnostics
- pilot evidence checklist

Use admin/debug only when diagnosing setup, adapter, runner, polling, or result import issues.

## Validation Evidence

- `npm run validate`: PASS, 1914/1914 checks
- `npm run check`: PASS
- `npm run harness:consultant-first-ui-cleanup-w210`: PASS, 11/11 assertions
- `npm run harness:one-click-production-build-automation-w208`: PASS, 11/11 assertions
- `npm run harness:production-flow-hardening-w209`: PASS, 11/11 assertions
- `npm run harness:production-consultant-build-automation-w206`: PASS, 8/8 assertions

## Release Decision

W210 is a release candidate for consultant-first production smoke. The next test should be a normal consultant run, not an admin/debug run.
