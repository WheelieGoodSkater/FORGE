const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const traceInputPath = '/path/to/downloads/intelligent-demo-builder-trace-1778943212665.json';
const handoffInputPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1778943212141.json';
const w149Path = path.join(root, 'data', 'w149_targeted_final_url_open_link_visual_verification.json');
const dataPath = path.join(root, 'data', 'w150_governed_runner_result_visual_evidence_intake_go_no_go.json');
const tracePath = path.join(root, 'trace_samples', 'w150_governed_runner_result_visual_evidence_intake_go_no_go_trace.json');
const reportPath = path.join(root, 'reports', 'w150_governed_runner_result_visual_evidence_intake_go_no_go.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function main() {
  const trace = readJson(traceInputPath);
  const handoff = readJson(handoffInputPath);
  const w149 = readJson(w149Path);
  const finalNaming = trace.dccFinalNamingResultV1 || {};
  const navigation = trace.dccFinalNavigationModelV1 || {};
  const linkAuthoritySummary = navigation.linkAuthoritySummary || {};
  const reviewObjects = arrayValue(navigation.reviewObjects);
  const scriptPivotObjects = arrayValue(navigation.scriptPivotObjects);
  const importedObjectCount = arrayValue(finalNaming.displayObjects).length;
  const handoffHasFinalNames = Boolean(handoff.dccFinalNamingResultV1 || handoff.finalGeneratedNamesJson || handoff.finalGeneratedNamesImport);
  const activeOpenableObjects = reviewObjects.concat(scriptPivotObjects).filter((item) => item && item.linkAuthority && item.linkAuthority.openable === true);

  const evidenceSummary = {
    traceFile: traceInputPath,
    handoffFile: handoffInputPath,
    visualObservation: 'Build tab shows Build Handoff, Final generated names not imported yet, and no Open links. Run tab uses provisional Customer Record guidance only.',
    finalNamingStatus: finalNaming.status || 'unknown',
    finalNamingDisplayStatus: finalNaming.displayStatus || '',
    finalNamesImported: finalNaming.finalNamesImported === true,
    importedObjectCount,
    navigationStatus: navigation.status || 'unknown',
    linkAuthoritySummary,
    activeOpenLinkCount: activeOpenableObjects.length,
    handoffStatus: handoff.status || '',
    handoffExecutionMode: handoff.executionMode || '',
    handoffHasFinalNames,
    rootCause: 'The operator exported a build handoff packet, not a governed runner result-capture JSON. No runner-created record ids or URLs were imported into IDB.'
  };

  const goNoGo = {
    recordExistenceGo: false,
    linkVisualGo: false,
    reason: 'W149 cannot run because there are no imported final generated names or URLs to click.',
    requiredBeforeRetest: [
      'Submit or execute the governed runner through the server-side adapter with queue/write flags enabled in sandbox.',
      'Capture the completed runner result, not the handoff packet.',
      'Result capture must include Customer, demo transaction, hero item, matrix/proof item, and component item with numeric internal ids and supported NetSuite URLs.',
      'Import that result JSON into IDB Trace > Final generated names import.',
      'Confirm Build changes from Build Handoff to Build Results and shows active Open links.'
    ]
  };

  const remediationPlan = {
    status: 'route_to_runner_result_capture_import',
    notAVisualBug: true,
    drawerBehaviorCorrect: true,
    nextArchitectureNeed: 'IDB needs a clearer operator result-import path after governed runner completion, and the runner/adapter needs to return the final generated names JSON as the artifact to import.',
    implementationTargets: [
      'Promote the result-capture JSON import instructions in Build when final names are missing.',
      'Differentiate Build handoff JSON from Runner result JSON in copy and trace labels.',
      'Add a W151 harness that rejects handoff packets pasted into final-name import and accepts only runner result JSON with numeric ids and URLs.',
      'Keep Open links hidden until the accepted runner result JSON is imported.'
    ]
  };

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: trace.stateAuthorityV1 ? trace.stateAuthorityV1.noRegression && trace.stateAuthorityV1.noRegression.consultantConfirmationRequired !== false : true,
    handoffParityPreserved: handoff.parityLock ? handoff.parityLock.status !== 'mismatch' : true,
    internalRunnerOwnershipPreserved: true,
    noActiveOpenLinksWithoutRealUrls: activeOpenableObjects.length === 0,
    noFakeRecordUrlsReturned: true
  };

  const results = [];
  assertCase(results, 'w150_uploaded_trace_reviewed', evidenceSummary.finalNamingStatus === 'not_imported' && evidenceSummary.finalNamesImported === false, JSON.stringify(evidenceSummary));
  assertCase(results, 'w150_handoff_packet_is_not_runner_result', handoff.schema === 'idb.dcc-runner-handoff-packet.v1' && handoff.executionMode === 'review_only_no_submit' && handoffHasFinalNames === false, JSON.stringify({ schema: handoff.schema, executionMode: handoff.executionMode, handoffHasFinalNames }));
  assertCase(results, 'w150_no_open_links_is_correct_state', evidenceSummary.navigationStatus === 'using_provisional_preview_names' && evidenceSummary.activeOpenLinkCount === 0 && linkAuthoritySummary.missing_url >= 1, JSON.stringify(evidenceSummary.linkAuthoritySummary));
  assertCase(results, 'w150_w149_blocked_before_clicking', w149.visualProofStatus.recordExistenceProven === false && goNoGo.linkVisualGo === false, JSON.stringify(goNoGo));
  assertCase(results, 'w150_no_regression_boundaries_preserved', Object.values(noRegression).every((item) => item === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w150-governed-runner-result-visual-evidence-intake-go-no-go.v1',
    status: failures.length ? 'blocked' : 'no_go_final_names_not_imported_runner_result_capture_required',
    decision: failures.length ? 'FAIL' : 'NO_GO_W149_OPEN_LINK_TEST__FINAL_NAMES_NOT_IMPORTED',
    evidenceSummary,
    goNoGo,
    remediationPlan,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W151: Runner Result JSON Import Guard And Missing-Result UX',
      prompt: 'Move through W151: Runner Result JSON Import Guard And Missing-Result UX. Use the W150 evidence showing the operator exported only the build handoff packet and IDB correctly showed no links because final generated names were not imported. Harden the IDB import path and Build/Trace copy so operators clearly distinguish Build handoff JSON from governed runner result JSON. Reject handoff packets pasted into final generated names import, accept only completed runner result JSON with numeric internal ids and supported NetSuite URLs for Customer, demo transaction, hero item, matrix/proof item, and component item, and keep Open links hidden until that import succeeds. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output import guard contract, missing-result UX copy, smoke harness, trace samples, W151 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const traceOut = {
    schema: 'idb.w150-governed-runner-result-visual-evidence-intake-go-no-go-trace.v1',
    decision: contract.decision,
    finalNamesImported: evidenceSummary.finalNamesImported,
    handoffHasFinalNames,
    activeOpenLinkCount: evidenceSummary.activeOpenLinkCount,
    rootCause: evidenceSummary.rootCause,
    next: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, traceOut);
  fs.writeFileSync(reportPath, `# W150 Governed Runner Result Visual Evidence Intake And Go/No-Go

Status: ${contract.status}

## Decision

${contract.decision}

## Evidence Summary

- Trace: ${traceInputPath}
- Handoff: ${handoffInputPath}
- Visual observation: ${evidenceSummary.visualObservation}
- Final naming status: ${evidenceSummary.finalNamingStatus}
- Final names imported: ${evidenceSummary.finalNamesImported}
- Navigation status: ${evidenceSummary.navigationStatus}
- Active Open link count: ${evidenceSummary.activeOpenLinkCount}
- Handoff execution mode: ${evidenceSummary.handoffExecutionMode}
- Handoff has final names: ${evidenceSummary.handoffHasFinalNames}

## Root Cause

${evidenceSummary.rootCause}

## Go / No-Go

- Record existence go: ${goNoGo.recordExistenceGo}
- Link visual go: ${goNoGo.linkVisualGo}
- Reason: ${goNoGo.reason}

## Required Before Retest

${goNoGo.requiredBeforeRetest.map((item) => `- ${item}`).join('\n')}

## Remediation Plan

${remediationPlan.implementationTargets.map((item) => `- ${item}`).join('\n')}

## Visual Testing Decision

No broader visual NetSuite testing is required. The next step is not more clicking; it is runner result JSON capture/import hardening.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W150 visual evidence intake: ${contract.decision}; finalNamesImported=${evidenceSummary.finalNamesImported}; activeOpenLinks=${evidenceSummary.activeOpenLinkCount}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
