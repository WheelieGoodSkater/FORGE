const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w187Path = path.join(root, 'data', 'w187_completed_runner_result_import_commit_from_poll_cta.json');
const dataPath = path.join(root, 'data', 'w188_imported_final_url_targeted_operator_verification_from_build_return.json');
const tracePath = path.join(root, 'trace_samples', 'w188_imported_final_url_targeted_operator_verification_from_build_return_trace.json');
const reportPath = path.join(root, 'reports', 'w188_imported_final_url_targeted_operator_verification_from_build_return.md');

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

function fallbackState() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    activeView: 'review',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: '',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    toggles: {},
    acceptedPacket: null,
    dccFinalNamingResult: null,
    integratedBuildRunnerResult: null,
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: new Date().toISOString()
    }
  };
}

function buildContext(hooks) {
  const state = fallbackState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function completedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: { type: 'customer', name: 'Ariat International Outdoor Retail Account', internalId: 501234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234' },
      demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
      heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
      matrixProofItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
      componentItem: { type: 'inventoryitem', name: 'Ariat Brown Leather Upper Component', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }
    },
    demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
    heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
    matrixItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
    componentItems: [{ type: 'inventoryitem', name: 'Ariat Brown Leather Upper Component', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }]
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const w187 = readJson(w187Path);
  const completedResult = completedRunnerResultJson();
  const packet = hooks.importedFinalUrlTargetedOperatorVerificationPacketFromBuildReturnV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      importCommit: w187.samples.completed,
      completedResultJson: completedResult
    }
  );
  const blockedPacket = hooks.importedFinalUrlTargetedOperatorVerificationPacketFromBuildReturnV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      importCommit: w187.samples.pending,
      completedResultJson: null
    }
  );

  const roles = packet.targetedRecords.map((record) => record.role);
  const results = [];
  assertCase(results, 'w188_packet_ready_after_w187_commit', packet.status === 'imported_final_url_targeted_operator_verification_packet_ready', packet.status);
  assertCase(results, 'w188_requires_w151_valid_imported_urls', packet.source.commitAllowed === true && packet.source.w151CompletedResultAccepted === true && packet.targetedRecords.every((record) => record.numericId && record.supportedUrl && record.openable), JSON.stringify(packet.source));
  assertCase(results, 'w188_covers_five_targeted_records', ['customer', 'sales_order', 'hero_item', 'matrix_or_proof_item', 'component_item'].every((role) => roles.includes(role)) && packet.targetedRecords.length === 5, JSON.stringify(roles));
  assertCase(results, 'w188_exact_operator_steps_ready', packet.exactOperatorSteps.length === 6 && packet.exactOperatorSteps.slice(1).every((step) => step.screenshotRequired === true && /Click/.test(step.action)), JSON.stringify(packet.exactOperatorSteps));
  assertCase(results, 'w188_screenshot_packet_ready', packet.screenshotsNeeded.length === 7 && packet.screenshotsNeeded.filter((shot) => shot.filenameHint).length === 5, JSON.stringify(packet.screenshotsNeeded));
  assertCase(results, 'w188_fail_criteria_ready', packet.failCriteria.some((item) => /Notice, Error, Invalid number/.test(item)) && packet.failCriteria.some((item) => /drawer action attempts/.test(item)), JSON.stringify(packet.failCriteria));
  assertCase(results, 'w188_blocked_without_w187_import', blockedPacket.status === 'imported_final_url_targeted_operator_verification_packet_blocked' && blockedPacket.source.commitAllowed === false, JSON.stringify(blockedPacket.source));
  assertCase(results, 'w188_broader_visual_blocked_targeted_only', packet.visualTestingDecision.targetedOnly === true && packet.visualTestingDecision.broaderVisualNetSuiteTestingRequired === false, JSON.stringify(packet.visualTestingDecision));
  assertCase(results, 'w188_no_regression_preserved', packet.noRegression.noDrawerWrites === true && packet.noRegression.noDrawerTransactionWrites === true && packet.noRegression.noDrawerCreatedRecords === true && packet.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true && packet.noRegression.noActiveOpenLinksWithoutRealUrls === true, JSON.stringify(packet.noRegression));

  const guardedHarness = {
    packetReadyAfterW187Import: results.find((result) => result.name === 'w188_packet_ready_after_w187_commit').pass,
    requiresW151ValidNumericIdsAndSupportedUrls: results.find((result) => result.name === 'w188_requires_w151_valid_imported_urls').pass,
    coversCustomerTransactionHeroMatrixComponent: results.find((result) => result.name === 'w188_covers_five_targeted_records').pass,
    exactOperatorStepsReady: results.find((result) => result.name === 'w188_exact_operator_steps_ready').pass,
    screenshotsNeededReady: results.find((result) => result.name === 'w188_screenshot_packet_ready').pass,
    failCriteriaReady: results.find((result) => result.name === 'w188_fail_criteria_ready').pass,
    blockedWithoutW187Import: results.find((result) => result.name === 'w188_blocked_without_w187_import').pass,
    targetedOnlyBroaderVisualBlocked: results.find((result) => result.name === 'w188_broader_visual_blocked_targeted_only').pass,
    noRegressionPreserved: results.find((result) => result.name === 'w188_no_regression_preserved').pass
  };

  const contract = {
    schema: 'idb.w188-imported-final-url-targeted-operator-verification-from-build-return.v1',
    status: results.every((result) => result.pass)
      ? 'imported_final_url_targeted_operator_verification_ready'
      : 'imported_final_url_targeted_operator_verification_failed',
    operatorVerificationPacket: packet,
    exactOperatorSteps: packet.exactOperatorSteps,
    screenshotsNeeded: packet.screenshotsNeeded,
    guardedHarness,
    samples: {
      ready: packet,
      blocked: blockedPacket
    },
    visualTestingDecision: {
      targetedOnly: true,
      broaderVisualNetSuiteTestingRequired: false,
      decision: 'targeted_only_open_link_verification',
      reason: 'Only the five W151-valid imported final URLs should be visually verified. Broader NetSuite testing remains blocked.'
    },
    bestNextCodexPrompt: {
      block: 'W189: Targeted Open-Link Visual Evidence Intake And Pass/Fail Review',
      prompt: 'Move through W189: Targeted Open-Link Visual Evidence Intake And Pass/Fail Review. Use the W188 targeted operator verification packet and uploaded screenshots/trace evidence to review whether Customer, demo transaction, hero item, matrix/proof item, and component item Open links landed on actual NetSuite record pages. Mark pass only if each page is not Notice/Error/placeholder and shows numeric-id supported NetSuite URL plus record identity. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no SuiteScript invocation outside approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no broader visual testing. Output evidence review, pass/fail table, trace samples, W189 report, broader visual testing decision, and best next Codex prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w188-imported-final-url-targeted-operator-verification-from-build-return-trace.v1',
    readyTrace: packet.traceSamples,
    blockedTrace: blockedPacket.traceSamples,
    targetedRecords: packet.targetedRecords,
    results
  };

  const screenshotRows = packet.screenshotsNeeded.map((shot) => `| ${shot.label} | ${(shot.mustShow || []).join('; ')} | ${shot.optional ? 'Optional' : 'Required'} |`).join('\n');
  const stepRows = packet.exactOperatorSteps.map((step) => `| ${step.step} | ${step.action} | ${(step.passCriteria || []).join('; ')} |`).join('\n');
  const report = `# W188 Imported Final URL Targeted Operator Verification Packet From Build Return

Decision: ${contract.status}

## Exact Operator Steps

| Step | Action | Pass Criteria |
| --- | --- | --- |
${stepRows}

## Screenshots Needed

| Screenshot | Must Show | Required |
| --- | --- | --- |
${screenshotRows}

## Guarded Harness

| Gate | Result |
| --- | --- |
| Packet ready after W187 import | ${guardedHarness.packetReadyAfterW187Import ? 'PASS' : 'FAIL'} |
| Requires W151-valid numeric ids and supported URLs | ${guardedHarness.requiresW151ValidNumericIdsAndSupportedUrls ? 'PASS' : 'FAIL'} |
| Covers five targeted records | ${guardedHarness.coversCustomerTransactionHeroMatrixComponent ? 'PASS' : 'FAIL'} |
| Exact operator steps ready | ${guardedHarness.exactOperatorStepsReady ? 'PASS' : 'FAIL'} |
| Screenshot list ready | ${guardedHarness.screenshotsNeededReady ? 'PASS' : 'FAIL'} |
| Fail criteria ready | ${guardedHarness.failCriteriaReady ? 'PASS' : 'FAIL'} |
| Blocked without W187 import | ${guardedHarness.blockedWithoutW187Import ? 'PASS' : 'FAIL'} |
| Broader visual testing blocked | ${guardedHarness.targetedOnlyBroaderVisualBlocked ? 'PASS' : 'FAIL'} |
| No-regression boundaries preserved | ${guardedHarness.noRegressionPreserved ? 'PASS' : 'FAIL'} |

## Visual Testing Decision

Targeted-only: click Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Broader visual NetSuite testing remains blocked.

## Trace Samples

- ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!results.every((result) => result.pass)) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W188 imported final URL targeted operator verification failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W188 imported final URL targeted operator verification: ${contract.status}; records=${packet.targetedRecords.length}; screenshots=${packet.screenshotsNeeded.length}`);
}

main();
