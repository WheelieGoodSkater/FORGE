#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const dataPath = path.join(root, 'data', 'w232_build_ready_records_return.json');
const tracePath = path.join(root, 'trace_samples', 'w232_build_ready_records_return_trace.json');
const reportPath = path.join(root, 'reports', 'w232_build_ready_records_return.md');

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeJson(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, value);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
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
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live fetch disabled in W232 harness')),
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
        click: () => {},
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

function loadAdapterWithMocks(sidecarJson, salesOrderMatch) {
  let written = '';
  const scriptParams = {
    custscript_idb_create_enabled: 'T',
    custscript_idb_governed_sandbox_write_enabled: 'T',
    custscript_idb_queue_submit_enabled: 'T',
    custscript_idb_sandbox_account_allowlist: 'TD3021666',
    custscript_idb_runner_script_id: 'customscript_scai_so_csv_runner',
    custscript_idb_runner_deploy_id: 'customdeploy_scai_so_csv_runner',
    custscript_idb_runner_mapping_id: '550',
    custscript_idb_runner_folder_id: '8329',
    custscript_idb_runner_subsidiary_id: '1',
    custscript_idb_runner_location_id: '7',
    custscript_idb_runner_wc_search_id: '5005',
    custscript_idb_result_capture_folder_id: '8329'
  };
  const runtime = {
    accountId: 'TD3021666',
    getCurrentScript: () => ({
      getParameter: ({ name }) => scriptParams[name] || ''
    })
  };
  const file = {
    load: () => ({
      name: 'idb_runner_sidecar_pending_IDB_liquid_death.json',
      getContents: () => JSON.stringify(sidecarJson)
    })
  };
  const search = {
    create: ({ type }) => ({
      run: () => ({
        getRange: () => {
          if (type === 'file') {
            return [{
              id: '991',
              getValue: ({ name }) => name === 'internalid' ? '991' : 'idb_runner_sidecar_pending_IDB_liquid_death.json'
            }];
          }
          if (type === 'salesorder' && salesOrderMatch) {
            return [{
              id: String(salesOrderMatch.internalId),
              getValue: ({ name }) => {
                if (name === 'internalid') return String(salesOrderMatch.internalId);
                if (name === 'tranid') return salesOrderMatch.name;
                if (name === 'externalid') return salesOrderMatch.externalId;
                return '';
              }
            }];
          }
          return [];
        }
      })
    })
  };
  const sandbox = {
    console,
    JSON,
    String,
    Number,
    RegExp,
    Array,
    Object,
    define: (deps, factory) => {
      sandbox.adapter = factory(runtime, { create: () => ({ scriptId: '', deploymentId: '', params: {}, submit: () => 'TASK_1' }) }, { audit: () => {}, error: () => {} }, file, search);
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(adapterPath, 'utf8'), sandbox, { filename: adapterPath });
  return {
    poll(params) {
      written = '';
      sandbox.adapter.onRequest({
        request: { parameters: params || {} },
        response: { write: (body) => { written = body; } }
      });
      return JSON.parse(written || '{}');
    }
  };
}

function liquidDeathState(overrides = {}) {
  return Object.assign({
    open: true,
    selectedLaneId: 'food_beverage',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    activeView: 'review',
    setupEditMode: false,
    intake: {
      customer: 'Liquid Death',
      website: 'https://liquiddeath.com',
      notes: 'Buyer is the VP of Operations and Supply Chain. Pain: fast retail demand and distributor commitments need one view of availability, replenishment, production planning, and customer promise. Proof: show a customer order, finished canned beverage, ingredient or packaging item, replenishment flow, and WIP detail only if returned. Value: reduce manual reconciliation and protect service levels.',
      websiteEvidence: 'Website shows canned water, sparkling water, flavored sparkling water, iced tea, variety packs, and canned beverage product signals.',
      scObjective: 'Prove beverage availability and replenishment confidence across retail demand, distributor commitments, and production planning.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: true,
      enableWip: false
    },
    integratedBuildAdapterConfig: {
      endpointUrl: '',
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      productionBuildModeEnabled: true,
      mode: 'production_build_saved_admin_config'
    },
    integratedBuildOperatorApproval: {
      endpointConfirmed: true,
      confirmedSandboxAccount: true,
      currentSandboxAccount: 'TD3021666',
      operatorName: 'Saved admin config',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      reviewDecision: 'operator_approved_queue_submit',
      confirmedNoSubmit: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: '2026-05-19T20:15:00.000Z'
    }
  }, overrides);
}

function contextFromState(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function main() {
  const idempotencyToken = 'IDB-idb-build-liquid-death-food-beverage-foodmanufacturing-LIQUID_DEATH-FOOD_BEVERAGE';
  const runnerTaskId = 'SCHEDSCRIPT_REDACTED';
  const sidecar = {
    schema: 'idb.runner-result-capture.v1',
    status: 'pending_transaction_resolution',
    idempotencyToken,
    resultCaptureFolderId: 8329,
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    finalGeneratedNamesReady: false,
    transactionResolution: {
      status: 'pending_transaction_resolution',
      authority: 'legacy_runner_csv_import_path',
      expectedDemoTransactionExternalId: idempotencyToken,
      expectedExternalIdCandidates: [idempotencyToken, `IDB_SO_${idempotencyToken}`]
    },
    partialGeneratedNamesJson: {
      schema: 'idb.runner-sidecar-result-json.v1',
      status: 'pending_transaction_resolution',
      runStatus: 'pending_transaction_resolution',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      idempotencyToken,
      records: {
        customer: {
          type: 'customer',
          name: 'Liquid Death Customer Account',
          internalId: '81001',
          url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=81001'
        },
        demoTransaction: {
          type: 'salesorder',
          name: 'Liquid Death Demo Sales Order',
          internalId: '',
          url: '',
          expectedExternalId: idempotencyToken,
          externalIdCandidates: [idempotencyToken, `IDB_SO_${idempotencyToken}`]
        },
        heroItem: {
          type: 'inventoryitem',
          name: 'Liquid Death Sparkling Water Variety 12-Pack',
          internalId: '81003',
          url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=81003'
        },
        matrixProofItem: {
          type: 'inventoryitem',
          name: 'Liquid Death Canned Beverage Availability Flow',
          internalId: '81004',
          url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=81004'
        },
        componentItem: {
          type: 'inventoryitem',
          name: 'Liquid Death Packaging Component Item',
          internalId: '81005',
          url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=81005'
        }
      }
    }
  };
  const adapter = loadAdapterWithMocks(sidecar, {
    internalId: '81002',
    name: 'Sales Order LD-81002',
    externalId: idempotencyToken
  });
  const adapterPoll = adapter.poll({
    custpage_idb_action: 'poll_runner_result_capture',
    custpage_idb_runner_task_id: runnerTaskId,
    custpage_idb_idempotency_token: idempotencyToken,
    custpage_idb_expected_result_schema: 'idb.completed-runner-result-json.v1',
    custpage_idb_confirmed_build_request_json: '{}',
    custpage_idb_operator_queue_gate_json: '{}'
  });
  const hooks = loadHooks();
  const context = contextFromState(hooks, liquidDeathState({
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId,
      idempotencyToken,
      resultCapture: {
        status: 'pending_transaction_resolution',
        runnerTaskId,
        idempotencyToken
      },
      finalGeneratedNamesJson: null
    }
  }));
  const completedJson = adapterPoll.finalGeneratedNamesJson;
  const guard = hooks.validateDccFinalNamingImportPayload(completedJson, context.state, context.lane, context.page, context.recommendation);
  const pollControl = {
    schema: 'idb.approved-server-adapter-result-poll-control-implementation.v1',
    status: 'poll_control_completed_result_ready_for_w151_import',
    prerequisites: { runnerTaskIdPresent: true },
    pollRequest: { requestConstructed: true, requestSent: true },
    resultImportGuard: {
      importReady: guard.valid === true,
      completedResultAcceptedByW151: guard.valid === true,
      generatedRecordOwner: completedJson && completedJson.generatedRecordOwner,
      activeOpenLinksBeforeImport: 0
    },
    normalizedPollResponse: Object.assign({}, adapterPoll, {
      finalGeneratedNamesJson: completedJson,
      finalGeneratedNamesJsonReady: guard.valid === true
    })
  };
  const commit = hooks.completedRunnerResultImportCommitOperatorFlowV1(context.state, context.lane, context.page, context.recommendation, {
    operatorChoseImport: true,
    pollControl,
    completedResultJson: completedJson
  });
  const committedState = Object.assign({}, context.state, {
    dccFinalNamingResult: commit.statePatch && commit.statePatch.dccFinalNamingResult
  });
  const importedContext = contextFromState(hooks, committedState);
  const buildHtml = hooks.renderReviewView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation);
  const runHtml = hooks.renderRunView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation, importedContext.lane.moves[0], { id: 'prove', label: 'Prove' });
  const navigation = hooks.dccFinalNavigationModel(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation);

  const forbiddenNormalUi = /(runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages)/i;
  const results = [];
  assertCase(results, 'active_w144_promotes_pending_sidecar_after_sales_order_resolution',
    adapterPoll.status === 'completed_runner_result_ready' &&
      adapterPoll.finalGeneratedNamesJsonReady === true &&
      adapterPoll.resultCapture.transactionResolution.status === 'resolved_by_csv_import',
    JSON.stringify({ status: adapterPoll.status, tx: adapterPoll.resultCapture && adapterPoll.resultCapture.transactionResolution }));
  assertCase(results, 'completed_json_has_all_required_real_links',
    ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].every((role) => {
      const record = completedJson && completedJson.records && completedJson.records[role];
      return record && /^\d+$/.test(String(record.internalId || '')) && /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(record.url || '');
    }),
    JSON.stringify(completedJson && completedJson.records));
  assertCase(results, 'w151_guard_accepts_adapter_completed_json',
    guard.valid === true && guard.finalNaming && guard.finalNaming.finalNamesImported === true,
    guard.status);
  assertCase(results, 'bring_back_records_commit_creates_forge_final_names',
    commit.commitAllowed === true &&
      commit.statePatch &&
      commit.statePatch.dccFinalNamingResult &&
      commit.buildRunAfterCommit.verifiedOpenLinkCount >= 5,
    JSON.stringify({ commitAllowed: commit.commitAllowed, openLinks: commit.buildRunAfterCommit && commit.buildRunAfterCommit.verifiedOpenLinkCount }));
  assertCase(results, 'build_and_run_show_plain_record_names_and_open_links',
    buildHtml.includes('Liquid Death Customer Account') &&
      buildHtml.includes('Liquid Death Sparkling Water Variety 12-Pack') &&
      buildHtml.includes('Open') &&
      runHtml.includes('Open') &&
      navigation.linkAuthoritySummary.verified_openable >= 5,
    JSON.stringify(navigation.linkAuthoritySummary));
  assertCase(results, 'normal_ui_stays_consultant_safe',
    !forbiddenNormalUi.test(buildHtml) && !forbiddenNormalUi.test(runHtml),
    'Build/Run rendered without forbidden internal terms.');
  assertCase(results, 'no_drawer_write_boundaries_preserved',
    commit.noRegression &&
      commit.noRegression.noDrawerWrites === true &&
      commit.noRegression.noDrawerTransactionWrites === true &&
      commit.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    JSON.stringify(commit.noRegression));

  const passCount = results.filter((item) => item.pass).length;
  const status = passCount === results.length ? 'PASS_W232_BUILD_READY_RECORDS_RETURN' : 'FAIL_W232_BUILD_READY_RECORDS_RETURN';
  const contract = {
    schema: 'idb.w232-build-ready-records-return.v1',
    status,
    sourceTrace: '/path/to/downloads/intelligent-demo-builder-trace-1779235571802.json',
    rootCause: 'Active W144 adapter lacked pending sidecar transaction-resolution promotion, so FORGE could see build completion without a W151-valid completed result JSON to import.',
    fixContract: {
      consultantClickPath: [
        'Consultant clicks Build demo records.',
        'FORGE waits while the governed runner builds records.',
        'When the runner sidecar exists but Sales Order import is still resolving, FORGE keeps links pending.',
        'When the CSV-created Sales Order resolves, active W144 promotes the sidecar to completed runner JSON.',
        'Bring back records imports the W151-valid completed result into FORGE.',
        'Build and Run show plain record names and real Open links.'
      ],
      uploadFiles: [
        'idb-drawer.user.js',
        'netsuite/idb_governed_runner_adapter_w144_suitelet.js'
      ],
      noRegression: {
        drawerCreatesRecords: false,
        drawerTransactionWrites: false,
        directDrawerSuiteScriptOutsideApprovedAdapterPath: false,
        runnerOwnsGeneratedRecords: true,
        openLinksOnlyAfterRealUrls: true
      }
    },
    adapterPoll,
    importGuard: {
      valid: guard.valid,
      status: guard.status
    },
    committedOpenLinks: navigation.linkAuthoritySummary,
    results
  };
  const trace = {
    schema: 'idb.w232-build-ready-records-return-trace.v1',
    adapterStatus: adapterPoll.status,
    transactionResolution: adapterPoll.resultCapture && adapterPoll.resultCapture.transactionResolution,
    importedRecords: completedJson && completedJson.records,
    commitStatus: commit.status,
    verifiedOpenLinks: navigation.linkAuthoritySummary
  };
  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  writeText(reportPath, [
    '# W232 Build Ready Records Return',
    '',
    `Status: ${status} (${passCount}/${results.length})`,
    '',
    '## Root Cause',
    contract.rootCause,
    '',
    '## Consultant Path',
    ...contract.fixContract.consultantClickPath.map((step) => `- ${step}`),
    '',
    '## Upload Files',
    ...contract.fixContract.uploadFiles.map((file) => `- ${file}`),
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Visual Testing Decision',
    'No broad visual testing. This harness verifies the targeted build-ready import path and real Open-link model with mocked NetSuite adapter/search/file modules.',
    ''
  ].join('\n'));

  if (passCount !== results.length) {
    console.error(`${status}: ${passCount}/${results.length}`);
    process.exit(1);
  }
  console.log(`${status}: ${passCount}/${results.length}; openLinks=${navigation.linkAuthoritySummary.verified_openable}`);
}

main();
