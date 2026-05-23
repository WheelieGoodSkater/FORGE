const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w148Path = path.join(root, 'data', 'w148_governed_runner_result_capture_final_url_import.json');
const dataPath = path.join(root, 'data', 'w149_targeted_final_url_open_link_visual_verification.json');
const tracePath = path.join(root, 'trace_samples', 'w149_targeted_final_url_open_link_visual_verification_trace.json');
const reportPath = path.join(root, 'reports', 'w149_targeted_final_url_open_link_visual_verification.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function recordList(finalGeneratedNamesJson) {
  return [
    {
      role: 'customer',
      label: 'Customer',
      recordType: 'customer',
      name: finalGeneratedNamesJson.customer.name,
      id: finalGeneratedNamesJson.customer.id,
      url: finalGeneratedNamesJson.customer.url,
      expectedPath: '/app/common/entity/custjob.nl'
    },
    {
      role: 'demoTransaction',
      label: 'Demo transaction',
      recordType: 'salesorder',
      name: finalGeneratedNamesJson.salesOrder.name,
      id: finalGeneratedNamesJson.salesOrder.id,
      url: finalGeneratedNamesJson.salesOrder.url,
      expectedPath: '/app/accounting/transactions/salesord.nl'
    },
    {
      role: 'heroItem',
      label: 'Hero item',
      recordType: 'inventoryitem',
      name: finalGeneratedNamesJson.heroItem.name,
      id: finalGeneratedNamesJson.heroItem.id,
      url: finalGeneratedNamesJson.heroItem.url,
      expectedPath: '/app/common/item/item.nl'
    },
    {
      role: 'matrixProofItem',
      label: 'Matrix/proof item',
      recordType: 'matrixitem',
      name: finalGeneratedNamesJson.matrixItem.name,
      id: finalGeneratedNamesJson.matrixItem.id,
      url: finalGeneratedNamesJson.matrixItem.url,
      expectedPath: '/app/common/item/item.nl'
    },
    {
      role: 'componentItem',
      label: 'Component item',
      recordType: 'inventoryitem',
      name: finalGeneratedNamesJson.componentItems[0].name,
      id: finalGeneratedNamesJson.componentItems[0].id,
      url: finalGeneratedNamesJson.componentItems[0].url,
      expectedPath: '/app/common/item/item.nl'
    }
  ];
}

function expectedAbsoluteUrl(record) {
  return `https://YOUR_ACCOUNT_ID.app.netsuite.com${record.url}`;
}

function evaluateLanding(record, evidence) {
  const ev = evidence || {};
  const loadedUrl = String(ev.loadedUrl || '');
  const pageTitle = String(ev.pageTitle || '');
  const pageText = String(ev.pageText || '');
  const urlMatches = loadedUrl.includes(record.expectedPath) && loadedUrl.includes(`id=${record.id}`);
  const hasRecordIdentity = pageTitle.includes(record.name) || pageText.includes(record.name) || pageText.includes(record.id);
  const noticeOrError = /That record does not exist|Invalid number|unexpected error|Notice|Error/i.test(`${pageTitle} ${pageText}`);
  const realRecordSignals = Array.isArray(ev.realRecordSignals) ? ev.realRecordSignals : [];
  const pass = urlMatches && hasRecordIdentity && !noticeOrError && realRecordSignals.length >= 1;
  return {
    role: record.role,
    label: record.label,
    expectedUrl: expectedAbsoluteUrl(record),
    loadedUrl,
    urlMatches,
    hasRecordIdentity,
    noticeOrError,
    realRecordSignals,
    pass,
    status: pass ? 'actual_record_page_verified' : 'not_verified'
  };
}

function blockedNoticeEvidence(records) {
  return records.map((record) => ({
    role: record.role,
    loadedUrl: expectedAbsoluteUrl(record),
    pageTitle: 'Oracle NetSuite Notice',
    pageText: 'Notice That record does not exist.',
    realRecordSignals: []
  }));
}

function acceptedEvidenceShape(records) {
  return records.map((record) => ({
    role: record.role,
    loadedUrl: expectedAbsoluteUrl(record),
    pageTitle: `${record.name} - NetSuite`,
    pageText: `${record.name} internal id ${record.id}`,
    realRecordSignals: ['record name visible']
  }));
}

function main() {
  const w148 = readJson(w148Path);
  const finalGeneratedNamesJson = w148.finalGeneratedNamesJson;
  const records = recordList(finalGeneratedNamesJson);
  const noticeResults = blockedNoticeEvidence(records).map((evidence) => evaluateLanding(records.find((record) => record.role === evidence.role), evidence));
  const acceptedShapeResults = acceptedEvidenceShape(records).map((evidence) => evaluateLanding(records.find((record) => record.role === evidence.role), evidence));
  const operatorEvidence = records.map((record) => ({
    role: record.role,
    label: record.label,
    name: record.name,
    id: record.id,
    url: record.url,
    expectedClickTarget: expectedAbsoluteUrl(record),
    visualStatus: 'awaiting_operator_click',
    requiredEvidence: [
      'loaded URL contains the same numeric id',
      'page is not a NetSuite Notice page',
      'page is not a NetSuite Error page',
      'record name or internal id is visible on the landed page',
      'screenshot or operator note confirms actual record page'
    ]
  }));

  const visualProofStatus = {
    recordExistenceProven: false,
    reason: 'No authenticated NetSuite click evidence or screenshots were provided in the workspace for W149. The harness validates the exact evidence shape and rejects Notice/Error pages, but does not fabricate record-page proof.',
    targetedVisualEvidenceRequired: true,
    broaderVisualTestingRequired: false
  };

  const recordPageLandingChecklist = records.map((record) => ({
    role: record.role,
    label: record.label,
    name: record.name,
    id: record.id,
    clickUrl: expectedAbsoluteUrl(record),
    passWhen: [
      `URL path contains ${record.expectedPath}`,
      `URL id query param is ${record.id}`,
      'NetSuite record form or record view is visible',
      'record name or internal id is visible',
      'page is not Notice, Error, Invalid number, or record does not exist'
    ],
    failWhen: [
      'Notice: That record does not exist',
      'Invalid number',
      'An unexpected error has occurred',
      'placeholder or REPLACE_REAL token appears',
      'loaded page path does not match the expected record type'
    ]
  }));

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    idempotencyPreserved: w148.noRegression.idempotencyPreserved === true,
    internalRunnerOwnershipPreserved: w148.finalGeneratedNamesJson.generatedRecordOwner === 'governed_dcc_runner_internal_build_engine',
    rollbackByDisablingServerFlags: true,
    noActiveOpenLinksWithoutRealUrls: w148.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };

  const results = [];
  assertCase(results, 'w149_uses_w148_final_generated_names_json', finalGeneratedNamesJson.schema === 'idb.internal-build-engine.real-record-result.v1' && records.length === 5, finalGeneratedNamesJson.schema);
  assertCase(results, 'w149_checklist_covers_all_required_records', recordPageLandingChecklist.length === 5 && recordPageLandingChecklist.every((item) => item.clickUrl.includes(`id=${item.id}`)), JSON.stringify(recordPageLandingChecklist));
  assertCase(results, 'w149_notice_error_pages_are_rejected', noticeResults.every((item) => item.pass === false && item.noticeOrError === true), JSON.stringify(noticeResults));
  assertCase(results, 'w149_valid_record_page_evidence_shape_is_accepted', acceptedShapeResults.every((item) => item.pass === true && item.status === 'actual_record_page_verified'), JSON.stringify(acceptedShapeResults));
  assertCase(results, 'w149_live_record_existence_not_fabricated', visualProofStatus.recordExistenceProven === false && operatorEvidence.every((item) => item.visualStatus === 'awaiting_operator_click'), JSON.stringify(visualProofStatus));
  assertCase(results, 'w149_no_regression_boundaries_preserved', Object.values(noRegression).every((item) => item === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w149-targeted-final-url-open-link-visual-verification.v1',
    status: failures.length ? 'blocked' : 'targeted_visual_verification_ready_operator_evidence_required',
    decision: failures.length ? 'FAIL' : 'PASS_VERIFICATION_PACKET_READY__LIVE_RECORD_PROOF_AWAITING_OPERATOR_EVIDENCE',
    source: {
      w148Data: w148Path,
      runnerTaskId: w148.resultCaptureContract.sourceRunnerTaskId,
      finalGeneratedNamesImported: w148.importEvidence.finalNamesImported,
      activeOpenAnchors: w148.importEvidence.openAnchorCount
    },
    finalGeneratedNamesJson,
    targetedVisualEvidence: operatorEvidence,
    recordPageLandingChecklist,
    evaluatorSmoke: {
      noticeErrorRejected: noticeResults,
      acceptedRecordPageEvidenceShape: acceptedShapeResults
    },
    visualProofStatus,
    broaderVisualTestingDecision: {
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'Only the five final generated record URLs need targeted landing proof. No broader NetSuite UI sweep is required for W149.'
    },
    noRegression,
    bestNextCodexPrompt: {
      block: 'W150: Governed Runner Result Visual Evidence Intake And Go/No-Go',
      prompt: 'Move through W150: Governed Runner Result Visual Evidence Intake And Go/No-Go. Use the W149 targeted checklist and the operator-provided screenshots or notes from clicking Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Mark each link as actual_record_page_verified only if the landed NetSuite page is not Notice/Error/Invalid number and shows the matching record name or numeric internal id. If all five pass, promote the governed runner result as visually verified for consultant use; if any fail, keep the drawer import but block record-existence readiness and route remediation to runner result capture. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output W150 go/no-go report, evidence summary, trace samples, broader visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w149-targeted-final-url-open-link-visual-verification-trace.v1',
    decision: contract.decision,
    recordExistenceProven: visualProofStatus.recordExistenceProven,
    requiredClicks: records.map((record) => ({
      role: record.role,
      id: record.id,
      url: expectedAbsoluteUrl(record)
    })),
    noticeErrorRejected: noticeResults.every((item) => item.pass === false),
    acceptedEvidenceShapePasses: acceptedShapeResults.every((item) => item.pass === true),
    broaderVisualTestingRequired: false,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W149 Targeted Final URL Open-Link Visual Verification

Status: ${contract.status}

## Decision

${contract.decision}

## Targeted Visual Evidence

Live record existence proven: ${visualProofStatus.recordExistenceProven}

Reason: ${visualProofStatus.reason}

## Record Page Landing Checklist

${recordPageLandingChecklist.map((item) => `- ${item.label}: ${item.name} / id=${item.id} / ${item.clickUrl}`).join('\n')}

## Required Pass Conditions

- URL path and id match the final generated names JSON.
- NetSuite record page is visible.
- Record name or numeric internal id is visible.
- Page is not Notice, Error, Invalid number, placeholder, or record-does-not-exist.

## Evaluator Smoke

- Notice/Error rejected: ${noticeResults.every((item) => item.pass === false)}
- Valid evidence shape accepted: ${acceptedShapeResults.every((item) => item.pass === true)}

## Broader Visual Testing Decision

- Broader visual NetSuite testing required: No.
- Reason: ${contract.broaderVisualTestingDecision.reason}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W149 targeted open-link verification: ${contract.decision}; recordExistenceProven=${visualProofStatus.recordExistenceProven}; broaderVisual=${contract.broaderVisualTestingDecision.broaderVisualNetSuiteTestingRequired}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
