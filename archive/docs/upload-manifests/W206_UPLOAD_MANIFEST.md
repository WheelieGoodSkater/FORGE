# W206 Upload Manifest

## Package

`idb_w206_production_consultant_automation_upload_package.zip`

## Upload / Install

1. Update Tampermonkey with `idb-drawer.user.js`.
2. No NetSuite Suitelet upload is required for W206 if W205/W144/W203 files are already deployed.

## What Changed

- Normal consultant workflow now stays focused on:
  - Customer / Prospect Name
  - Website
  - Conversation Notes
  - Create new hero item / Manufacturing / WIP toggles
- W144 endpoint, server flags, sandbox account, operator approval phrases, idempotency, runner script IDs, folders, and result capture plumbing are admin/debug saved configuration.
- Build can show a consultant-safe `Build demo records` action when saved admin config and production build mode are ready.
- After runnerTaskId capture, Build can show `Check runner result`.
- After W151-valid completed runner JSON is available, Build can show `Import completed result`.
- Open links remain hidden until completed runner result import succeeds.

## Regression Boundary

- No drawer writes.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved server adapter path.
- Runner owns record creation.
- W151 import guard remains required.
- NetSuite record URLs must be absolute.
