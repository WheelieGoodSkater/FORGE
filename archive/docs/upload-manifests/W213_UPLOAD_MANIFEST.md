# W213 Upload Manifest

## Purpose

W213 improves consultant-facing story, ROI, competitive, objection-handling, and Run coaching while preserving the working one-click Build path.

## Upload Scope

Upload/update only:

- `idb-drawer.user.js`

No NetSuite Suitelet, W144 adapter, or runner upload is required for W213.

## What Changed

- Added the W213 consultant story / ROI / competitive quality model.
- Website evidence continues to anchor industry and product context.
- Consultant toggles continue to control operating-model vocabulary.
- Conversation notes now shape pain, ROI, competitive framing, objections, and Run coaching more explicitly.
- NetSuite is positioned as the winning operating system without unsupported claims.
- ROI copy now requires a customer baseline before claiming savings.
- Run coaching now uses the W213 copy model and preserves imported final generated names.

## Preserved Boundaries

- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 server adapter path.
- Runner owns generated records.
- W151 import guard remains internal and required.
- Open links appear only after real numeric ids and supported NetSuite URLs exist.
- W211 forbidden vocabulary guard remains active.
- W212 website-grounded naming authority remains active.

## Validation

Run from `/path/to/workspace/intelligent demo builder drawer`:

```bash
npm run harness:consultant-story-roi-competitive-w213
npm run harness:website-grounded-orchestration-w212
npm run harness:toggle-aware-naming-w211
npm run harness:consultant-first-ui-cleanup-w210
npm run check
npm run validate
```

Expected:

- W213: `pass; 12/12 checks`
- W212: `PASS (10/10)`
- W211: `PASS (7/7)`
- W210: `11/11 harness assertions passed`
- validate: `Checks: 1914/1914`

## Visual Testing Decision

No broad visual NetSuite testing is required for W213. This is a copy/orchestration quality pass. Use a normal consultant smoke only if you want to inspect the new wording live.
