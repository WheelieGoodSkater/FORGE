const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const writerPath = path.join(root, 'netsuite', 'idb_governed_runner_result_writer_w192.js');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const dataPath = path.join(root, 'data', 'w193_idb_polls_completed_result_imports_final_urls.json');
const tracePath = path.join(root, 'trace_samples', 'w193_idb_polls_completed_result_imports_final_urls_trace.json');
const reportPath = path.join(root, 'reports', 'w193_idb_polls_completed_result_imports_final_urls.md');

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
    URLSearchParams,
    Blob: function Blob() {},
    Promise,
    fetch: () => Promise.reject(new Error('live fetch disabled in W193 harness')),
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

function loadWriter(savedFiles) {
  let exported = null;
  const modules = {
    'N/file': {
      Type: { JSON: 'JSON' },
      create: (options) => ({
        name: options.name,
        folder: options.folder,
        contents: options.contents,
        save: () => {
          const id = String(1900 + savedFiles.length);
          savedFiles.push(Object.assign({ id }, options));
          return id;
        }
      })
    },
    'N/log': { audit: () => {}, error: () => {} }
  };
  const sandbox = {
    console,
    JSON,
    Date,
    String,
    Number,
    RegExp,
    Array,
    Object,
    define: (deps, factory) => {
      exported = factory(...deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(writerPath, 'utf8'), sandbox, { filename: writerPath });
  return exported;
}

function loadW191Adapter(captureFiles) {
  let exported = null;
  const files = captureFiles || [];
  const modules = {
    'N/runtime': { accountId: 'SANDBOX_ACCOUNT_ID', getCurrentScript: () => ({ getParameter: () => '' }) },
    'N/task': { TaskType: { SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT' }, create: () => ({ submit: () => 'not-called' }) },
    'N/log': { audit: () => {}, error: () => {} },
    'N/file': {
      load: ({ id }) => {
        const match = files.find((file) => String(file.id) === String(id));
        if (!match) throw new Error(`file ${id} not found`);
        return { id: match.id, name: match.name, getContents: () => match.contents };
      }
    },
    'N/search': {
      create: (options) => ({
        run: () => ({
          getRange: () => files
            .filter((file) => String(file.folder) === '678')
            .filter((file) => JSON.stringify(options.filters || []).includes(file.runnerTaskId) || JSON.stringify(options.filters || []).includes(file.idempotencyToken))
            .map((file) => ({
              id: file.id,
              name: file.name,
              getValue: ({ name }) => {
                if (name === 'internalid') return file.id;
                if (name === 'name') return file.name;
                if (name === 'modified') return '2026-05-17T12:00:00.000Z';
                return '';
              }
            }))
        })
      })
    }
  };
  const sandbox = {
    console,
    JSON,
    Date,
    String,
    RegExp,
    Array,
    Object,
    define: (deps, factory) => {
      exported = factory(...deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(adapterPath, 'utf8'), sandbox, { filename: adapterPath });
  return exported;
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
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_pending_result_capture',
      queueSubmitted: true,
      runnerTaskId: 'task_w193_ariat_001',
      idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: 'task_w193_ariat_001',
        resultCaptureCursor: 'cursor_w193_initial'
      },
      finalGeneratedNamesJson: null
    },
    integratedBuildAdapterConfig: {
      endpointUrl: '',
      adapterApproved: true,
      approvedEndpointMode: 'approved_server_adapter_only',
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      currentSandboxAccount: 'TD3021666',
      idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES'
    },
    integratedBuildOperatorApproval: {
      operatorName: 'Operator User',
      currentSandboxAccount: 'TD3021666',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      confirmedSandboxAccount: true,
      endpointConfirmed: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL'
    },
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
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function completedResultInput(overrides) {
  return Object.assign({
    resultCaptureFolderId: '678',
    runnerTaskId: 'task_w193_ariat_001',
    idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
    prospect: 'Ariat International',
    records: {
      customer: { type: 'customer', name: 'Ariat International Outdoor Retail Account', internalId: '91201', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=91201' },
      demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: '91202', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=91202' },
      heroItem: { type: 'inventoryitem', name: 'Ariat International Style SKU', internalId: '91203', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91203' },
      matrixProofItem: { type: 'matrixitem', name: 'Ariat International Style Matrix Availability Flow', internalId: '91204', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91204' },
      componentItems: [{ type: 'inventoryitem', name: 'Ariat International Size Color SKU', internalId: '91205', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91205' }]
    }
  }, overrides || {});
}

function w191Config() {
  return {
    schema: 'idb.governed-runner-runtime-config.v1',
    accountId: 'SANDBOX_ACCOUNT_ID',
    createEnabled: true,
    governedSandboxWriteEnabled: true,
    queueSubmitEnabled: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    runnerScriptId: 'customscript_scai_so_csv_runner',
    runnerDeployId: 'customdeploy_scai_so_csv_runner',
    mappingId: '112',
    folderId: '345',
    subsidiaryId: '1',
    locationId: '7',
    workCenterSearchId: '',
    resultCaptureFolderId: '678'
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const savedFiles = [];
  const writer = loadWriter(savedFiles);
  const writeResult = writer.writeCompletedRunnerResult(completedResultInput());
  const captureFiles = savedFiles.map((file) => ({
    id: file.id,
    folder: String(file.folder),
    name: file.name,
    runnerTaskId: writeResult.runnerTaskId,
    idempotencyToken: writeResult.idempotencyToken,
    contents: file.contents
  }));
  const w191Adapter = loadW191Adapter(captureFiles);
  const pollEnvelopeFromW191 = w191Adapter._test.buildResultCapturePollEnvelope({
    runnerTaskId: writeResult.runnerTaskId,
    idempotencyToken: writeResult.idempotencyToken,
    resultCaptureCursor: 'cursor_w193_initial',
    expectedResultSchema: 'idb.completed-runner-result-json.v1'
  }, w191Config(), {
    file: {
      load: ({ id }) => {
        const match = captureFiles.find((file) => String(file.id) === String(id));
        return { id: match.id, name: match.name, getContents: () => match.contents };
      }
    },
    search: {
      create: (options) => ({
        run: () => ({
          getRange: () => captureFiles
            .filter((file) => String(file.folder) === '678')
            .filter((file) => JSON.stringify(options.filters || []).includes(file.runnerTaskId) || JSON.stringify(options.filters || []).includes(file.idempotencyToken))
            .map((file) => ({
              id: file.id,
              name: file.name,
              getValue: ({ name }) => name === 'internalid' ? file.id : name === 'name' ? file.name : ''
            }))
        })
      })
    }
  }, []);

  const pendingNoMutation = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      executePoll: true,
      transport: () => ({
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'polling_pending',
        runnerTaskId: writeResult.runnerTaskId,
        idempotencyToken: writeResult.idempotencyToken,
        resultCapture: { status: 'pending_runner_completion', runnerTaskId: writeResult.runnerTaskId },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      })
    }
  );
  const completedWaitingForImport = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      executePoll: true,
      transport: () => pollEnvelopeFromW191,
      operatorChoseImport: false
    }
  );
  const imported = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      executePoll: true,
      transport: () => pollEnvelopeFromW191,
      operatorChoseImport: true
    }
  );
  const malformedWrite = writer.writeCompletedRunnerResult(completedResultInput({
    runnerTaskId: 'task_w193_bad_001',
    records: {
      customer: { type: 'customer', name: 'Ariat Placeholder Account', internalId: 'REPLACE_REAL_CUSTOMER_ID', url: '/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID' }
    }
  }));

  const results = [];
  assertCase(results, 'w193_w192_writer_saved_capture_for_w191_poll', writeResult.saved === true && writeResult.completedRunnerResultJson.schema === 'idb.completed-runner-result-json.v1', JSON.stringify(writeResult));
  assertCase(results, 'w193_w191_poll_returns_completed_result', pollEnvelopeFromW191.status === 'completed_runner_result_ready' && pollEnvelopeFromW191.finalGeneratedNamesJson.records.customer.internalId === '91201', JSON.stringify(pollEnvelopeFromW191.finalGeneratedNamesJson.records.customer));
  assertCase(results, 'w193_pending_poll_non_mutating', pendingNoMutation.status !== 'completed_result_imported_final_urls_ready' && !pendingNoMutation.statePatch.dccFinalNamingResult && pendingNoMutation.mutationGuard.drawerWritesAttempted === false, JSON.stringify(pendingNoMutation.status));
  assertCase(results, 'w193_completed_waits_for_import_choice', completedWaitingForImport.status === 'completed_result_ready_waiting_for_import_choice' && completedWaitingForImport.importGuard.completedResultAcceptedByW151 === true && !completedWaitingForImport.statePatch.dccFinalNamingResult, JSON.stringify(completedWaitingForImport.importGuard));
  assertCase(results, 'w193_import_commits_final_urls_to_idb', imported.status === 'completed_result_imported_final_urls_ready' && imported.statePatch.dccFinalNamingResult && imported.buildAndRunAfterImport.buildShowsImportedNames === true && imported.buildAndRunAfterImport.runShowsImportedNames === true, JSON.stringify(imported.buildAndRunAfterImport));
  assertCase(results, 'w193_verified_open_links_ready_after_import', imported.buildAndRunAfterImport.verifiedOpenLinkCount >= 5 && imported.buildAndRunAfterImport.requiredRecordsReady === true && imported.visualTestingDecision.targetedOpenLinkTestingReady === true, JSON.stringify(imported.buildAndRunAfterImport));
  assertCase(results, 'w193_malformed_result_blocked_before_capture', malformedWrite.saved === false && malformedWrite.errors.some((error) => /numeric|demoTransaction/.test(error)), JSON.stringify(malformedWrite.errors));
  assertCase(results, 'w193_no_drawer_write_boundaries_preserved', imported.noRegression.noDrawerWrites === true && imported.noRegression.noDrawerTransactionWrites === true && imported.noRegression.noDirectDrawerSuiteScriptInvocationOutsideApprovedAdapterPath === true, JSON.stringify(imported.noRegression));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w193-idb-polls-completed-result-imports-final-urls.v1',
    status: pass ? 'PASS' : 'FAIL',
    decision: pass ? 'PASS_IDB_POLLS_W191_W192_RESULT_AND_IMPORTS_FINAL_URLS' : 'FAIL_W193_IDB_POLL_IMPORT',
    pollingImportContract: {
      pollSource: 'W190 Check runner result control',
      pollEndpoint: 'W191 W144 Suitelet action poll_runner_result_capture',
      resultCaptureSource: 'W192 governed runner result writer File Cabinet JSON',
      importGuard: 'W151 completed runner result import guard',
      commitTarget: 'state.dccFinalNamingResult',
      activeOpenLinksBeforeImport: 0,
      activeOpenLinksAfterImport: imported.buildAndRunAfterImport.verifiedOpenLinkCount
    },
    completedResultEnvelope: {
      w192FileName: writeResult.fileName,
      w191Status: pollEnvelopeFromW191.status,
      completedResultJson: pollEnvelopeFromW191.finalGeneratedNamesJson
    },
    guardedHarness: {
      pendingPollNonMutating: pendingNoMutation.status !== 'completed_result_imported_final_urls_ready',
      completedPollRequiresImportChoice: completedWaitingForImport.status === 'completed_result_ready_waiting_for_import_choice',
      w151AcceptedCompletedJson: imported.importGuard.completedResultAcceptedByW151 === true,
      importCommittedFinalUrls: imported.status === 'completed_result_imported_final_urls_ready',
      buildShowsRealImportedNames: imported.buildAndRunAfterImport.buildShowsImportedNames === true,
      runShowsRealImportedNames: imported.buildAndRunAfterImport.runShowsImportedNames === true,
      verifiedOpenLinksReady: imported.buildAndRunAfterImport.verifiedOpenLinkCount >= 5,
      malformedResultBlocked: malformedWrite.saved === false,
      noDrawerWrites: true,
      noDrawerTransactionWrites: true
    },
    traceSamples: [
      {
        event: 'w193_w192_result_capture_written',
        fileName: writeResult.fileName,
        runnerTaskId: writeResult.runnerTaskId,
        idempotencyToken: writeResult.idempotencyToken,
        activeOpenLinks: 0
      },
      {
        event: 'w193_w191_poll_completed_result',
        status: pollEnvelopeFromW191.status,
        resultCaptureStatus: pollEnvelopeFromW191.resultCapture.status,
        completedResultAcceptedByW151: imported.importGuard.completedResultAcceptedByW151,
        activeOpenLinksBeforeImport: 0
      },
      {
        event: 'w193_final_urls_imported_into_idb',
        status: imported.status,
        verifiedOpenLinkCount: imported.buildAndRunAfterImport.verifiedOpenLinkCount,
        buildShowsImportedNames: imported.buildAndRunAfterImport.buildShowsImportedNames,
        runShowsImportedNames: imported.buildAndRunAfterImport.runShowsImportedNames
      }
    ],
    visualTestingDecision: {
      targetedOpenLinkTestingReady: imported.visualTestingDecision.targetedOpenLinkTestingReady === true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'After W193 import, the only visual test needed is targeted clicking of the five imported Open links. Broad drawer visual testing remains blocked/not needed.'
    },
    noRegression: imported.noRegression,
    bestNextCodexPrompt: {
      block: 'W194: Targeted Real Imported Open-Link Verification From W193',
      prompt: 'Move through W194: Targeted Real Imported Open-Link Verification From W193. Use the W193 imported final URLs from real W191/W192 result capture to run only the targeted operator visual verification: click Customer, demo transaction, hero item, matrix/proof item, and component item Open links, prove each lands on an actual NetSuite record page, and reject Notice/Error/placeholder pages. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and do not broaden visual testing. Output exact operator steps, screenshots needed, pass/fail evidence review, trace samples, W194 report, and production-readiness next prompt.'
    },
    harnessResults: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  fs.writeFileSync(reportPath, [
    '# W193: IDB Polls Completed Result And Imports Final URLs',
    '',
    `Decision: ${contract.decision}`,
    '',
    '## Polling Import Contract',
    '- W190 Check runner result polls the W191 result-capture endpoint.',
    '- W191 reads W192 File Cabinet result capture JSON by runnerTaskId/idempotency token.',
    '- W151 validates numeric ids, supported NetSuite URLs, and internal runner ownership.',
    '- IDB commits final names locally only after import; the drawer creates no records and performs no transaction writes.',
    '',
    '## Guarded Harness',
    '```json',
    JSON.stringify(contract.guardedHarness, null, 2),
    '```',
    '',
    '## Visual Testing Decision',
    contract.visualTestingDecision.reason,
    '',
    '## Best Next Codex Prompt',
    contract.bestNextCodexPrompt.prompt,
    ''
  ].join('\n'));

  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
  console.log(`W193 IDB poll/import final URLs: ${contract.decision}; openLinks=${imported.buildAndRunAfterImport.verifiedOpenLinkCount}`);
}

main();
