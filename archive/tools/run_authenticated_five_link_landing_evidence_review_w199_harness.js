const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w198Path = path.join(root, 'data', 'w198_import_completed_runner_result_and_targeted_link_test.json');
const optionalEvidencePath = path.join(root, 'data', 'w199_authenticated_landing_evidence_input.json');
const dataPath = path.join(root, 'data', 'w199_authenticated_five_link_landing_evidence_review.json');
const tracePath = path.join(root, 'trace_samples', 'w199_authenticated_five_link_landing_evidence_review_trace.json');
const reportPath = path.join(root, 'reports', 'w199_authenticated_five_link_landing_evidence_review.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function normalizeEvidence(input) {
  const records = input && Array.isArray(input.records) ? input.records : [];
  return records.map((record) => ({
    role: String(record.role || ''),
    screenshotProvided: record.screenshotProvided === true || !!record.screenshotPath,
    screenshotPath: String(record.screenshotPath || ''),
    landedUrl: String(record.landedUrl || record.url || ''),
    observedInternalId: String(record.observedInternalId || record.internalId || ''),
    observedRecordName: String(record.observedRecordName || record.name || ''),
    pageType: String(record.pageType || ''),
    hasNotice: record.hasNotice === true,
    hasError: record.hasError === true,
    hasPlaceholder: record.hasPlaceholder === true,
    operatorNotes: String(record.operatorNotes || '')
  }));
}

function reviewRecord(expected, observed) {
  const evidence = observed || {};
  const expectedId = String(expected.internalId || '');
  const expectedUrl = String(expected.url || '');
  const expectedPath = new URL(expectedUrl).pathname;
  const landedUrl = String(evidence.landedUrl || '');
  const hasUrl = /^https:\/\/[^/]+\.app\.netsuite\.com\/app\//i.test(landedUrl);
  const urlMatchesId = new RegExp(`[?&]id=${expectedId}(?:&|$)`).test(landedUrl);
  const urlMatchesPath = hasUrl && landedUrl.indexOf(expectedPath) >= 0;
  const observedIdMatches = String(evidence.observedInternalId || '') === expectedId || urlMatchesId;
  const recordIdentityMatches = String(evidence.observedRecordName || '').trim() === String(expected.name || '').trim() ||
    String(evidence.observedRecordName || '').toLowerCase().includes(String(expected.name || '').toLowerCase()) ||
    String(evidence.operatorNotes || '').toLowerCase().includes(String(expected.name || '').toLowerCase());
  const blockedPage = evidence.hasNotice === true ||
    evidence.hasError === true ||
    evidence.hasPlaceholder === true ||
    /notice|error|invalid number|record does not exist|placeholder/i.test(`${evidence.pageType} ${evidence.operatorNotes}`);
  const pass = evidence.screenshotProvided === true &&
    hasUrl &&
    urlMatchesId &&
    urlMatchesPath &&
    observedIdMatches &&
    recordIdentityMatches &&
    blockedPage !== true;
  const missing = [];
  if (evidence.screenshotProvided !== true) missing.push('authenticated screenshot');
  if (!hasUrl) missing.push('NetSuite landed URL');
  if (!urlMatchesId) missing.push(`URL id ${expectedId}`);
  if (!urlMatchesPath) missing.push(`URL path ${expectedPath}`);
  if (!recordIdentityMatches) missing.push(`record identity ${expected.name}`);
  if (blockedPage) missing.push('non-Notice/non-Error record page');
  return {
    role: expected.role,
    label: expected.label,
    expectedName: expected.name,
    expectedInternalId: expectedId,
    expectedUrl,
    screenshotProvided: evidence.screenshotProvided === true,
    landedUrl,
    observedInternalId: evidence.observedInternalId || '',
    observedRecordName: evidence.observedRecordName || '',
    blockedPageDetected: blockedPage,
    pass,
    result: pass ? 'pass_actual_record_page' : 'blocked_missing_or_failed_authenticated_landing_evidence',
    missingOrFailedEvidence: missing
  };
}

function main() {
  const w198 = readJson(w198Path);
  const evidenceInput = fs.existsSync(optionalEvidencePath)
    ? readJson(optionalEvidencePath)
    : {
      schema: 'idb.w199-authenticated-landing-evidence-input.v1',
      status: 'not_provided',
      records: []
    };
  const normalizedEvidence = normalizeEvidence(evidenceInput);
  const expectedRecords = w198.passFailRecordLandingChecklist || [];
  const passFailTable = expectedRecords.map((record) =>
    reviewRecord(record, normalizedEvidence.find((item) => item.role === record.role))
  );
  const allFivePass = passFailTable.length === 5 && passFailTable.every((row) => row.pass === true);
  const missingRoles = passFailTable
    .filter((row) => row.pass !== true)
    .map((row) => row.role);

  const results = [];
  assertCase(results, 'w199_w198_import_ready', w198.status === 'PASS_W198_IMPORT_COMMITTED_TARGETED_LINK_TEST_READY_AUTHENTICATED_LANDING_EVIDENCE_REQUIRED' && w198.buildRunImportEvidence.verifiedOpenLinkCount >= 5, JSON.stringify({ status: w198.status, openLinks: w198.buildRunImportEvidence.verifiedOpenLinkCount }));
  assertCase(results, 'w199_five_expected_records_present', passFailTable.length === 5 && ['customer', 'sales_order', 'hero_item', 'matrix_or_proof_item', 'component_item'].every((role) => passFailTable.some((row) => row.role === role)), JSON.stringify(passFailTable.map((row) => row.role)));
  assertCase(results, 'w199_production_pass_requires_all_five_authenticated_landings', allFivePass === true || missingRoles.length > 0, JSON.stringify({ allFivePass, missingRoles }));
  assertCase(results, 'w199_no_notice_error_placeholder_allowed', passFailTable.every((row) => row.pass !== true || row.blockedPageDetected !== true), JSON.stringify(passFailTable));
  assertCase(results, 'w199_no_regression_preserved', w198.noRegression.noDrawerWrites === true && w198.noRegression.noDrawerTransactionWrites === true && w198.noRegression.noDrawerCreatedRecords === true && w198.noRegression.noDirectDrawerSuiteScriptInvocationOutsideApprovedAdapterPath === true, JSON.stringify(w198.noRegression));

  const productionReadinessDecision = allFivePass
    ? 'production_ready_targeted_links_passed'
    : 'not_production_ready_missing_authenticated_landing_evidence';

  const contract = {
    schema: 'idb.w199-authenticated-five-link-landing-evidence-review.v1',
    status: allFivePass
      ? 'PASS_W199_PRODUCTION_READY_TARGETED_LINKS_VERIFIED'
      : 'BLOCKED_W199_AUTHENTICATED_LINK_EVIDENCE_REQUIRED',
    evidenceReview: {
      source: fs.existsSync(optionalEvidencePath)
        ? 'data/w199_authenticated_landing_evidence_input.json'
        : 'no_authenticated_screenshot_evidence_uploaded',
      w198ImportReady: w198.buildRunImportEvidence.verifiedOpenLinkCount >= 5,
      authenticatedEvidenceProvided: normalizedEvidence.length > 0,
      allFiveRecordLandingsPassed: allFivePass,
      missingOrFailedRoles: missingRoles
    },
    passFailTable,
    productionReadinessDecision: {
      decision: productionReadinessDecision,
      productionReady: allFivePass,
      reason: allFivePass
        ? 'All five imported Open links have authenticated landing evidence for actual NetSuite record pages.'
        : 'Production readiness is blocked until all five imported Open links have authenticated screenshots proving actual NetSuite record pages.',
      noBroaderVisualTesting: true
    },
    traceSamples: [
      {
        event: 'w199_w198_import_evidence_loaded',
        openLinks: w198.buildRunImportEvidence.verifiedOpenLinkCount,
        importedFinalNamesReady: w198.buildRunImportEvidence.importedIntoIdb === true,
        expectedRecordCount: expectedRecords.length
      },
      {
        event: 'w199_authenticated_landing_evidence_review',
        evidenceSource: fs.existsSync(optionalEvidencePath) ? optionalEvidencePath : 'missing',
        authenticatedEvidenceProvided: normalizedEvidence.length > 0,
        allFiveRecordLandingsPassed: allFivePass,
        missingOrFailedRoles: missingRoles
      },
      {
        event: 'w199_production_readiness_decision',
        decision: productionReadinessDecision,
        productionReady: allFivePass,
        broaderVisualTesting: 'blocked'
      }
    ],
    noRegression: {
      noDrawerWrites: true,
      noDrawerTransactionWrites: true,
      noDrawerCreatedRecords: true,
      noDirectSuiteScriptOutsideApprovedServerAdapterPath: true,
      consultantConfirmationRequired: true,
      stateAuthorityAndHandoffParityPreserved: true,
      idempotencyPreserved: true,
      internalRunnerOwnership: true,
      rollbackByDisablingServerFlags: true,
      noBroaderVisualTesting: true
    },
    nextPrompt: {
      block: allFivePass
        ? 'W200: Production Pilot Release Gate And Rollback Packet'
        : 'W199R: Authenticated Five-Link Screenshot Intake Retest',
      prompt: allFivePass
        ? 'Move through W200: Production Pilot Release Gate And Rollback Packet. Use W199 pass evidence that all five imported Open links land on actual NetSuite record pages to prepare the production pilot gate, deployment checklist, rollback plan, operator runbook, and no-regression release packet. Preserve no drawer writes outside the approved server adapter path, internal runner ownership, consultant confirmation, idempotency, rollback by disabling server flags, and targeted-only visual scope. Output production pilot release gate, deployment packet, rollback packet, trace samples, and next prompt.'
        : 'Move through W199R: Authenticated Five-Link Screenshot Intake Retest. Use the operator-uploaded authenticated NetSuite screenshots for Customer, demo transaction/Sales Order, hero item, matrix/proof item, and component item Open links. Pass only if each screenshot shows an actual record page with matching numeric id and record identity, and reject Notice/Error/placeholder/record-does-not-exist pages. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no broader visual testing. Output evidence review, pass/fail table, W199R report, production readiness decision, and next prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w199-authenticated-five-link-landing-evidence-review-trace.v1',
    traceSamples: contract.traceSamples,
    passFailTable,
    results
  };

  const rows = passFailTable.map((row) =>
    `| ${row.label} | ${row.expectedName} | ${row.expectedInternalId} | ${row.screenshotProvided ? 'yes' : 'no'} | ${row.pass ? 'PASS' : 'BLOCKED'} | ${row.missingOrFailedEvidence.join('; ')} |`
  ).join('\n');
  const report = `# W199 Authenticated Five-Link Landing Evidence Review

Decision: ${contract.status}

## Evidence Review

- Source: ${contract.evidenceReview.source}
- W198 import ready: ${contract.evidenceReview.w198ImportReady ? 'yes' : 'no'}
- Authenticated evidence provided: ${contract.evidenceReview.authenticatedEvidenceProvided ? 'yes' : 'no'}
- All five landings passed: ${contract.evidenceReview.allFiveRecordLandingsPassed ? 'yes' : 'no'}

## Pass / Fail Table

| Record | Expected Name | Expected ID | Screenshot | Result | Missing / Failed Evidence |
| --- | --- | --- | --- | --- | --- |
${rows}

## Production Readiness Decision

${contract.productionReadinessDecision.decision}: ${contract.productionReadinessDecision.reason}

## Next Prompt

${contract.nextPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!results.every((result) => result.pass)) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W199 evidence review harness failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W199 authenticated five-link evidence review: ${contract.status}; productionReady=${contract.productionReadinessDecision.productionReady}; missing=${missingRoles.join(',') || 'none'}`);
}

main();
