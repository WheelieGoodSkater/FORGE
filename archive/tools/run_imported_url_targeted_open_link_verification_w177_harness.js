const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w176Path = path.join(root, 'data', 'w176_completed_runner_result_import_commit.json');
const dataPath = path.join(root, 'data', 'w177_imported_url_targeted_open_link_verification_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w177_imported_url_targeted_open_link_verification_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w177_imported_url_targeted_open_link_verification_packet.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function loadHooks() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
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
    Promise,
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
      setInterval: () => 1,
      clearInterval: () => {},
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

function main() {
  const w176 = readJson(w176Path);
  const hooks = loadHooks();
  const commit = w176.samples.commit;
  const pending = w176.samples.pendingNoCommit;
  const adapterError = w176.samples.adapterErrorNoCommit;
  const packet = hooks.importedUrlTargetedOpenLinkVerificationPacketV1(commit, {
    pendingAndAdapterErrorNoMutationPreserved:
      pending.commitAllowed === false &&
      adapterError.commitAllowed === false &&
      pending.mutationGuard.pendingFinalNamesMutated === false &&
      adapterError.mutationGuard.adapterErrorFinalNamesMutated === false
  });

  const targetedRecordRoles = packet.targetedRecords.map((record) => record.role);
  const requiredRoles = ['customer', 'sales_order', 'hero_item', 'matrix_or_proof_item', 'component_item'];
  const operatorEvidenceTemplate = packet.targetedRecords.map((record) => ({
    role: record.role,
    label: record.label,
    name: record.name,
    id: record.id,
    clickUrl: record.url,
    expectedPath: record.expectedPath,
    screenshotName: `w177-${record.role}-${record.id}.png`,
    operatorResult: 'pending_operator_click',
    passOnlyIf: record.evidenceRequired
  }));
  const guardedHarness = {
    startsFromW176: w176.decision === 'PASS_COMPLETED_RUNNER_RESULT_IMPORT_COMMIT_READY__BUILD_RUN_URLS_READY__VISUAL_TESTING_BLOCKED',
    packetHookReady: typeof hooks.importedUrlTargetedOpenLinkVerificationPacketV1 === 'function',
    targetedPacketReady: packet.status === 'targeted_open_link_verification_packet_ready',
    coversFiveRequiredRecords: packet.targetedRecords.length === 5 && requiredRoles.every((role) => targetedRecordRoles.includes(role)),
    allRecordsHaveNumericIdsAndSupportedUrls: packet.targetedRecords.every((record) => record.numericId === true && record.supportedUrl === true && record.openable === true),
    operatorStepsReady: packet.operatorSteps.length === 5 && packet.operatorSteps.every((step) => step.screenshotRequired === true && /Click the .* Open link/.test(step.action)),
    pendingAndAdapterErrorNoMutationPreserved: packet.noRegression.pendingAndAdapterErrorNoMutationPreserved === true,
    broaderVisualTestingBlocked: packet.visualTestingDecision.targetedOpenLinkVerificationRequired === true &&
      packet.visualTestingDecision.broaderVisualNetSuiteTestingRequired === false &&
      packet.verificationScope.broaderVisualTestingBlocked === true,
    traceSamplesReady: Array.isArray(packet.traceSamples) &&
      packet.traceSamples.length >= 3 &&
      packet.traceSamples.some((sample) => sample.event === 'w177_visual_scope_decision')
  };
  const noRegression = {
    noDrawerWrites: packet.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: packet.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath:
      packet.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: packet.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: packet.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: packet.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: packet.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: packet.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: packet.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };
  const visualTestingDecision = {
    targetedOnly: true,
    targetedOpenLinkVerificationRequired: packet.visualTestingDecision.targetedOpenLinkVerificationRequired,
    broaderVisualNetSuiteTestingRequired: false,
    exactScreenshotsRequired: packet.screenshotPacket.requiredScreenshots.length,
    reason: 'W177 allows only the five imported Open-link landing checks. No broad NetSuite visual sweep is requested.'
  };

  const results = [];
  assertCase(results, 'w177_starts_from_w176_import_commit', guardedHarness.startsFromW176, w176.decision);
  assertCase(results, 'w177_packet_hook_ready', guardedHarness.packetHookReady, 'importedUrlTargetedOpenLinkVerificationPacketV1');
  assertCase(results, 'w177_targeted_packet_ready', guardedHarness.targetedPacketReady, packet.status);
  assertCase(results, 'w177_covers_customer_transaction_hero_matrix_component', guardedHarness.coversFiveRequiredRecords, targetedRecordRoles.join(','));
  assertCase(results, 'w177_numeric_ids_and_supported_urls_ready', guardedHarness.allRecordsHaveNumericIdsAndSupportedUrls, JSON.stringify(packet.targetedRecords));
  assertCase(results, 'w177_exact_operator_steps_ready', guardedHarness.operatorStepsReady, JSON.stringify(packet.operatorSteps));
  assertCase(results, 'w177_pending_error_no_mutation_preserved', guardedHarness.pendingAndAdapterErrorNoMutationPreserved, JSON.stringify({ pending: pending.status, adapterError: adapterError.status }));
  assertCase(results, 'w177_targeted_only_visual_decision', guardedHarness.broaderVisualTestingBlocked, JSON.stringify(packet.visualTestingDecision));
  assertCase(results, 'w177_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w177_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(packet.traceSamples));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w177-imported-url-targeted-open-link-verification-packet.v1',
    status: failures.length ? 'blocked' : 'imported_url_targeted_open_link_verification_packet_ready',
    decision: failures.length
      ? 'FAIL_IMPORTED_URL_TARGETED_OPEN_LINK_VERIFICATION_PACKET'
      : 'PASS_IMPORTED_URL_TARGETED_OPEN_LINK_VERIFICATION_PACKET_READY__TARGETED_ONLY',
    generatedAt: new Date().toISOString(),
    source: {
      w176Data: w176Path,
      w176Decision: w176.decision,
      buildSurface: commit.buildSurface,
      runSurface: commit.runSurface,
      linkAuthority: commit.linkAuthority
    },
    targetedVerificationPacket: packet,
    operatorEvidenceTemplate,
    exactOperatorSteps: [
      'Confirm IDB Build shows Build results imported and Open links for the final generated records.',
      'Click Customer Open and capture a screenshot showing URL bar plus the record page identity.',
      'Click Demo transaction Open and capture a screenshot showing URL bar plus the record page identity.',
      'Click Hero item Open and capture a screenshot showing URL bar plus the record page identity.',
      'Click Matrix/proof item Open and capture a screenshot showing URL bar plus the record page identity.',
      'Click Component item Open and capture a screenshot showing URL bar plus the record page identity.',
      'Stop and report immediately if any page shows Notice, Error, Invalid number, record does not exist, or a mismatched id.',
      'Do not test broader NetSuite UI behavior in this block.'
    ],
    guardedHarness,
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W178: Targeted Open-Link Evidence Intake And Record Landing Go/No-Go',
      prompt: 'Move through W178: Targeted Open-Link Evidence Intake And Record Landing Go/No-Go. Use the W177 targeted verification packet and the operator-provided screenshots or notes for Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Mark each link as actual_record_page_verified only if the landed NetSuite page is not Notice/Error/Invalid number and shows the matching record name or numeric internal id. If all five pass, mark imported runner URLs record-landing verified; if any fail, keep final names imported but block record-existence readiness and route remediation to runner result capture. Preserve no drawer writes, no drawer SuiteScript invocation outside the approved server adapter path, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output W178 evidence intake report, go/no-go decision, trace samples, broader visual testing decision, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w177-imported-url-targeted-open-link-verification-packet-trace.v1',
    generatedAt: contract.generatedAt,
    decision: contract.decision,
    packetTrace: packet.traceSamples,
    targetedRecords: packet.targetedRecords.map((record) => ({
      role: record.role,
      name: record.name,
      id: record.id,
      url: record.url,
      readyForTargetedClick: record.readyForTargetedClick
    })),
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W177 Imported URL Targeted Open-Link Verification Packet

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Targeted Verification Packet

- Source: W176 completed runner result import commit
- Targeted records: ${packet.targetedRecords.length}
- Targeted only: ${visualTestingDecision.targetedOnly}
- Broader visual testing required: ${visualTestingDecision.broaderVisualNetSuiteTestingRequired}
- Drawer creates records: false
- Drawer invokes SuiteScript: false

## Exact Operator Steps

${contract.exactOperatorSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Records To Verify

${packet.targetedRecords.map((record) => `- ${record.label}: ${record.name} / id=${record.id} / ${record.url}`).join('\n')}

## Screenshot Requirements

${packet.screenshotPacket.requiredScreenshots.map((item) => `- ${item.label}: ${item.filenameHint}; must show ${item.mustShow.join(', ')}`).join('\n')}

## Guarded Harness

| Gate | Result |
| --- | --- |
${Object.keys(guardedHarness).map((key) => `| ${key} | ${guardedHarness[key] ? 'PASS' : 'FAIL'} |`).join('\n')}

## Visual Testing Decision

Targeted Open-link verification is ready. Broader NetSuite visual testing remains blocked.

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`);

  console.log(`W177 imported URL targeted verification packet: ${contract.decision}; targetedOnly=${visualTestingDecision.targetedOnly}; records=${packet.targetedRecords.length}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
