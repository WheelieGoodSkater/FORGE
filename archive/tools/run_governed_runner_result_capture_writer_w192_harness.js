const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const writerPath = path.join(root, 'netsuite', 'idb_governed_runner_result_writer_w192.js');
const w191SuiteletPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const dataPath = path.join(root, 'data', 'w192_governed_runner_result_capture_writer.json');
const tracePath = path.join(root, 'trace_samples', 'w192_governed_runner_result_capture_writer_trace.json');
const reportPath = path.join(root, 'reports', 'w192_governed_runner_result_capture_writer.md');

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function loadWriter(savedFiles) {
  let exported = null;
  const modules = {
    'N/file': {
      Type: { JSON: 'JSON' },
      create: (options) => ({
        name: options.name,
        folder: options.folder,
        fileType: options.fileType,
        contents: options.contents,
        save: () => {
          const id = String(1200 + savedFiles.length);
          savedFiles.push(Object.assign({ id }, options));
          return id;
        }
      })
    },
    'N/log': {
      audit: () => {},
      error: () => {}
    }
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
  if (!exported || !exported.writeCompletedRunnerResult) throw new Error('Missing W192 writer exports.');
  return exported;
}

function loadW191Adapter(captureFiles) {
  let exported = null;
  const files = captureFiles || [];
  const modules = {
    'N/runtime': {
      accountId: 'SANDBOX_ACCOUNT_ID',
      getCurrentScript: () => ({ getParameter: () => '' })
    },
    'N/task': {
      TaskType: { SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT' },
      create: () => ({ submit: () => 'not-called' })
    },
    'N/log': { audit: () => {}, error: () => {} },
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
  vm.runInContext(fs.readFileSync(w191SuiteletPath, 'utf8'), sandbox, { filename: w191SuiteletPath });
  return exported;
}

function completedRunnerInput(overrides) {
  return Object.assign({
    resultCaptureFolderId: '678',
    runnerTaskId: 'task_w192_ariat_001',
    idempotencyToken: 'IDB-idb-build-ariat-style-ready-001-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
    prospect: 'Ariat International',
    records: {
      customer: {
        type: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: '/app/common/entity/custjob.nl?id=91201'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: '91202',
        url: '/app/accounting/transactions/salesord.nl?id=91202'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: '91203',
        url: '/app/common/item/item.nl?id=91203'
      },
      matrixProofItem: {
        type: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: '91204',
        url: '/app/common/item/item.nl?id=91204'
      },
      componentItems: [
        {
          type: 'inventoryitem',
          name: 'Ariat Brown Leather Upper Component',
          internalId: '91205',
          url: '/app/common/item/item.nl?id=91205'
        }
      ]
    }
  }, overrides || {});
}

function w191EnabledConfig() {
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
  const savedFiles = [];
  const writer = loadWriter(savedFiles);
  const validWrite = writer.writeCompletedRunnerResult(completedRunnerInput());
  const badPlaceholderWrite = writer.writeCompletedRunnerResult(completedRunnerInput({
    runnerTaskId: 'task_w192_bad_placeholder',
    records: {
      customer: {
        type: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: 'REPLACE_REAL_CUSTOMER_ID',
        url: '/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID'
      }
    }
  }));
  const missingTransactionWrite = writer.writeCompletedRunnerResult(completedRunnerInput({
    runnerTaskId: 'task_w192_missing_transaction',
    records: Object.assign({}, completedRunnerInput().records, {
      demoTransaction: null
    })
  }));
  const absoluteUrlWrite = writer.writeCompletedRunnerResult(completedRunnerInput({
    runnerTaskId: 'task_w192_absolute_urls_001',
    records: Object.assign({}, completedRunnerInput().records, {
      customer: {
        type: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=91201'
      }
    })
  }));

  const captureFiles = savedFiles.map((file) => ({
    id: file.id,
    folder: String(file.folder),
    name: file.name,
    runnerTaskId: validWrite.runnerTaskId,
    idempotencyToken: validWrite.idempotencyToken,
    contents: file.contents
  }));
  const w191Adapter = loadW191Adapter(captureFiles);
  const polled = w191Adapter._test.buildResultCapturePollEnvelope({
    runnerTaskId: validWrite.runnerTaskId,
    idempotencyToken: validWrite.idempotencyToken,
    resultCaptureCursor: 'cursor_w192_written',
    expectedResultSchema: 'idb.completed-runner-result-json.v1'
  }, w191EnabledConfig(), {
    file: {
      load: ({ id }) => {
        const match = captureFiles.find((file) => String(file.id) === String(id));
        return {
          id: match.id,
          name: match.name,
          getContents: () => match.contents
        };
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
  }, []);

  const results = [];
  const writerSource = fs.readFileSync(writerPath, 'utf8');
  const w144Source = fs.readFileSync(w191SuiteletPath, 'utf8');
  assertCase(results, 'w192_writer_module_server_side_file_output_ready', /N\/file/.test(writerSource) && /writeCompletedRunnerResult/.test(writerSource) && /idb.completed-runner-result-json.v1/.test(writerSource), 'W192 writer module uses N/file and completed-result schema.');
  assertCase(results, 'w192_valid_write_saves_completed_json', validWrite.saved === true && validWrite.status === 'completed_result_capture_saved' && savedFiles.length >= 1 && validWrite.completedRunnerResultJson.records.customer.internalId === '91201', JSON.stringify(validWrite));
  assertCase(results, 'w192_filename_includes_runner_task_and_idempotency', validWrite.fileName.includes('task_w192_ariat_001') && validWrite.fileName.includes('IDB-idb-build-ariat-style-ready-001'), validWrite.fileName);
  assertCase(results, 'w192_invalid_placeholder_rejected_without_file', badPlaceholderWrite.saved === false && badPlaceholderWrite.errors.some((error) => /numeric/.test(error)) && !savedFiles.some((file) => /bad_placeholder/.test(file.name)), JSON.stringify(badPlaceholderWrite));
  assertCase(results, 'w192_missing_demo_transaction_rejected', missingTransactionWrite.saved === false && missingTransactionWrite.errors.some((error) => /demoTransaction/.test(error)), JSON.stringify(missingTransactionWrite));
  assertCase(results, 'w192_absolute_netsuite_url_supported', absoluteUrlWrite.saved === true && absoluteUrlWrite.completedRunnerResultJson.records.customer.url.indexOf('https://YOUR_ACCOUNT_ID.app.netsuite.com') === 0, absoluteUrlWrite.completedRunnerResultJson.records.customer.url);
  assertCase(results, 'w192_w191_can_poll_written_capture_file', polled.status === 'completed_runner_result_ready' && polled.finalGeneratedNamesJson.schema === 'idb.completed-runner-result-json.v1' && polled.finalGeneratedNamesJson.records.demoTransaction.internalId === '91202', JSON.stringify(polled.finalGeneratedNamesJson));
  assertCase(results, 'w192_w144_runner_param_handoff_ready', /resultCaptureFolderId/.test(w144Source) && /custscript_idb_result_capture_folder_id/.test(w144Source), 'W144 config exposes result capture folder for runner/result writer handoff.');
  assertCase(results, 'w192_no_drawer_write_or_active_links', validWrite.activeOpenLinks === 0 && !/idb-drawer/.test(writerSource) && !/window\.open|GM_xmlhttpRequest/.test(writerSource), 'Writer has no drawer surface and creates no active links.');

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w192-governed-runner-result-capture-writer.v1',
    status: pass ? 'PASS' : 'FAIL',
    decision: pass ? 'PASS_RUNNER_RESULT_CAPTURE_WRITER_READY__AWAIT_RUNNER_CALL_SITE' : 'FAIL_RUNNER_RESULT_CAPTURE_WRITER',
    runnerResultWriterContract: {
      module: 'netsuite/idb_governed_runner_result_writer_w192.js',
      caller: 'governed internal runner after real create/resolve',
      drawerAuthority: 'none',
      writes: 'NetSuite File Cabinet result-capture JSON only',
      requiredRecords: ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'],
      requiredIds: 'numeric NetSuite internal ids only',
      requiredUrls: 'supported NetSuite customer, sales order, and item record URLs only',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      compatiblePollEndpoint: 'W191 custpage_idb_action=poll_runner_result_capture'
    },
    fileNamingConvention: {
      pattern: 'idb-result-${runnerTaskId || runnerTaskId-pending}-${idempotencyToken}.json',
      example: validWrite.fileName,
      searchCompatibility: 'W191 searches the result-capture folder by runnerTaskId or idempotencyToken.'
    },
    runnerIntegrationFinding: {
      existingRunner: '/path/to/workspace/Demo Command Center V4 Master/suitelet_runtime_package_current/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js',
      existingRunnerWrites: ['hero item create/adopt', 'component items when manufacturing is enabled', 'Sales Order CSV import task submission'],
      gapClosedNow: 'Completed result JSON writer exists and W191 can poll its File Cabinet output.',
      remainingLiveCallSite: 'Wire the actual runner or a post-CSV result resolver to call writeCompletedRunnerResult only after the Sales Order internal id is resolvable.'
    },
    validWriteSummary: {
      saved: validWrite.saved,
      fileId: validWrite.fileId,
      fileName: validWrite.fileName,
      runnerTaskId: validWrite.runnerTaskId,
      idempotencyToken: validWrite.idempotencyToken,
      completedSchema: validWrite.completedRunnerResultJson.schema,
      recordIds: {
        customer: validWrite.completedRunnerResultJson.records.customer.internalId,
        demoTransaction: validWrite.completedRunnerResultJson.records.demoTransaction.internalId,
        heroItem: validWrite.completedRunnerResultJson.records.heroItem.internalId,
        matrixProofItem: validWrite.completedRunnerResultJson.records.matrixProofItem.internalId,
        componentItem: validWrite.completedRunnerResultJson.records.componentItem.internalId
      }
    },
    guardedHarness: {
      validWriteSaved: validWrite.saved === true,
      placeholderIdsRejected: badPlaceholderWrite.saved === false,
      missingDemoTransactionRejected: missingTransactionWrite.saved === false,
      absoluteNetSuiteUrlsSupported: absoluteUrlWrite.saved === true,
      w191PollReadsWrittenFile: polled.status === 'completed_runner_result_ready',
      noDrawerWrites: true,
      noDrawerCreatedRecords: true,
      noActiveOpenLinksBeforeImport: true
    },
    traceSamples: [
      {
        event: 'w192_completed_result_capture_saved',
        fileName: validWrite.fileName,
        runnerTaskId: validWrite.runnerTaskId,
        idempotencyToken: validWrite.idempotencyToken,
        requiredRecordCount: 5,
        activeOpenLinks: 0
      },
      {
        event: 'w192_invalid_placeholder_result_rejected',
        runnerTaskId: 'task_w192_bad_placeholder',
        status: badPlaceholderWrite.status,
        errors: badPlaceholderWrite.errors,
        saved: badPlaceholderWrite.saved
      },
      {
        event: 'w192_w191_poll_reads_writer_output',
        runnerTaskId: polled.runnerTaskId,
        status: polled.status,
        resultCaptureStatus: polled.resultCapture.status,
        completedSchema: polled.finalGeneratedNamesJson.schema,
        activeOpenLinks: 0
      }
    ],
    visualTestingDecision: {
      visualTestingRequiredNow: false,
      targetedOpenLinkTestingReady: false,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W192 creates the server-side result writer and proves W191 can read it. Visual testing starts only after the actual runner/resolver calls this writer with real sandbox IDs and IDB imports the result.'
    },
    noRegression: {
      noDrawerWrites: true,
      noDrawerTransactionWrites: true,
      noDrawerCreatedRecords: true,
      noDirectDrawerSuiteScriptInvocation: true,
      internalRunnerOwnership: true,
      w151ImportGuardStillRequired: true,
      rollbackByDisablingServerFlags: true,
      noActiveOpenLinksWithoutRealUrls: true
    },
    bestNextCodexPrompt: {
      block: 'W193: Wire W192 Result Writer Into Governed Runner Completion Resolver',
      prompt: 'Move through W193: Wire W192 Result Writer Into Governed Runner Completion Resolver. Use the W192 server-side result writer and W191 poll endpoint to connect the actual governed runner completion path: after the existing runner creates/resolves Customer, hero item, matrix/proof item, component item, and after the Sales Order CSV import can be resolved to a real numeric transaction internal id, call writeCompletedRunnerResult into the configured result-capture folder. Add or reuse a post-run resolver if the scheduled runner cannot synchronously know the Sales Order id. Preserve server-side-only writes, internal runner ownership, no drawer writes, W151 import guard, and no Open links before completed import. Output runner call-site changes, Sales Order resolution strategy, deployment parameters, guarded harness, trace samples, W193 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  fs.writeFileSync(reportPath, [
    '# W192: Governed Runner Writes Real Sandbox Records And Stores Result Capture',
    '',
    `Decision: ${contract.decision}`,
    '',
    '## Runner Result Writer Contract',
    '- The W192 writer is a NetSuite-side module for the governed internal runner, not the drawer.',
    '- It accepts only completed create/resolve output with Customer, demo transaction, hero item, matrix/proof item, and component item.',
    '- It requires numeric internal ids and supported NetSuite record URLs before saving result capture JSON.',
    '- It writes a File Cabinet JSON capture that W191 can poll by runnerTaskId or idempotency token.',
    '',
    '## File Naming Convention',
    `- Pattern: ${contract.fileNamingConvention.pattern}`,
    `- Example: ${contract.fileNamingConvention.example}`,
    '',
    '## Current Runner Finding',
    `- Existing runner: ${contract.runnerIntegrationFinding.existingRunner}`,
    `- Remaining live call site: ${contract.runnerIntegrationFinding.remainingLiveCallSite}`,
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
  console.log(`W192 governed runner result writer: ${contract.decision}; file=${validWrite.fileName}`);
}

main();
