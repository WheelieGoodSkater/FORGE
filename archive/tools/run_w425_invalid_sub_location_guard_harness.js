#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const fileCabinetRunnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'archive', 'reports', 'w425_invalid_sub_location_guard.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start < 0) return '';
  const next = source.indexOf('\n  function ', start + 1);
  return source.slice(start, next > start ? next : source.length);
}

function main() {
  const results = [];
  const runner = read(runnerPath);
  const fileCabinetRunner = read(fileCabinetRunnerPath);
  const saveSidecarFn = functionBody(runner, 'saveIdbInventoryItemWithDuplicateFallbacks');
  const setupFn = functionBody(runner, 'applyGeneratedInventoryItemSetupPersistence');

  assertCase(results, 'w425-filecabinet-runner-synced',
    runner === fileCabinetRunner,
    'Root and FileCabinet runner copies should match.');

  assertCase(results, 'w425-invalid-sub-detector-present',
    runner.includes('function isInvalidSubsidiaryLocationError') &&
      /INVALID_SUB\|subsidiary restrictions\|incompatible with those defined for location/.test(runner),
    'Runner should have a named guard for NetSuite subsidiary/location incompatibility errors.');

  assertCase(results, 'w425-sidecar-create-defers-body-location',
    saveSidecarFn.includes('IDB sidecar item location deferred') &&
      saveSidecarFn.includes('avoid_invalid_sub_location_save_blocker') &&
      !/rec\.setValue\(\{\s*fieldId:\s*'location'/.test(saveSidecarFn),
    'Sidecar inventory item creation should not set body location before first save.');

  assertCase(results, 'w425-sidecar-invalid-sub-diagnostic-preserved',
    saveSidecarFn.includes('IDB sidecar item invalid subsidiary/location guard') &&
      saveSidecarFn.includes('isInvalidSubsidiaryLocationError(e)'),
    'If NetSuite still returns INVALID_SUB, the runner should log diagnostics before surfacing the error.');

  assertCase(results, 'w425-setup-persistence-still-attempts-location-after-save',
    setupFn.includes('values: { location: Number(locationId) }') &&
      setupFn.includes('bodyLocationOk') &&
      setupFn.includes('forge.w424.generated-inventory-item-setup-diagnostics.v1'),
    'Location setup should still be attempted after item creation and reported through diagnostics.');

  assertCase(results, 'w425-setup-failure-does-not-weaken-proof-validation',
    setupFn.includes("status: setupOk ? 'setup_persisted' : 'setup_needs_review'") &&
      setupFn.includes('validation') &&
      setupFn.includes('planningAutoCalcOff'),
    'Setup failures should remain visible as proof-quality diagnostics, not hidden as clean proof.');

  assertCase(results, 'w425-no-runner-authority-expansion',
    !/fake Open|upload performed|deployment performed|completed-result import validation disabled/i.test(runner),
    'Patch should not add fake links, upload/deploy posture, or import-validation weakening.');

  const report = `# W425 INVALID_SUB Location Guard

## Summary
W425 addresses the NetSuite regression where generated sidecar inventory item creation can fail with \`INVALID_SUB\` when a selected location has subsidiary restrictions incompatible with the item subsidiary.

The fix is deliberately narrow:
- create the sidecar item first with name, external id, display name, and subsidiary;
- defer body \`location\` assignment until post-save setup persistence;
- keep location/planning setup as visible diagnostics;
- do not weaken completed-result import validation or Open-link authority.

## Why This Matters
The Kettle Brand Snacks run showed NetSuite rejecting a location/subsidiary combination for \`Outside Roasting\`. That should not kill the whole build if the core records can be created safely. The cockpit should receive records when possible and mark proof quality for review when setup persistence is incomplete.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No source-pack, drawer, adapter, or record creation authority was expanded.
- Open links remain verified-import only.
- N/LLM remains advisory-only.

## Recommendation
Lock W425 after the harnesses pass, reinstall/deploy the updated runner, and rerun one controlled Food/Beverage case. If NetSuite still reports setup weakness, inspect the returned setup diagnostics instead of treating the build as failed proof.
`;
  fs.writeFileSync(reportPath, report);

  printResults('W425 INVALID_SUB location guard harness', results);
}

main();
