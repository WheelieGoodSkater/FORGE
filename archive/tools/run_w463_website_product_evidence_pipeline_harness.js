#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function requestKeyFor(website, evidence) {
  return ['websiteResolverServiceV1', website || '', String(evidence || '').slice(0, 160)].join('|').toLowerCase();
}

function productRichState(hooks, config) {
  const requestKey = requestKeyFor(config.website, '');
  const state = Object.assign(hooks.defaultState(), {
    open: true,
    selectedLaneId: 'dealer_hardgoods',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    intake: {
      customer: config.customer,
      website: config.website,
      notes: config.notes,
      websiteEvidence: '',
      scObjective: 'Prove product availability and replenishment readiness from public website product evidence.',
      competitor: 'spreadsheets and manual channel allocation',
      decisionCriteria: 'Visible product-specific records instead of generic lane labels.',
      timelineUrgency: ''
    },
    websiteResolverRuntime: {
      requestKey,
      status: 'resolved'
    },
    websiteEvidenceV1: {
      schema: 'idb.website-evidence.v1',
      domain: config.domain,
      fetchStatus: 'captured',
      confidence: { state: 'recommended', score: 0.84 },
      sourceUrls: [config.website, `${config.website.replace(/\/$/, '')}/collections/all`],
      resolverAdapter: { requestKey },
      extractedEvidence: {
        pageTitle: config.pageTitle,
        metaDescription: config.metaDescription,
        productNames: config.productNames,
        productCardNames: config.productNames,
        navigationLabels: ['Shop', 'Products', 'Best Sellers'],
        productCategoryTerms: config.categoryTerms
      },
      signals: {
        laneCandidates: [
          { laneId: 'dealer_hardgoods', score: 0.84, evidence: config.categoryTerms }
        ],
        productSeed: '',
        productFamily: '',
        demandMoment: 'product availability and replenishment readiness'
      }
    }
  });
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl', pageType: 'NetSuite page', confidence: 'low' };
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W463 harness' });
  const drawer = readRepoFile('idb-drawer.user.js');
  const fileCabinetDrawer = readRepoFile('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');

  const fellow = productRichState(hooks, {
    customer: 'Fellow Products',
    website: 'https://fellowproducts.com',
    domain: 'fellowproducts.com',
    pageTitle: 'Fellow coffee gear and brewing products',
    metaDescription: 'Shop electric kettles, grinders, mugs, scales, and coffee gear.',
    productNames: ['Stagg EKG Electric Kettle', 'Carter Move Mug', 'Opus Conical Burr Grinder', 'Ode Brew Grinder', 'Tally Pro Precision Scale'],
    categoryTerms: ['electric kettle', 'coffee grinder', 'coffee gear', 'drinkware']
  });
  const solo = productRichState(hooks, {
    customer: 'Solo Stove',
    website: 'https://www.solostove.com',
    domain: 'solostove.com',
    pageTitle: 'Solo Stove smokeless fire pits and outdoor products',
    metaDescription: 'Shop fire pits, pizza ovens, griddles, coolers, and outdoor cooking products.',
    productNames: ['Bonfire Fire Pit', 'Yukon Fire Pit', 'Ranger Fire Pit', 'Mesa Tabletop Fire Pit', 'Pi Prime Pizza Oven'],
    categoryTerms: ['smokeless fire pits', 'outdoor cooking', 'pizza ovens', 'griddles']
  });

  const fellowCandidates = hooks.websiteProductEvidenceCandidatesW424(fellow.state.websiteEvidenceV1, fellow.state.intake);
  const soloCandidates = hooks.websiteProductEvidenceCandidatesW424(solo.state.websiteEvidenceV1, solo.state.intake);
  const fellowRequest = hooks.confirmedBuildRequestJsonV1(fellow.state, fellow.lane, fellow.page, fellow.recommendation);
  const soloRequest = hooks.confirmedBuildRequestJsonV1(solo.state, solo.lane, solo.page, solo.recommendation);

  assertCase(results, 'w463_fellow_product_candidates_from_website_cards',
    fellowCandidates.productSeed === 'Stagg EKG Electric Kettle' &&
      fellowCandidates.productCandidates.includes('Opus Conical Burr Grinder'),
    JSON.stringify(fellowCandidates));
  assertCase(results, 'w463_solo_product_candidates_from_website_cards',
    soloCandidates.productSeed === 'Bonfire Fire Pit' &&
      soloCandidates.productCandidates.includes('Pi Prime Pizza Oven'),
    JSON.stringify(soloCandidates));
  assertCase(results, 'w463_confirmed_request_carries_website_evidence_payload',
    fellowRequest.websiteEvidence &&
      fellowRequest.websiteEvidence.websiteEvidenceV1 &&
      fellowRequest.websiteEvidence.productCandidates.includes('Stagg EKG Electric Kettle') &&
      fellowRequest.productEvidence.productSeed === 'Stagg EKG Electric Kettle' &&
      fellowRequest.groundedProductEvidence.productCandidates.includes('Carter Move Mug'),
    JSON.stringify(fellowRequest.websiteEvidence));
  assertCase(results, 'w463_confirmed_request_carries_solo_product_payload',
    soloRequest.websiteEvidence &&
      soloRequest.websiteEvidence.websiteEvidenceV1 &&
      soloRequest.productEvidence.productCandidates.includes('Bonfire Fire Pit') &&
      soloRequest.groundedProductEvidence.productCandidates.includes('Yukon Fire Pit'),
    JSON.stringify(soloRequest.productEvidence));
  assertCase(results, 'w463_drawer_copies_stay_synced',
    drawer.includes('idb.request_website_evidence_payload.v1') &&
      fileCabinetDrawer.includes('idb.request_website_evidence_payload.v1'),
    '');
  assertCase(results, 'w463_adapter_rejects_generic_hardgoods_lane_labels',
    adapter.includes('drinkware product line') &&
      adapter.includes('outdoor cooking product line') &&
      adapter.includes('coffee gear') &&
      adapter.includes('fire pits'),
    '');
  assertCase(results, 'w463_runner_blocks_generic_product_line_fallback_assignment',
    runner.includes('concreteHardgoodsProductFromEvidenceW463') &&
      runner.includes('Drinkware Product Line') &&
      runner.includes('Outdoor Cooking Product Line') &&
      !/product\s*=\s*\/pizza oven\|karu\|koda\|volt\|fyra\/\.test\(evidence\)\s*\?\s*'Outdoor Cooking Product Line'\s*:\s*'Drinkware Product Line'/.test(runner),
    '');

  printResults('W463 website/product evidence pipeline harness', results);
}

main();
