const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const traceInputPath = '/path/to/downloads/intelligent-demo-builder-trace-1778890662164.json';
const w137Path = path.join(root, 'data', 'w137_internal_build_engine_real_numeric_id_output.json');
const dataPath = path.join(root, 'data', 'w137_real_numeric_id_visual_evidence_review.json');
const tracePath = path.join(root, 'trace_samples', 'w137_real_numeric_id_visual_evidence_review_trace.json');
const reportPath = path.join(root, 'reports', 'w137_real_numeric_id_visual_evidence_review.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueRecords(trace) {
  const nav = trace.dccFinalNavigationModelV1 || {};
  return arrayValue(nav.reviewObjects)
    .concat(arrayValue(nav.scriptPivotObjects))
    .filter((item, index, list) => {
      const key = `${item.role || item.label}|${item.id}|${item.url}`;
      return list.findIndex((other) => `${other.role || other.label}|${other.id}|${other.url}` === key) === index;
    });
}

function main() {
  const trace = readJson(traceInputPath);
  const w137 = readJson(w137Path);
  const records = uniqueRecords(trace).map((item) => ({
    role: item.role || '',
    label: item.label || '',
    name: item.name || '',
    id: item.id || '',
    url: item.url || '',
    linkStatus: item.linkAuthority && item.linkAuthority.status ? item.linkAuthority.status : 'unknown',
    openable: Boolean(item.linkAuthority && item.linkAuthority.openable),
    numericIdShape: /^\d+$/.test(String(item.id || '')),
    supportedUrlShape: /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+/.test(String(item.url || ''))
  }));
  const allNumericOpenable = records.length >= 5 && records.every((item) => item.numericIdShape && item.supportedUrlShape && item.linkStatus === 'verified_openable' && item.openable === true);
  const contract = {
    schema: 'idb.w137-real-numeric-id-visual-evidence-review.v1',
    status: 'blocked_runner_dcc_creation_not_proven',
    decision: 'NO_GO_REAL_RECORD_EXISTENCE__RUNNER_DCC_CREATION_REQUIRED',
    evidenceFiles: {
      trace: traceInputPath,
      w137Contract: w137Path
    },
    evidenceFinding: {
      drawerNumericShapePassed: allNumericOpenable,
      recordExistenceProven: false,
      userObservation: 'Nothing was opened; numeric ids were imported, but records do not auto-create from the drawer.',
      architecturalConclusion: 'The drawer import path is not the record creation path. Actual records must be produced or resolved by the governed DCC runner/internal build engine, then imported back into the drawer.'
    },
    traceEvidence: {
      exportedAt: trace.exportedAt,
      lane: trace.selectedLane && trace.selectedLane.name,
      finalNamingStatus: trace.dccFinalNamingResultV1 && trace.dccFinalNamingResultV1.status,
      finalNavigationStatus: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.status,
      linkAuthoritySummary: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.linkAuthoritySummary,
      dccHandoffStatus: trace.dccRunnerHandoffPacketV1 && trace.dccRunnerHandoffPacketV1.status,
      dccExecutionMode: trace.dccRunnerHandoffPacketV1 && trace.dccRunnerHandoffPacketV1.executionMode,
      records
    },
    requiredNextArchitecture: {
      block: 'governed_runner_dcc_creation_result',
      requirements: [
        'Use the exported handoff packet to run the governed DCC/internal build engine path; do not expect drawer import to create records.',
        'DCC/runner must create or resolve Customer, Sales Order/demo transaction, hero item, matrix/proof item, and component records.',
        'DCC/runner must return the actual internal ids created/resolved by NetSuite.',
        'The final generated names JSON must be generated from runner/DCC result output, not hand-typed sample ids.',
        'The drawer remains no-write and import-only.'
      ]
    },
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      generatedRecordsOwnedByInternalBuildEngine: true
    },
    bestNextCodexPrompt: {
      block: 'W138: Governed DCC Runner Creation Result Capture',
      prompt: 'Move through W138: Governed DCC Runner Creation Result Capture. Use the W137R finding that numeric drawer imports do not create records and real record existence requires the governed DCC runner/internal build engine. Define and test the operator-only path from exported handoff packet to DCC runner execution/result capture, requiring the runner to create or resolve Customer, demo transaction, hero item, matrix/proof item, and component records and return actual NetSuite internal ids plus supported URLs. Do not enable drawer writes, do not invoke SuiteScript from the drawer, and do not create transactions from the drawer. Preserve consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership. Output runner creation result contract, operator runbook, result JSON shape, trace samples, W138 report, whether targeted visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const traceOut = {
    schema: 'idb.w137-real-numeric-id-visual-evidence-review-trace.v1',
    decision: contract.decision,
    drawerNumericShapePassed: contract.evidenceFinding.drawerNumericShapePassed,
    recordExistenceProven: false,
    dccRunnerCreationRequired: true,
    next: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, traceOut);
  fs.writeFileSync(reportPath, `# W137R Real Numeric ID Visual Evidence Review

Status: ${contract.status}

## Decision

${contract.decision}

## Finding

- Drawer numeric URL shape passed: ${contract.evidenceFinding.drawerNumericShapePassed}
- Record existence proven: ${contract.evidenceFinding.recordExistenceProven}
- User observation: ${contract.evidenceFinding.userObservation}
- Conclusion: ${contract.evidenceFinding.architecturalConclusion}

## Records In Trace

${records.map((item) => `- ${item.label}: ${item.name} / id=${item.id} / ${item.linkStatus} / openable=${item.openable}`).join('\n')}

## Required Next Architecture

${contract.requiredNextArchitecture.requirements.map((item) => `- ${item}`).join('\n')}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W137R evidence review complete: ${contract.decision}; drawerNumericShapePassed=${allNumericOpenable}; recordExistenceProven=false`);
}

main();
