#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { assertCase, printResults, root } = require('./lib/forge_harness_fixtures');

const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_forge_clean_w483.js');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');

function loadRunnerHooks() {
  const savedFiles = [];
  const modules = {
    'N/runtime': {
      accountId: 'TD3021666',
      getCurrentScript() { return { getParameter() { return ''; } }; }
    },
    'N/log': { audit() {}, error() {}, debug() {} },
    'N/search': {
      Sort: { DESC: 'DESC', ASC: 'ASC' },
      createColumn(opts) { return opts || {}; },
      create() { return { run() { return { getRange() { return []; } }; } }; }
    },
    'N/record': {},
    'N/https': {},
    'N/task': {},
    'N/file': {
      Type: { PLAINTEXT: 'PLAINTEXT', JSON: 'JSON', CSV: 'CSV' },
      create(opts) {
        const item = Object.assign({ id: String(9500 + savedFiles.length) }, opts || {});
        savedFiles.push(item);
        return {
          name: item.name,
          save() { return item.id; },
          getContents() { return item.contents || ''; }
        };
      },
      load() { throw new Error('No file loads in W483 CLI harness'); }
    }
  };
  let exported = null;
  const sandbox = {
    console,
    JSON,
    Date,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    encodeURIComponent,
    define(deps, factory) {
      exported = factory.apply(null, deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  const source = fs.readFileSync(runnerPath, 'utf8').replace(
    'return { execute };',
    'return { execute, __testHooks: { generateNamingPack, writeForgeSidecarResultW483 } };'
  );
  vm.runInContext(source, sandbox, { filename: runnerPath });
  if (!exported || !exported.__testHooks) throw new Error('Failed to expose W483 hooks');
  return { hooks: exported.__testHooks, savedFiles };
}

function loadAdapterHooks() {
  const modules = {
    'N/runtime': { accountId: 'TD3021666', getCurrentScript() { return { getParameter() { return ''; } }; } },
    'N/task': {},
    'N/log': { audit() {}, error() {}, debug() {} },
    'N/file': {},
    'N/search': { Sort: { DESC: 'DESC' }, createColumn(opts) { return opts || {}; }, create() { return { run() { return { getRange() { return []; } }; } }; } }
  };
  let exported = null;
  const sandbox = {
    console,
    JSON,
    Date,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    define(deps, factory) {
      exported = factory.apply(null, deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(adapterPath, 'utf8'), sandbox, { filename: adapterPath });
  if (!exported || !exported._test) throw new Error('Failed to expose adapter test hooks');
  return exported._test;
}

function fakeIds(index) {
  const base = 2000 + index * 30;
  return {
    customerId: base + 1,
    heroItemId: base + 2,
    assemblyId: base + 3,
    bomId: base + 4,
    bomRevId: base + 5,
    comp1Id: base + 6,
    comp2Id: base + 7,
    comp3Id: base + 8,
    heroItemExternalId: `SCAI_W483_FRESH_HERO_${index}`,
    heroItemCsvKey: `SCAI_W483_FRESH_HERO_${index}`
  };
}

function requestForItem(item) {
  const toggles = {
    createNewHeroItem: true,
    enableManufacturing: item.mode !== 'distribution',
    enableWip: item.mode === 'wip'
  };
  return {
    requestId: `REQ-FRESH-${item.slug}`,
    prospect: { name: item.prospect, website: item.website },
    demoPath: {
      laneId: item.mode,
      laneName: item.mode === 'wip' ? 'Manufacturing with WIP' : (item.mode === 'manufacturing' ? 'Manufacturing' : 'Distribution'),
      scenario: item.agenda,
      productFamily: item.expectedProduct
    },
    selectedToggles: toggles,
    toggles,
    storyInputs: {
      buyerNeed: item.notes,
      scObjective: item.agenda,
      competitors: item.competitors || ''
    },
    websiteEvidence: {
      trustedWebsiteProductExamplesW472: item.productEvidence,
      productCandidates: item.productEvidence,
      sourceUrls: [item.website],
      evidenceText: item.signalText
    },
    productEvidence: {
      trustedWebsiteProductExamplesW472: item.productEvidence,
      productCandidates: item.productEvidence,
      sourceUrls: [item.website]
    }
  };
}

function runCase(hooks, adapterHooks, savedFiles, item, index) {
  const request = requestForItem(item);
  const names = adapterHooks.buildServerPrecomputedNamingPack(request);
  const enableManufacturing = item.mode !== 'distribution';
  const enableWip = item.mode === 'wip';
  const args = {
    folderId: 777,
    prospect: item.prospect,
    website: item.website,
    notes: item.notes,
    agenda: item.agenda,
    extId: `W483_FRESH_${index}_${item.slug}`,
    ids: fakeIds(index),
    names,
    soFileId: 8800 + index,
    soTaskId: `CSVIMPORT_FRESH_${index}`,
    woId: enableManufacturing ? 8700 + index : null,
    routingId: enableWip ? 8750 + index : null,
    routingResult: enableWip ? { routingId: 8750 + index, decision: 'created-new-routing', attachResult: 'attached' } : null,
    enableManufacturing,
    enableWip,
    createNewHeroItem: true,
    namingPayload: { found: false, parsed: false, applied: true, source: names._source, payload: names },
    confirmedBuildRequestJson: Object.assign({}, request, {
      sourceRequestId: `REQ-FRESH-${item.slug}`,
      buildAttemptId: `ATTEMPT-FRESH-${item.slug}`
    })
  };
  const capture = hooks.writeForgeSidecarResultW483(args);
  const saved = savedFiles[savedFiles.length - 1];
  const payload = saved ? JSON.parse(saved.contents) : null;
  return { item, names, capture, payload };
}

function main() {
  const { hooks, savedFiles } = loadRunnerHooks();
  const adapterHooks = loadAdapterHooks();
  const cases = [
    {
      slug: 'martin-guitar',
      prospect: 'C. F. Martin & Co.',
      website: 'https://www.martinguitar.com',
      mode: 'wip',
      signalText: 'Official site for acoustic guitars, guitar strings, custom shop instruments, and musical instrument dealer programs.',
      notes: 'Regional dealers are asking for better delivery confidence before committing custom acoustic guitar slots for the fall tour season. Sales needs a record-backed build path and a sober ROI story around fewer promise misses.',
      agenda: 'Build guitar order path, assembly, BOM, routing, and advisory competitive story.',
      expectedProduct: 'Acoustic Guitar',
      expectedIndustry: 'Musical Instruments Manufacturing',
      productEvidence: ['D-28 Authentic 1937 Acoustic Guitar', 'SC-13E Special Acoustic-Electric Guitar', '000-18 Modern Deluxe Acoustic Guitar'],
      competitors: 'Taylor, Breedlove'
    },
    {
      slug: 'knoll',
      prospect: 'Knoll',
      website: 'https://www.knoll.com',
      mode: 'manufacturing',
      signalText: 'Modern furniture, workplace seating, chairs, desks, tables, office furniture, and ergonomic furniture systems.',
      notes: 'A contract dealer has a staged workplace refresh and needs confidence that seating packages can be promised without late configuration surprises.',
      agenda: 'Show furniture order, assembly/BOM readiness, and value narrative without WIP routing.',
      expectedProduct: 'Ergonomic Chair',
      expectedIndustry: 'Furniture Manufacturing',
      productEvidence: ['Womb Chair', 'Generation Chair', 'Saarinen Executive Chair'],
      competitors: 'Teknion, Humanscale'
    },
    {
      slug: 'miele',
      prospect: 'Miele USA',
      website: 'https://www.mieleusa.com',
      mode: 'distribution',
      signalText: 'Premium home appliance products including vacuum cleaners, dishwashers, laundry appliances, kitchen appliances, and electronics.',
      notes: 'Retail replenishment planners need cleaner allocation confidence around premium appliance launches before committing store-level availability.',
      agenda: 'Show distribution-only availability proof and advisory ROI.',
      expectedProduct: 'Premium Home Appliance',
      expectedIndustry: 'Premium Home Appliance Manufacturing',
      productEvidence: ['Complete C3 Canister Vacuum', 'Triflex HX2 Cordless Vacuum', 'G 7000 Dishwasher'],
      competitors: 'Bosch, Electrolux'
    },
    {
      slug: 'jungheinrich',
      prospect: 'Jungheinrich',
      website: 'https://www.jungheinrich.com',
      mode: 'wip',
      signalText: 'Forklift trucks, pallet trucks, warehouse equipment, automated warehouse equipment, and industrial equipment service.',
      notes: 'The sales team needs to show a branch manager how lift truck demand can be tied to assembly readiness and routing before promising a delivery window.',
      agenda: 'Show equipment order, manufacturing records, work order, routing, ROI and competitive proof.',
      expectedProduct: 'Lift Truck',
      expectedIndustry: 'Industrial Equipment Manufacturing',
      productEvidence: ['EKS 215a Automated Guided Vehicle', 'ERE 120 Electric Pallet Truck', 'ETV 216i Reach Truck'],
      competitors: 'Linde, Raymond'
    },
    {
      slug: 'all-clad',
      prospect: 'All-Clad',
      website: 'https://www.all-clad.com',
      mode: 'manufacturing',
      signalText: 'Cookware, stainless steel cookware, skillets, cookware sets, kitchenware, pans, and cooking tools.',
      notes: 'Wholesale account teams are preparing a holiday cookware set push and need proof that replenishment and assembly readiness can support channel commitments.',
      agenda: 'Show cookware product, assembly, BOM, and advisory ROI story.',
      expectedProduct: 'Cookware Set',
      expectedIndustry: 'Kitchenware Manufacturing',
      productEvidence: ['D3 Stainless 10-Piece Cookware Set', 'Copper Core 5-Ply Saute Pan', 'HA1 Nonstick Fry Pan Set'],
      competitors: 'Made In, Calphalon'
    },
    {
      slug: 'igloo',
      prospect: 'Igloo Coolers',
      website: 'https://www.igloocoolers.com',
      mode: 'distribution',
      signalText: 'Coolers, drinkware, bottles, outdoor hardgoods, ice chests, bags, and durable outdoor products.',
      notes: 'Field sales is planning a summer retail reset and wants evidence that cooler availability can be allocated by account without overpromising.',
      agenda: 'Show distribution availability proof, returned records, ROI and competitive advisory.',
      expectedProduct: 'Durable Hardgoods Product',
      expectedIndustry: 'Durable Consumer Goods Manufacturing',
      productEvidence: ['Trailmate Journey 70 Qt Cooler', 'MaxCold Latitude 62 Qt Roller Cooler', 'Playmate Elite Cooler'],
      competitors: 'RTIC, Coleman'
    },
    {
      slug: 'la-z-boy',
      prospect: 'La-Z-Boy',
      website: 'https://www.la-z-boy.com',
      mode: 'manufacturing',
      signalText: 'Furniture, recliners, chairs, sofas, sectionals, seating, tables, and home furniture.',
      notes: 'A regional store group wants to promise delivery windows on configurable recliners but needs a clearer assembly and component readiness story.',
      agenda: 'Show seating product, assembly, BOM and advisory value narrative.',
      expectedProduct: 'Ergonomic Chair',
      expectedIndustry: 'Furniture Manufacturing',
      productEvidence: ['Pinnacle Rocking Recliner', 'Trouper Power Reclining Sofa', 'Morrison Reclina-Rocker Recliner'],
      competitors: 'Ashley, Flexsteel'
    },
    {
      slug: 'vitamix',
      prospect: 'Vitamix',
      website: 'https://www.vitamix.com',
      mode: 'distribution',
      signalText: 'Kitchen appliance products including blenders, premium appliances, accessories, containers, electronics, and home appliance bundles.',
      notes: 'Retail buyers are asking for launch allocation confidence on premium blender bundles before approving endcap commitments.',
      agenda: 'Show distribution-only record proof and value story.',
      expectedProduct: 'Premium Home Appliance',
      expectedIndustry: 'Premium Home Appliance Manufacturing',
      productEvidence: ['Vitamix 7500 Blender', 'Ascent X5 Blender', 'Explorian E310 Blender'],
      competitors: 'Ninja, Blendtec'
    },
    {
      slug: 'cutco',
      prospect: 'Cutco',
      website: 'https://www.cutco.com',
      mode: 'wip',
      signalText: 'Kitchen knives, cutlery, knife sets, kitchenware, utensils, accessories, and manufacturing quality programs.',
      notes: 'Direct sales managers need proof that premium knife set demand can be connected to build readiness and fulfillment timing for seasonal campaigns.',
      agenda: 'Show kitchenware order, assembly, BOM, routing, ROI and competitive advisory.',
      expectedProduct: 'Cookware Set',
      expectedIndustry: 'Kitchenware Manufacturing',
      productEvidence: ['Homemaker Set with Table Knives', 'Galley Set with Block', 'Petite Chef Knife'],
      competitors: 'Wusthof, Zwilling'
    },
    {
      slug: 'cordoba',
      prospect: 'Cordoba Guitars',
      website: 'https://www.cordobaguitars.com',
      mode: 'manufacturing',
      signalText: 'Acoustic guitars, nylon string guitars, ukuleles, guitar accessories, and musical instruments.',
      notes: 'Dealer reps need an instrument availability story for nylon-string guitar demand without claiming measured savings before a baseline exists.',
      agenda: 'Show guitar item, assembly, BOM and advisory ROI/competitive narrative.',
      expectedProduct: 'Acoustic Guitar',
      expectedIndustry: 'Musical Instruments Manufacturing',
      productEvidence: ['C5 Classical Guitar', 'C7 CD Classical Guitar', 'Stage Nylon Acoustic-Electric Guitar'],
      competitors: 'Yamaha, Takamine'
    },
    {
      slug: 'prs-guitars',
      prospect: 'PRS Guitars',
      website: 'https://prsguitars.com',
      mode: 'wip',
      signalText: 'Electric guitars, acoustic guitars, guitar pickups, amps, accessories, and musical instruments.',
      notes: 'Dealer ops is preparing a limited run electric guitar launch and wants assembly readiness tied to promised delivery dates before reps start taking commitments.',
      agenda: 'Show electric guitar demand through assembly, BOM, routing, ROI, and competitive advisory.',
      expectedProduct: 'Electric Guitar',
      expectedIndustry: 'Musical Instruments Manufacturing',
      productEvidence: ['SE Custom 24 Electric Guitar', 'S2 McCarty 594 Electric Guitar', 'Silver Sky Electric Guitar'],
      competitors: 'Fender, Gibson'
    },
    {
      slug: 'steelcase',
      prospect: 'Steelcase',
      website: 'https://www.steelcase.com',
      mode: 'manufacturing',
      signalText: 'Office furniture, ergonomic chairs, desks, seating, tables, workplace systems, and furniture services.',
      notes: 'A large workplace refresh needs a dependable chair configuration story before the dealer commits installation windows.',
      agenda: 'Show seating product, assembly, BOM readiness, ROI, and competitive advisory.',
      expectedProduct: 'Ergonomic Chair',
      expectedIndustry: 'Furniture Manufacturing',
      productEvidence: ['Gesture Ergonomic Chair', 'Series 1 Chair', 'Leap Office Chair'],
      competitors: 'Herman Miller, Haworth'
    },
    {
      slug: 'sharkclean',
      prospect: 'SharkNinja',
      website: 'https://www.sharkclean.com',
      mode: 'distribution',
      signalText: 'Vacuum cleaners, cordless vacuums, air purifiers, steam mops, home appliance accessories, and premium appliances.',
      notes: 'Retail planners need allocation confidence before committing endcap inventory for a cordless vacuum promotion.',
      agenda: 'Show distribution-only appliance availability proof and advisory value.',
      expectedProduct: 'Premium Home Appliance',
      expectedIndustry: 'Premium Home Appliance Manufacturing',
      productEvidence: ['Stratos Cordless Vacuum', 'Detect Pro Cordless Vacuum', 'Navigator Lift-Away Upright Vacuum'],
      competitors: 'Dyson, Bissell'
    },
    {
      slug: 'hyster',
      prospect: 'Hyster',
      website: 'https://www.hyster.com',
      mode: 'wip',
      signalText: 'Forklift trucks, lift trucks, pallet trucks, warehouse equipment, industrial equipment, parts, and service.',
      notes: 'A branch manager wants lift truck demand tied to work order readiness before promising a fleet delivery window.',
      agenda: 'Show lift truck order, manufacturing records, work order, routing, ROI, and competitive proof.',
      expectedProduct: 'Lift Truck',
      expectedIndustry: 'Industrial Equipment Manufacturing',
      productEvidence: ['J30-40XNT Electric Lift Truck', 'H50-60XT Forklift Truck', 'W45ZHD Pallet Truck'],
      competitors: 'Crown, Toyota Material Handling'
    },
    {
      slug: 'calphalon',
      prospect: 'Calphalon',
      website: 'https://www.calphalon.com',
      mode: 'manufacturing',
      signalText: 'Cookware, nonstick cookware, stainless steel pans, skillets, kitchenware, and cookware sets.',
      notes: 'Wholesale sales needs confidence that cookware set replenishment can support a seasonal channel bundle without manual spreadsheet promises.',
      agenda: 'Show cookware product, assembly, BOM, ROI, and competitive advisory.',
      expectedProduct: 'Cookware Set',
      expectedIndustry: 'Kitchenware Manufacturing',
      productEvidence: ['Premier Space-Saving 10-Piece Cookware Set', 'Classic Hard-Anodized Nonstick Cookware Set', 'Signature Nonstick Fry Pan'],
      competitors: 'All-Clad, Made In'
    },
    {
      slug: 'pelican',
      prospect: 'Pelican Products',
      website: 'https://www.pelican.com',
      mode: 'distribution',
      signalText: 'Coolers, cases, drinkware, outdoor hardgoods, durable products, lighting, and protective equipment.',
      notes: 'Channel sales is preparing a rugged cooler push and wants account-level allocation proof before promising big-box availability.',
      agenda: 'Show durable hardgoods distribution, returned records, ROI, and competitive advisory.',
      expectedProduct: 'Durable Hardgoods Product',
      expectedIndustry: 'Durable Consumer Goods Manufacturing',
      productEvidence: ['Elite 45QT Cooler', '20QT Elite Cooler', 'Dayventure Sling Cooler'],
      competitors: 'YETI, Igloo'
    },
    {
      slug: 'blanco',
      prospect: 'Blanco',
      website: 'https://www.blanco.com',
      mode: 'manufacturing',
      signalText: 'Kitchen sinks, faucets, kitchen systems, kitchenware accessories, and premium kitchen products.',
      notes: 'Dealer teams need a clean build-readiness story for kitchen sink packages before committing project delivery dates.',
      agenda: 'Show kitchen product, assembly, BOM, ROI, and competitive advisory.',
      expectedProduct: 'Kitchenware Product',
      expectedIndustry: 'Kitchenware Manufacturing',
      productEvidence: ['Precis Super Single Bowl Sink', 'Diamond Silgranit Kitchen Sink', 'Valea Super Single Bowl Sink'],
      competitors: 'Kohler, Elkay'
    },
    {
      slug: 'makita',
      prospect: 'Makita',
      website: 'https://www.makitatools.com',
      mode: 'distribution',
      signalText: 'Power tools, cordless tools, drills, saws, outdoor power equipment, batteries, and jobsite accessories.',
      notes: 'Distributor sales needs availability proof for a cordless tool promotion without overcommitting branch stock.',
      agenda: 'Show distribution availability for durable hardgoods and advisory value narrative.',
      expectedProduct: 'Durable Hardgoods Product',
      expectedIndustry: 'Durable Consumer Goods Manufacturing',
      productEvidence: ['18V LXT Cordless Hammer Driver-Drill', '40V Max XGT Circular Saw', '18V LXT Brushless Impact Driver'],
      competitors: 'Milwaukee Tool, DeWalt'
    },
    {
      slug: 'rowenta',
      prospect: 'Rowenta',
      website: 'https://www.rowentausa.com',
      mode: 'distribution',
      signalText: 'Home appliances, irons, steamers, air purifiers, vacuums, fans, and appliance accessories.',
      notes: 'Retail replenishment teams need a grounded appliance availability story for a seasonal garment-care promotion.',
      agenda: 'Show distribution-only appliance records, ROI, and competitive advisory.',
      expectedProduct: 'Premium Home Appliance',
      expectedIndustry: 'Premium Home Appliance Manufacturing',
      productEvidence: ['Steamforce Pro Iron', 'X-Cel Handheld Steamer', 'Pure Air Genius Air Purifier'],
      competitors: 'Conair, Shark'
    },
    {
      slug: 'bissell',
      prospect: 'Bissell',
      website: 'https://www.bissell.com',
      mode: 'distribution',
      signalText: 'Vacuum cleaners, carpet cleaners, steam cleaners, cordless vacuums, and home appliance products.',
      notes: 'A mass retailer wants confidence on floor-care launch allocation and cleaner account-level availability proof.',
      agenda: 'Show appliance distribution records, ROI, and competitive advisory.',
      expectedProduct: 'Premium Home Appliance',
      expectedIndustry: 'Premium Home Appliance Manufacturing',
      productEvidence: ['CrossWave HydroSteam Wet Dry Vac', 'Pet Hair Eraser Turbo Lift-Off Vacuum', 'Little Green Portable Carpet Cleaner'],
      competitors: 'Hoover, Shark'
    }
  ];

  const results = [];
  const outputs = cases.map((item, index) => runCase(hooks, adapterHooks, savedFiles, item, index + 1));
  outputs.forEach(({ item, names, capture, payload }) => {
    const completed = payload && payload.completedResultJson || {};
    const roiAudit = completed.roiAudit || {};
    const competitive = completed.competitive || {};
    const label = `w483-fresh-${item.slug}`;
    assertCase(results, `${label}-product-industry`,
      item.productEvidence.indexOf(names.hero_item_name) !== -1 &&
        names.industry_category === item.expectedIndustry &&
        /website-product-examples|website_product_examples/i.test(names._source || names.namingEvidenceSource || ''),
      JSON.stringify({ names }, null, 2));
    assertCase(results, `${label}-old-runner-pack-shape`,
      (item.mode === 'distribution'
        ? /Availability Flow|Fulfillment Flow|Availability Plan|Replenishment Plan/.test([
          names.assembly_name,
          names.bom_name,
          names.bom_revision_name,
          names.routing_name
        ].join(' '))
        : names.assembly_name === `${names.hero_item_name} Assembly` &&
          names.bom_name === `BOM - ${names.hero_item_name}` &&
          names.bom_revision_name === `Revision 1 - ${names.hero_item_name}` &&
          names.routing_name === `Routing - ${names.hero_item_name}`) &&
        Array.isArray(names.component_names) &&
        names.component_names.length === 3 &&
        names.operation_names_by_seq &&
        names.operation_names_by_seq['10'],
      JSON.stringify({ names }, null, 2));
    assertCase(results, `${label}-sidecar-result-shape`,
      capture &&
        capture.fileId &&
        payload &&
        payload.schema === 'idb.runner-result-capture.w483.forge-clean.v1' &&
        completed.schema === 'forge.completed-runner-result.v3' &&
        Array.isArray(completed.displayReadyRecords) &&
        completed.displayReadyRecords.length >= (item.mode === 'distribution' ? 3 : 7),
      JSON.stringify({ capture, completedKeys: Object.keys(completed || {}) }, null, 2));
    assertCase(results, `${label}-roi-competitive`,
      roiAudit.schema === 'idb.w483-runner-roi-audit.v1' &&
        /Advisory only|returned NetSuite records/i.test(roiAudit.claim || '') &&
        competitive.schema === 'idb.w483-runner-competitive.v1' &&
        Array.isArray(competitive.namedCompetitors),
      JSON.stringify({ roiAudit, competitive }, null, 2));
  });

  printResults('W483 20 fresh CLI pipeline smoke suite', results);
  console.log(JSON.stringify(outputs.map(({ item, names, capture, payload }) => ({
    slug: item.slug,
    website: item.website,
    mode: item.mode,
    product: names.hero_item_name,
    expectedCategory: item.expectedProduct,
    industry: names.industry_category,
    components: names.component_names,
    operations: names.operation_names_by_seq,
    status: payload.completedResultJson.status,
    returnedCount: payload.completedResultJson.returnedCount,
    realMissingUrlCount: payload.completedResultJson.realMissingUrlCount,
    roi: payload.completedResultJson.roiAudit.claim,
    competitive: payload.completedResultJson.competitive.competitorSafeContrast,
    resultFileName: capture.fileName
  })), null, 2));
}

main();
