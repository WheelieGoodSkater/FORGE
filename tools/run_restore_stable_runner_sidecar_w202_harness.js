#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(repoRoot, '..');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const adapterPath = path.join(repoRoot, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet_v2_json_errors.js');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message, evidence) {
  if (!condition) {
    const suffix = evidence ? `\nEvidence: ${evidence}` : '';
    throw new Error(`${message}${suffix}`);
  }
}

const runner = read(runnerPath);
const adapter = read(adapterPath);

const checks = [];
function check(name, condition, evidence) {
  assert(condition, name, evidence);
  checks.push({ name, status: 'PASS' });
}

check(
  'IDB result capture no longer calls direct Sales Order creation',
  !/ensureIdbDemoSalesOrderForResult|record\.Type\.SALES_ORDER/.test(runner),
  'Direct Sales Order creation must stay out of the IDB sidecar result writer.'
);

check(
  'IDB result capture writes a pending sidecar instead of completed W151 JSON',
  /function writeIdbSidecarResultCaptureV1/.test(runner) &&
    /schema:\s*'idb\.runner-sidecar-result-json\.v1'/.test(runner) &&
    /status:\s*'pending_transaction_resolution'/.test(runner) &&
    /finalGeneratedNamesReady:\s*false/.test(runner),
  'Sidecar capture must not claim completed result readiness.'
);

check(
  'Proven CSV import path is preserved for IDB runs',
  /submitCsvImport\(\{ mappingId: soMappingId, fileId: soFileId \}\)/.test(runner) &&
    /SO CSV Import SUBMITTED for IDB transaction resolution/.test(runner) &&
    !/SO CSV Import skipped for IDB result capture/.test(runner),
  'IDB result capture mode must not skip SO CSV import.'
);

check(
  'Sidecar records expected demo transaction external id and CSV task evidence',
  /expectedDemoTransactionExternalId/.test(runner) &&
    /expectedExternalIdCandidates/.test(runner) &&
    /csvImport/.test(runner) &&
    /legacy_runner_csv_import_path/.test(runner),
  'Sidecar must preserve enough data for later transaction resolution.'
);

check(
  'W144 polling treats pending sidecar as polling_pending, not adapter_error',
  /function normalizePendingSidecarResultCapture/.test(adapter) &&
    /status:\s*'polling_pending'/.test(adapter) &&
    /lookupStatus:\s*'pending_transaction_resolution'/.test(adapter) &&
    /partialGeneratedNamesJson/.test(adapter),
  'Adapter polling must keep waiting on pending transaction resolution.'
);

check(
  'No active Open links before completed runner result import',
  /activeOpenLinks:\s*0/.test(runner) &&
    /activeOpenLinks:\s*0/.test(adapter) &&
    /finalGeneratedNamesJson:\s*null/.test(adapter),
  'Sidecar pending state cannot expose drawer links.'
);

const report = {
  schema: 'idb.w202.restore-stable-runner-sidecar-harness.v1',
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  files: {
    runner: runnerPath,
    adapter: adapterPath
  },
  checks,
  sidecarResultCaptureContract: {
    schema: 'idb.runner-result-capture.v1',
    status: 'pending_transaction_resolution',
    finalGeneratedNamesReady: false,
    activeOpenLinks: 0,
    transactionAuthority: 'legacy_runner_csv_import_path'
  }
};

console.log(JSON.stringify(report, null, 2));
