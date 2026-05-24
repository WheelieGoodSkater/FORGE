const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w162Path = path.join(root, 'data', 'w162_integrated_build_result_fixture_import_commit.json');
const dataPath = path.join(root, 'data', 'w163_approved_server_adapter_result_alignment.json');
const tracePath = path.join(root, 'trace_samples', 'w163_approved_server_adapter_result_alignment_trace.json');
const reportPath = path.join(root, 'reports', 'w163_approved_server_adapter_result_alignment.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

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

function ariatState() {
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
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
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

function completedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: {
        type: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: 501234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: 601234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: 701234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
      },
      matrixProofItem: {
        type: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: 701235,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    },
    demoTransaction: {
      type: 'salesorder',
      name: 'Ariat Seasonal Footwear Availability Demo Order',
      internalId: 601234,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234'
    },
    heroItem: {
      type: 'inventoryitem',
      name: 'Ariat Terrain H2O Work Boot Hero Item',
      internalId: 701234,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
    },
    matrixItem: {
      type: 'matrixitem',
      name: 'Ariat Core Boot Size Color Matrix',
      internalId: 701235,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
    },
    componentItems: [
      {
        type: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    ]
  };
}

async function main() {
  const w162 = readJson(w162Path);
  const hooks = loadHooks();
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const completedJson = completedRunnerResultJson();
  const alignment = hooks.approvedServerAdapterResultAlignmentContractV1(state, lane, page, recommendation, {
    completedResultJson: completedJson,
    runnerTaskId: 'fixture_w163_runner_task_001'
  });
  const completedEnvelope = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId: 'fixture_w163_runner_task_001',
    resultCapture: {
      status: 'completed_result_capture_ready',
      runnerTaskId: 'fixture_w163_runner_task_001'
    },
    finalGeneratedNamesJson: completedJson,
    activeOpenLinks: 0
  };
  const commit = hooks.integratedBuildResultFixtureImportStateCommitV1(state, lane, page, recommendation, {
    completedResultJson: completedJson,
    serverResultFixture: completedEnvelope,
    handoffPacket: hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation)
  });
  const normalizedExpected = {
    queued: 'queued_pending',
    polling: 'polling_pending',
    completed: 'completed_result_awaiting_w151_import',
    error: 'adapter_transport_error_drawer_safe'
  };
  const serverAdapterResultAlignmentContract = {
    schema: 'idb.w163-server-adapter-result-alignment-contract.v1',
    startsFromW162Decision: w162.decision,
    invocationMode: alignment.invocationMode,
    normalizedStatuses: alignment.normalizedStatuses,
    completedGuardStatus: alignment.completedResult.guardStatus,
    completedCommitStatus: alignment.completedResult.commitStatus,
    openableAfterCommit: alignment.completedResult.openableAfterCommit,
    errorRecoveryStatus: alignment.errorRecovery.status,
    activeOpenLinksBeforeImport: alignment.activeOpenLinksBeforeImport
  };
  const guardedHarness = {
    startsFromW162: w162.decision === 'PASS_FIXTURE_IMPORT_COMMIT_READY__VISUAL_TESTING_BLOCKED',
    alignmentHookReady: typeof hooks.approvedServerAdapterResultAlignmentContractV1 === 'function',
    queuedPollingCompletedErrorNormalize: JSON.stringify(alignment.normalizedStatuses) === JSON.stringify(normalizedExpected),
    completedResultRequiresW151BeforeCommit: alignment.completedResult.acceptedByW151 === true && commit.commitAllowed === true && commit.importGuards.completedResultAccepted === true,
    completedResultHasNumericIdsAndUrls: alignment.completedResult.openableAfterCommit >= 5 && commit.linkAuthority.noActiveOpenLinksWithoutRealUrls === true,
    handoffRejected: alignment.rejectedInputs.handoffRejected === true && alignment.rejectedInputs.handoffStatus === 'handoff_packet_rejected',
    errorEnvelopeDrawerSafe: alignment.errorRecovery.drawerSafe === true && alignment.errorRecovery.next === 'rollback_by_disabling_server_flags_or_retry_after_adapter_review',
    noOpenLinksBeforeImport: alignment.activeOpenLinksBeforeImport === 0 && state.dccFinalNamingResult === null,
    invocationStillDisabledByDefault: alignment.invocationMode === 'disabled_by_default_contract_only'
  };
  const noRegression = {
    noDrawerWrites: alignment.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: alignment.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: alignment.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: alignment.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: alignment.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    internalRunnerOwnership: alignment.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: alignment.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: alignment.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: alignment.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noActiveOpenLinksBeforeImport: alignment.noRegression.noActiveOpenLinksBeforeImport === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W163 aligns the approved server adapter response contract only. Real invocation and visual NetSuite testing remain blocked.'
  };

  const results = [];
  assertCase(results, 'w163_starts_from_w162_import_commit', guardedHarness.startsFromW162, w162.decision);
  assertCase(results, 'w163_alignment_hook_ready', guardedHarness.alignmentHookReady && alignment.status === 'approved_server_adapter_result_contract_aligned', alignment.status);
  assertCase(results, 'w163_envelopes_normalize_to_expected_states', guardedHarness.queuedPollingCompletedErrorNormalize, JSON.stringify(alignment.normalizedStatuses));
  assertCase(results, 'w163_completed_result_requires_w151_before_commit', guardedHarness.completedResultRequiresW151BeforeCommit, JSON.stringify(alignment.completedResult));
  assertCase(results, 'w163_completed_result_requires_numeric_ids_and_urls', guardedHarness.completedResultHasNumericIdsAndUrls, JSON.stringify(commit.linkAuthority));
  assertCase(results, 'w163_handoff_json_still_rejected', guardedHarness.handoffRejected, JSON.stringify(alignment.rejectedInputs));
  assertCase(results, 'w163_error_envelope_drawer_safe', guardedHarness.errorEnvelopeDrawerSafe, JSON.stringify(alignment.errorRecovery));
  assertCase(results, 'w163_no_open_links_before_import_and_invocation_disabled', guardedHarness.noOpenLinksBeforeImport && guardedHarness.invocationStillDisabledByDefault, JSON.stringify({ activeOpenLinksBeforeImport: alignment.activeOpenLinksBeforeImport, invocationMode: alignment.invocationMode }));
  assertCase(results, 'w163_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w163-approved-server-adapter-result-alignment.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_result_alignment_ready',
    decision: failures.length ? 'FAIL' : 'PASS_SERVER_ADAPTER_RESULT_ALIGNMENT_READY__VISUAL_TESTING_BLOCKED',
    serverAdapterResultAlignmentContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W164: Approved Server Adapter Disabled Live Transport Readiness',
      prompt: 'Move through W164: Approved Server Adapter Disabled Live Transport Readiness. Use the W163 aligned server adapter result contract to wire the disabled-by-default live transport readiness path for the approved NetSuite server adapter endpoint, without enabling writes or real invocation. Prove IDB can construct the request only when the confirmed Build request, server flags, sandbox allowlist, operator approval, idempotency token, and approved endpoint mode are present; otherwise it remains no-submit. Preserve queued, polling, completed, and error response normalization into the W157-W162 path, no drawer writes, no drawer transaction writes, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing. Output disabled live transport readiness contract, guarded harness, trace samples, W164 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w163-approved-server-adapter-result-alignment-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    normalizedStatuses: alignment.normalizedStatuses,
    completedGuardStatus: alignment.completedResult.guardStatus,
    completedCommitStatus: alignment.completedResult.commitStatus,
    errorRecovery: alignment.errorRecovery,
    activeOpenLinksBeforeImport: alignment.activeOpenLinksBeforeImport,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W163 Approved Server Adapter Result Contract Alignment

Decision: ${contract.decision}

## Server Adapter Result Alignment Contract
- Starts from W162: ${serverAdapterResultAlignmentContract.startsFromW162Decision}.
- Invocation mode: ${serverAdapterResultAlignmentContract.invocationMode}.
- Queued normalizes to: ${serverAdapterResultAlignmentContract.normalizedStatuses.queued}.
- Polling normalizes to: ${serverAdapterResultAlignmentContract.normalizedStatuses.polling}.
- Completed normalizes to: ${serverAdapterResultAlignmentContract.normalizedStatuses.completed}.
- Error normalizes to: ${serverAdapterResultAlignmentContract.normalizedStatuses.error}.
- Completed guard: ${serverAdapterResultAlignmentContract.completedGuardStatus}.
- Completed commit status: ${serverAdapterResultAlignmentContract.completedCommitStatus}.
- Openable after commit: ${serverAdapterResultAlignmentContract.openableAfterCommit}.
- Error recovery status: ${serverAdapterResultAlignmentContract.errorRecoveryStatus}.
- Active Open links before import: ${serverAdapterResultAlignmentContract.activeOpenLinksBeforeImport}.

## Guarded Harness
- Envelopes normalize to expected states: ${guardedHarness.queuedPollingCompletedErrorNormalize}.
- Completed result requires W151 before commit: ${guardedHarness.completedResultRequiresW151BeforeCommit}.
- Completed result requires numeric ids and URLs: ${guardedHarness.completedResultHasNumericIdsAndUrls}.
- Handoff JSON remains rejected: ${guardedHarness.handoffRejected}.
- Error envelope drawer-safe: ${guardedHarness.errorEnvelopeDrawerSafe}.
- Invocation disabled by default: ${guardedHarness.invocationStillDisabledByDefault}.

## Visual Testing Decision
Blocked. ${visualTestingDecision.reason}

## Validator Gates
${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## No Regression
${Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Best Next Codex Prompt
${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W163 server adapter result alignment FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W163 server adapter result alignment: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
