const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const packagePath = path.join(root, 'package.json');
const dataPath = path.join(root, 'data', 'w200_simplified_idb_intake_production_build_request.json');
const tracePath = path.join(root, 'trace_samples', 'w200_simplified_idb_intake_production_build_request_trace.json');
const reportPath = path.join(root, 'reports', 'w200_simplified_idb_intake_production_build_request.md');

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function sourceBetween(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  if (start === -1 || end === -1) return '';
  return source.slice(start, end);
}

function main() {
  const source = fs.readFileSync(userscriptPath, 'utf8');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const results = [];
  const setupReadinessSource = sourceBetween(source, 'function setupReadiness', 'function productionConsultantIntakeV1');
  const renderSetupSource = sourceBetween(source, 'function renderDemoSetup', 'function renderSetupPlan');
  const confirmedRequestSource = sourceBetween(source, 'function confirmedBuildRequestJsonV1', 'function integratedBuildOperatorGateV1');

  assertCase(
    results,
    'consultant readiness requires only the three production inputs',
    setupReadinessSource.includes("const required = ['customer', 'website', 'notes'];")
      && !setupReadinessSource.includes('scObjective')
      && !setupReadinessSource.includes('decisionCriteria'),
    'setupReadiness no longer makes proof/objective fields required.'
  );
  assertCase(
    results,
    'production consultant intake contract exists',
    source.includes('function productionConsultantIntakeV1')
      && source.includes("consultantFacingRequiredInputs: ['customer/prospect name', 'website', 'conversation notes']")
      && source.includes("requiredRecordSet: ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem']"),
    'W200 adds the three-input contract and required record set.'
  );
  assertCase(
    results,
    'confirmed build request includes simplified intake and admin/debug contract',
    confirmedRequestSource.includes('simplifiedConsultantIntake')
      && confirmedRequestSource.includes('adminDebugConfiguration')
      && confirmedRequestSource.includes('hiddenBehindAdminDebugState: true'),
    'The request JSON names the consultant contract and hidden adapter configuration.'
  );
  assertCase(
    results,
    'normal consultant form shows only customer website and notes',
    renderSetupSource.includes('Customer / Prospect Name')
      && renderSetupSource.includes('Website')
      && renderSetupSource.includes('Conversation Notes')
      && renderSetupSource.includes('idb-w200-admin-debug-intake'),
    'Legacy objective/decision fields are retained only inside admin/debug details.'
  );
  assertCase(
    results,
    'server adapter controls are hidden behind admin/debug',
    source.includes('idb-w200-admin-debug-server-config')
      && source.includes('Admin/debug: server adapter configuration'),
    'W144 endpoint/flags/operator fields are not part of the normal consultant workflow.'
  );
  assertCase(
    results,
    'handoff-only export is de-emphasized',
    source.includes('Export debug handoff')
      && source.includes('Operator evidence only. This is not runner execution.'),
    'Build handoff remains available as debug evidence, not the primary production action.'
  );
  assertCase(
    results,
    'existing W144 runnerTaskId path remains intact',
    source.includes('data-idb-real-adapter-action="submit_w144_once"')
      && source.includes('runnerTaskId')
      && source.includes('realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1'),
    'W200 does not remove the current W144 adapter call and runnerTaskId capture path.'
  );
  assertCase(
    results,
    'W151 import guard and link authority remain required',
    source.includes('W151 completed runner result JSON guard remains required')
      && source.includes('noActiveOpenLinksBeforeCompletedRunnerResultImport')
      && source.includes('Open links appear only after completed governed runner result JSON is returned and imported.'),
    'Open links still wait for completed runner result import.'
  );
  assertCase(
    results,
    'package exposes W200 harness',
    pkg.scripts['harness:simplified-idb-intake-production-build-request-w200']
      === 'node tools/run_simplified_idb_intake_production_build_request_w200_harness.js',
    'The regression harness is runnable by name.'
  );

  const failed = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w200.simplified-idb-intake-production-build-request.v1',
    status: failed.length ? 'fail' : 'pass',
    simplifiedIdbIntakeArchitecture: {
      consultantFacingRequiredInputs: [
        'customer/prospect name',
        'website',
        'conversation notes'
      ],
      inferredByIdb: [
        'lane',
        'proof path',
        'demo scenario',
        'build story',
        'initial record naming intent'
      ],
      debugOnlyConfiguration: [
        'approved W144 endpoint',
        'server flags',
        'sandbox allowlist',
        'runner script/deployment IDs',
        'mapping ID',
        'runner folder ID',
        'result capture folder ID',
        'operator approval phrase'
      ]
    },
    confirmedBuildRequestJsonContract: {
      schema: 'idb.confirmed-build-request.v1',
      generatedFrom: [
        'name',
        'website',
        'notes',
        'confirmed inferred lane/proof/demo path',
        'idempotency token',
        'required record set'
      ],
      requiredRecordSet: [
        'Customer',
        'demo transaction / Sales Order',
        'hero item',
        'matrix/proof item',
        'component item'
      ]
    },
    buildReadinessStates: [
      'consultant_intake_incomplete',
      'demo_path_needs_confirmation',
      'build_request_ready',
      'server_adapter_not_configured',
      'ready_for_governed_runner_submit',
      'runnerTaskId_captured',
      'waiting_for_completed_runner_result',
      'completed_result_imported'
    ],
    regressionGates: results,
    visualTestingDecision: 'blocked_until_completed_runner_result_import',
    bestNextCodexPrompt: 'Move through W201: Governed Runner Completed Result Writer For Active V4 Runner. Patch the active scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js path to write W151-valid completed runner result JSON with numeric ids and supported NetSuite URLs into the configured result capture folder after successful server-side runner execution, then prove IDB polling can retrieve it without drawer writes.'
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, {
    schema: 'idb.w200.trace-samples.v1',
    samples: [
      {
        event: 'consultant_intake_ready',
        requiredInputs: contract.simplifiedIdbIntakeArchitecture.consultantFacingRequiredInputs,
        inferred: contract.simplifiedIdbIntakeArchitecture.inferredByIdb
      },
      {
        event: 'debug_config_hidden',
        fields: contract.simplifiedIdbIntakeArchitecture.debugOnlyConfiguration
      },
      {
        event: 'completed_result_import_guard',
        guard: 'W151 completed runner result JSON with numeric ids and supported NetSuite URLs'
      }
    ]
  });

  const report = [
    '# W200 Report: Simplified IDB Intake And Production Build Request Contract',
    '',
    `Status: ${contract.status.toUpperCase()}`,
    '',
    '## Simplified IDB Intake Architecture',
    '',
    '- Required consultant inputs: customer/prospect name, website, conversation notes.',
    '- IDB infers lane, proof path, demo scenario, build story, and initial record naming intent.',
    '- Adapter endpoint, flags, runner IDs, mapping, folders, result capture, and operator controls are admin/debug only.',
    '',
    '## Confirmed Build Request JSON Contract',
    '',
    '- Generated from the three inputs plus confirmed inferred path and idempotency token.',
    '- Requires Customer, demo transaction/Sales Order, hero item, matrix/proof item, and component item.',
    '- Keeps W151 completed-result import guard before any final generated names mutation.',
    '',
    '## Regression Harness Updates',
    '',
    ...results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'}: ${result.name} - ${result.detail}`),
    '',
    '## Visual Testing Decision',
    '',
    'Blocked until completed runner result JSON is imported. No Open-link visual testing is useful while the runner result writer is missing.',
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
