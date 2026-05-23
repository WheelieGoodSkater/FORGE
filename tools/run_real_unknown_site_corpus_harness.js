const fs = require('fs');
const path = require('path');
const { resolveWebsiteEvidenceV1 } = require('./website_evidence_live_adapter');

const root = path.resolve(__dirname, '..');
const corpusPath = path.join(root, 'data', 'w58_real_unknown_site_corpus.json');
const tracePath = path.join(root, 'trace_samples', 'w58_real_unknown_site_corpus_evaluation_trace.json');
const reportPath = path.join(root, 'reports', 'w58_real_unknown_site_corpus.md');
const capturedAt = '2026-05-12T15:58:00.000Z';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const fixturePages = {
  'https://www.trekbikes.com/': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Trek Bikes',
      description: 'Bikes, cycling gear, bicycle equipment, helmets, components, dealer stores, and bike service.',
      nav: [['/bikes', 'Bikes'], ['/equipment', 'Equipment'], ['/stores', 'Stores']],
      h1: 'Bikes and cycling equipment',
      h2: ['Road bikes', 'Mountain bikes'],
      body: 'Shop bikes, bicycle helmets, components, cart, dealer locator, stores, retail service, and replenishment.'
    })
  },
  'https://www.trekbikes.com/bikes': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Trek Bike Catalog',
      description: 'Bicycle SKU catalog with dealer inventory and replenishment signals.',
      nav: [],
      h1: 'Bike catalog',
      h2: ['Bicycle SKU availability'],
      body: 'Dealer inventory, bicycle components, shop, replenishment, and retail stores.'
    })
  },
  'https://www.patagonia.com/': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Patagonia Outdoor Clothing',
      description: 'Apparel, accessories, jackets, footwear, packs, sizes, colors, and seasonal collections.',
      nav: [['/shop', 'Shop'], ['/collections', 'Collections'], ['/footwear', 'Footwear']],
      h1: 'Apparel and accessories',
      h2: ['Jackets by size and color', 'Seasonal collections'],
      body: 'Shop apparel, accessories, footwear, sizes, style variants, cart, checkout, product catalog, and channel availability.'
    })
  },
  'https://www.patagonia.com/shop': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Shop Apparel',
      description: 'Style, size, color variants, footwear, apparel, and accessories.',
      nav: [],
      h1: 'Shop apparel',
      h2: ['Style and size variants'],
      body: 'Apparel product catalog, accessories, shoes, sizes, variants, shop, and checkout.'
    })
  },
  'https://www.grainger.com/': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Industrial Supply Distributor',
      description: 'Industrial products, branch availability, distribution, wholesale inventory, warehouse fulfillment, and replenishment.',
      nav: [['/products', 'Products'], ['/services', 'Services'], ['/locations', 'Locations']],
      h1: 'Industrial supplies and distribution',
      h2: ['Branch fulfillment', 'Warehouse replenishment'],
      body: 'Products, distributor, wholesale, branch availability, warehouse, fulfillment, replenishment, service, and inventory.'
    })
  },
  'https://www.grainger.com/products': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Industrial Products',
      description: 'Distributor SKU catalog for warehouse and branch fulfillment.',
      nav: [],
      h1: 'Products',
      h2: ['Distributor SKU availability'],
      body: 'Industrial distribution, warehouse fulfillment, replenishment, service locations, and inventory.'
    })
  },
  'https://www.lincolnelectric.com/': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Industrial Equipment Manufacturing',
      description: 'Manufacturing equipment, production systems, assembly, components, factory automation, and service.',
      nav: [['/products', 'Products'], ['/solutions', 'Solutions'], ['/services', 'Services']],
      h1: 'Manufacturing equipment and production systems',
      h2: ['Assembly readiness', 'Factory production'],
      body: 'Industrial equipment, manufacturing, production, assembly, components, factory, made to order, work order, and service.'
    })
  },
  'https://www.lincolnelectric.com/products': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Equipment Products',
      description: 'Manufactured item catalog for assembly and component readiness.',
      nav: [],
      h1: 'Equipment products',
      h2: ['Components and assembly'],
      body: 'Manufacturing products, production equipment, assembly, components, and work order readiness.'
    })
  },
  'https://ridgeline-outfitters.example/': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'RidgeLine Outfitters',
      description: 'Outdoor apparel, footwear, accessories, outfitter services, equipment, dealer distribution, and seasonal inventory.',
      nav: [['/collections', 'Collections'], ['/services', 'Services'], ['/dealers', 'Dealers']],
      h1: 'Apparel, footwear, accessories, equipment, and outfitter services',
      h2: ['Style sizes and seasonal variants', 'Dealer distribution services'],
      body: 'Shop apparel, boots, accessories, equipment, service appointments, dealer locator, wholesale replenishment, distribution, and product catalog.'
    })
  },
  'https://ridgeline-outfitters.example/collections': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Collections and Services',
      description: 'Apparel styles, equipment products, service appointments, and dealer replenishment.',
      nav: [],
      h1: 'Collections',
      h2: ['Styles and services'],
      body: 'Style, sizes, accessories, dealer, distribution, replenishment, service, and equipment.'
    })
  },
  'https://thin-prospect.example/': {
    status: 200,
    contentType: 'text/html',
    body: pageHtml({
      title: 'Welcome',
      description: '',
      nav: [['/about', 'About'], ['/contact', 'Contact']],
      h1: 'Welcome',
      h2: [],
      body: 'We help customers succeed.'
    })
  },
  'https://blocked-prospect.example/': {
    status: 403,
    contentType: 'text/html',
    body: '<html><title>Access blocked</title></html>'
  },
  'https://unavailable-prospect.example/': {
    status: 0,
    contentType: '',
    body: '',
    error: { type: 'dns_or_network_error', message: 'Host unavailable in corpus fixture.' }
  },
  'https://timeout-prospect.example/': {
    status: 0,
    contentType: '',
    body: '',
    error: { type: 'timeout', message: 'Resolver timed out in corpus fixture.' }
  }
};

const proofAnchorByLane = {
  apparel_accessories: { label: 'Style / SKU Matrix' },
  dealer_hardgoods: { label: 'Product / SKU' },
  industrial_distribution: { label: 'Inventory / Fulfillment' },
  industrial_equipment: { label: 'Assembly' }
};

function pageHtml({ title, description, nav, h1, h2, body }) {
  const navHtml = (nav || []).map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n');
  const h2Html = (h2 || []).map((value) => `<h2>${value}</h2>`).join('\n');
  return `<html><head><title>${title}</title><meta name="description" content="${description}" /></head><body><nav>${navHtml}</nav><h1>${h1}</h1>${h2Html}<p>${body}</p></body></html>`;
}

function mockFetchPage(url) {
  const exact = fixturePages[url];
  const slash = fixturePages[url.endsWith('/') ? url : `${url}/`];
  const response = exact || slash;
  if (!response) {
    return Promise.resolve({
      url,
      status: 404,
      contentType: 'text/html',
      body: '',
      error: { type: 'dns_or_network_error', message: `No W58 fixture registered for ${url}.` }
    });
  }
  return Promise.resolve(Object.assign({ url, finalUrl: url }, response));
}

function citationFromEvidence(evidence, supports) {
  const extracted = evidence.extractedEvidence || {};
  const candidates = [
    ['pageTitle', extracted.pageTitle],
    ['metaDescription', extracted.metaDescription],
    ['h1Text', (extracted.h1Text || [])[0]],
    ['h2Text', (extracted.h2Text || [])[0]],
    ['navigationLabels', (extracted.navigationLabels || [])[0]],
    ['productCategoryTerms', (extracted.productCategoryTerms || [])[0]],
    ['industryLanguage', (extracted.industryLanguage || [])[0]]
  ].filter((item) => item[1]);
  return candidates.slice(0, 3).map(([field, value], index) => ({
    sourceUrl: (evidence.sourceUrls || [])[index] || (evidence.sourceUrls || [])[0] || evidence.normalizedUrl,
    field,
    value,
    supports
  }));
}

function classifyEvidence(evidence) {
  const best = (evidence.signals.laneCandidates || [])[0] || null;
  const second = (evidence.signals.laneCandidates || [])[1] || null;
  const base = {
    inputEvidenceSchema: evidence.schema,
    normalizedUrl: evidence.normalizedUrl,
    domain: evidence.domain,
    laneRecommendation: null,
    proofAnchorRecommendation: null,
    productSeed: '',
    productFamily: '',
    demandMoment: '',
    confidence: evidence.confidence,
    evidenceCitations: [],
    competingCandidates: [],
    confirmationPrompt: null,
    classificationState: evidence.confidence.state,
    writeAuthority: 'none',
    nllmAuthority: 'advisory_only',
    notesBoundary: {
      notesDidOverrideIdentification: false,
      notesNotAllowedFor: ['laneRecommendation', 'proofAnchorRecommendation', 'productSeed', 'productFamily', 'demandMoment'],
      notesAllowedFor: ['pain', 'roi', 'competitiveFraming', 'objections', 'talkTrack', 'runCoaching']
    }
  };
  if (evidence.confidence.state === 'insufficient_evidence' || !best) {
    base.confirmationPrompt = {
      reason: evidence.failureState || 'thin_or_missing_website_evidence',
      missingEvidence: 'Need reachable category, product, service, or industry website evidence.',
      question: 'Can the consultant provide stronger website evidence before IDB selects a lane?'
    };
    return base;
  }
  if (evidence.confidence.state === 'needs_confirmation') {
    base.laneRecommendation = { laneId: best.laneId, score: best.score };
    base.proofAnchorRecommendation = proofAnchorByLane[best.laneId] || { label: '' };
    base.evidenceCitations = citationFromEvidence(evidence, `candidate:${best.laneId}`);
    base.competingCandidates = (evidence.signals.laneCandidates || []).slice(0, 3).map((candidate) => ({
      laneId: candidate.laneId,
      score: candidate.score,
      whyItMightFit: `Website evidence includes ${candidate.evidence.join(', ') || 'overlapping category language'}.`,
      evidenceCitations: citationFromEvidence(evidence, `candidate:${candidate.laneId}`).slice(0, 2)
    }));
    base.confirmationPrompt = {
      reason: evidence.failureState === 'ambiguous' ? 'multiple plausible lanes detected' : 'classification below recommendation threshold',
      missingEvidence: 'Need consultant confirmation of the business model and product category before ROI, competitive, or write preparation.',
      question: 'Which classification should IDB use for this prospect?'
    };
    return base;
  }
  base.laneRecommendation = { laneId: best.laneId, score: best.score };
  base.proofAnchorRecommendation = proofAnchorByLane[best.laneId] || { label: '' };
  base.productSeed = evidence.signals.productSeed;
  base.productFamily = evidence.signals.productFamily;
  base.demandMoment = evidence.signals.demandMoment;
  base.evidenceCitations = citationFromEvidence(evidence, `recommended:${best.laneId}`);
  return base;
}

function laneMatches(result, label) {
  if (!label.expectedLaneId) {
    return result.classification.laneRecommendation === null;
  }
  const actual = result.classification.laneRecommendation && result.classification.laneRecommendation.laneId;
  return actual === label.expectedLaneId || (label.acceptedAlternateLaneIds || []).includes(actual);
}

function expectedFieldsMatch(result, label) {
  const classification = result.classification;
  if (label.expectedClassificationState === 'insufficient_evidence') {
    return classification.productSeed === '' && classification.productFamily === '' && classification.demandMoment === '';
  }
  if (label.expectedClassificationState === 'needs_confirmation') {
    return !!classification.confirmationPrompt && classification.competingCandidates.length >= 2;
  }
  return classification.productSeed === label.expectedProductSeed
    && classification.productFamily === label.expectedProductFamily
    && classification.demandMoment.includes(label.expectedDemandMomentContains || '');
}

function evidenceCovered(result) {
  const classification = result.classification;
  if (classification.classificationState === 'recommended') {
    return classification.evidenceCitations.length >= 2 && classification.evidenceCitations.every((citation) => citation.sourceUrl && citation.field && citation.value && citation.supports);
  }
  if (classification.classificationState === 'needs_confirmation') {
    return !!classification.confirmationPrompt
      && classification.competingCandidates.length >= 2
      && classification.competingCandidates.every((candidate) => candidate.evidenceCitations.length >= 1 && candidate.evidenceCitations.every((citation) => citation.sourceUrl && citation.field && citation.value));
  }
  return !!classification.confirmationPrompt
    && classification.laneRecommendation === null
    && classification.productSeed === ''
    && classification.productFamily === ''
    && classification.demandMoment === '';
}

function unsupportedClaimCount(result) {
  const classification = result.classification;
  if (classification.classificationState === 'insufficient_evidence') {
    return classification.laneRecommendation || classification.productSeed || classification.productFamily || classification.demandMoment ? 1 : 0;
  }
  if (classification.classificationState === 'recommended' && classification.evidenceCitations.length < 2) {
    return 1;
  }
  if (classification.classificationState === 'needs_confirmation' && !classification.confirmationPrompt) {
    return 1;
  }
  return 0;
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

async function main() {
  const corpus = readJson(corpusPath);
  const findings = [];
  for (const label of corpus.humanLabeledCorpus) {
    const evidence = await resolveWebsiteEvidenceV1(label.website, { fetchClient: mockFetchPage, capturedAt });
    const classification = classifyEvidence(evidence);
    const stateMatches = classification.classificationState === label.expectedClassificationState;
    const laneOk = laneMatches({ classification }, label);
    const fieldsOk = expectedFieldsMatch({ classification }, label);
    const covered = evidenceCovered({ classification });
    const unsupportedClaims = unsupportedClaimCount({ classification });
    const falseConfidentWrong = classification.classificationState === 'recommended' && (!laneOk || !fieldsOk);
    const correctOrHonest = stateMatches
      && covered
      && unsupportedClaims === 0
      && !falseConfidentWrong
      && (classification.classificationState === 'recommended' ? laneOk && fieldsOk : true);
    const notes = [];
    if (!stateMatches) notes.push(`state:${classification.classificationState}->${label.expectedClassificationState}`);
    if (!laneOk) notes.push('lane_mismatch_or_guess');
    if (!fieldsOk) notes.push('field_mismatch');
    if (!covered) notes.push('evidence_coverage_gap');
    if (unsupportedClaims) notes.push('unsupported_claim');
    if (falseConfidentWrong) notes.push('false_confident_wrong');
    findings.push({
      id: label.id,
      siteKind: label.siteKind,
      sourceType: label.sourceType,
      website: label.website,
      expectedClassificationState: label.expectedClassificationState,
      actualClassificationState: classification.classificationState,
      expectedLaneId: label.expectedLaneId,
      actualLaneId: classification.laneRecommendation ? classification.laneRecommendation.laneId : '',
      correctOrHonest,
      falseConfidentWrong,
      unsupportedClaimCount: unsupportedClaims,
      evidenceCovered: covered,
      resolverFailureState: evidence.failureState,
      pagesSampledCount: evidence.pagesSampled.length,
      sourceUrlCount: evidence.sourceUrls.length,
      status: correctOrHonest ? 'PASS' : 'FAIL',
      notes,
      evidence,
      classification
    });
  }

  const policy = corpus.evaluationPolicy;
  const total = findings.length;
  const correctOrHonestCount = findings.filter((item) => item.correctOrHonest).length;
  const falseConfidentWrongCount = findings.filter((item) => item.falseConfidentWrong).length;
  const unsupportedClaimTotal = findings.reduce((sum, item) => sum + item.unsupportedClaimCount, 0);
  const evidenceCoveredCount = findings.filter((item) => item.evidenceCovered).length;
  const realUrlSeedCount = findings.filter((item) => item.sourceType === 'real_url_seed_fixture_snapshot').length;
  const requiredMix = corpus.requiredSiteMix || [];
  const actualMix = new Set(findings.map((item) => item.siteKind));
  const mixCovered = requiredMix.every((kind) => actualMix.has(kind));
  const failureStatesCovered = ['blocked', 'thin', 'unavailable', 'ambiguous', 'timeout'].every((state) => findings.some((item) => item.resolverFailureState === state));
  const metrics = {
    totalCases: total,
    realUrlSeedCount,
    correctOrHonestCount,
    correctOrHonestPassRate: Number((correctOrHonestCount / total).toFixed(4)),
    falseConfidentWrongCount,
    falseConfidentWrongRate: Number((falseConfidentWrongCount / total).toFixed(4)),
    unsupportedClaimCount: unsupportedClaimTotal,
    evidenceCoverageScore: Number((evidenceCoveredCount / total).toFixed(4)),
    mixCovered,
    failureStatesCovered
  };
  const decision = total >= policy.minimumCorpusCases
    && realUrlSeedCount >= policy.minimumRealUrlSeedCases
    && metrics.correctOrHonestPassRate >= policy.correctOrHonestPassRateMinimum
    && metrics.falseConfidentWrongRate <= policy.falseConfidentWrongRateMaximum
    && metrics.unsupportedClaimCount <= policy.unsupportedClaimsMaximum
    && metrics.evidenceCoverageScore >= policy.traceEvidenceCoverageMinimum
    && mixCovered
    && failureStatesCovered
    && findings.every((item) => item.status === 'PASS')
    ? 'PASS'
    : 'FAIL';

  const traceFindings = findings.map((item) => ({
    id: item.id,
    siteKind: item.siteKind,
    sourceType: item.sourceType,
    website: item.website,
    expectedClassificationState: item.expectedClassificationState,
    actualClassificationState: item.actualClassificationState,
    expectedLaneId: item.expectedLaneId,
    actualLaneId: item.actualLaneId,
    correctOrHonest: item.correctOrHonest,
    falseConfidentWrong: item.falseConfidentWrong,
    unsupportedClaimCount: item.unsupportedClaimCount,
    evidenceCovered: item.evidenceCovered,
    resolverFailureState: item.resolverFailureState,
    pagesSampledCount: item.pagesSampledCount,
    sourceUrlCount: item.sourceUrlCount,
    notes: item.notes,
    evidence: item.evidence,
    classification: item.classification
  }));
  fs.writeFileSync(tracePath, `${JSON.stringify({
    schema: 'idb.w58-real-unknown-site-corpus-evaluation-trace.v1',
    generated: capturedAt,
    decision,
    corpusSchema: corpus.schema,
    fixturePolicy: corpus.fixturePolicy,
    thresholds: policy,
    metrics,
    requiredSiteMix: requiredMix,
    noRegression: corpus.noRegression,
    findings: traceFindings
  }, null, 2)}\n`);

  const rows = findings.map((item) => `| ${item.status} | ${item.id} | ${item.siteKind} | ${item.actualClassificationState} | ${item.actualLaneId || 'none'} | ${item.correctOrHonest ? 'yes' : 'no'} | ${item.falseConfidentWrong ? 'yes' : 'no'} | ${item.unsupportedClaimCount} | ${item.evidenceCovered ? 'yes' : 'no'} | ${item.resolverFailureState || 'none'} | ${escapeTable(item.notes.join(', ') || 'None')} |`).join('\n');
  const report = `# W58 Real Unknown-Site Corpus

Decision: ${decision} / REAL UNKNOWN-SITE CORPUS READY / NO WRITE AUTHORITY

## Objective

Prove the live resolver and classifier against real consultant-style websites.

## Completed

- Added a human-labeled W58 corpus with real URL seeds and synthetic failure cases.
- Evaluated W57 resolver output and classifier-shaped recommendations together.
- Added evidence coverage scoring, false-confident-wrong detection, unsupported-claim checks, and required site mix coverage.
- Covered product brand, distributor/dealer, apparel/accessories, manufacturing-heavy, ambiguous, weak/thin, blocked, unavailable, and timeout cases.

## Fixture Honesty

This W58 corpus uses deterministic HTML snapshots for real URL seeds so preflight stays stable without live internet access. It does not claim the snapshots are current live website content. W59 should compare approved live fetch results against these labels and report drift.

## Scorecard

| Metric | Value | Threshold |
| --- | ---: | ---: |
| Total cases | ${metrics.totalCases} | >= ${policy.minimumCorpusCases} |
| Real URL seed cases | ${metrics.realUrlSeedCount} | >= ${policy.minimumRealUrlSeedCases} |
| Correct or honest pass rate | ${metrics.correctOrHonestPassRate} | >= ${policy.correctOrHonestPassRateMinimum} |
| False-confident-wrong rate | ${metrics.falseConfidentWrongRate} | <= ${policy.falseConfidentWrongRateMaximum} |
| Unsupported claim count | ${metrics.unsupportedClaimCount} | <= ${policy.unsupportedClaimsMaximum} |
| Evidence coverage score | ${metrics.evidenceCoverageScore} | >= ${policy.traceEvidenceCoverageMinimum} |
| Required site mix covered | ${metrics.mixCovered ? 'yes' : 'no'} | yes |
| Failure states covered | ${metrics.failureStatesCovered ? 'yes' : 'no'} | yes |

## Case Results

| Status | Case | Site Kind | State | Lane | Correct/Honest | False Confident Wrong | Unsupported Claims | Evidence Covered | Failure State | Notes |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |
${rows}

## No Regression

- Write authority remains \`none\`.
- Resolver/classifier evaluation does not invoke SuiteScript.
- N/LLM remains advisory-only.
- Notes cannot own identification.
- Blocked, thin, unavailable, and timeout cases do not produce confident guesses.
- Ambiguous cases require confirmation and competing candidates.

## Next Block Prompt

W59: Confidence Calibration And Live Fetch Drift. Use the W58 corpus to tune thresholds and compare deterministic snapshot results against approved live resolver fetches. The goal is to reduce false-confident-wrong outcomes, identify website drift, preserve honest uncertainty, and prepare the corpus for five-consultant pilot testing.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Real unknown-site corpus harness: ${decision} (${correctOrHonestCount}/${total} correct or honest, ${unsupportedClaimTotal} unsupported claims)`);
  if (decision !== 'PASS') {
    console.error(findings.filter((item) => item.status !== 'PASS').map((item) => ({ id: item.id, notes: item.notes, state: item.actualClassificationState, lane: item.actualLaneId })));
    process.exit(1);
  }
}

main();
