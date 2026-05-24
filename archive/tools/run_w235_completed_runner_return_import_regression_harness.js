#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'reports', 'w235_completed_runner_return_import_regression.md');
const tracePath = path.join(root, 'trace_samples', 'w235_completed_runner_return_import_regression_trace.json');

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeText(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, value);
}

function writeJson(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function has(source, needle) {
  return source.indexOf(needle) !== -1;
}

function main() {
  const source = fs.readFileSync(drawerPath, 'utf8');
  const results = [];

  assertCase(
    results,
    'w235_normalization_preserves_raw_result_capture',
    has(source, 'resultCapture: Object.assign({}, resultCapture') &&
      has(source, 'finalGeneratedNamesJson: hasCompletedResultJson ? (result.finalGeneratedNamesJson || resultCapture.finalGeneratedNamesJson) : null'),
    'normalizeApprovedServerAdapterTransportResponseV1 now carries the adapter resultCapture forward instead of dropping it.'
  );

  assertCase(
    results,
    'w235_ready_detection_requires_actual_completed_payload',
    has(source, 'function adapterResultIndicatesCompletedResultReady(result)') &&
      has(source, 'if (value.finalGeneratedNamesJson || capture.finalGeneratedNamesJson) return true;') &&
      has(source, 'return false;'),
    'FORGE no longer treats finalGeneratedNamesJsonReady text/status flags as record-link evidence.'
  );

  assertCase(
    results,
    'w235_state_patch_preserves_invalid_payload_for_admin_debug',
    has(source, 'completedResultPresent') &&
      has(source, 'finalGeneratedNamesJson: completedResultPresent ? completedResultJson : null') &&
      has(source, 'completedResultAcceptedByW151: completedGuard.valid === true') &&
      has(source, 'completedResultMessage: completedGuard.message'),
    'A completed-but-rejected poll response is retained with W151 diagnostics while top-level Open-link import stays blocked.'
  );

  assertCase(
    results,
    'w235_check_status_import_uses_poll_normalized_payload',
    has(source, 'w190Result.normalizedResponse && w190Result.normalizedResponse.finalGeneratedNamesJson') &&
      has(source, 'completedResultStatus: w190Result.resultImportGuard.completedResultStatus ||'),
    'Check status now keeps the poll payload and traces the exact import status.'
  );

  assertCase(
    results,
    'w235_rejected_completed_payload_routes_to_admin_safe_failure_copy',
    has(source, 'completedResultRejected') &&
      has(source, "consultantStatus = 'build_failed_ask_admin'") &&
      has(source, "copy: 'The build stopped safely. Ask an admin to review the build log and retry.'"),
    'Completed payloads that fail the import guard stop the normal consultant loop instead of asking for repeated Bring back records clicks.'
  );

  assertCase(
    results,
    'w235_no_open_links_before_valid_import_preserved',
    has(source, 'finalGeneratedNamesJson: completedResultW151Valid ? completedResultJson : null') &&
      has(source, 'finalGeneratedNamesJsonReady: completedResultW151Valid') &&
      has(source, 'noActiveOpenLinksWithoutRealUrls: true'),
    'Top-level finalGeneratedNamesJson is committed only after W151-valid IDs, URLs, and runner owner.'
  );

  const trace = {
    schema: 'idb.w235-completed-runner-return-import-regression.trace.v1',
    generatedAt: new Date().toISOString(),
    reviewedTrace: '/path/to/downloads/intelligent-demo-builder-trace-1779280924087.json',
    conclusion: 'Runner submit completed, but FORGE collapsed a non-importable poll response into completed UI state while retaining the old empty placeholder resultCapture.',
    passCount: results.filter((item) => item.pass).length,
    resultCount: results.length,
    results,
    visualTestingDecision: 'No broad visual testing. This harness covers the completed-runner return/import regression path and keeps live visual checks out of scope.'
  };

  const report = [
    '# W235 Completed Runner Return Import Regression',
    '',
    '## Diagnosis',
    '',
    'The supplied trace shows the runner task was submitted and later polled, but the drawer state kept an empty placeholder resultCapture with null records while the UI moved into a completed/bring-back-records state.',
    '',
    '## Fix Contract',
    '',
    '- Preserve the adapter poll resultCapture on the drawer state.',
    '- Require an actual completed result object before declaring completed-result readiness.',
    '- Commit top-level final generated names only after W151 accepts numeric IDs, supported NetSuite URLs, and runner ownership.',
    '- Route completed-but-rejected payloads to simple consultant failure copy and admin/debug diagnostics instead of an endless Bring back records loop.',
    '- Preserve no drawer-created records, no drawer transaction writes, and no direct SuiteScript outside W144.',
    '',
    '## Harness Results',
    '',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    `Result: ${trace.passCount}/${trace.resultCount}`,
    ''
  ].join('\n');

  writeJson(tracePath, trace);
  writeText(reportPath, report);

  if (trace.passCount !== trace.resultCount) {
    console.error(report);
    process.exit(1);
  }
  console.log(report);
}

main();
