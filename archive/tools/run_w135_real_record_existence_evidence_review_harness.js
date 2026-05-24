const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const traceInputPath = '/path/to/downloads/intelligent-demo-builder-trace-1778888885930.json';
const handoffInputPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1778888885366.json';
const dataPath = path.join(root, 'data', 'w135_real_record_existence_evidence_review.json');
const tracePath = path.join(root, 'trace_samples', 'w135_real_record_existence_evidence_review_trace.json');
const reportPath = path.join(root, 'reports', 'w135_real_record_existence_evidence_review.md');

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks() {
  const storage = makeStorage();
  const sandbox = {
    console,
    Date,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    URL,
    Blob: function Blob() {},
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      innerWidth: 1440
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: { innerText: '', classList: { add: () => {}, remove: () => {} } },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        remove: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: {}
      }),
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.self = sandbox.window;
  sandbox.window.top = sandbox.window;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueRecords(trace) {
  const nav = trace.dccFinalNavigationModelV1 || {};
  return arrayValue(nav.reviewObjects)
    .concat(arrayValue(nav.scriptPivotObjects))
    .filter((item, index, list) => {
      const key = `${item.role || item.label}|${item.id}|${item.url}`;
      return list.findIndex((other) => `${other.role || other.label}|${other.id}|${other.url}` === key) === index;
    });
}

function main() {
  const hooks = loadHooks();
  const trace = readJson(traceInputPath);
  const handoff = readJson(handoffInputPath);
  const records = uniqueRecords(trace).map((item) => {
    const currentAuthority = hooks.verifiedRecordLinkAuthorityV1(item);
    return {
      role: item.role || '',
      label: item.label || '',
      name: item.name || '',
      id: item.id || '',
      url: item.url || '',
      traceLinkStatus: item.linkAuthority && item.linkAuthority.status ? item.linkAuthority.status : 'unknown',
      correctedLinkStatus: currentAuthority.status,
      correctedOpenable: currentAuthority.openable,
      correctedDisplayLabel: currentAuthority.displayLabel
    };
  });
  const unresolvedReplacementTokens = records.filter((item) => /REPLACE_REAL_/i.test(`${item.id} ${item.url}`));
  const correctedOpenableCount = records.filter((item) => item.correctedOpenable).length;
  const contract = {
    schema: 'idb.w135-real-record-existence-evidence-review.v1',
    status: 'blocked_real_records_not_provided',
    decision: 'FAIL_REAL_RECORD_EXISTENCE__PLACEHOLDER_IDS_IMPORTED',
    evidenceFiles: {
      trace: traceInputPath,
      handoff: handoffInputPath
    },
    visualObservationFromUser: {
      buildAndRunRenderedImportedNames: true,
      customerClickResult: 'NetSuite Notice: Invalid number REPLACE_REAL_CUSTOMER_ID',
      otherClickResult: 'NetSuite unexpected error after opening another unresolved placeholder/result URL',
      implication: 'This W135 run did not use real internal build-engine record ids. It used replacement tokens, so record existence is not proven.'
    },
    traceEvidence: {
      exportedAt: trace.exportedAt,
      lane: trace.selectedLane && trace.selectedLane.name,
      finalNamingStatus: trace.dccFinalNamingResultV1 && trace.dccFinalNamingResultV1.status,
      finalNavigationStatus: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.status,
      originalLinkAuthoritySummary: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.linkAuthoritySummary,
      correctedOpenableCount,
      unresolvedReplacementTokenCount: unresolvedReplacementTokens.length,
      records
    },
    handoffEvidence: {
      schema: handoff.schema,
      status: handoff.status,
      executionMode: handoff.executionMode,
      noSuiteScriptInvocationFromDrawer: handoff.noRegression && handoff.noRegression.suiteScriptInvocationFromIdb === false,
      noTransactionWritesFromDrawer: handoff.noRegression && handoff.noRegression.noIdbTransactionWrite === true
    },
    remediation: [
      'Tightened drawer link authority so REPLACE_REAL_* and similar unresolved tokens cannot render active Open links.',
      'Require numeric NetSuite internal id both in the record id field and URL id query before verified_openable.',
      'Rerun W135 only after the internal build engine returns actual numeric internal ids for the required records.'
    ],
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      generatedRecordsOwnedByInternalBuildEngine: true
    },
    bestNextCodexPrompt: {
      block: 'W136: Real ID Enforcement Retest And Build Engine Output Fix',
      prompt: 'Move through W136: Real ID Enforcement Retest And Build Engine Output Fix. Use the W135 evidence showing REPLACE_REAL_* placeholder ids were imported and incorrectly appeared as Open before the link authority hardening. Verify the drawer now renders unresolved replacement ids as Link pending or Needs real URL, then update the internal build engine/operator output path so final generated names JSON contains actual numeric NetSuite internal ids and supported URLs for Customer, demo transaction, hero item, matrix/proof item, and component records. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership. Output corrected import smoke, real build-engine output requirements, trace samples, W136 report, whether targeted visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const traceOut = {
    schema: 'idb.w135-real-record-existence-evidence-review-trace.v1',
    decision: contract.decision,
    correctedOpenableCount,
    unresolvedReplacementTokenCount: unresolvedReplacementTokens.length,
    recordExistenceProven: false,
    next: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, traceOut);
  fs.writeFileSync(reportPath, `# W135 Real Record Existence Evidence Review

Status: ${contract.status}

## Decision

${contract.decision}

## Evidence Finding

- Build and Run rendered imported names.
- Customer Open reached NetSuite, but NetSuite returned: Invalid number REPLACE_REAL_CUSTOMER_ID.
- The imported final generated names JSON still contained replacement tokens, not real internal ids.
- Record existence is not proven.

## Corrected Link Authority

${records.map((item) => `- ${item.label}: ${item.name} / ${item.id} / trace=${item.traceLinkStatus} / corrected=${item.correctedLinkStatus}`).join('\n')}

## Remediation

${contract.remediation.map((item) => `- ${item}`).join('\n')}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W135 evidence review complete: ${contract.decision}; unresolvedReplacementTokenCount=${unresolvedReplacementTokens.length}; correctedOpenableCount=${correctedOpenableCount}`);
}

main();
