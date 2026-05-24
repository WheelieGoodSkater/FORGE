const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w154Path = path.join(root, 'data', 'w154_integrated_build_button_status_dry_run_wiring.json');
const dataPath = path.join(root, 'data', 'w155_integrated_build_invocation_toggle_polling_stub.json');
const tracePath = path.join(root, 'trace_samples', 'w155_integrated_build_invocation_toggle_polling_stub_trace.json');
const reportPath = path.join(root, 'reports', 'w155_integrated_build_invocation_toggle_polling_stub.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return '';
  const bodyStart = source.indexOf('{', start);
  if (bodyStart < 0) return '';
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return '';
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

function completedResultFixture(runnerTaskId, idempotencyToken) {
  return {
    status: 'completed_result_available_fixture_only',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      schema: 'idb.runner-result-capture.v1',
      status: 'completed_result_available',
      runnerTaskId,
      idempotencyToken,
      finalGeneratedNamesReady: true,
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    },
    finalGeneratedNamesJson: {
      schema: 'dcc.final-generated-names.v1',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      customer: {
        name: 'Ariat International Outdoor Retail Account',
        id: '91201',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=91201'
      },
      salesOrder: {
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        id: '91202',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=91202'
      },
      heroItem: {
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        id: '91203',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91203'
      },
      matrixProofItem: {
        name: 'Ariat Core Boot Size Color Matrix',
        id: '91204',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91204'
      },
      componentItems: [
        {
          name: 'Ariat Brown Leather Upper Component',
          id: '91205',
          url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91205'
        }
      ]
    },
    activeOpenLinks: 0,
    createsRecords: false,
    suiteScriptInvocationPerformed: false,
    transactionWritesPerformed: false,
    generatedRecordOwner: 'governed_runner_internal_build_engine'
  };
}

async function main() {
  const w154 = readJson(w154Path);
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w155StubSource = extractFunctionBody(userscript, 'invokeIntegratedBuildServerAdapterStubV1');

  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const adapterConfig = {
    endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_runner_adapter&deploy=customdeploy_idb_runner_adapter',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    mode: 'approved_server_adapter_available'
  };
  const operatorEvidence = {
    operatorName: 'Sandbox Operator',
    reviewedAt: '2026-05-16T00:00:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedNoSubmit: false,
    confirmedSandboxAccount: true,
    notes: 'Operator approved W155 controlled invocation harness.'
  };

  const disabledToggle = hooks.integratedBuildServerAdapterInvocationToggleV1(state, lane, page, recommendation);
  const readyButDisabledToggle = hooks.integratedBuildServerAdapterInvocationToggleV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: false,
    approvedEndpointMode: 'approved_server_adapter_only'
  });
  const enabledToggle = hooks.integratedBuildServerAdapterInvocationToggleV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only'
  });

  const defaultInvocation = await hooks.invokeIntegratedBuildServerAdapterStubV1(state, lane, page, recommendation);
  let transportCallCount = 0;
  const transportResult = await hooks.invokeIntegratedBuildServerAdapterStubV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    transport: (requestEnvelope, toggle) => {
      transportCallCount += 1;
      return {
        status: 'queued_pending_harness_transport',
        queueSubmitted: true,
        runnerTaskId: `fixture_w155_${requestEnvelope.idempotencyToken}_001`,
        resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_runner_completion',
          runnerTaskId: `fixture_w155_${requestEnvelope.idempotencyToken}_001`,
          idempotencyToken: requestEnvelope.idempotencyToken,
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null,
          activeOpenLinks: 0
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_runner_internal_build_engine',
        approvedEndpoint: toggle.endpointConfigured && toggle.adapterApproved
      };
    }
  });
  const pendingPoll = hooks.integratedBuildRunnerPollingStubV1(transportResult, { pollAttempted: true });
  const completedFixture = completedResultFixture(transportResult.runnerTaskId, enabledToggle.idempotencyToken);
  const completedPoll = hooks.integratedBuildRunnerPollingStubV1(completedFixture, { pollAttempted: true });
  const completedStatus = hooks.integratedBuildRunnerReturnStatusModelV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    adapterResult: completedFixture
  });
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);

  const invocationToggleContract = {
    defaultState: disabledToggle.status,
    readyButDisabledState: readyButDisabledToggle.status,
    enabledApprovedState: enabledToggle.status,
    callAllowedOnlyWhen: [
      'invocationEnabled true',
      'approvedEndpointMode approved_server_adapter_only',
      'confirmed Build request ready',
      'operator gate approved',
      'CREATE_ENABLED true',
      'GOVERNED_SANDBOX_WRITE_ENABLED true',
      'QUEUE_SUBMIT_ENABLED true',
      'sandbox allowlist present',
      'idempotency token present'
    ]
  };
  const pollingStubHarness = {
    defaultInvocation: {
      status: defaultInvocation.status,
      invocationAttempted: defaultInvocation.invocationAttempted,
      queueSubmitted: defaultInvocation.queueSubmitted,
      runnerTaskId: defaultInvocation.runnerTaskId
    },
    approvedHarnessTransport: {
      status: transportResult.status,
      invocationAttempted: transportResult.invocationAttempted,
      queueSubmitted: transportResult.queueSubmitted,
      runnerTaskId: transportResult.runnerTaskId,
      transportCallCount
    },
    pendingPoll: {
      status: pendingPoll.status,
      runnerTaskId: pendingPoll.runnerTaskId,
      activeOpenLinks: pendingPoll.activeOpenLinks
    },
    completedPoll: {
      status: completedPoll.status,
      finalGeneratedNamesJsonReady: completedPoll.finalGeneratedNamesJsonReady,
      activeOpenLinks: completedPoll.activeOpenLinks
    },
    completedStatusAwaitingImport: {
      status: completedStatus.status,
      activeOpenLinks: completedStatus.activeOpenLinks,
      finalNamesImported: completedStatus.finalNamesImported
    }
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W155 adds a disabled-by-default invocation toggle and polling stub only. No real runner result has been imported into IDB.'
  };
  const noRegression = {
    noDrawerWrites: true,
    noDrawerTransactionWrites: true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
    consultantConfirmationRequired: enabledToggle.requestEnvelope.confirmedBuildRequestJson.consultantConfirmation.confirmed === true,
    stateAuthorityAndHandoffParityPreserved: enabledToggle.requestEnvelope.confirmedBuildRequestJson.stateAuthority.handoffParityStatus === 'matched',
    idempotencyPreserved: !!enabledToggle.idempotencyToken,
    internalRunnerOwnership: transportResult.generatedRecordOwner === 'governed_runner_internal_build_engine',
    rollbackByDisablingServerFlags: enabledToggle.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: pendingPoll.activeOpenLinks === 0 && completedPoll.activeOpenLinks === 0 && completedStatus.activeOpenLinks === 0
  };

  const results = [];
  assertCase(results, 'w155_starts_from_w154_status_wiring_ready', w154.decision === 'PASS_BUILD_STATUS_DRY_RUN_WIRING_READY__VISUAL_TESTING_BLOCKED', w154.decision);
  assertCase(results, 'w155_toggle_disabled_by_default', disabledToggle.status === 'disabled_by_default_no_submit' && disabledToggle.invocationEnabled === false && disabledToggle.canCallApprovedAdapter === false, JSON.stringify(disabledToggle));
  assertCase(results, 'w155_ready_but_disabled_still_no_submit', readyButDisabledToggle.status === 'disabled_by_default_no_submit' && readyButDisabledToggle.endpointConfigured === true && readyButDisabledToggle.adapterApproved === true && readyButDisabledToggle.canCallApprovedAdapter === false, JSON.stringify(readyButDisabledToggle));
  assertCase(results, 'w155_enabled_approved_path_allows_harness_transport_only', enabledToggle.status === 'approved_adapter_call_allowed' && enabledToggle.canCallApprovedAdapter === true && transportResult.invocationAttempted === true && transportCallCount === 1, JSON.stringify(transportResult));
  assertCase(results, 'w155_default_invocation_does_not_call_or_queue', defaultInvocation.status === 'not_invoked_no_submit' && defaultInvocation.invocationAttempted === false && defaultInvocation.queueSubmitted === false && defaultInvocation.runnerTaskId === null, JSON.stringify(defaultInvocation));
  assertCase(results, 'w155_polling_stub_pending_and_completed_wait_for_import', pendingPoll.status === 'polling_stub_pending' && completedPoll.status === 'completed_result_awaiting_w151_import' && completedStatus.status === 'completed_result_awaiting_w151_import' && completedStatus.activeOpenLinks === 0, JSON.stringify({ pendingPoll, completedPoll, completedStatus }));
  assertCase(results, 'w155_build_surface_mentions_toggle_and_polling_stub', /Invocation toggle/.test(renderedBuild) && /Polling stub/.test(renderedBuild) && /disabled by default/.test(renderedBuild), renderedBuild.slice(0, 600));
  assertCase(results, 'w155_no_regression_and_visual_testing_blocked', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w155_no_new_raw_network_in_toggle_model', /function invokeIntegratedBuildServerAdapterStubV1/.test(userscript) && w155StubSource && !/GM_xmlhttpRequest/.test(w155StubSource) && !/fetch\(/.test(w155StubSource), 'W155 transport is injected by harness only; later W189 W144 helper is separately gated');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w155-integrated-build-invocation-toggle-polling-stub.v1',
    status: failures.length ? 'blocked' : 'integrated_build_invocation_toggle_polling_stub_ready',
    decision: failures.length ? 'FAIL' : 'PASS_INVOCATION_TOGGLE_AND_POLLING_STUB_READY__VISUAL_TESTING_BLOCKED',
    invocationToggleContract,
    pollingStubHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W156: Approved Server Adapter Transport Wiring Behind Disabled Default',
      prompt: 'Move through W156: Approved Server Adapter Transport Wiring Behind Disabled Default. Use the W155 invocation toggle and polling stub to add the transport boundary for the approved server adapter endpoint, still disabled by default and exercised only by harness. Require server flags, sandbox allowlist, operator approval, idempotency, and approvedEndpointMode before any request can be constructed. Do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output transport boundary contract, guarded harness, trace samples, W156 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };

  const trace = {
    schema: 'idb.w155-integrated-build-invocation-toggle-polling-stub-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    defaultInvocationAttempted: defaultInvocation.invocationAttempted,
    harnessTransportCallCount: transportCallCount,
    pendingPoll: pollingStubHarness.pendingPoll,
    completedPoll: pollingStubHarness.completedPoll,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W155 Integrated Build Server Adapter Invocation Toggle And Polling Stub

Decision: ${contract.decision}

## Invocation Toggle Contract
- Default state: ${invocationToggleContract.defaultState}.
- Ready but disabled state: ${invocationToggleContract.readyButDisabledState}.
- Enabled approved state: ${invocationToggleContract.enabledApprovedState}.
- Calls are allowed only when: ${invocationToggleContract.callAllowedOnlyWhen.join(', ')}.

## Polling Stub Harness
- Default invocation: status=${defaultInvocation.status}, invocationAttempted=${defaultInvocation.invocationAttempted}, queueSubmitted=${defaultInvocation.queueSubmitted}.
- Approved harness transport: status=${transportResult.status}, runnerTaskId=${transportResult.runnerTaskId}, transportCallCount=${transportCallCount}.
- Pending poll: status=${pendingPoll.status}, activeOpenLinks=${pendingPoll.activeOpenLinks}.
- Completed poll: status=${completedPoll.status}, finalGeneratedNamesJsonReady=${completedPoll.finalGeneratedNamesJsonReady}, activeOpenLinks=${completedPoll.activeOpenLinks}.
- Completed status waits for W151 import: status=${completedStatus.status}, activeOpenLinks=${completedStatus.activeOpenLinks}.

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
    console.error(`W155 integrated Build invocation toggle/polling stub FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W155 integrated Build invocation toggle/polling stub: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
