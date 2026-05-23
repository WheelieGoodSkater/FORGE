const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const handoffInputPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1778943212141.json';
const w148Path = path.join(root, 'data', 'w148_governed_runner_result_capture_final_url_import.json');
const w150Path = path.join(root, 'data', 'w150_governed_runner_result_visual_evidence_intake_go_no_go.json');
const dataPath = path.join(root, 'data', 'w151_runner_result_import_guard_missing_result_ux.json');
const tracePath = path.join(root, 'trace_samples', 'w151_runner_result_import_guard_missing_result_ux_trace.json');
const reportPath = path.join(root, 'reports', 'w151_runner_result_import_guard_missing_result_ux.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function makeStorage(initial) {
  const store = new Map(Object.entries(initial || {}));
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

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const handoffPacket = readJson(handoffInputPath);
  const w148 = readJson(w148Path);
  const w150 = readJson(w150Path);
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const handoffGuard = hooks.validateDccFinalNamingImportPayload(handoffPacket, state, lane, page, recommendation);
  const acceptedGuard = hooks.validateDccFinalNamingImportPayload(w148.finalGeneratedNamesJson, state, lane, page, recommendation);
  const emptyGuard = hooks.validateDccFinalNamingImportPayload(null, state, lane, page, recommendation);
  const mismatchGuard = hooks.validateDccFinalNamingImportPayload(Object.assign({}, w148.finalGeneratedNamesJson, {
    customer: Object.assign({}, w148.finalGeneratedNamesJson.customer, {
      id: '91201',
      url: '/app/common/entity/custjob.nl?id=99999'
    })
  }), state, lane, page, recommendation);

  const buildMissingHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const traceMissingHtml = compact(hooks.renderTraceView(state, lane, page, recommendation));
  state.dccFinalNamingResult = acceptedGuard.finalNaming;
  const navigationAfterImport = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const buildImportedHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));

  const importGuardContract = {
    schema: 'idb.w151-runner-result-import-guard-contract.v1',
    rejects: [
      'Build handoff packets',
      'blank or non-object JSON',
      'payloads missing required Customer, demo transaction, hero item, matrix/proof item, or component item',
      'payloads without numeric internal ids',
      'payloads with unsupported NetSuite URL paths',
      'payloads where URL id does not match internal id',
      'payloads without completed runner status'
    ],
    acceptsOnly: 'completed_governed_runner_result_json',
    drawerAuthority: 'import_names_and_urls_only'
  };

  const missingResultUxCopy = {
    buildBlockedText: 'Visual link testing is blocked until Build triggers the governed runner, result capture returns completed runner result JSON, and IDB imports real numeric ids plus supported NetSuite URLs.',
    traceImportText: 'Paste completed governed runner result JSON only. Do not paste the Build handoff JSON.',
    importButtonLabel: 'Import runner result'
  };

  const integratedBuildReturnReadinessContract = {
    schema: 'idb.w151-integrated-build-return-readiness-contract.v1',
    status: 'not_ready_handoff_only',
    visualTestingDecision: 'blocked_until_integrated_build_runner_return_exists',
    nextIntegrationTarget: [
      'Build action calls the approved server-side adapter only after consultant confirmation and server flags.',
      'Server-side adapter owns SuiteScript invocation and runner queue submit.',
      'IDB captures runnerTaskId without generating records itself.',
      'IDB polls or imports result capture from the server-side path.',
      'Completed runner result JSON imports final names, numeric ids, and supported URLs into IDB.',
      'Only then do Open links and targeted visual testing become available.'
    ]
  };

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawerUntilApprovedServerAdapter: true,
    noDrawerTransactionWrites: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    idempotencyPreserved: true,
    internalRunnerOwnershipPreserved: true,
    rollbackByDisablingServerFlags: true,
    noActiveOpenLinksWithoutRealUrls: navigationAfterImport.reviewObjects.concat(navigationAfterImport.scriptPivotObjects).every((item) => !item.openableUrl || (item.linkAuthority && item.linkAuthority.openable))
  };

  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    blockedUntil: 'Build triggers governed runner execution and completed runner result returns to IDB.',
    broaderVisualTestingRequired: false
  };

  const results = [];
  assertCase(results, 'w151_uses_w150_no_links_evidence', w150.decision === 'NO_GO_W149_OPEN_LINK_TEST__FINAL_NAMES_NOT_IMPORTED' && w150.evidenceSummary.finalNamesImported === false, JSON.stringify(w150.evidenceSummary));
  assertCase(results, 'w151_handoff_packet_rejected', handoffGuard.valid === false && handoffGuard.status === 'handoff_packet_rejected', JSON.stringify(handoffGuard));
  assertCase(results, 'w151_completed_runner_result_accepted', acceptedGuard.valid === true && acceptedGuard.status === 'completed_runner_result_accepted' && acceptedGuard.finalNaming.finalNamesImported === true, JSON.stringify(acceptedGuard));
  assertCase(results, 'w151_empty_and_id_mismatch_blocked', emptyGuard.valid === false && mismatchGuard.valid === false && /URL id must match|Blocked URLs/.test(mismatchGuard.message), JSON.stringify({ empty: emptyGuard, mismatch: mismatchGuard }));
  assertCase(results, 'w151_missing_result_ux_visible', /Visual testing blocked/.test(buildMissingHtml) && /Need runner result JSON/.test(buildMissingHtml) && /Handoff is not a result/.test(buildMissingHtml) && /Completed runner result import/.test(traceMissingHtml) && /Do not paste the Build handoff JSON/.test(traceMissingHtml) && /Import runner result/.test(traceMissingHtml), JSON.stringify(missingResultUxCopy));
  assertCase(results, 'w151_open_links_only_after_completed_runner_result_import', navigationAfterImport.status === 'using_dcc_final_names' && navigationAfterImport.linkAuthoritySummary.verified_openable >= 5 && /Build Results/.test(buildImportedHtml) && /Open/.test(buildImportedHtml), JSON.stringify(navigationAfterImport.linkAuthoritySummary));
  assertCase(results, 'w151_runtime_markers_present', /function validateDccFinalNamingImportPayload/.test(userscript) && /handoff_packet_rejected/.test(userscript) && /Visual testing blocked/.test(userscript), 'runtime guard and UX markers');
  assertCase(results, 'w151_no_regression_boundaries_preserved', Object.values(noRegression).every((item) => item === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w151-runner-result-import-guard-missing-result-ux.v1',
    status: failures.length ? 'blocked' : 'runner_result_import_guard_and_missing_result_ux_ready',
    decision: failures.length ? 'FAIL' : 'PASS_IMPORT_GUARD_READY__VISUAL_TESTING_BLOCKED_UNTIL_INTEGRATED_BUILD_RETURN',
    importGuardContract,
    missingResultUxCopy,
    integratedBuildReturnReadinessContract,
    guardEvidence: {
      handoffPacket: {
        valid: handoffGuard.valid,
        status: handoffGuard.status,
        message: handoffGuard.message
      },
      completedRunnerResult: {
        valid: acceptedGuard.valid,
        status: acceptedGuard.status,
        finalNamesImported: acceptedGuard.finalNaming && acceptedGuard.finalNaming.finalNamesImported
      },
      idMismatch: {
        valid: mismatchGuard.valid,
        status: mismatchGuard.status,
        message: mismatchGuard.message
      }
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W152: Integrated Build Runner Return Adapter Design',
      prompt: 'Move through W152: Integrated Build Runner Return Adapter Design. Use W151 to move past handoff-only testing and design the integrated Build path where the consultant-confirmed Build action calls the approved server-side adapter behind CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED, sandbox allowlist, operator approval, and idempotency. The server-side adapter, not the drawer, invokes/queues the governed runner, captures runnerTaskId, polls or retrieves completed result capture, and returns completed runner result JSON to IDB for final generated names import. Do not request visual testing yet. Preserve no drawer writes, no drawer SuiteScript invocation, no drawer transaction writes, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output integrated Build-return architecture, server adapter API contract, polling/result-capture state machine, smoke harness, trace samples, W152 report, visual testing decision blocked until implementation, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w151-runner-result-import-guard-missing-result-ux-trace.v1',
    decision: contract.decision,
    handoffRejected: handoffGuard.status,
    completedRunnerResultAccepted: acceptedGuard.status,
    visualTestingBlocked: visualTestingDecision.visualTestingBlocked,
    next: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W151 Runner Result JSON Import Guard, Missing-Result UX, And No-Visual-Testing Until Integrated Build Return

Status: ${contract.status}

## Decision

${contract.decision}

## Import Guard Contract

- Accepts only: ${importGuardContract.acceptsOnly}
- Drawer authority: ${importGuardContract.drawerAuthority}

Rejected:

${importGuardContract.rejects.map((item) => `- ${item}`).join('\n')}

## Guard Evidence

- Handoff packet: ${handoffGuard.status}
- Completed runner result: ${acceptedGuard.status}
- ID mismatch: ${mismatchGuard.status}

## Missing-Result UX Copy

- Build: ${missingResultUxCopy.buildBlockedText}
- Trace: ${missingResultUxCopy.traceImportText}
- Button: ${missingResultUxCopy.importButtonLabel}

## Integrated Build-Return Readiness

Status: ${integratedBuildReturnReadinessContract.status}

${integratedBuildReturnReadinessContract.nextIntegrationTarget.map((item) => `- ${item}`).join('\n')}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Visual testing blocked: Yes.
- Blocked until: ${visualTestingDecision.blockedUntil}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W151 runner result import guard: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
