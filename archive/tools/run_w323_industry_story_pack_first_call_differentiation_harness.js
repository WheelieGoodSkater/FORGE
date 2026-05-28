#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  root,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function includesAny(text, terms) {
  return terms.some((term) => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text));
}

function storyText(fixture) {
  return JSON.stringify(fixture.expectedStory || {});
}

function scoreFixture(fixture) {
  const story = fixture.expectedStory || {};
  const notes = fixture.firstCallNotes || {};
  const text = storyText(fixture);
  const wrongTerms = ['Finished/Assembly Item', 'Formula or Batch Structure', 'Ingredient', 'Component Item', 'Work Order', 'Routing', 'WIP'];
  const score = {
    industrySpecificity: new RegExp(fixture.industry.split(' ')[0], 'i').test(`${fixture.industry} ${fixture.subIndustry} ${text}`) && !/generic ERP/i.test(text),
    proofRecordFit: Array.isArray(story.proofRecordRoles) && story.proofRecordRoles.length >= 4 && /SKU|Sales Order|Availability|Fulfillment|Dealer/i.test(story.proofRecordRoles.join(' ')),
    storyUsefulness: /Open|show|prove/i.test(story.proofMove || '') && /NetSuite|proof path|returned records|SKU/i.test(`${story.proofMove} ${story.demoPath}`),
    objectionReadiness: /ask|show|validate|returned records|proof path/i.test(story.objectionResponse || ''),
    claimSafety: /risk reduction|baseline|after.*confirm|confirmed/i.test(story.roiSafeValueFraming || '') && /Do not claim|Do not/i.test(story.noClaimCaution || ''),
    vocabularySafety: !includesAny(text, wrongTerms) || /Do not claim/i.test(story.noClaimCaution || ''),
    weakEvidenceHonesty: /confirm|confirmation|review-only|missing|weak/i.test(`${notes.uncertaintyOrMissingEvidence || ''} ${story.weakEvidenceConfirmationBehavior || ''}`)
  };
  return Object.assign({}, score, {
    pass: Object.keys(score).every((key) => score[key] === true)
  });
}

function main() {
  const results = [];
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const sourceLanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w321Trace = readArchiveJson('trace_samples', 'w321_live_writeback_baseline_industry_story_pivot_trace.json');
  const w322Trace = readArchiveJson('trace_samples', 'w322_distribution_proof_record_vocabulary_story_polish_trace.json');
  const report = readArchiveText('reports', 'w323_industry_story_pack_architecture.md');
  const trace = readArchiveJson('trace_samples', 'w323_industry_story_pack_architecture_trace.json');
  const fixtures = readArchiveJson('fixtures', 'w323_industry_story_first_call_fixtures.json');
  const fixtureList = fixtures.fixtures || [];
  const scores = fixtureList.map((fixture) => ({ id: fixture.id, score: scoreFixture(fixture) }));
  const requiredFields = trace.requiredStoryPackFields || [];
  const requiredNoteFields = ['buyerRole', 'pain', 'proofRequested', 'valueHypothesis', 'competitorOrSpreadsheetPressure', 'uncertaintyOrMissingEvidence'];

  assertCase(results, 'w321-baseline-remains-frozen',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w321Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w321Trace.guardrails.w151W214W245ValidationUnchanged === true,
    JSON.stringify({ status: w321Trace.status }));

  assertCase(results, 'w322-distribution-polish-remains-frozen',
    w322Trace.status === 'distribution_story_polish_ready' &&
      w322Trace.w321BaselineProtected === true &&
      w322Trace.distributionProofRecordVocabulary.safeLabels.indexOf('Branch Availability / Replenishment Flow') >= 0 &&
      w322Trace.guardrails.w151W214W245ValidationUnchanged === true,
    JSON.stringify({ status: w322Trace.status }));

  assertCase(results, 'industry-story-pack-architecture-packet-exists',
    /W323: Industry Story Pack Architecture/.test(report) &&
      trace.schema === 'forge.w323.industry-story-pack-architecture.trace.v1' &&
      trace.status === 'industry_story_pack_architecture_ready',
    JSON.stringify({ schema: trace.schema, status: trace.status }));

  assertCase(results, 'all-required-story-pack-fields-are-represented',
    ['buyerProblemSummary', 'proofRecordRoles', 'demoPath', 'proofMove', 'objectionResponse', 'competitiveContrast', 'roiSafeValueFraming', 'noClaimCaution', 'weakEvidenceConfirmationBehavior']
      .every((field) => requiredFields.indexOf(field) >= 0) &&
      fixtureList.every((fixture) => requiredFields.every((field) => Object.prototype.hasOwnProperty.call(fixture.expectedStory || {}, field))),
    JSON.stringify(requiredFields));

  assertCase(results, 'three-realistic-first-call-fixtures-exist',
    fixtureList.length >= 3 &&
      fixtureList.some((fixture) => /Industrial Distribution/i.test(fixture.industry) && /Branch Fulfillment/i.test(fixture.subIndustry)) &&
      fixtureList.some((fixture) => /Electrical Components/i.test(fixture.industry)) &&
      fixtureList.some((fixture) => /Dealer|Hardgoods/i.test(fixture.industry)) &&
      fixtureList.every((fixture) => requiredNoteFields.every((field) => Object.prototype.hasOwnProperty.call(fixture.firstCallNotes || {}, field))),
    fixtureList.map((fixture) => `${fixture.industry} / ${fixture.subIndustry}`).join(' | '));

  assertCase(results, 'each-fixture-produces-differentiated-story-expectations',
    new Set(fixtureList.map((fixture) => fixture.expectedStory.demoPath)).size === fixtureList.length &&
      new Set(fixtureList.map((fixture) => fixture.expectedStory.buyerProblemSummary)).size === fixtureList.length &&
      new Set(fixtureList.map((fixture) => fixture.expectedStory.competitiveContrast)).size === fixtureList.length,
    fixtureList.map((fixture) => fixture.expectedStory.demoPath).join(' | '));

  assertCase(results, 'story-scoring-covers-required-dimensions-and-fixtures-pass',
    ['industrySpecificity', 'proofRecordFit', 'storyUsefulness', 'objectionReadiness', 'claimSafety', 'vocabularySafety', 'weakEvidenceHonesty']
      .every((key) => Object.prototype.hasOwnProperty.call(trace.storyScoringModel || {}, key)) &&
      scores.every((item) => item.score.pass === true),
    JSON.stringify(scores));

  const distributionFixture = fixtureList.find((fixture) => fixture.id === 'gulfshore-industrial-supply-branch-fulfillment') || {};
  assertCase(results, 'distribution-fixture-preserves-w322-safe-labels-and-blocked-vocabulary',
    ['Customer', 'Sales Order', 'Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU']
      .every((label) => (distributionFixture.expectedStory.proofRecordRoles || []).indexOf(label) >= 0) &&
      w322Trace.distributionProofRecordVocabulary.blockedConsultantFacingTerms.every((term) => !storyText(distributionFixture).includes(term) || /Do not claim/.test(distributionFixture.expectedStory.noClaimCaution || '')),
    JSON.stringify(distributionFixture.expectedStory || {}));

  assertCase(results, 'no-source-lane-pack-mutation-is-introduced',
    trace.guardrails.sourceLanePacksMutated === false &&
      !/gulfshore-industrial-supply|metrovolt-electrical|ridgeway-outdoor-power/i.test(sourceLanePacks),
    'W323 fixtures should stay archived and review-only');

  assertCase(results, 'w144-submit-refresh-import-remains-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      trace.guardrails.w144SubmitRefreshImportUnchanged === true,
    'W144 adapter anchors remain present');

  assertCase(results, 'w151-w214-w245-validation-remains-unchanged',
    /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      trace.guardrails.w151W214W245ValidationUnchanged === true,
    'drawer validation anchors remain present');

  assertCase(results, 'open-links-remain-after-valid-import-only',
    w321Trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true &&
      w322Trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true &&
      trace.guardrails.openLinksOnlyAfterValidImport === true,
    'Open-link authority guardrail remains frozen');

  assertCase(results, 'no-runtime-authority-changes-or-fake-links',
    trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:industry-story-pack-first-call-differentiation-w323'] === 'node archive/tools/run_w323_industry_story_pack_first_call_differentiation_harness.js' &&
      /run_w323_industry_story_pack_first_call_differentiation_harness/.test(packageJson.scripts.check) &&
      trace.selectedNextBlock.id === 'W324',
    JSON.stringify(trace.selectedNextBlock));

  printResults('W323 industry story pack and first-call differentiation harness', results);
}

main();
