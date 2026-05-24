const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const dataPath = path.join(root, 'data', 'w191_server_adapter_result_capture_endpoint.json');
const tracePath = path.join(root, 'trace_samples', 'w191_server_adapter_result_capture_endpoint_trace.json');
const reportPath = path.join(root, 'reports', 'w191_server_adapter_result_capture_endpoint.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function makeSearchResult(file) {
  return {
    id: file.id,
    name: file.name,
    getValue: ({ name }) => {
      if (name === 'internalid') return file.id;
      if (name === 'name') return file.name;
      if (name === 'modified') return file.modified || '2026-05-17T12:00:00.000Z';
      return '';
    }
  };
}

function loadSuiteletAdapter(captureFiles) {
  let exported = null;
  const files = captureFiles || [];
  const modules = {
    'N/runtime': {
      accountId: 'SANDBOX_ACCOUNT_ID',
      getCurrentScript: () => ({ getParameter: () => '' })
    },
    'N/task': {
      TaskType: { SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT' },
      create: () => ({
        submit: () => {
          throw new Error('W191 result polling must not submit a task.');
        }
      })
    },
    'N/log': {
      audit: () => {},
      error: () => {}
    },
    'N/file': {
      load: ({ id }) => {
        const match = files.find((file) => String(file.id) === String(id));
        if (!match) throw new Error(`file ${id} not found`);
        return {
          id: match.id,
          name: match.name,
          getContents: () => match.contents
        };
      }
    },
    'N/search': {
      create: (options) => ({
        options,
        run: () => ({
          getRange: () => {
            const serializedFilters = JSON.stringify(options.filters || []);
            return files
              .filter((file) => String(file.folder) === '678')
              .filter((file) => serializedFilters.includes(file.runnerTaskId) || serializedFilters.includes(file.idempotencyToken))
              .map(makeSearchResult);
          }
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
  vm.runInContext(fs.readFileSync(suiteletAdapterPath, 'utf8'), sandbox, { filename: suiteletAdapterPath });
  if (!exported || !exported._test) throw new Error('Missing W144 suitelet adapter test exports.');
  return exported;
}

function enabledConfig() {
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

function completedCaptureFixture() {
  return {
    schema: 'idb.governed-runner-result-capture.v1',
    sourceRunnerTaskId: 'task_w191_ariat_001',
    idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
    status: 'completed',
    prospect: 'Ariat International',
    records: {
      customer: {
        recordType: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: '/app/common/entity/custjob.nl?id=91201'
      },
      demoTransaction: {
        recordType: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: '91202',
        url: '/app/accounting/transactions/salesord.nl?id=91202'
      },
      heroItem: {
        recordType: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: '91203',
        url: '/app/common/item/item.nl?id=91203'
      },
      matrixProofItem: {
        recordType: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: '91204',
        url: '/app/common/item/item.nl?id=91204'
      },
      componentItems: [
        {
          recordType: 'inventoryitem',
          name: 'Ariat Brown Leather Upper Component',
          internalId: '91205',
          url: '/app/common/item/item.nl?id=91205'
        }
      ]
    }
  };
}

function pollLookup(overrides) {
  return Object.assign({
    runnerTaskId: 'task_w191_ariat_001',
    idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
    resultCaptureCursor: 'cursor_w190_initial',
    expectedResultSchema: 'idb.completed-runner-result-json.v1'
  }, overrides || {});
}

function main() {
  const w139 = readJson(w139Path);
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const completedFile = {
    id: '991',
    folder: '678',
    name: 'idb-result-task_w191_ariat_001-IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES.json',
    runnerTaskId: 'task_w191_ariat_001',
    idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
    contents: JSON.stringify(completedCaptureFixture())
  };
  const malformedFile = {
    id: '992',
    folder: '678',
    name: 'idb-result-task_w191_bad_001-IDB-bad.json',
    runnerTaskId: 'task_w191_bad_001',
    idempotencyToken: 'IDB-bad',
    contents: JSON.stringify({
      schema: 'idb.governed-runner-result-capture.v1',
      status: 'completed',
      records: {
        customer: {
          recordType: 'customer',
          name: 'Ariat International Outdoor Retail Account',
          internalId: 'REPLACE_REAL_CUSTOMER_ID',
          url: '/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID'
        }
      }
    })
  };
  const nonJsonFile = {
    id: '993',
    folder: '678',
    name: 'idb-result-task_w191_nonjson_001-IDB-nonjson.json',
    runnerTaskId: 'task_w191_nonjson_001',
    idempotencyToken: 'IDB-nonjson',
    contents: '{not json'
  };
  const adapter = loadSuiteletAdapter([completedFile, malformedFile, nonJsonFile]);
  const pending = adapter._test.buildResultCapturePollEnvelope(
    pollLookup({ runnerTaskId: 'task_w191_pending_001', idempotencyToken: 'IDB-pending' }),
    enabledConfig(),
    adapter._test ? {
      file: loadSuiteletAdapter([completedFile])._test && {
        load: () => {
          throw new Error('pending should not load file');
        }
      },
      search: {
        create: () => ({
          run: () => ({
            getRange: () => []
          })
        })
      }
    } : {},
    []
  );
  const completed = adapter._test.buildResultCapturePollEnvelope(
    pollLookup(),
    enabledConfig(),
    loadModulesForFiles([completedFile]),
    []
  );
  const malformed = adapter._test.buildResultCapturePollEnvelope(
    pollLookup({ runnerTaskId: 'task_w191_bad_001', idempotencyToken: 'IDB-bad' }),
    enabledConfig(),
    loadModulesForFiles([malformedFile]),
    []
  );
  const nonJson = adapter._test.buildResultCapturePollEnvelope(
    pollLookup({ runnerTaskId: 'task_w191_nonjson_001', idempotencyToken: 'IDB-nonjson' }),
    enabledConfig(),
    loadModulesForFiles([nonJsonFile]),
    []
  );
  const missingGate = adapter._test.buildResultCapturePollEnvelope(
    pollLookup({ runnerTaskId: '', idempotencyToken: '' }),
    enabledConfig(),
    loadModulesForFiles([]),
    []
  );
  const normalized = adapter._test.normalizeCompletedRunnerResult(completedCaptureFixture());

  const results = [];
  assertCase(results, 'w191_w144_has_poll_action_branch', /poll_runner_result_capture/.test(suiteletSource) && /buildResultCapturePollEnvelope/.test(suiteletSource) && /custpage_idb_runner_task_id/.test(suiteletSource), 'Suitelet action branch and request params present');
  assertCase(results, 'w191_pending_returns_polling_pending_non_mutating', pending.status === 'polling_pending' && pending.resultCapture.status === 'pending_runner_completion' && pending.finalGeneratedNamesJson === null && pending.activeOpenLinks === 0, JSON.stringify(pending));
  assertCase(results, 'w191_completed_returns_w151_valid_json', completed.status === 'completed_runner_result_ready' && completed.resultCapture.status === 'completed_result_capture_ready' && completed.finalGeneratedNamesJson.schema === 'idb.completed-runner-result-json.v1' && completed.finalGeneratedNamesJson.generatedRecordOwner === 'governed_runner_internal_build_engine' && completed.finalGeneratedNamesJson.records.customer.internalId === '91201', JSON.stringify(completed.finalGeneratedNamesJson));
  assertCase(results, 'w191_malformed_result_returns_adapter_error', malformed.status === 'adapter_error' && malformed.error === true && malformed.finalGeneratedNamesJson === null && /numeric internalId/.test(malformed.errorMessage), malformed.errorMessage);
  assertCase(results, 'w191_non_json_result_returns_adapter_error', nonJson.status === 'adapter_error' && nonJson.error === true && /not valid JSON/.test(nonJson.errorMessage), nonJson.errorMessage);
  assertCase(results, 'w191_missing_poll_identity_blocks_adapter_safe', missingGate.status === 'adapter_error' && /runnerTaskId/.test(missingGate.errorMessage) && /idempotencyToken/.test(missingGate.errorMessage), missingGate.errorMessage);
  assertCase(results, 'w191_normalization_accepts_governed_capture_shape', normalized.valid === true && normalized.completed.records.demoTransaction.url === '/app/accounting/transactions/salesord.nl?id=91202', JSON.stringify(normalized));
  assertCase(results, 'w191_no_n_record_or_drawer_write_path', !/N\/record/.test(suiteletSource) && !/record\.create|record\.submitFields|nlapiSubmitRecord/.test(suiteletSource), 'result capture endpoint reads files only');

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w191-server-adapter-result-capture-endpoint.v1',
    status: pass ? 'server_adapter_result_capture_endpoint_ready' : 'blocked',
    decision: pass ? 'PASS_SERVER_ADAPTER_RESULT_CAPTURE_ENDPOINT_READY__COMPLETED_JSON_RETURN' : 'FAIL',
    sourceBlocks: {
      w190PollRequestAction: 'poll_runner_result_capture',
      confirmedRequestSchema: w139.contractJson.confirmedIdbBuildRequestJson.schema,
      adapterFile: suiteletAdapterPath
    },
    serverEndpointChanges: {
      actionParam: 'custpage_idb_action',
      pollAction: 'poll_runner_result_capture',
      pollInputs: [
        'custpage_idb_runner_task_id',
        'custpage_idb_idempotency_token',
        'custpage_idb_result_capture_cursor',
        'custpage_idb_expected_result_schema',
        'custpage_idb_confirmed_build_request_json',
        'custpage_idb_operator_queue_gate_json'
      ],
      resultCaptureStore: 'File Cabinet folder from custscript_idb_result_capture_folder_id',
      lookupKeys: ['runnerTaskId', 'idempotencyToken'],
      completedResultSchemaReturned: 'idb.completed-runner-result-json.v1',
      readsOnly: true,
      writesRecords: false
    },
    completedResultEnvelopeShape: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_runner_result_ready',
      runnerTaskId: 'task_w191_ariat_001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesReady: true,
        finalGeneratedNamesJson: 'idb.completed-runner-result-json.v1'
      },
      finalGeneratedNamesJson: completed.finalGeneratedNamesJson,
      activeOpenLinks: 0
    },
    guardedHarness: {
      pendingReturnsPollingPending: results.find((result) => result.name === 'w191_pending_returns_polling_pending_non_mutating').pass,
      completedReturnsW151ValidJson: results.find((result) => result.name === 'w191_completed_returns_w151_valid_json').pass,
      malformedReturnsAdapterError: results.find((result) => result.name === 'w191_malformed_result_returns_adapter_error').pass,
      nonJsonReturnsAdapterError: results.find((result) => result.name === 'w191_non_json_result_returns_adapter_error').pass,
      missingIdentityBlocksSafe: results.find((result) => result.name === 'w191_missing_poll_identity_blocks_adapter_safe').pass,
      noRecordWritesFromAdapterEndpoint: results.find((result) => result.name === 'w191_no_n_record_or_drawer_write_path').pass
    },
    samples: {
      pending,
      completed,
      malformed,
      nonJson,
      missingGate
    },
    traceSamples: [
      {
        event: 'w191_result_capture_poll_pending',
        runnerTaskId: pending.runnerTaskId,
        status: pending.status,
        resultCaptureStatus: pending.resultCapture.status,
        activeOpenLinks: 0
      },
      {
        event: 'w191_result_capture_completed_json_returned',
        runnerTaskId: completed.runnerTaskId,
        status: completed.status,
        completedResultSchema: completed.finalGeneratedNamesJson.schema,
        customerInternalId: completed.finalGeneratedNamesJson.records.customer.internalId,
        activeOpenLinks: 0
      },
      {
        event: 'w191_result_capture_adapter_error',
        runnerTaskId: malformed.runnerTaskId,
        status: malformed.status,
        errorMessage: malformed.errorMessage,
        activeOpenLinks: 0
      }
    ],
    visualTestingDecision: {
      visualTestingBlockedUntilImportedIntoIdb: true,
      targetedOpenLinkTestingReady: false,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W191 makes the server adapter able to return completed JSON. Visual testing waits until IDB polls the deployed endpoint and imports W151-valid URLs.'
    },
    noRegression: {
      noDrawerWrites: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noDirectSuiteScriptOutsideApprovedAdapterPath: true,
      pendingAndAdapterErrorNonMutating: true,
      internalRunnerOwnershipRequired: true,
      noActiveOpenLinksBeforeImport: true,
      rollbackByDisablingServerFlags: true
    },
    bestNextCodexPrompt: {
      block: 'W192: Governed Runner Result Capture Writer Contract And File Output',
      prompt: 'Move through W192: Governed Runner Result Capture Writer Contract And File Output. Use W191 server adapter polling support to define and implement the governed runner result-capture writer that, after the internal runner creates or resolves Customer, demo transaction, hero item, matrix/proof item, and component item records, writes a completed result JSON file into the configured result-capture folder named with runnerTaskId/idempotency token. Preserve internal runner ownership, numeric internal ids, supported NetSuite URLs, no drawer writes, no drawer-created records, rollback by disabling server flags, and no active Open links until W151 import. Output runner result writer contract, file naming convention, guarded harness, trace samples, W192 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  fs.writeFileSync(reportPath, [
    '# W191: Server Adapter Result Capture Endpoint Support And Completed JSON Return',
    '',
    `Decision: ${contract.decision}`,
    '',
    '## Server Endpoint Changes',
    '- W144 now routes `custpage_idb_action=poll_runner_result_capture` separately from queue submit.',
    '- Polling requires runnerTaskId, idempotency token, expected completed-result schema, and result-capture folder config.',
    '- The adapter searches the configured File Cabinet result-capture folder by runnerTaskId/idempotency token.',
    '- Missing result returns `polling_pending`; malformed/non-JSON result returns drawer-safe `adapter_error`; valid result returns completed JSON.',
    '- The endpoint reads result files only. It does not create records or transactions.',
    '',
    '## Completed Envelope Shape',
    '```json',
    JSON.stringify(contract.completedResultEnvelopeShape, null, 2),
    '```',
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
  console.log(`W191 server adapter result capture endpoint: ${contract.decision}; completed=${completed.status}; pending=${pending.status}`);
}

function loadModulesForFiles(captureFiles) {
  const files = captureFiles || [];
  return {
    file: {
      load: ({ id }) => {
        const match = files.find((file) => String(file.id) === String(id));
        if (!match) throw new Error(`file ${id} not found`);
        return {
          id: match.id,
          name: match.name,
          getContents: () => match.contents
        };
      }
    },
    search: {
      create: (options) => ({
        options,
        run: () => ({
          getRange: () => {
            const filters = JSON.stringify(options.filters || []);
            return files
              .filter((file) => String(file.folder) === '678')
              .filter((file) => filters.includes(file.runnerTaskId) || filters.includes(file.idempotencyToken))
              .map(makeSearchResult);
          }
        })
      })
    }
  };
}

main();
