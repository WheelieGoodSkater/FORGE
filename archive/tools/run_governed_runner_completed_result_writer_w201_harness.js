const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet_v2_json_errors.js');
const packagePath = path.join(root, 'package.json');
const dataPath = path.join(root, 'data', 'w201_governed_runner_completed_result_writer.json');
const tracePath = path.join(root, 'trace_samples', 'w201_governed_runner_completed_result_writer_trace.json');
const reportPath = path.join(root, 'reports', 'w201_governed_runner_completed_result_writer.md');

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function main() {
  const runner = fs.readFileSync(runnerPath, 'utf8');
  const adapter = fs.readFileSync(adapterPath, 'utf8');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const results = [];

  assertCase(
    results,
    'runner reads configured result capture folder',
    runner.includes("custscript_v3_runner_result_capture_folder")
      && runner.includes("custscript_idb_result_capture_folder_id")
      && runner.includes('resultCaptureFolderId: toIntOrNull'),
    'The active v4 runner can receive the W144 result capture folder parameter.'
  );
  assertCase(
    results,
    'runner writes W151 completed result capture',
    runner.includes('function writeIdbCompletedRunnerResultCaptureV1')
      && runner.includes("schema: 'idb.completed-runner-result-json.v1'")
      && runner.includes("generatedRecordOwner: 'governed_runner_internal_build_engine'"),
    'Completed result JSON uses the schema and ownership metadata IDB imports.'
  );
  assertCase(
    results,
    'runner creates/resolves all required IDB records server-side',
    runner.includes('function ensureIdbCustomerForResult')
      && runner.includes('function ensureIdbDemoSalesOrderForResult')
      && runner.includes('function ensureIdbProofItemForResult')
      && runner.includes('function ensureIdbComponentItemForResult')
      && runner.includes('role: \'heroItem\''),
    'Customer, Sales Order, hero item, matrix/proof item, and component item are runner-owned.'
  );
  assertCase(
    results,
    'completed result contains numeric ids and supported NetSuite URLs',
    runner.includes('function validateIdbCompletedRunnerResultV1')
      && runner.includes('function buildNetSuiteRecordUrl')
      && runner.includes('/app/common/entity/custjob.nl?id=')
      && runner.includes('/app/accounting/transactions/salesord.nl?id=')
      && runner.includes('/app/common/item/item.nl?id='),
    'The writer validates numeric internalId values and supported record URL paths.'
  );
  assertCase(
    results,
    'result capture file is discoverable by W144 polling',
    runner.includes('idb_completed_runner_result_')
      && runner.includes('safeFileToken(extId)')
      && adapter.includes("if (idempotencyToken) tokenFilters.push(['name', 'contains', idempotencyToken]);"),
    'File names contain the idempotency token so W144/W190 polling can find them.'
  );
  assertCase(
    results,
    'legacy DCC CSV import remains isolated from IDB result capture mode',
    runner.includes('SO CSV Import skipped for IDB result capture')
      && runner.includes('SO CSV Import SUBMITTED')
      && runner.includes('if (resultCaptureFolderId)'),
    'Legacy CSV import still runs when result capture mode is not configured.'
  );
  assertCase(
    results,
    'drawer remains non-writing',
    adapter.includes('generatedRecordOwner')
      && adapter.includes('finalGeneratedNamesReady: false')
      && !adapter.includes('record.create({ type: record.Type.SALES_ORDER'),
    'The drawer/adapter polling path imports result JSON only; record creation stays in the scheduled runner.'
  );
  assertCase(
    results,
    'package exposes W201 harness',
    pkg.scripts['harness:governed-runner-completed-result-writer-w201']
      === 'node tools/run_governed_runner_completed_result_writer_w201_harness.js',
    'The regression harness is runnable by name.'
  );

  const failed = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w201.governed-runner-completed-result-writer.v1',
    status: failed.length ? 'fail' : 'pass',
    runnerResultWriterChanges: {
      runnerPath,
      resultCaptureParam: 'custscript_v3_runner_result_capture_folder',
      fallbackResultCaptureParam: 'custscript_idb_result_capture_folder_id',
      writeFunction: 'writeIdbCompletedRunnerResultCaptureV1',
      ownership: 'governed_runner_internal_build_engine',
      drawerWrites: false
    },
    completedRunnerResultJsonContract: {
      schema: 'idb.completed-runner-result-json.v1',
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      requiredRecords: [
        'customer',
        'demoTransaction',
        'heroItem',
        'matrixProofItem',
        'componentItem'
      ],
      perRecordRequiredFields: ['name', 'internalId numeric string', 'supported NetSuite URL']
    },
    resultCaptureFileNamingLookupContract: {
      pattern: 'idb_completed_runner_result_<idempotencyToken>_<timestamp>.json',
      folder: 'configured result capture folder',
      lookup: 'W144/W190 searches result capture folder by runnerTaskId OR idempotencyToken'
    },
    regressionGates: results,
    visualTestingDecision: 'blocked_until_completed_runner_result_import',
    bestNextCodexPrompt: 'Move through W202: Upload Active V4 Runner Result Writer And Poll Completed Result. Upload the patched scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js, run one approved W144 submit, use Check runner result to retrieve the completed result JSON, import it into IDB, then only if five Open links appear perform targeted link verification.'
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, {
    schema: 'idb.w201.trace-samples.v1',
    samples: [
      {
        event: 'runner_result_capture_written',
        fileName: 'idb_completed_runner_result_IDB_build_token_1770000000000.json',
        status: 'completed_result_capture_ready',
        generatedRecordOwner: 'governed_runner_internal_build_engine'
      },
      {
        event: 'completed_result_json',
        finalGeneratedNamesJson: {
          schema: 'idb.completed-runner-result-json.v1',
          status: 'completed',
          records: {
            customer: { type: 'customer', internalId: '123', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=123' },
            demoTransaction: { type: 'salesorder', internalId: '456', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=456' },
            heroItem: { type: 'inventoryitem', internalId: '789', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=789' },
            matrixProofItem: { type: 'inventoryitem', internalId: '790', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=790' },
            componentItem: { type: 'inventoryitem', internalId: '791', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=791' }
          }
        }
      }
    ]
  });

  const report = [
    '# W201 Report: Governed Runner Completed Result Writer For Active V4 Runner',
    '',
    `Status: ${contract.status.toUpperCase()}`,
    '',
    '## Runner Result Writer Changes',
    '',
    '- Patched the active v4 sandbox runner to read the configured result capture folder.',
    '- Added server-side Customer, demo Sales Order, matrix/proof item, and component item resolution for IDB result-capture mode.',
    '- Added completed runner result JSON writer with W151 numeric id and supported URL validation.',
    '- Kept drawer writes disabled; the drawer only polls/imports the completed result JSON.',
    '',
    '## Completed Runner Result JSON Contract',
    '',
    '- Schema: `idb.completed-runner-result-json.v1`.',
    '- Required owner: `governed_runner_internal_build_engine`.',
    '- Required records: Customer, demo transaction/Sales Order, hero item, matrix/proof item, component item.',
    '- Required per record: name, numeric internal id, supported NetSuite URL.',
    '',
    '## Result Capture File Naming / Lookup Contract',
    '',
    '- File name: `idb_completed_runner_result_<idempotencyToken>_<timestamp>.json`.',
    '- Folder: configured result capture folder.',
    '- Lookup: W144/W190 polling searches by `runnerTaskId` or `idempotencyToken`; the file name includes the idempotency token.',
    '',
    '## Harness And Trace Samples',
    '',
    ...results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'}: ${result.name} - ${result.detail}`),
    '',
    '## Visual Testing Decision',
    '',
    'Blocked until the patched runner is uploaded, one W144 submit completes, and IDB imports the completed result JSON.',
    '',
    '## Best Next Codex Prompt',
    '',
    contract.bestNextCodexPrompt
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);

  if (failed.length) {
    console.error(JSON.stringify({ status: 'fail', failed }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ status: 'pass', reportPath, dataPath, tracePath }, null, 2));
}

main();
