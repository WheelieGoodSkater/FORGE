# W207 Upload Manifest

## Purpose
Production Build Mode Smoke With Saved Admin Config.

This upload keeps the normal consultant workflow focused on:
- Customer / Prospect Name
- Website
- Conversation Notes
- Simple build toggles

The W144 endpoint, server flags, operator phrases, sandbox account, idempotency token, runner task plumbing, and result-capture details remain hidden behind saved admin/debug configuration in the normal flow.

## Upload
Update Tampermonkey with:
- `idb-drawer.user.js`

No NetSuite Suitelet or runner upload is required for W207 if the W144/W203/W205/W206 NetSuite-side files already match the last passing sandbox run.

## Validation
Local validation passed:
- `npm run harness:production-build-mode-smoke-w207`
- `npm run harness:production-consultant-build-automation-w206`
- `npm run harness:production-consultant-flow-cleanup-w205`
- `npm run check`
- `npm run validate`

## Evidence
- `reports/w207_production_build_mode_smoke.md`
- `data/w207_production_build_mode_smoke.json`
- `trace_samples/w207_production_build_mode_smoke_trace.json`

## Boundaries
- No drawer writes.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved server adapter path.
- Runner owns generated records.
- W151 import guard remains required.
- Open links appear only after completed runner result import.
