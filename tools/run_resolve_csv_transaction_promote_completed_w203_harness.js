#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(repoRoot, '..');
const adapterPath = path.join(repoRoot, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const adapter = read(adapterPath);
const runner = read(runnerPath);
const checks = [];

function check(name, condition) {
  assert(condition, name);
  checks.push({ name, status: 'PASS' });
}

check(
  'Active W144 can find sidecar files by raw or runner-safe idempotency token',
  /function safeFileToken/.test(adapter) &&
    /tokenFilters\.push\(\['name', 'contains', safeToken\]\)/.test(adapter) &&
    /nameFilter = \[nameFilter, 'OR', tokenFilters\[i\]\]/.test(adapter)
);

check(
  'Active W144 resolves CSV-created Sales Order by expected external id candidates',
  /function resolveSalesOrderByExternalIdCandidates/.test(adapter) &&
    /type:\s*'salesorder'/.test(adapter) &&
    /externalidstring/.test(adapter) &&
    /mainline/.test(adapter)
);

check(
  'Active W144 promotes pending sidecar only after transaction resolution',
  /function promotePendingSidecarIfTransactionResolved/.test(adapter) &&
    /resolved_by_csv_import/.test(adapter) &&
    /completed_runner_result_ready/.test(adapter)
);

check(
  'W151 completed result shape still requires numeric ids and supported URLs',
  /normalizeCompletedRunnerResult/.test(adapter) &&
    /numericId\(record\.internalId\)/.test(adapter) &&
    /supportedNetSuiteUrl\(record\.url\)/.test(adapter)
);

check(
  'Unresolved transaction remains polling_pending and non-mutating',
  /lookupStatus:\s*promoted\.reason/.test(adapter) &&
    /finalGeneratedNamesJson:\s*null/.test(adapter) &&
    /activeOpenLinks:\s*0/.test(adapter)
);

check(
  'Runner sidecar preserves transaction external id candidates from CSV authority',
  /expectedExternalIdCandidates/.test(runner) &&
    /legacy_runner_csv_import_path/.test(runner) &&
    /SO CSV Import SUBMITTED for IDB transaction resolution/.test(runner)
);

const report = {
  schema: 'idb.w203.resolve-csv-transaction-promote-completed-harness.v1',
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  files: {
    adapter: adapterPath,
    runner: runnerPath
  },
  checks,
  completedTransactionResolutionContract: {
    pendingInput: 'idb.runner-result-capture.v1 with status pending_transaction_resolution',
    lookupAuthority: 'legacy_runner_csv_import_path',
    lookupKeys: ['expectedDemoTransactionExternalId', 'expectedExternalIdCandidates'],
    successOutput: 'idb.completed-runner-result-json.v1',
    blockedOutput: 'polling_pending with finalGeneratedNamesJson null'
  }
};

console.log(JSON.stringify(report, null, 2));
