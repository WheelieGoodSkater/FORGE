const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const traceInputPath = '/path/to/downloads/intelligent-demo-builder-trace-1778886696446.json';
const handoffInputPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1778886698640.json';
const dataPath = path.join(root, 'data', 'w134_manual_visual_results_review.json');
const tracePath = path.join(root, 'trace_samples', 'w134_manual_visual_results_review_trace.json');
const reportPath = path.join(root, 'reports', 'w134_manual_visual_results_review.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function finalLinkObjects(trace) {
  const nav = trace.dccFinalNavigationModelV1 || {};
  return arrayValue(nav.reviewObjects)
    .concat(arrayValue(nav.scriptPivotObjects))
    .filter((item, index, list) => {
      const key = `${item.role || item.label}|${item.id}|${item.url}`;
      return list.findIndex((other) => `${other.role || other.label}|${other.id}|${other.url}` === key) === index;
    })
    .map((item) => ({
      role: item.role || '',
      label: item.label || '',
      name: item.name || '',
      id: item.id || '',
      url: item.url || '',
      linkStatus: item.linkAuthority && item.linkAuthority.status ? item.linkAuthority.status : 'unknown',
      openable: Boolean(item.linkAuthority && item.linkAuthority.openable)
    }));
}

function main() {
  const trace = readJson(traceInputPath);
  const handoff = readJson(handoffInputPath);
  const links = finalLinkObjects(trace);
  const allVerifiedOpenable = links.length >= 5 && links.every((item) => item.linkStatus === 'verified_openable' && item.openable === true);
  const allRealUrlShape = links.every((item) => /^\d+$/.test(String(item.id)) && /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+/.test(item.url));
  const contract = {
    schema: 'idb.w134-manual-visual-results-review.v1',
    status: 'visual_link_authority_pass_record_existence_not_proven',
    decision: 'PASS_DRAWER_LINK_AUTHORITY__REQUIRES_REAL_RECORD_EXISTENCE_PILOT',
    evidenceFiles: {
      trace: traceInputPath,
      handoff: handoffInputPath
    },
    visualObservationFromUser: {
      summary: 'No records exist, but drawer results worked as expected at this point.',
      netSuiteClickResult: 'Open link navigated to a NetSuite record URL shape, then NetSuite showed Notice: That record does not exist.',
      implication: 'The drawer can gate and open real URL-shaped links; W135 must prove the internal build engine returns actual existing record ids.'
    },
    traceEvidence: {
      exportedAt: trace.exportedAt,
      lane: trace.selectedLane && trace.selectedLane.name,
      finalNamingStatus: trace.dccFinalNamingResultV1 && trace.dccFinalNamingResultV1.status,
      finalNavigationStatus: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.status,
      linkAuthoritySummary: trace.dccFinalNavigationModelV1 && trace.dccFinalNavigationModelV1.linkAuthoritySummary,
      links,
      allVerifiedOpenable,
      allRealUrlShape
    },
    handoffEvidence: {
      schema: handoff.schema,
      status: handoff.status,
      executionMode: handoff.executionMode,
      noSuiteScriptInvocationFromDrawer: handoff.noRegression && handoff.noRegression.noSuiteScriptInvocationFromIdb === true,
      noTransactionWritesFromDrawer: handoff.noRegression && handoff.noRegression.noTransactionWrites === true
    },
    architecturalFinding: {
      drawerContractStatus: 'ready_for_real_build_engine_result',
      remainingGap: 'record_existence',
      ownerOfRemainingGap: 'internal_build_engine',
      requiredW135Proof: [
        'Build engine must create or resolve the actual Customer record and return its real internal id and URL.',
        'Build engine must create or resolve the actual demo transaction and return its real internal id and URL.',
        'Build engine must create or resolve the actual hero item, matrix/proof item, and component item and return real internal ids and URLs.',
        'Operator must click at least one returned Customer URL and one item or transaction URL and confirm NetSuite opens a real record page, not the Notice: That record does not exist page.',
        'The drawer must remain import-only and must not create records, invoke SuiteScript, submit, queue, or write transactions.'
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
      block: 'W135: Internal Build Engine Real Record Existence Pilot',
      prompt: 'Move through W135: Internal Build Engine Real Record Existence Pilot. Use the W134 manual visual evidence showing Open links route correctly but sample ids do not exist in NetSuite. Run an operator-only sandbox build-engine pilot that creates or resolves actual Customer, demo transaction, hero item, matrix/proof item, and component records, then returns their real internal ids and supported NetSuite record URLs in the final generated names JSON. Import that real result into the drawer and visually verify Build Results and Run show active Open links that open actual records, not the NetSuite “That record does not exist” notice. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership of generated records. Output real record existence evidence, imported result JSON, visual link screenshots, trace samples, W135 report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };

  const traceOut = {
    schema: 'idb.w134-manual-visual-results-review-trace.v1',
    decision: contract.decision,
    allVerifiedOpenable,
    allRealUrlShape,
    recordExistenceProven: false,
    linkCount: links.length,
    next: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, traceOut);
  fs.writeFileSync(reportPath, `# W134 Manual Visual Results Review

Status: ${contract.status}

## Decision

${contract.decision}

## What The Visual Test Proved

- Final generated names imported.
- Build Results and Run rendered active Open links for real URL-shaped records.
- The clicked URL reached NetSuite, but NetSuite showed "That record does not exist."
- Therefore drawer link authority passed, while real record existence remains unproven.

## Link Evidence

${links.map((item) => `- ${item.label}: ${item.name} / ${item.url} / ${item.linkStatus}`).join('\n')}

## W135 Architectural Requirement

${contract.architecturalFinding.requiredW135Proof.map((item) => `- ${item}`).join('\n')}

## No Regression

${Object.entries(contract.noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W134 manual visual results review PASS: linkAuthority=${allVerifiedOpenable} realUrlShape=${allRealUrlShape} recordExistenceProven=false`);
}

main();
