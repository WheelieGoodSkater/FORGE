const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w66_live_extraction_gap_closure_resolver_tuning.json');
const w65TracePath = path.join(root, 'trace_samples', 'w65_approved_live_resolver_smoke_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w66_live_extraction_gap_closure_trace.json');
const reportPath = path.join(root, 'reports', 'w66_live_extraction_gap_closure_resolver_tuning.md');
const resolverPath = path.join(root, 'tools', 'website_resolver_service_v1.js');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function findingById(trace, id) {
  return (trace.findings || []).find((item) => item.id === id) || {};
}

function main() {
  const contract = readJson(contractPath);
  const w65Trace = readJson(w65TracePath);
  const resolverSource = fs.readFileSync(resolverPath, 'utf8');
  const trek = findingById(w65Trace, 'w65_live_trek');
  const patagonia = findingById(w65Trace, 'w65_live_patagonia');
  const grainger = findingById(w65Trace, 'w65_live_grainger');
  const lincoln = findingById(w65Trace, 'w65_live_lincoln_electric');
  const results = [];

  assertCase(results, 'w66_resolver_version_advanced', /websiteResolverServiceV1\.local-prototype\.w66/.test(resolverSource) && /w66\.extraction-policy\.v1/.test(resolverSource), 'website_resolver_service_v1.js');
  assertCase(results, 'w66_bicycle_terms_and_discovery_added', ['bike', 'bikes', 'bicycle', 'cycling', 'electric bikes', 'equipment', 'helmets', 'mountain bikes', 'road bikes'].every((term) => resolverSource.includes(`'${term}'`)), 'bicycle/cycling terms');
  assertCase(results, 'w66_dealer_weighting_prefers_bicycle_hardgoods', /dealer_hardgoods:[\s\S]*?Bicycle SKU/.test(resolverSource) && /bike'\s*, 'bikes'/.test(resolverSource) && /retailer/.test(resolverSource), 'dealer_hardgoods weighting');
  assertCase(results, 'w66_trek_live_gap_closed', trek.actualState === 'recommended' && trek.actualLaneId === 'dealer_hardgoods' && trek.driftType === 'stable' && trek.actualScore >= 0.82, JSON.stringify(trek));
  assertCase(results, 'w66_trek_no_extraction_gaps_remaining', Array.isArray(trek.extractionGaps) && trek.extractionGaps.length === 0 && trek.sourceUrlCount >= 2, JSON.stringify(trek.extractionGaps || []));
  assertCase(results, 'w66_thin_and_blocked_sites_remain_honest', [patagonia, grainger, lincoln].every((item) => item.actualState === 'insufficient_evidence' && !item.actualLaneId && ['thin', 'blocked', 'unavailable', 'timeout'].includes(item.failureState)), JSON.stringify([patagonia, grainger, lincoln].map((item) => ({ id: item.id, state: item.actualState, lane: item.actualLaneId, failure: item.failureState }))));
  assertCase(results, 'w66_no_false_confident_wrong_or_unsupported_claims', w65Trace.metrics.falseConfidentWrongCount === 0 && w65Trace.metrics.unsupportedClaimCount === 0, JSON.stringify(w65Trace.metrics));
  assertCase(results, 'w66_no_write_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.blockedThinUnavailableTimeoutDoNotGuess === true && contract.noRegression.transactionWriteEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w66_best_next_prompt_present', /Move through W67/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.block);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w66-live-extraction-gap-closure-trace.v1',
    generated: new Date().toISOString(),
    decision,
    resolverVersion: contract.implementedTuning.resolverVersion,
    beforeW66FromW65: contract.beforeAfterExpectations.beforeW66FromW65,
    afterW66Metrics: w65Trace.metrics,
    beforeAfterFindings: {
      trek: {
        before: contract.beforeAfterExpectations.beforeW66FromW65.trek,
        after: {
          actualState: trek.actualState,
          actualLaneId: trek.actualLaneId,
          driftType: trek.driftType,
          sourceUrlCount: trek.sourceUrlCount,
          extractionGaps: trek.extractionGaps
        }
      },
      unchangedHonestFailures: [patagonia, grainger, lincoln].map((item) => ({
        id: item.id,
        actualState: item.actualState,
        actualLaneId: item.actualLaneId,
        failureState: item.failureState,
        extractionGaps: item.extractionGaps
      }))
    },
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W66 Live Extraction Gap Closure And Resolver Tuning

Decision: ${decision} / LIVE EXTRACTION GAP PARTIALLY CLOSED / NO WRITE AUTHORITY

## Objective

Use W65 live smoke findings to close resolver extraction gaps for approved public websites without overfitting to static fixtures.

## What Changed

- Added bicycle, cycling, bike, equipment, helmet, road-bike, mountain-bike, electric-bike, gear, parts, and gravel terms to resolver extraction.
- Added bicycle/cycling/equipment/helmet discovery labels.
- Reweighted Dealer Hardgoods so readable bicycle/cycling pages lead with \`dealer_hardgoods\`.
- Aligned Dealer Hardgoods resolver output to \`Bicycle SKU\` and \`Bicycle Dealer Hardgoods\`.
- Preserved thin/blocked honesty for Patagonia, Grainger, and Lincoln Electric.

## Live Before / After

- Trek before W66: ${contract.beforeAfterExpectations.beforeW66FromW65.trek}
- Trek after W66: ${trek.actualState} / ${trek.actualLaneId} / ${trek.driftType}
- Current live metrics: recommended ${w65Trace.metrics.recommendedCount}, needs confirmation ${w65Trace.metrics.needsConfirmationCount}, insufficient ${w65Trace.metrics.insufficientEvidenceCount}, false-confident-wrong ${w65Trace.metrics.falseConfidentWrongCount}, unsupported claims ${w65Trace.metrics.unsupportedClaimCount}

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## Remaining Gaps

- Patagonia remains thin from the public resolver response.
- Grainger remains thin from the public resolver response.
- Lincoln Electric remains blocked by HTTP 403.
- Production readiness still needs hosted endpoint behavior, caching, observability, and pilot rollout controls.

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Live extraction gap closure harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
