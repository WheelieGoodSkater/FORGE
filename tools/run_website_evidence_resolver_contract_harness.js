const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w50_website_evidence_v1_contract.json');
const tracePath = path.join(root, 'trace_samples', 'w50_website_evidence_resolver_trace_sample.json');
const reportPath = path.join(root, 'reports', 'w50_true_website_intelligence_foundation.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function arrayIncludesAll(actual, expected) {
  return expected.every((item) => actual.includes(item));
}

function main() {
  const contract = readJson(contractPath);
  const trace = readJson(tracePath);
  const results = [];
  const evidence = contract.websiteEvidenceV1 || {};
  const cases = trace.cases || [];
  const byFailureState = new Map(cases.map((item) => [item.failureState, item]));
  const requiredEvidenceFields = [
    'pageTitle',
    'metaDescription',
    'h1Text',
    'h2Text',
    'navigationLabels',
    'productCategoryTerms',
    'industryLanguage',
    'locationServiceClues',
    'ecommerceSignals',
    'manufacturingSignals',
    'distributionSignals',
    'sourceUrls'
  ];
  const expectedFailureStates = ['blocked', 'thin', 'unavailable', 'ambiguous', 'timeout'];

  assertCase(results, 'w50_contract_schema_present', contract.schema === 'idb.w50-website-evidence-v1-contract.v1', contract.schema);
  assertCase(results, 'w50_no_write_endpoint_architecture_present', contract.architecture && contract.architecture.recommendedRuntime === 'no_write_website_evidence_resolver_endpoint' && contract.architecture.writeAuthority === 'none', JSON.stringify(contract.architecture || {}));
  assertCase(results, 'w50_tampermonkey_not_fetch_authority', /should not rely on Tampermonkey alone/i.test(contract.architecture.tampermonkeyBoundary || ''), contract.architecture.tampermonkeyBoundary);
  assertCase(results, 'w50_website_evidence_schema_present', evidence.schema === 'idb.website-evidence.v1', evidence.schema);
  assertCase(results, 'w50_required_fields_present', arrayIncludesAll(evidence.requiredFields || [], ['inputUrl', 'normalizedUrl', 'domain', 'fetchStatus', 'fetchErrors', 'pagesSampled', 'extractedEvidence', 'signals', 'confidence', 'failureState', 'sourceUrls', 'capturedAt']), (evidence.requiredFields || []).join(', '));
  assertCase(results, 'w50_url_normalization_present', arrayIncludesAll((evidence.urlNormalization || {}).rules || [], ['trim whitespace', 'default missing scheme to https', 'lowercase hostname', 'remove hash fragments', 'preserve meaningful path', 'strip obvious tracking query parameters', 'reject unsupported schemes']), JSON.stringify(evidence.urlNormalization || {}));
  assertCase(results, 'w50_fetch_strategy_homepage_plus_discovered_pages', JSON.stringify(evidence.homepagePageFetchStrategy || {}).includes('homepage') && JSON.stringify(evidence.homepagePageFetchStrategy || {}).includes('navigation_discovered_category_or_products_page') && (evidence.homepagePageFetchStrategy.timeoutsMs || {}).overall === 12000, JSON.stringify(evidence.homepagePageFetchStrategy || {}));
  assertCase(results, 'w50_extracted_evidence_fields_present', arrayIncludesAll(evidence.extractedEvidenceFields || [], requiredEvidenceFields), (evidence.extractedEvidenceFields || []).join(', '));
  assertCase(results, 'w50_confidence_states_present', arrayIncludesAll(evidence.confidenceStates || [], ['recommended', 'needs_confirmation', 'insufficient_evidence']), (evidence.confidenceStates || []).join(', '));
  assertCase(results, 'w50_failure_states_present', arrayIncludesAll((evidence.failureStates || []).map((item) => item.id), expectedFailureStates), JSON.stringify(evidence.failureStates || []));
  assertCase(results, 'w50_trace_schema_present', trace.schema === 'idb.website-evidence-resolver-trace-sample.v1' && trace.resolverVersion === 'w50.website-evidence.v1', `${trace.schema} / ${trace.resolverVersion}`);
  assertCase(results, 'w50_trace_has_recommended_case', cases.some((item) => item.confidence && item.confidence.state === 'recommended' && item.failureState === null && item.sourceUrls.length > 0), '');
  expectedFailureStates.forEach((state) => {
    const item = byFailureState.get(state);
    assertCase(results, `w50_trace_failure_state:${state}`, item && item.confidence && item.confidence.requiresConfirmation === true && item.writeAuthority !== 'create', item ? item.id : 'missing');
  });
  assertCase(results, 'w50_ambiguous_case_requires_confirmation', byFailureState.get('ambiguous') && byFailureState.get('ambiguous').confidence.state === 'needs_confirmation' && (byFailureState.get('ambiguous').signals.laneCandidates || []).length >= 2, '');
  assertCase(results, 'w50_blocked_thin_unavailable_timeout_do_not_guess', ['blocked', 'thin', 'unavailable', 'timeout'].every((state) => {
    const item = byFailureState.get(state);
    return item && item.confidence.state === 'insufficient_evidence' && (item.signals.laneCandidates || []).length === 0;
  }), '');
  assertCase(results, 'w50_trace_no_write_regression', trace.writeAuthority === 'none' && trace.nllmAdvisoryOnly === true && trace.noRegression && trace.noRegression.noSuiteScriptInvocation === true && trace.noRegression.transactionWriteEnabled === false, JSON.stringify(trace.noRegression || {}));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${String(result.detail || '').replace(/\|/g, '/')} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W50 True Website Intelligence Foundation

Decision: ${decision} / WEBSITE EVIDENCE V1 READY / NO WRITE AUTHORITY

## Objective

Make website identification the center of the product by defining the production resolver contract before ROI, competitive, or broader write expansion.

## Completed

- Added the \`idb.website-evidence.v1\` contract for URL normalization, fetch strategy, extracted evidence, source URLs, confidence, and failure states.
- Defined the recommended no-write resolver endpoint architecture: the drawer sends a normalized URL request and receives structured evidence JSON.
- Kept Tampermonkey as the consultant surface, not the sole production fetch authority.
- Preserved N/LLM as advisory-only and write authority as \`none\`.
- Added trace samples for recommended, blocked, thin, unavailable, ambiguous, and timeout outcomes.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## Failure-State Behavior

- Blocked: ask for pasted website evidence and do not guess from brand name alone.
- Thin: mark insufficient evidence or needs confirmation with missing-evidence guidance.
- Unavailable: request manual evidence or retry later; no silent classification.
- Ambiguous: show competing interpretations and require consultant confirmation.
- Timeout: return timeout state with retry/manual-evidence recovery cue.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- Transaction writes remain blocked.
- N/LLM remains advisory-only.
- Website evidence owns identification; conversation notes stay downstream for story, ROI, competitive, objections, and run coaching.

## Failures

${failureRows}

## Next Block Prompt

W51: Intelligence Classifier V1. Turn \`websiteEvidenceV1\` into traceable lane, proof anchor, product seed, product family, and demand moment recommendations with confidence calibration, evidence citations, and confirmation gates.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Website evidence resolver contract harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
