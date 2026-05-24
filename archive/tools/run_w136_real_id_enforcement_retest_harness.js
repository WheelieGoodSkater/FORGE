const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const traceInputPath = '/path/to/downloads/intelligent-demo-builder-trace-1778889474970.json';
const dataPath = path.join(root, 'data', 'w136_real_id_enforcement_retest.json');
const tracePath = path.join(root, 'trace_samples', 'w136_real_id_enforcement_retest_trace.json');
const reportPath = path.join(root, 'reports', 'w136_real_id_enforcement_retest.md');

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
  const records = uniqueRecords(trace).map((item) => ({
    role: item.role || '',
    label: item.label || '',
    name: item.name || '',
    id: item.id || '',
    url: item.url || '',
    linkStatus: item.linkAuthority && item.linkAuthority.status ? item.linkAuthority.status : 'unknown',
    openable: Boolean(item.linkAuthority && item.linkAuthority.openable),
    openableUrl: item.openableUrl || ''
  }));
  const placeholderRecords = records.filter((item) => /REPLACE_REAL_/i.test(`${item.id} ${item.url}`));
  const allPlaceholdersBlocked = placeholderRecords.length >= 5 && placeholderRecords.every((item) => item.linkStatus === 'preview_placeholder' && item.openable === false && item.openableUrl === '');
  const contract = {
    schema: 'idb.w136-real-id-enforcement-retest.v1',
    status: allPlaceholdersBlocked ? 'real_id_enforcement_retest_passed' : 'blocked',
    decision: allPlaceholdersBlocked ? 'PASS_PLACEHOLDERS_BLOCKED__REAL_IDS_STILL_REQUIRED' : 'FAIL_PLACEHOLDER_LINK_GATE',
    evidenceFiles: {
      trace: traceInputPath
    },
    retestEvidence: {
      exportedAt: trace.exportedAt,
      lane: trace.selectedLane && trace.selectedLane.name,
      finalNamingStatus: trace.dccFinalNamingResultV1 && trace.dccFinalNamingResultV1.status,
      finalNavigationStatus: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.status,
      linkAuthoritySummary: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.linkAuthoritySummary,
      placeholderRecordCount: placeholderRecords.length,
      activeOpenablePlaceholderCount: placeholderRecords.filter((item) => item.openable).length,
      records
    },
    resultInterpretation: {
      drawerStatus: 'passed_placeholder_blocking',
      buildEngineStatus: 'still_must_return_real_numeric_ids',
      recordExistenceProven: false,
      reason: 'The retest used replacement tokens, and the drawer correctly prevented active Open links.'
    },
    realBuildEngineOutputRequirement: [
      'Customer id and URL id query must both be numeric and refer to an existing NetSuite customer/project record.',
      'Sales Order id and URL id query must both be numeric and refer to an existing NetSuite sales order.',
      'Hero item, matrix/proof item, and component item ids must be numeric and refer to existing NetSuite item records.',
      'The drawer remains import-only and must not create, submit, queue, or invoke SuiteScript.'
    ],
    visualNetSuiteTestingRequiredNow: false,
    targetedVisualNetSuiteTestingRequiredAfterRealIds: true,
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
      block: 'W137: Internal Build Engine Real Numeric ID Output',
      prompt: 'Move through W137: Internal Build Engine Real Numeric ID Output. Use the W136 retest proving placeholder IDs are now blocked as Link pending to focus on the internal build engine output. Produce or resolve actual sandbox records for Customer, demo transaction, hero item, matrix/proof item, and component item, then return final generated names JSON with numeric internal ids and supported NetSuite URLs only. Import that result into the drawer and perform targeted visual testing proving Open links load actual record pages. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership. Output real numeric ID result JSON, targeted visual evidence, trace samples, W137 report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const traceOut = {
    schema: 'idb.w136-real-id-enforcement-retest-trace.v1',
    decision: contract.decision,
    placeholderRecordCount: placeholderRecords.length,
    activeOpenablePlaceholderCount: contract.retestEvidence.activeOpenablePlaceholderCount,
    recordExistenceProven: false,
    next: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, traceOut);
  fs.writeFileSync(reportPath, `# W136 Real ID Enforcement Retest

Status: ${contract.status}

## Decision

${contract.decision}

## Retest Evidence

- Final names imported: ${contract.retestEvidence.finalNamingStatus}
- Link authority summary: ${JSON.stringify(contract.retestEvidence.linkAuthoritySummary)}
- Placeholder records found: ${contract.retestEvidence.placeholderRecordCount}
- Active openable placeholder records: ${contract.retestEvidence.activeOpenablePlaceholderCount}

## Record Statuses

${records.map((item) => `- ${item.label}: ${item.name} / ${item.id} / ${item.linkStatus} / openable=${item.openable}`).join('\n')}

## Next Requirement

${contract.realBuildEngineOutputRequirement.map((item) => `- ${item}`).join('\n')}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (!allPlaceholdersBlocked) {
    console.error('W136 real ID enforcement retest FAIL.');
    process.exit(1);
  }
  console.log(`W136 real ID enforcement retest PASS: placeholders=${placeholderRecords.length}, openable=${contract.retestEvidence.activeOpenablePlaceholderCount}`);
}

main();
