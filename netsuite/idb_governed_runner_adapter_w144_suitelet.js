/**
 * IDB Governed Runner Adapter W144
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/task', 'N/log', 'N/file', 'N/search'], (runtime, task, log, file, search) => {
  const ADAPTER_VERSION = 'w485-result-prefix-return-import';
  const SIDECAR_RUNNER_VERSION_W483 = 'W483';
  const DEFAULT_SIDECAR_RUNNER_SCRIPT_ID_W483 = 'customscript_scai_w483_clean';
  const DEFAULT_SIDECAR_RUNNER_DEPLOY_ID_W483 = 'customdeploy_scai_w483_clean';
  const NAMING_FILE_NAME_LIMIT_W468 = 96;
  const SALES_ORDER_LOOKUP_SEARCH_ID_W458 = 'customsearch_wms_atlas_bill_lookup_2';
  const SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458 = '5006';

  const PARAMS = {
    action: 'custpage_idb_action',
    requestJson: 'custpage_idb_confirmed_build_request_json',
    operatorGateJson: 'custpage_idb_operator_queue_gate_json',
    runnerTaskId: 'custpage_idb_runner_task_id',
    idempotencyToken: 'custpage_idb_idempotency_token',
    resultCaptureCursor: 'custpage_idb_result_capture_cursor',
    expectedResultSchema: 'custpage_idb_expected_result_schema',
    createEnabled: 'custscript_idb_create_enabled',
    governedSandboxWriteEnabled: 'custscript_idb_governed_sandbox_write_enabled',
    governedSandboxWriteEnabledShort: 'custscript_idb_governed_sandbox_write',
    queueSubmitEnabled: 'custscript_idb_queue_submit_enabled',
    sandboxAccountAllowlist: 'custscript_idb_sandbox_account_allowlist',
    runnerScriptId: 'custscript_idb_runner_script_id',
    runnerDeployId: 'custscript_idb_runner_deploy_id',
    mappingId: 'custscript_idb_runner_mapping_id',
    folderId: 'custscript_idb_runner_folder_id',
    subsidiaryId: 'custscript_idb_runner_subsidiary_id',
    locationId: 'custscript_idb_runner_location_id',
    workCenterSearchId: 'custscript_idb_runner_wc_search_id',
    resultCaptureFolderId: 'custscript_idb_result_capture_folder_id'
  };

  const RUNNER_PARAM_MAP = {
    prospect: 'custscript_w483_prospect',
    website: 'custscript_w483_website',
    notes: 'custscript_w483_notes',
    agenda: 'custscript_w483_agenda',
    extId: 'custscript_w483_extid',
    mappingId: 'custscript_w483_mapping',
    folderId: 'custscript_w483_folder',
    subsidiaryId: 'custscript_w483_subsidiary',
    locationId: 'custscript_w483_location',
    workCenterSearchId: 'custscript_w483_wc_search',
    enableWip: 'custscript_w483_enable_wip',
    enableManufacturing: 'custscript_w483_enable_mfg',
    createNewHero: 'custscript_w483_create_hero',
    heroItem: 'custscript_w483_hero_item',
    namingFileId: 'custscript_w483_naming_file',
    resultCaptureFolderId: 'custscript_w483_result_folder',
    confirmedBuildRequestJson: 'custscript_w483_req_json'
  };

  function onRequest(context) {
    let result;
    let action = '';
    try {
      action = readInput(context, PARAMS.action);
      const requestParsed = parseJson(readInput(context, PARAMS.requestJson), 'confirmed IDB build request JSON');
      const operatorGateParsed = parseJson(readInput(context, PARAMS.operatorGateJson), 'operator queue gate JSON');
      const runnerConfig = resolveRunnerConfig(runtime.getCurrentScript(), runtime.accountId || '');
      result = action === 'poll_runner_result_capture'
        ? buildResultCapturePollEnvelope({
          runnerTaskId: readInput(context, PARAMS.runnerTaskId),
          idempotencyToken: readInput(context, PARAMS.idempotencyToken),
          resultCaptureCursor: readInput(context, PARAMS.resultCaptureCursor),
          expectedResultSchema: readInput(context, PARAMS.expectedResultSchema),
          confirmedRequest: requestParsed.value,
          operatorGate: operatorGateParsed.value
        }, runnerConfig, { file, search }, requestParsed.errors.concat(operatorGateParsed.errors))
        : buildAdapterResult(requestParsed.value, runnerConfig, operatorGateParsed.value, requestParsed.errors.concat(operatorGateParsed.errors));

      log.audit({
        title: 'IDB governed runner adapter W465',
        details: JSON.stringify({
          version: ADAPTER_VERSION,
          action: action || 'queue_submit',
          runnerStatus: result.runnerStatus || result.status,
          queueSubmitted: result.queueSubmitted,
          runnerTaskId: result.runnerTaskId,
          resultCaptureStatus: result.resultCapture && result.resultCapture.status
        })
      });
    } catch (error) {
      result = adapterExceptionEnvelope(error, action || 'queue_submit');
      log.error({
        title: 'IDB governed runner adapter W144 exception',
        details: JSON.stringify(result)
      });
    }
    writeJson(context, result);
  }

  function writeJson(context, result) {
    if (context && context.response && typeof context.response.write === 'function') {
      context.response.write(JSON.stringify(result, null, 2));
    }
  }

  function adapterExceptionEnvelope(error, action) {
    const name = error && (error.name || error.id) ? String(error.name || error.id) : 'ADAPTER_EXCEPTION';
    const message = error && error.message ? String(error.message) : String(error || 'Unknown adapter exception');
    return {
      schema: 'idb.governed-runner-adapter-result.v1',
      adapterVersion: ADAPTER_VERSION,
      status: 'adapter_error',
      runnerStatus: 'adapter_error',
      action: action || 'queue_submit',
      error: true,
      errorName: name,
      errorMessage: message,
      errorStack: error && error.stack ? String(error.stack).slice(0, 1200) : '',
      createsRecords: false,
      queueSubmitted: false,
      runnerTaskId: null,
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      idempotencyToken: '',
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'adapter_error',
        error: true,
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    };
  }

  function readInput(context, paramName) {
    const req = (context && context.request) || {};
    const params = req.parameters || {};
    if (params[paramName]) return String(params[paramName] || '');
    if (paramName === PARAMS.requestJson && req.body) return String(req.body || '');
    return '';
  }

  function parseJson(raw, label) {
    if (!raw) return { value: null, errors: [`${label} is required.`] };
    try {
      return { value: JSON.parse(raw), errors: [] };
    } catch (e) {
      return { value: null, errors: [`${label} is not valid JSON.`] };
    }
  }

  function getParam(currentScript, name) {
    return String((currentScript && currentScript.getParameter && currentScript.getParameter({ name })) || '').trim();
  }

  function flag(value) {
    return value === true || value === 'T' || value === 'true' || value === '1';
  }

  function resolveRunnerConfig(currentScript, accountId) {
    return {
      schema: 'idb.governed-runner-runtime-config.v1',
      accountId: String(accountId || '').trim(),
      createEnabled: flag(getParam(currentScript, PARAMS.createEnabled)),
      governedSandboxWriteEnabled: flag(getParam(currentScript, PARAMS.governedSandboxWriteEnabled) || getParam(currentScript, PARAMS.governedSandboxWriteEnabledShort)),
      queueSubmitEnabled: flag(getParam(currentScript, PARAMS.queueSubmitEnabled)),
      sandboxAccountAllowlist: splitCsv(getParam(currentScript, PARAMS.sandboxAccountAllowlist)),
      runnerScriptId: normalizeRunnerScriptIdW484(getParam(currentScript, PARAMS.runnerScriptId)),
      runnerDeployId: normalizeRunnerDeployIdW484(getParam(currentScript, PARAMS.runnerDeployId)),
      configuredSidecarRunnerVersion: SIDECAR_RUNNER_VERSION_W483,
      mappingId: getParam(currentScript, PARAMS.mappingId),
      folderId: getParam(currentScript, PARAMS.folderId),
      subsidiaryId: getParam(currentScript, PARAMS.subsidiaryId),
      locationId: getParam(currentScript, PARAMS.locationId),
      workCenterSearchId: getParam(currentScript, PARAMS.workCenterSearchId),
      resultCaptureFolderId: getParam(currentScript, PARAMS.resultCaptureFolderId)
    };
  }

  function splitCsv(value) {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeRunnerScriptIdW484(value) {
    const text = String(value || '').trim();
    if (!text) return DEFAULT_SIDECAR_RUNNER_SCRIPT_ID_W483;
    if (/^customscript_ss_demo_commcenter_runner$|^customscript_scai_ss_runner_simple_w482$|^customscript_scai_ss_runner_sidecar_/i.test(text)) {
      return DEFAULT_SIDECAR_RUNNER_SCRIPT_ID_W483;
    }
    return text;
  }

  function normalizeRunnerDeployIdW484(value) {
    const text = String(value || '').trim();
    if (!text) return DEFAULT_SIDECAR_RUNNER_DEPLOY_ID_W483;
    if (/^customdeploy_ss_demo_commcenter_runner$|^customdeploy_deploy_commcenter_runner$|^customdeploy_scai_ss_runner_simple_w482$|^customdeploy_scai_ss_runner_sidecar_/i.test(text)) {
      return DEFAULT_SIDECAR_RUNNER_DEPLOY_ID_W483;
    }
    return text;
  }

  function validateConfirmedRequest(request) {
    const errors = [];
    if (!request || typeof request !== 'object') {
      return { valid: false, errors: ['request must be an object.'] };
    }
    if (request.schema !== 'idb.confirmed-build-request.v1') errors.push('schema must be idb.confirmed-build-request.v1.');
    if (request.requestStatus !== 'confirmed_ready_for_governed_runner') errors.push('requestStatus must be confirmed_ready_for_governed_runner.');
    if (!request.consultantConfirmation || request.consultantConfirmation.confirmed !== true) errors.push('consultant confirmation is required.');
    if (!request.stateAuthority || request.stateAuthority.handoffParityStatus !== 'matched' || request.stateAuthority.noStateMismatch !== true) errors.push('state authority and handoff parity must be matched.');
    if (!request.prospect || !request.prospect.name) errors.push('prospect.name is required.');
    if (!request.demoPath || !request.demoPath.laneId || !request.demoPath.scenario) errors.push('demoPath lane and scenario are required.');
    const legacyRequiredRecordsValid = Array.isArray(request.requiredRecords) &&
      ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].every((role) => request.requiredRecords.indexOf(role) !== -1);
    const canonicalRequiredRolesValid = Array.isArray(request.requiredRecordRoles) &&
      request.requiredRecordRoles.indexOf('customer') !== -1 &&
      request.requiredRecordRoles.indexOf('sales_order') !== -1 &&
      request.requiredRecordRoles.length >= 4;
    if (!legacyRequiredRecordsValid && !canonicalRequiredRolesValid) {
      errors.push('request must include legacy requiredRecords or canonical requiredRecordRoles with customer, sales_order, and mode-specific records.');
    }
    return { valid: errors.length === 0, errors };
  }

  function validateRunnerConfig(config) {
    const errors = [];
    ['runnerScriptId', 'runnerDeployId', 'mappingId', 'folderId', 'subsidiaryId', 'resultCaptureFolderId'].forEach((key) => {
      if (!config[key]) errors.push(`${key} runtime config is required.`);
    });
    if (!config.accountId) errors.push('runtime account id is required.');
    if (!config.sandboxAccountAllowlist.length) errors.push('sandbox account allowlist is required.');
    if (config.accountId && config.sandboxAccountAllowlist.length && config.sandboxAccountAllowlist.indexOf(config.accountId) === -1) {
      errors.push('runtime account id is not in sandbox account allowlist.');
    }
    return { valid: errors.length === 0, errors };
  }

  function validateOperatorQueueGate(gate) {
    const errors = [];
    if (!gate || typeof gate !== 'object') {
      return { valid: false, errors: ['operator queue gate JSON is required.'] };
    }
    if (gate.schema !== 'idb.operator-queue-gate.v1') errors.push('operator gate schema must be idb.operator-queue-gate.v1.');
    if (gate.operatorOnly !== true) errors.push('operatorOnly must be true.');
    if (!gate.operator || !gate.operator.name) errors.push('operator.name is required.');
    if (gate.reviewDecision !== 'operator_approved_queue_submit') errors.push('reviewDecision must be operator_approved_queue_submit for W144 queue submit.');
    if (gate.confirmedNoSubmit !== false) errors.push('confirmedNoSubmit must be false only for the W144 server-flagged queue pilot.');
    if (gate.confirmedDrawerNoWrite !== true) errors.push('confirmedDrawerNoWrite must be true.');
    if (gate.confirmedSandboxAccount !== true) errors.push('confirmedSandboxAccount must be true.');
    if (gate.drawerInvocationTokenAccepted === true) errors.push('drawer invocation token must not be accepted.');
    if (gate.typeToConfirm !== 'QUEUE GOVERNED SANDBOX RUNNER') errors.push('typeToConfirm must be QUEUE GOVERNED SANDBOX RUNNER.');
    return { valid: errors.length === 0, errors };
  }

  function safeToken(value) {
    return String(value || '')
      .replace(/[^A-Za-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48)
      .toUpperCase();
  }

  function buildIdempotencyToken(request) {
    return `IDB-${request.requestId || 'request'}-${safeToken(request.prospect && request.prospect.name)}-${safeToken(request.demoPath && request.demoPath.laneId)}`.slice(0, 120);
  }

  function buildRunnerParams(request, config, idempotencyToken, namingFileId) {
    const runnerParams = {};
    const toggles = normalizeSelectedToggles(request);
    runnerParams[RUNNER_PARAM_MAP.prospect] = String(request.prospect.name || '');
    runnerParams[RUNNER_PARAM_MAP.website] = String(request.prospect.website || '');
    runnerParams[RUNNER_PARAM_MAP.notes] = String((request.storyInputs && request.storyInputs.buyerNeed) || '');
    runnerParams[RUNNER_PARAM_MAP.agenda] = String((request.storyInputs && request.storyInputs.scObjective) || request.demoPath.scenario || '');
    runnerParams[RUNNER_PARAM_MAP.extId] = idempotencyToken;
    runnerParams[RUNNER_PARAM_MAP.mappingId] = config.mappingId;
    runnerParams[RUNNER_PARAM_MAP.folderId] = config.folderId;
    runnerParams[RUNNER_PARAM_MAP.subsidiaryId] = config.subsidiaryId;
    runnerParams[RUNNER_PARAM_MAP.locationId] = config.locationId;
    runnerParams[RUNNER_PARAM_MAP.workCenterSearchId] = config.workCenterSearchId;
    runnerParams[RUNNER_PARAM_MAP.enableWip] = toTf(toggles.enableWip);
    runnerParams[RUNNER_PARAM_MAP.enableManufacturing] = toTf(toggles.enableManufacturing);
    runnerParams[RUNNER_PARAM_MAP.createNewHero] = toTf(toggles.createNewHeroItem);
    runnerParams[RUNNER_PARAM_MAP.heroItem] = toggles.createNewHeroItem ? '' : String(request.heroItemId || request.existingHeroItemId || '');
    if (namingFileId) runnerParams[RUNNER_PARAM_MAP.namingFileId] = String(namingFileId);
    runnerParams[RUNNER_PARAM_MAP.resultCaptureFolderId] = config.resultCaptureFolderId;
    runnerParams[RUNNER_PARAM_MAP.confirmedBuildRequestJson] = JSON.stringify(buildRunnerRequestContext(request, toggles, idempotencyToken));
    return runnerParams;
  }

  function compactText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function uniqueList(values) {
    const seen = {};
    const out = [];
    (values || []).forEach((value) => {
      const text = compactText(value);
      const key = text.toLowerCase();
      if (!text || seen[key]) return;
      seen[key] = true;
      out.push(text);
    });
    return out;
  }

  function titleCaseEvidencePhraseW457(value) {
    return compactText(value).toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase())
      .replace(/\bNola\b/g, 'NOLA')
      .replace(/\bHojicha\b/g, 'Hojicha')
      .replace(/\bRtd\b/g, 'RTD');
  }

  function evidenceSignalsW457(signal, patterns) {
    return uniqueList((patterns || []).map((entry) => {
      const match = signal.match(entry.pattern);
      return match ? (entry.label || match[0]) : '';
    }));
  }

  function evidenceTextW457(value) {
    if (!value) return '';
    if (typeof value === 'string') return compactText(value);
    try {
      return compactText(JSON.stringify(value));
    } catch (e) {
      return '';
    }
  }

  function sourceKindForEvidencePathW457(path) {
    const key = String(path || '').toLowerCase();
    if (/naming|advisory|llm|dccfinal/.test(key)) return 'llm_naming_advisory';
    if (/resolver|websiteevidencev1|bridge|profile/.test(key)) return 'resolver_evidence';
    if (/nav|menu|category|categories/.test(key)) return 'website_nav';
    if (/product|catalog|sku|collection|variant|item/.test(key)) return 'website_product_list';
    if (/website|page|snippet|text|evidence/.test(key)) return 'website_page_text';
    return 'website_page_text';
  }

  function domainFromWebsiteW457(website) {
    return compactText(website).replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].toLowerCase();
  }

  function brandFromWebsiteOrProspectW457(website, prospect) {
    const domain = domainFromWebsiteW457(website);
    if (/bluebottlecoffee\.com|bluebottle/.test(domain)) return 'Blue Bottle';
    if (/health-ade\.com|healthade/.test(domain)) return 'Health-Ade';
    if (/yeti\.com|yeti/.test(domain)) return 'YETI';
    if (/stanley1913\.com|stanley/.test(domain)) return 'Stanley';
    if (/chobani\.com/.test(domain)) return 'Chobani';
    if (/drinkpoppi\.com|poppi/.test(domain)) return 'Poppi';
    if (/goodles\.com/.test(domain)) return 'Goodles';
    if (/chomps\.com/.test(domain)) return 'Chomps';
    if (/peakdesign\.com|peakdesign|peak-design/.test(domain)) return 'Peak Design';
    if (/garmin\.com|garmin/.test(domain)) return 'Garmin';
    if (/lecreuset\.com|le-creuset|le creuset/.test(domain)) return 'Le Creuset';
    if (/corkcicle\.com|corkcicle/.test(domain)) return 'Corkcicle';
    const cleaned = compactText(prospect).replace(/\b(line readiness|wip proof|readiness proof|demo proof|proof|readiness|wip|demo|v\d+)\b/ig, '');
    return cleaned || compactText(prospect) || 'Demo Customer';
  }

  function addCatalogCandidateW457(candidates, rawName, opts) {
    const name = compactText(rawName).replace(/\s+\|\s+.*/, '').replace(/\s+-\s+Shop\b.*/i, '');
    if (!name || name.length < 3 || name.length > 80) return;
    if (/^(home|shop|shop all|products|product|catalog|menu|about|learn|subscribe|account|cart|checkout|search|privacy|terms|contact|blog|recipes|locations|featured products|new arrivals|accessories|parts|services|solutions)$/i.test(name)) return;
    if (isGenericCatalogCandidateW459(name)) {
      if (!(opts && opts.allowGeneric)) return;
    }
    candidates.push({
      name,
      source: opts && opts.source || 'website_page_text',
      sourceUrl: opts && opts.sourceUrl || '',
      domain: opts && opts.domain || '',
      evidenceText: compactText(opts && opts.evidenceText || name).slice(0, 260),
      category: opts && opts.category || '',
      confidence: Number(opts && opts.confidence || 72),
      wipSuitabilityScore: 0,
      reasons: uniqueList(opts && opts.reasons || [])
    });
  }

  function isGenericCatalogCandidateW459(value) {
    const name = compactText(value);
    return /^(coffee|cold brew|beverage|drinkware|cooler|coolers|bags|bag|bags\s*&\s*packs?|packs?|travel bags?|slings?\s*&\s*crossbody bags?|backpacks?|duffels?|totes?|wallets?|blankets?|case|case pack|pack|batch|product|products|products cpg|catalog product|advisory insufficient|product\s*\/?\s*sku|product sku|contractor job order|dealer channel availability|dealer channel availability sku|catalog|equipment|industrial equipment|industrial supply|industrial equipment manufacturing|distribution|warehouse|warehouse equipment|lab|outdoor gear|outdoor cooking|coffee gear|coffee equipment|kettles|grinders|fire pit|fire pits|smokeless fire pits|drinkware product line|outdoor cooking product line|outdoor product line|dealer hardgoods sku|dealer durable hardgoods|durable hardgoods|sku|item|product case|variety pack|cold brew coffee batch|milk and flavor blend|assembly|finished good|finished goods|proof|manufacturing proof|fulfillment proof|wip line-flow readiness|advisory supported|supported advisory|website supported|evidence supported|website resolver service v1|websiteresolverservicev1|public website fetch is resolver-limited|resolver limited|needs confirmation|apparel|clothing|footwear|fashion|style|styles|apparel\s*&\s*accessories|apparel and footwear style|core style color-size matrix|style\s*\/\s*sku matrix)$/i.test(name)
      || /\b(building materials|contractor|dealer hardgoods|channel fulfillment|project fulfillment|readiness|fulfillment)\b/i.test(name);
  }

  function genericCatalogCandidateRejectedReasonW459(value) {
    const name = compactText(value);
    if (!name || !isGenericCatalogCandidateW459(name)) return '';
    return `${name} rejected: generic lane/category label without concrete website product-line evidence`;
  }

  function hasConcreteProductSignalW464(value) {
    const lower = compactText(value).toLowerCase();
    return /\b(nola|craft matcha|craft hojicha|craft hōjicha|kyoto style espresso|vanilla chicory syrup|our summer blend|ginger lemon|pink lady apple|pomegranate|strawberry lemon|cheddy mac|original beef|kombucha|sunsip|prebiotic soda|marinara|tomato basil|arrabbiata|vodka sauce|roasted garlic|penne rigate|spaghetti|forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|electric truck|internal combustion truck|counterbalance|turret truck|very narrow aisle|rambler|tundra|roadie|hopper|camino|loadout|yonder|quencher|flowstate|iceflow|classic legendary|aerolight|adventure quencher|wide mouth|all around|trail series|good grips|pop containers|steel salad spinner|angled measuring cup|brew coffee maker|tot feeding|stagg ekg|carter move|opus conical burr|ode brew|clara french press|tally pro|everyday backpack|tasra|backpack|travel tripod|capture camera clip|slide lite|camera strap|tech pouch|camera bag|travel bag|camera accessory|forerunner|edge cycling|edge bike|edge computer|running watch|cycling computer|signature dutch oven|dutch oven|enameled cast iron|cast iron cookware|cookware set|cookware|bonfire|yukon|ranger|mesa|pi prime|canyon|karu|koda|volt|fyra|pizza oven|ironwood|timberline|pro series|woodridge|flat top grill|pellet grill|pellets|insulated tumbler|sport canteen|cold cup|lunch bag|commuter cup|stemless cup|tumbler|canteen|bottle|cooler|carryall|bucket|mug|cup|kettle|grinder|french press|scale|fire pit|stove|wallet|strap|blanket|puffy|bag|bags|tote|duffel|crossbody|pouch|sling|case|sku|sauce|pasta|coffee|espresso|matcha|hojicha|syrup|series)\b/i.test(lower);
  }

  function colorPatternOnlyProductNameReasonW472(value) {
    const text = compactText(value);
    if (!text || hasConcreteProductSignalW464(text)) return '';
    const tokens = text.toLowerCase().split(/[\s/,+&-]+/).filter(Boolean);
    const hasColorOrPattern = /\b(black|white|pink|red|orange|yellow|green|blue|purple|brown|tan|beige|cream|gray|grey|olive|navy|ivory|charcoal|matte|stripe|striped|dot|dotted|plaid|check|checked|floral|camo|fade|dusk|ombre|print|pattern|color|colour|del dia|del día)\b/i.test(text);
    const hasSizeOnly = /^(?:xs|s|m|l|xl|xxl|small|medium|large|one size|1-person|2-person|16l|32oz|64oz|\d+\s*(?:oz|l|ml|person|pack))$/i.test(text);
    if ((hasColorOrPattern && tokens.length <= 5) || hasSizeOnly) {
      return `${text} rejected: color, pattern, size, or collection label lacks a product noun`;
    }
    return '';
  }

  function selectedCatalogCandidateRejectedReasonW464(value, context) {
    const name = compactText(value);
    if (!name) return '';
    const prospect = compactText(context && context.prospect).toLowerCase();
    const lower = name.toLowerCase();
    const genericReason = genericCatalogCandidateRejectedReasonW459(name);
    if (genericReason) return genericReason;
    const colorPatternReason = colorPatternOnlyProductNameReasonW472(name);
    if (colorPatternReason) return colorPatternReason;
    if (/^(building materials\s*&\s*contractor project fulfillment|dealer hardgoods\s*&\s*channel fulfillment|contractor job order|dealer channel availability)$/i.test(name)) {
      return `${name} rejected: lane/workflow label cannot be selected as a product`;
    }
    if (/^(industrial equipment manufacturing|wip line-flow readiness|manufacturing proof)$/i.test(name)) {
      return `${name} rejected: manufacturing workflow label cannot be selected as a product`;
    }
    if (/^(building materials|dealer hardgoods|industrial distribution|food and beverage|apparel|apparel\s*&\s*accessories|parts\s*\/\s*service|medical\s*\/\s*dental|wholesale janitorial|hvac mechanical)$/i.test(name)) {
      return `${name} rejected: industry label cannot be selected as a product`;
    }
    if (/^(apparel and footwear style|core style color-size matrix|style\s*\/\s*sku matrix|dealer durable hardgoods|needs confirmation|websiteresolverservicev1|website resolver service v1|public website fetch is resolver-limited|resolver limited)$/i.test(name)) {
      return `${name} rejected: resolver/lane label cannot be selected as a product`;
    }
    if (/\b(project fulfillment|channel fulfillment|job order|availability|workflow|proof path|readiness)\b/i.test(name) && !hasConcreteProductSignalW464(name)) {
      return `${name} rejected: workflow label lacks public product-line evidence`;
    }
    if (prospect && lower === prospect) {
      return `${name} rejected: prospect name cannot be selected as a product`;
    }
    if (prospect && lower.indexOf(prospect) === 0 && !hasConcreteProductSignalW464(name)) {
      return `${name} rejected: prospect-name-only label lacks public product-line evidence`;
    }
    return '';
  }

  function traverseCatalogEvidenceW457(value, path, visit, depth) {
    if (!value || depth > 5) return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      visit(compactText(value), path);
      return;
    }
    if (Array.isArray(value)) {
      value.slice(0, 80).forEach((item, index) => traverseCatalogEvidenceW457(item, `${path}[${index}]`, visit, depth + 1));
      return;
    }
    if (typeof value === 'object') {
      Object.keys(value).slice(0, 120).forEach((key) => traverseCatalogEvidenceW457(value[key], path ? `${path}.${key}` : key, visit, depth + 1));
    }
  }

  function extractCatalogPhrasesFromTextW457(text) {
    const cleaned = compactText(text);
    const phrases = [];
    const known = [
      'Coffee & Tea', 'Craft Matcha', 'Espresso', 'Limited Offerings', 'Signature Blends',
      'Craft Instant Coffee', 'Single Origin', 'Decaf', 'NOLA', 'Exceedingly Rare California',
      'Honduras Santa Barbara', 'Honduras Santa Bárbara', 'Sweet Blossom Syrup',
      'Vanilla Chicory Syrup', 'Golden Hour', 'Craft Hojicha', 'Craft Hōjicha',
      'Our Summer Blend', 'Kyoto Style Espresso', 'Ginger Lemon', 'Pink Lady Apple',
      'Pomegranate', 'Kombucha', 'SunSip', 'Prebiotic Soda', 'Classic Kombucha',
      'Flip', 'Greek Yogurt', 'Oatmilk', 'Complete', 'Zero Sugar', 'Mac and Cheese',
      'Cheddy Mac', 'Shella Good', 'Lucky Penne', 'Beef Stick', 'Turkey Stick',
      'Jalapeno Beef', 'Original Beef',
      'Forklift Truck', 'Forklift Trucks', 'Lift Truck', 'Lift Trucks',
      'Pallet Truck', 'Pallet Trucks', 'Reach Truck', 'Reach Trucks',
      'Order Picker', 'Order Pickers', 'Tow Tractor', 'Tow Tractors',
      'Electric Truck', 'Electric Trucks', 'Internal Combustion Truck',
      'Internal Combustion Trucks', 'Counterbalance Truck', 'Counterbalance Trucks',
      'Turret Truck', 'Turret Trucks', 'Very Narrow Aisle Truck',
      'Very Narrow Aisle Trucks', 'Rider Pallet Truck', 'Walkie Pallet Truck',
      'Reach-Fork Truck', 'SP Series Order Picker', 'C-5 Series', 'C-G Series',
      'RC Series', 'RM Series', 'RR/RD Series', 'TSP Series', 'PE Series', 'WP Series'
      , 'Rambler', 'Rambler Tumbler', 'Rambler 20 oz Tumbler',
      'Rambler 30 oz Tumbler', 'Rambler Bottle', 'Tundra Cooler',
      'Roadie Cooler', 'Hopper Soft Cooler', 'Camino Carryall',
      'LoadOut Bucket', 'Yonder Bottle', 'Quencher H2.0 FlowState Tumbler',
      'IceFlow Flip Straw Tumbler', 'Classic Legendary Bottle',
      'AeroLight Transit Mug', 'Adventure Quencher Travel Tumbler',
      'Wide Mouth Bottle', 'All Around Travel Tumbler', 'All Around Tumbler',
      'Trail Series Bottle', 'Coffee Mug', 'Karu 2 Pro Multi-Fuel Pizza Oven',
      'Koda 16 Gas Powered Pizza Oven', 'Karu 12G Multi-Fuel Pizza Oven',
      'Volt 12 Electric Pizza Oven', 'Fyra 12 Wood Pellet Pizza Oven',
      'Stagg EKG Electric Kettle', 'Stagg EKG Pro', 'Carter Move Mug',
      'Opus Conical Burr Grinder', 'Ode Brew Grinder', 'Clara French Press',
      'Tally Pro Precision Scale', 'Bonfire', 'Yukon', 'Ranger', 'Mesa',
      'Mesa XL', 'Pi Prime', 'Canyon', 'Surround Tabletop',
      'Insulated Tumbler', 'Sport Canteen', 'Cold Cup', 'Lunch Bag',
      'Commuter Cup', 'Coffee Mug', 'Water Bottle', 'Stemless Cup',
      'Good Grips', 'POP Containers', 'Brew Coffee Maker',
      'Steel Salad Spinner', 'Angled Measuring Cup', 'Tot Feeding Products',
      'Ironwood', 'Timberline', 'Pro Series', 'Woodridge', 'Flat Top Grill',
      'Forerunner Running Watch', 'Forerunner 265 Running Watch',
      'Edge Cycling Computer', 'Edge 1040 Cycling Computer',
      'Everyday Backpack', 'Travel Tripod', 'Capture Camera Clip',
      'Slide Lite Camera Strap', 'Slide Lite', 'Tech Pouch',
      'Camera Cube', 'Packing Cube', 'Outdoor Backpack', 'Travel Backpack',
      'Signature Dutch Oven', 'Enameled Cast Iron Cookware',
      'Cast Iron Cookware', 'Cookware Set'
    ];
    known.forEach((term) => {
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/o/g, '[oō]'), 'i');
      if (re.test(cleaned)) phrases.push(term);
    });
    [
      /\b([A-Z][A-Za-z0-9-]{1,8}\s+Series\s+(?:Forklift|Lift Truck|Pallet Truck|Reach Truck|Order Picker|Tow Tractor|Turret Truck|Truck)s?)\b/g,
      /\b((?:Electric|Internal Combustion|Counterbalance|Rider|Walkie|Walkie Rider|Very Narrow Aisle|Reach-Fork)\s+(?:Forklift|Lift Truck|Pallet Truck|Reach Truck|Order Picker|Tow Tractor|Turret Truck|Truck)s?)\b/gi,
      /\b((?:Forklift|Lift Truck|Pallet Truck|Reach Truck|Order Picker|Tow Tractor|Turret Truck)s?)\b/gi,
      /\b((?:Rambler|Tundra|Roadie|Hopper|Camino|LoadOut|Yonder)\s+(?:Tumbler|Bottle|Cooler|Soft Cooler|Carryall|Bucket|Mug|Drinkware)s?)\b/gi,
      /\b((?:Quencher H2\.0 FlowState|IceFlow Flip Straw|Classic Legendary|AeroLight Transit|Adventure Quencher)\s+(?:Tumbler|Bottle|Mug|Travel Tumbler)s?)\b/gi,
      /\b((?:Wide Mouth|All Around|Trail Series|Coffee)\s+(?:Bottle|Travel Tumbler|Tumbler|Mug)s?)\b/gi,
      /\b((?:Karu 2 Pro|Karu 12G|Koda 16|Volt 12|Fyra 12)\s+(?:Multi-Fuel|Gas Powered|Electric|Wood Pellet)?\s*(?:Pizza Oven|Oven)s?)\b/gi,
      /\b((?:Stagg EKG|Stagg EKG Pro|Carter Move|Opus Conical Burr|Ode Brew|Clara|Tally Pro)\s+(?:Electric Kettle|Kettle|Mug|Grinder|Burr Grinder|Brew Grinder|French Press|Precision Scale|Scale)s?)\b/gi,
      /\b((?:Insulated|Sport|Commuter|Classic|Cruiser|Kids?|Coffee|Stemless|Water)?\s*(?:Tumbler|Canteen|Cold Cup|Lunch Bag|Bottle|Mug|Cup)s?)\b/gi,
      /\b((?:Bonfire|Yukon|Ranger|Mesa XL|Mesa|Canyon|Pi Prime|Surround)\s+(?:Fire Pit|Firepit|Pizza Oven|Tabletop|Stove|Grill|Shield|Stand|Hub)?s?)\b/gi,
      /\b((?:Good Grips|POP Containers|Brew Coffee Maker|Steel Salad Spinner|Angled Measuring Cup|Tot Feeding Products?))\b/gi,
      /\b((?:Ironwood|Timberline|Pro Series|Woodridge|Flat Top Grill)\s*(?:Pellet Grill|Wood Pellet Grill|Grill|Griddle|Products?)?)\b/gi,
      /\b((?:Forerunner|Edge)\s*(?:\d{2,4})?\s*(?:Running Watch|GPS Watch|Smartwatch|Cycling Computer|Bike Computer|Computer)s?)\b/gi,
      /\b((?:Everyday Backpack|Travel Tripod|Capture Camera Clip|Slide Lite Camera Strap|Slide Lite|Tech Pouch|Camera Cube|Packing Cube|Outdoor Backpack|Travel Backpack)s?)\b/gi,
      /\b((?:Signature\s+)?(?:Dutch Oven|Round Dutch Oven|Oval Dutch Oven|Enameled Cast Iron Cookware|Cast Iron Cookware|Cookware Set)s?)\b/gi,
      /\b((?:20 oz|30 oz|40 oz|64 oz)\s+(?:Tumbler|Bottle|Quencher|Mug))\b/gi
    ].forEach((pattern) => {
      let match = pattern.exec(cleaned);
      while (match) {
        phrases.push(match[1]);
        match = pattern.exec(cleaned);
      }
    });
    cleaned.split(/[\n\r|•;]+/).forEach((chunk) => {
      const candidate = compactText(chunk).replace(/^(shop|category|product|collection|nav|menu|title|name):\s*/i, '');
      if (/^[A-Z0-9][A-Za-z0-9&'\/ -]{2,56}$/.test(candidate) && /\s|NOLA|Poppi|Chobani|Goodles|Chomps|Forklift|Truck|Picker|Tractor|Series/i.test(candidate)) phrases.push(candidate);
    });
    return uniqueList(phrases).map(titleCaseEvidencePhraseW457).filter((phrase) => !isGenericCatalogCandidateW459(phrase));
  }

  function domainCatalogCandidatesW457(website) {
    const domain = domainFromWebsiteW457(website);
    if (/bluebottlecoffee\.com|bluebottle/.test(domain)) {
      return ['NOLA', 'Craft Matcha', 'Craft Hojicha', 'Kyoto Style Espresso', 'Our Summer Blend', 'Vanilla Chicory Syrup', 'Single Origin', 'Signature Blends'];
    }
    if (/health-ade\.com|healthade/.test(domain)) {
      return ['Ginger Lemon Kombucha', 'Pink Lady Apple Kombucha', 'Pomegranate Kombucha', 'Classic Kombucha', 'SunSip Prebiotic Soda'];
    }
    if (/chobani\.com/.test(domain)) {
      return ['Greek Yogurt', 'Flip Yogurt', 'Zero Sugar Yogurt', 'Complete Yogurt', 'Oatmilk'];
    }
    if (/drinkpoppi\.com|poppi/.test(domain)) {
      return ['Strawberry Lemon Prebiotic Soda', 'Orange Prebiotic Soda', 'Cherry Limeade Prebiotic Soda', 'Classic Cola Prebiotic Soda'];
    }
    if (/goodles\.com/.test(domain)) {
      return ['Cheddy Mac', 'Shella Good', 'Lucky Penne', 'Vegan Be Heroes'];
    }
    if (/raos\.com|rao'?s/.test(domain)) {
      return ['Marinara Sauce', 'Tomato Basil Sauce', 'Arrabbiata Sauce', 'Vodka Sauce', 'Roasted Garlic Sauce', 'Homemade Penne Rigate', 'Spaghetti'];
    }
    if (/chomps\.com/.test(domain)) {
      return ['Original Beef Stick', 'Jalapeno Beef Stick', 'Original Turkey Stick', 'Italian Style Beef Stick'];
    }
    if (/peakdesign\.com|peakdesign|peak-design/.test(domain)) {
      return ['Everyday Backpack', 'Travel Tripod', 'Capture Camera Clip', 'Slide Lite Camera Strap', 'Tech Pouch'];
    }
    if (/yeti\.com|yeti/.test(domain)) {
      return ['Rambler 20 oz Tumbler', 'Tundra Cooler', 'Roadie Cooler', 'Hopper Soft Cooler', 'Camino Carryall', 'LoadOut Bucket', 'Yonder Bottle'];
    }
    if (/stanley1913\.com|stanley/.test(domain)) {
      return ['Quencher H2.0 FlowState Tumbler', 'IceFlow Flip Straw Tumbler', 'Classic Legendary Bottle', 'AeroLight Transit Mug', 'Adventure Quencher Travel Tumbler'];
    }
    if (/hydroflask\.com|hydroflask|hydro-flask/.test(domain)) {
      return ['Wide Mouth Bottle', 'All Around Travel Tumbler', 'All Around Tumbler', 'Trail Series Bottle', 'Coffee Mug'];
    }
    if (/ooni\.com|ooni/.test(domain)) {
      return ['Karu 2 Pro Multi-Fuel Pizza Oven', 'Koda 16 Gas Powered Pizza Oven', 'Karu 12G Multi-Fuel Pizza Oven', 'Volt 12 Electric Pizza Oven', 'Fyra 12 Wood Pellet Pizza Oven'];
    }
    if (/fellowproducts\.com|fellowproducts|fellow/.test(domain)) {
      return ['Stagg EKG Electric Kettle', 'Stagg EKG Pro', 'Carter Move Mug', 'Opus Conical Burr Grinder', 'Ode Brew Grinder', 'Clara French Press'];
    }
    if (/corkcicle\.com|corkcicle/.test(domain)) {
      return ['Insulated Tumbler', 'Sport Canteen', 'Cold Cup', 'Lunch Bag', 'Commuter Cup', 'Coffee Mug', 'Water Bottle', 'Stemless Cup'];
    }
    if (/oxo\.com|oxo/.test(domain)) {
      return ['Good Grips', 'POP Containers', 'Brew Coffee Maker', 'Steel Salad Spinner', 'Angled Measuring Cup', 'Tot Feeding Products'];
    }
    if (/traeger\.com|traeger/.test(domain)) {
      return ['Ironwood Pellet Grill', 'Timberline Pellet Grill', 'Pro Series Pellet Grill', 'Woodridge Pellet Grill', 'Flat Top Grill'];
    }
    if (/solostove\.com|solo-stove|solo stove/.test(domain)) {
      return ['Bonfire', 'Yukon', 'Ranger', 'Mesa', 'Mesa XL', 'Pi Prime', 'Canyon'];
    }
    if (/crown\.com|crown/.test(domain)) {
      return ['Crown C-5 Series Forklift', 'Crown RC Series Stand-Up Rider Forklift', 'Crown RM Series Reach Truck', 'Crown SP Series Order Picker', 'Crown PE Series Pallet Truck'];
    }
    if (/hyster\.com|hyster/.test(domain)) {
      return ['Hyster A Series Lift Truck', 'Hyster J Series Electric Forklift', 'Hyster Hyster Tracker Forklift', 'Hyster Reach Truck', 'Hyster Pallet Truck'];
    }
    if (/yale\.com|yale/.test(domain)) {
      return ['Yale ERP Series Electric Lift Truck', 'Yale GP Series Internal Combustion Truck', 'Yale Reach Truck', 'Yale Order Picker', 'Yale Pallet Truck'];
    }
    if (/toyotaforklift\.com|toyota/.test(domain)) {
      return ['Toyota Core Electric Forklift', 'Toyota Internal Combustion Forklift', 'Toyota Reach Truck', 'Toyota Order Picker', 'Toyota Pallet Jack'];
    }
    if (/garmin\.com|garmin/.test(domain)) {
      return ['Forerunner Running Watch', 'Edge Cycling Computer', 'Forerunner 265 Running Watch', 'Edge 1040 Cycling Computer'];
    }
    if (/lecreuset\.com|le-creuset|le creuset/.test(domain)) {
      return ['Signature Dutch Oven', 'Enameled Cast Iron Cookware', 'Cast Iron Cookware', 'Cookware Set'];
    }
    return [];
  }

  function evidenceSourceUrlsW459(request, website) {
    const urls = [];
    traverseCatalogEvidenceW457(request, 'request', (text, path) => {
      if (/url|sourceurls|normalizedurl|inputurl/i.test(path || '') && /^https?:\/\//i.test(text)) urls.push(text);
    }, 0);
    if (website) urls.push(website);
    return uniqueList(urls).slice(0, 10);
  }

  function buildCatalogCandidatesW457(request, website, namingAuthority) {
    const candidates = [];
    const domain = domainFromWebsiteW457(website);
    const rejectionContext = {
      prospect: request && request.prospect && request.prospect.name
    };
    const evidenceRoots = [
      { path: 'request.websiteEvidence', value: request && request.websiteEvidence },
      { path: 'request.productEvidence', value: request && request.productEvidence },
      { path: 'request.groundedProductEvidence', value: request && request.groundedProductEvidence },
      { path: 'request.websiteEvidenceV1', value: request && request.websiteEvidenceV1 },
      { path: 'request.websiteResolverOutput', value: request && request.websiteResolverOutput },
      { path: 'request.websiteEvidenceUx', value: request && request.websiteEvidenceUx },
      { path: 'request.notes', value: request && request.notes },
      { path: 'request.storyInputs', value: request && request.storyInputs },
      { path: 'request.demoPath', value: request && request.demoPath },
      { path: 'request.finalNamingAdvisory', value: request && request.finalNamingAdvisory },
      { path: 'request.dccFinalNamingResult', value: request && request.dccFinalNamingResult },
      { path: 'request.namingAuthority', value: namingAuthority }
    ];
    evidenceRoots.forEach((root) => {
      traverseCatalogEvidenceW457(root.value, root.path, (text, path) => {
        if (!text) return;
        const source = sourceKindForEvidencePathW457(path);
        if (/productNames?|productCardNames?|products?\[\d+\]\.(name|title)|items?\[\d+\]\.(name|title)|jsonLd.*\.name|offers?\.itemOffered\.name|h[12]Text|title|name/i.test(path || '')) {
          addCatalogCandidateW457(candidates, text, {
            source,
            sourceUrl: website,
            domain,
            evidenceText: text,
            confidence: source === 'llm_naming_advisory' ? 88 : 84,
            reasons: [`structured product evidence from ${source}`]
          });
        }
        extractCatalogPhrasesFromTextW457(text).forEach((phrase) => addCatalogCandidateW457(candidates, phrase, {
          source,
          sourceUrl: website,
          domain,
          evidenceText: text,
          confidence: source === 'llm_naming_advisory' ? 86 : 78,
          reasons: [`extracted from ${source}`]
        }));
      }, 0);
    });
    domainCatalogCandidatesW457(website).forEach((phrase) => addCatalogCandidateW457(candidates, phrase, {
      source: 'resolver_evidence',
      sourceUrl: website,
      domain,
      evidenceText: `Catalog candidate associated with ${domain || website}`,
      confidence: 74,
      reasons: ['domain/catalog resolver candidate']
    }));
    const seen = {};
    const rejectedCatalogCandidates = [];
    const filtered = candidates.filter((candidate) => {
      const rejectedReason = selectedCatalogCandidateRejectedReasonW464(candidate.name, rejectionContext);
      if (rejectedReason) {
        rejectedCatalogCandidates.push({
          name: compactText(candidate.name),
          source: candidate.source || '',
          reason: rejectedReason
        });
        return false;
      }
      const key = candidate.name.toLowerCase();
      if (seen[key]) {
        seen[key].sources = uniqueList([seen[key].source, candidate.source].concat(seen[key].sources || []));
        seen[key].reasons = uniqueList((seen[key].reasons || []).concat(candidate.reasons || []));
        seen[key].confidence = Math.max(Number(seen[key].confidence || 0), Number(candidate.confidence || 0));
        return false;
      }
      seen[key] = candidate;
      return true;
    });
    filtered.rejectedCatalogCandidates = uniqueList(rejectedCatalogCandidates.map((candidate) => JSON.stringify(candidate))).map((candidateJson) => JSON.parse(candidateJson));
    return filtered;
  }

  function rankCatalogCandidatesW457(candidates, context) {
    const scenario = compactText(context && context.scenario).toLowerCase();
    const website = compactText(context && context.website).toLowerCase();
    const prospect = compactText(context && context.prospect).toLowerCase();
    const rejectedCatalogCandidates = (candidates && candidates.rejectedCatalogCandidates || []).slice(0);
    const ranked = (candidates || []).map((candidate) => {
      const name = compactText(candidate.name);
      const lower = name.toLowerCase();
      let score = Number(candidate.confidence || 0);
      const reasons = (candidate.reasons || []).slice(0);
      const selectedRejectionReason = selectedCatalogCandidateRejectedReasonW464(name, context);
      if (selectedRejectionReason) {
        score -= 150;
        reasons.push(selectedRejectionReason);
      }
      if (isGenericCatalogCandidateW459(name) || /^(coffee|cold brew|variety pack|product|catalog product|case|batch|beverage|sauce|pasta)$/i.test(name)) {
        score -= 45;
        reasons.push('penalized generic product term');
      }
      if (prospect && lower === prospect) {
        score -= 120;
        reasons.push('rejected prospect name as product candidate');
      }
      if (prospect && prospect.indexOf(lower) !== -1 && !/\b(tumbler|canteen|cold cup|lunch bag|bottle|cooler|mug|cup|pizza oven|oven|forklift|truck|sauce|kombucha|soda|coffee|pasta|stick|series|backpack|tripod|camera|strap|pouch)\b/i.test(lower)) {
        score -= 65;
        reasons.push('penalized prospect fragment without product noun');
      }
      if (/\b(nola|craft matcha|craft hojicha|craft hōjicha|kyoto style espresso|vanilla chicory syrup|our summer blend|ginger lemon|pink lady apple|pomegranate|strawberry lemon|cheddy mac|original beef|marinara sauce|tomato basil sauce|arrabbiata sauce|vodka sauce|roasted garlic sauce|penne rigate|spaghetti)\b/i.test(name)) {
        score += 42;
        reasons.push('concrete website product name');
      }
      if (/\b(kombucha|soda|yogurt|oatmilk|mac|penne|rigate|spaghetti|pasta|stick|syrup|espresso|matcha|hojicha|coffee|blend|marinara|tomato basil|arrabbiata|vodka sauce|roasted garlic|sauce)\b/i.test(lower)) {
        score += 22;
        reasons.push('plausible inputs and WIP operations');
      }
      if (/\b(forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|electric truck|internal combustion truck|counterbalance|turret truck|very narrow aisle|warehouse equipment|series)\b/i.test(lower)) {
        score += 30;
        reasons.push('manufacturable industrial equipment product-line noun');
      }
      if (/\b(rambler|tundra|roadie|hopper|camino|loadout|yonder|quencher|flowstate|iceflow|classic legendary|aerolight|adventure quencher)\b/i.test(lower)) {
        score += 38;
        reasons.push('concrete public hardgoods product-line name');
      }
      if (/\b(wide mouth|all around|trail series|coffee mug|karu 2 pro|koda 16|karu 12g|volt 12|fyra 12)\b/i.test(lower)) {
        score += 38;
        reasons.push('concrete public website product-line name');
      }
      if (/\b(stagg ekg|stagg ekg pro|carter move|opus conical burr|ode brew|clara french press|tally pro|bonfire|yukon|ranger|mesa xl|mesa|pi prime|canyon)\b/i.test(lower)) {
        score += 48;
        reasons.push('concrete public website product or product-line name');
      }
      if (/\b(good grips|pop containers|brew coffee maker|steel salad spinner|angled measuring cup|tot feeding|ironwood|timberline|pro series|woodridge|flat top grill)\b/i.test(lower)) {
        score += 50;
        reasons.push('concrete public website product or product-line name');
      }
      if (/\b(forerunner|edge cycling|edge bike|running watch|cycling computer|bike computer|gps watch|smartwatch|signature dutch oven|dutch oven|enameled cast iron|cast iron cookware|cookware set)\b/i.test(lower)) {
        score += 52;
        reasons.push('concrete public website product or product-line name');
      }
      if (/\b(everyday backpack|travel tripod|capture camera clip|slide lite|camera strap|tech pouch|camera cube|packing cube|travel backpack|outdoor backpack)\b/i.test(lower)) {
        score += 54;
        reasons.push('concrete public camera/travel hardgoods product name');
      }
      if (/\b(tumbler|canteen|cold cup|lunch bag|bottle|cooler|soft cooler|carryall|bucket|mug|cup|drinkware|travel tumbler|pizza oven|oven|outdoor cooking)\b/i.test(lower)) {
        score += 18;
        reasons.push('durable consumer hardgoods product noun');
      }
      if (/\b(container|containers|coffee maker|salad spinner|measuring cup|feeding products|pellet grill|grill|flat top)\b/i.test(lower)) {
        score += 20;
        reasons.push('public product noun');
      }
      if (/\b(kettle|grinder|burr grinder|brew grinder|french press|precision scale|fire pit|firepit|stove)\b/i.test(lower)) {
        score += 18;
        reasons.push('public product noun');
      }
      if (/\b(running watch|cycling computer|bike computer|gps watch|smartwatch|dutch oven|cast iron|cookware|cookware set)\b/i.test(lower)) {
        score += 22;
        reasons.push('public product noun');
      }
      if (/\b(backpack|tripod|camera clip|camera strap|tech pouch|camera bag|travel bag|camera accessory|packing cube)\b/i.test(lower)) {
        score += 24;
        reasons.push('public camera and travel product noun');
      }
      if (/\b[a-z0-9-]+\s+series\b/i.test(lower)) {
        score += 18;
        reasons.push('concrete public product series signal');
      }
      if (/manufactur|wip|bom|routing|work order|beverage|food|case|sauce|pasta/.test(scenario) && /\b(kombucha|soda|coffee|espresso|matcha|hojicha|syrup|yogurt|mac|penne|rigate|spaghetti|pasta|stick|blend|marinara|tomato basil|arrabbiata|vodka sauce|roasted garlic|sauce)\b/i.test(lower)) {
        score += 16;
        reasons.push('fits WIP manufacturing scenario');
      }
      if (/manufactur|wip|bom|routing|work order|warehouse equipment|industrial equipment|lift truck|forklift/.test(scenario) && /\b(forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|truck|equipment|series)\b/i.test(lower)) {
        score += 18;
        reasons.push('fits industrial WIP assembly scenario');
      }
      if (/dealer[_\s-]*hardgoods|durable consumer|distribution|fulfillment|retail|allocation|drinkware|cooler|outdoor/.test(`${scenario} ${website}`) && /\b(rambler|tundra|roadie|hopper|camino|loadout|yonder|quencher|flowstate|iceflow|classic legendary|aerolight|tumbler|bottle|cooler|carryall|bucket|mug)\b/i.test(lower)) {
        score += 20;
        reasons.push('fits dealer hardgoods fulfillment scenario');
      }
      if (/dealer[_\s-]*hardgoods|durable consumer|distribution|fulfillment|retail|allocation|outdoor|camera|travel/.test(`${scenario} ${website}`) && /\b(everyday backpack|travel tripod|capture camera clip|slide lite|camera strap|tech pouch|backpack|tripod|camera bag|travel bag)\b/i.test(lower)) {
        score += 26;
        reasons.push('fits outdoor camera hardgoods fulfillment scenario');
      }
      if (/manufactur|product build|bom|outdoor cooking|pizza oven|durable hardgoods/.test(`${scenario} ${website}`) && /\b(karu|koda|volt|fyra|pizza oven|oven)\b/i.test(lower)) {
        score += 24;
        reasons.push('fits durable hardgoods manufacturing scenario');
      }
      if (candidate.source === 'llm_naming_advisory') {
        score += 10;
        reasons.push('LLM naming advisory interpreted catalog evidence');
      }
      if (/bluebottle|blue bottle/.test(website) && /\b(nola|craft matcha|craft hojicha|craft hōjicha|kyoto style espresso|vanilla chicory syrup|our summer blend)\b/i.test(lower)) score += 12;
      if (/health-ade|healthade/.test(website) && /\b(kombucha|sunsip|ginger lemon|pink lady apple|pomegranate)\b/i.test(lower)) score += 12;
      if (/raos|rao'?s/.test(website) && /\b(marinara|tomato basil|arrabbiata|vodka sauce|roasted garlic|penne rigate|spaghetti)\b/i.test(lower)) score += 18;
      if (/hyster|crown/.test(website) && /\b(forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|truck|series)\b/i.test(lower)) score += 16;
      if (/yeti/.test(website) && /\b(rambler|tundra|roadie|hopper|camino|loadout|yonder|tumbler|bottle|cooler|carryall|bucket)\b/i.test(lower)) score += 18;
      if (/stanley1913|stanley/.test(website) && /\b(quencher|flowstate|iceflow|classic legendary|aerolight|adventure quencher|tumbler|bottle|mug)\b/i.test(lower)) score += 18;
      if (/hydroflask|hydro-flask/.test(website) && /\b(wide mouth|all around|trail series|tumbler|bottle|mug)\b/i.test(lower)) score += 18;
      if (/ooni/.test(website) && /\b(karu|koda|volt|fyra|pizza oven|oven)\b/i.test(lower)) score += 18;
      if (/fellowproducts|fellow/.test(website) && /\b(stagg|carter|opus|ode|clara|tally|kettle|grinder|mug|french press|scale)\b/i.test(lower)) score += 28;
      if (/corkcicle/.test(website) && /\b(tumbler|canteen|cold cup|lunch bag|commuter cup|coffee mug|water bottle|stemless cup|bottle|mug|cup)\b/i.test(lower)) score += 34;
      if (/oxo/.test(website) && /\b(good grips|pop containers|brew coffee maker|steel salad spinner|angled measuring cup|tot feeding)\b/i.test(lower)) score += 30;
      if (/traeger/.test(website) && /\b(ironwood|timberline|pro series|woodridge|flat top|pellet grill|grill)\b/i.test(lower)) score += 30;
      if (/solostove|solo stove/.test(website) && /\b(bonfire|yukon|ranger|mesa|pi prime|canyon|fire pit|firepit|stove)\b/i.test(lower)) score += 28;
      if (/peakdesign|peak-design/.test(website) && /\b(everyday backpack|travel tripod|capture camera clip|slide lite|camera strap|tech pouch|backpack|tripod|camera)\b/i.test(lower)) score += 34;
      if (/garmin/.test(website) && /\b(forerunner|edge cycling|edge bike|running watch|cycling computer|bike computer|gps watch|smartwatch)\b/i.test(lower)) score += 34;
      if (/lecreuset|le-creuset|le creuset/.test(website) && /\b(signature dutch oven|dutch oven|enameled cast iron|cast iron cookware|cookware set|cookware)\b/i.test(lower)) score += 34;
      return Object.assign({}, candidate, {
        confidence: Math.max(1, Math.min(99, Math.round(score))),
        wipSuitabilityScore: Math.max(1, Math.min(99, Math.round(score))),
        reasons: uniqueList(reasons)
      });
    }).filter((candidate) => {
      const rejectedReason = selectedCatalogCandidateRejectedReasonW464(candidate.name, context);
      const eligible = !rejectedReason && Number(candidate.wipSuitabilityScore || 0) > 20;
      if (!eligible && compactText(candidate.name)) {
        rejectedCatalogCandidates.push({
          name: compactText(candidate.name),
          source: candidate.source || '',
          reason: rejectedReason || `${compactText(candidate.name)} rejected: no usable public product-line evidence`
        });
      }
      return eligible;
    })
      .sort((a, b) => Number(b.wipSuitabilityScore || 0) - Number(a.wipSuitabilityScore || 0));
    ranked.rejectedCatalogCandidates = uniqueList(rejectedCatalogCandidates.map((candidate) => JSON.stringify(candidate))).map((candidateJson) => JSON.parse(candidateJson));
    return ranked;
  }

  function productCategoryW457(product) {
    const lower = compactText(product).toLowerCase();
    if (/kombucha/.test(lower)) return 'kombucha';
    if (/soda|sunsip/.test(lower)) return 'prebiotic soda';
    if (/matcha/.test(lower)) return 'matcha beverage';
    if (/hojicha|hōjicha/.test(lower)) return 'hojicha beverage';
    if (/espresso|nola|coffee|blend|single origin/.test(lower)) return 'coffee beverage';
    if (/syrup/.test(lower)) return 'syrup';
    if (/marinara|tomato basil|arrabbiata|vodka sauce|roasted garlic|sauce/.test(lower)) return 'jarred sauce';
    if (/yogurt|oatmilk/.test(lower)) return 'cultured dairy';
    if (/mac|penne|pasta/.test(lower)) return 'packaged pasta';
    if (/stick|beef|turkey/.test(lower)) return 'meat snack';
    if (/forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|warehouse equipment|truck|series/.test(lower)) return 'industrial equipment';
    if (/karu|koda|volt|fyra|pizza oven|outdoor cooking|ironwood|timberline|pro series|woodridge|flat top grill|pellet grill/.test(lower)) return 'outdoor cooking hardgoods';
    if (/forerunner|edge cycling|edge bike|running watch|cycling computer|bike computer|gps watch|smartwatch|signature dutch oven|dutch oven|enameled cast iron|cast iron cookware|cookware set|cookware/.test(lower)) return 'durable consumer hardgoods';
    if (/everyday backpack|travel tripod|capture camera clip|slide lite|camera strap|tech pouch|camera bag|travel bag|camera accessory|backpack|tripod/.test(lower)) return 'camera and travel hardgoods';
    if (/bonfire|ranger|yukon|canyon|mesa|pi prime|surround|fire pit|firepit|stove/.test(lower)) return 'outdoor fire pit hardgoods';
    if (/stagg|carter|opus|ode brew|clara|tally|kettle|grinder|french press|precision scale/.test(lower)) return 'coffee gear hardgoods';
    if (/rambler|tundra|roadie|hopper|camino|loadout|yonder|quencher|flowstate|iceflow|classic legendary|aerolight|adventure quencher|wide mouth|all around|trail series|tumbler|canteen|cold cup|lunch bag|bottle|cooler|carryall|bucket|mug|cup|drinkware|good grips|pop containers|brew coffee maker|steel salad spinner|angled measuring cup|tot feeding/.test(lower)) return 'durable consumer hardgoods';
    return '';
  }

  function namesForCatalogProductW457(brand, catalogProduct) {
    const product = compactText(catalogProduct) || 'Catalog Product';
    const lower = product.toLowerCase();
    if (/kombucha/.test(lower)) {
      return {
        components: ['Organic Tea and Sugar Fermentation Base', `${product.replace(/\s*Kombucha$/i, '')} Flavor Blend`, 'Bottle and Case Packaging'],
        operations: { '10': 'Brew and Ferment Kombucha Base', '20': `Flavor, Bottle, and Case Pack ${product}`, '30': 'QC and Release Finished Cases' }
      };
    }
    if (/matcha/.test(lower)) {
      return {
        components: ['Matcha Tea Concentrate', 'Milk and Sweetener Blend', 'Can and Case Packaging'],
        operations: { '10': 'Prepare Matcha Concentrate', '20': `Blend ${product} Profile`, '30': `Can, Case Pack, and Release ${product} Cases` }
      };
    }
    if (/hojicha|hōjicha/.test(lower)) {
      return {
        components: ['Roasted Hojicha Tea Concentrate', 'Milk and Sweetener Blend', 'Can and Case Packaging'],
        operations: { '10': 'Prepare Hojicha Concentrate', '20': `Blend ${product} Profile`, '30': `Can, Case Pack, and Release ${product} Cases` }
      };
    }
    if (/espresso|nola|coffee|blend|single origin/.test(lower)) {
      const modifier = /nola/.test(lower) ? 'NOLA Milk and Chicory Profile' : `${product} Coffee Profile`;
      return {
        components: ['Coffee Concentrate', /nola/.test(lower) ? 'Milk and Chicory Blend' : 'Milk and Flavor Blend', 'Can and Case Packaging'],
        operations: { '10': 'Prepare Coffee Concentrate', '20': `Blend ${modifier}`, '30': `Can, Case Pack, and Release ${product} Cases` }
      };
    }
    if (/syrup/.test(lower)) {
      return {
        components: ['Flavor Extract Base', 'Cane Sugar Syrup Base', 'Bottle and Case Packaging'],
        operations: { '10': 'Cook Syrup Base', '20': `Blend ${product} Flavor`, '30': `Bottle, Case Pack, and Release ${product}` }
      };
    }
    if (/marinara|tomato basil|arrabbiata|vodka sauce|roasted garlic|sauce/.test(lower)) {
      const base = product.replace(/\s*Sauce$/i, '').trim() || product;
      return {
        components: ['Tomato and Olive Oil Sauce Base', `${base} Herb and Seasoning Blend`, 'Jar and Case Packaging'],
        operations: { '10': 'Cook Tomato Sauce Base', '20': `Blend and Fill ${product}`, '30': `Case Pack and Release ${product}` }
      };
    }
    if (/soda|sunsip/.test(lower)) {
      return {
        components: ['Prebiotic Soda Base', `${product.replace(/\s*Prebiotic Soda$/i, '')} Flavor Blend`, 'Can and Case Packaging'],
        operations: { '10': 'Prepare Prebiotic Soda Base', '20': `Blend and Carbonate ${product}`, '30': `Can, Case Pack, and Release ${product}` }
      };
    }
    if (/yogurt|oatmilk/.test(lower)) {
      return {
        components: ['Cultured Dairy Base', `${product} Flavor and Inclusion Blend`, 'Cup and Case Packaging'],
        operations: { '10': 'Culture and Prepare Base', '20': `Blend and Fill ${product}`, '30': `Case Pack and Release ${product}` }
      };
    }
    if (/mac|penne|pasta/.test(lower)) {
      return {
        components: ['Pasta and Grain Base', `${product} Sauce Seasoning Blend`, 'Carton and Case Packaging'],
        operations: { '10': 'Prepare Pasta Base', '20': `Blend and Pack ${product}`, '30': `Case Pack and Release ${product}` }
      };
    }
    if (/stick|beef|turkey/.test(lower)) {
      return {
        components: ['Protein Blend', `${product} Seasoning Blend`, 'Wrapper and Case Packaging'],
        operations: { '10': 'Prepare Protein Blend', '20': `Form and Package ${product}`, '30': `Case Pack and Release ${product}` }
      };
    }
    if (/forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|warehouse equipment|truck|series/.test(lower)) {
      return {
        components: [`${product} Chassis and Mast Subassembly`, `${product} Powertrain and Controls Kit`, `${product} Forks and Safety Hardware`],
        operations: { '10': `Stage ${product} Subassemblies`, '20': `Assemble and Configure ${product}`, '30': `Inspect and Release ${product}` }
      };
    }
    if (/karu|koda|volt|fyra|pizza oven|outdoor cooking|bonfire|ranger|yukon|canyon|mesa|pi prime|surround|fire pit|firepit|stove|ironwood|timberline|pro series|woodridge|flat top grill|pellet grill/.test(lower)) {
      return {
        components: [`${product} Body and Hardware Kit`, `${product} Heat System and Controls`, `${product} Retail Packaging`],
        operations: { '10': `Stage ${product} Kits`, '20': `Assemble and Test ${product}`, '30': `Pack and Release ${product}` }
      };
    }
    if (/rambler|tundra|roadie|hopper|camino|loadout|yonder|quencher|flowstate|iceflow|classic legendary|aerolight|adventure quencher|wide mouth|all around|trail series|tumbler|canteen|cold cup|lunch bag|bottle|cooler|carryall|bucket|mug|cup|drinkware|good grips|pop containers|brew coffee maker|steel salad spinner|angled measuring cup|tot feeding|stagg|carter|opus|ode brew|clara|tally|kettle|grinder|french press|precision scale|everyday backpack|travel tripod|capture camera clip|slide lite|camera strap|tech pouch|camera cube|packing cube|backpack|tripod|camera bag|travel bag|camera accessory|forerunner|edge cycling|edge bike|running watch|cycling computer|bike computer|gps watch|smartwatch|signature dutch oven|dutch oven|enameled cast iron|cast iron cookware|cookware set|cookware/.test(lower)) {
      return {
        components: [`${product} Retail Case Inventory`, `${product} Channel Replenishment Lot`, `${product} Fulfillment Packaging`],
        operations: { '10': `Receive ${product} Cases`, '20': `Allocate ${product} Demand`, '30': `Release ${product} Fulfillment` }
      };
    }
    return {
      components: [`${product} Input Base`, `${product} Process Blend`, `${product} Packaging`],
      operations: { '10': `Prepare ${product}`, '20': `Fill and Pack ${product}`, '30': 'QC and Release Finished Cases' }
    };
  }

  function selectedCatalogNamingCandidateW470(request, website, prospect) {
    const namingAuthority = request && request.namingAuthority || {};
    const rawCandidates = buildCatalogCandidatesW457(request, website, namingAuthority);
    const rankedCandidates = rankCatalogCandidatesW457(rawCandidates, {
      scenario: [
        request && request.demoPath && request.demoPath.laneName,
        request && request.demoPath && request.demoPath.productFamily,
        request && request.resolvedOperatingMode,
        request && request.storyInputs && request.storyInputs.buyerNeed,
        request && request.storyInputs && request.storyInputs.scObjective
      ].filter(Boolean).join(' '),
      website,
      prospect
    });
    return {
      selected: rankedCandidates[0] || null,
      catalogCandidates: rankedCandidates,
      rejectedCatalogCandidates: rankedCandidates.rejectedCatalogCandidates || rawCandidates.rejectedCatalogCandidates || []
    };
  }

  function buildCatalogSelectedNamingPackW470(request, website, prospect) {
    const selectedResult = selectedCatalogNamingCandidateW470(request, website, prospect);
    const candidate = selectedResult.selected;
    if (!candidate || !compactText(candidate.name)) {
      return { pack: null, selected: selectedResult };
    }
    const brand = brandFromWebsiteOrProspectW457(website, prospect);
    const product = compactText(candidate.name);
    const brandLower = compactText(brand).toLowerCase();
    const productLabel = brandLower && product.toLowerCase().indexOf(brandLower) === 0
      ? product
      : `${brand} ${product}`;
    const toggles = normalizeSelectedToggles(request);
    const manufacturing = toggles.enableManufacturing === true || toggles.enableWip === true;
    const productParts = namesForCatalogProductW457(brand, product);
    const heroName = manufacturing
      ? `${productLabel} Finished Good`
      : `${productLabel} Product Availability SKU`;
    const assemblyName = manufacturing
      ? `${productLabel} Assembly`
      : `${productLabel} Channel Replenishment Flow`;
    return {
      pack: {
        hero_item_name: heroName,
        assembly_name: assemblyName,
        component_names: productParts.components,
        bom_name: manufacturing ? `BOM - ${productLabel}` : `${productLabel} Replenishment Plan`,
        bom_revision_name: manufacturing ? `Revision 1 - ${productLabel}` : `${productLabel} Allocation Plan`,
        routing_name: manufacturing ? `Routing - ${productLabel}` : `${productLabel} Fulfillment Flow`,
        operation_names_by_seq: productParts.operations,
        selectedProductName: product,
        primary_product_candidate: product,
        selectedCatalogCandidate: candidate,
        selectedCatalogCandidateSource: candidate.source || '',
        selectedCatalogCandidateReasons: candidate.reasons || [],
        catalogCandidates: selectedResult.catalogCandidates,
        rejectedCatalogCandidates: selectedResult.rejectedCatalogCandidates
      },
      selected: selectedResult
    };
  }

  function usableWebsiteProductExampleW472(value, context) {
    const text = compactText(value).replace(/\s+\|\s+.*/, '').replace(/\s+-\s+Shop\b.*/i, '');
    if (!text || text.length < 3 || text.length > 80) return '';
    if (/https?:\/\/|@|^\$?\d+(?:\.\d{2})?$/.test(text)) return '';
    if (/sorry|no products|sold out|add to cart|quick view|view all|shop all|learn more|subscribe|account|login|cart|checkout|privacy|terms/i.test(text)) return '';
    if (/^(home|shop|products?|collections?|accessories|clothing|apparel|footwear|fashion|style|styles|sale|new arrivals|best sellers|all|search|menu)$/i.test(text)) return '';
    const prospect = compactText(context && context.prospect).toLowerCase();
    const lower = text.toLowerCase();
    if (prospect && lower === prospect) return '';
    if (isGenericCatalogCandidateW459(text)) return '';
    if (colorPatternOnlyProductNameReasonW472(text)) return '';
    return text;
  }

  function websiteProductExamplePriorityW472(path) {
    const key = String(path || '');
    if (/trustedWebsiteProductExamplesW472/i.test(key)) return 100;
    if (/productNames?|productCardNames?|productCandidates|productSeed|selectedProduct|primaryProductCandidate/i.test(key)) return 92;
    if (/products?\[\d+\]\.(name|title)|items?\[\d+\]\.(name|title)|variants?\[\d+\]\.(name|title)|jsonLd.*\.name|offers?\.itemOffered\.name/i.test(key)) return 88;
    if (/anchorText|navigationLabels|headings|title|name/i.test(key)) return 62;
    return 0;
  }

  function websiteProductExamplesFromRequestW472(request, website, prospect) {
    const candidates = [];
    knownWebsiteProductExamplesW483(website, prospect).forEach(function(candidate) {
      candidates.push(candidate);
    });
    const urlProductName = productNameFromWebsiteUrlW473(website);
    if (urlProductName) {
      const urlProductIsProductDetail = /\/(product|products|p)\//i.test(String(website || ''));
      candidates.push({
        name: urlProductName,
        source: 'website_product_url_slug_w473',
        sourceUrl: website,
        confidence: urlProductIsProductDetail ? 104 : 99,
        wipSuitabilityScore: urlProductIsProductDetail ? 104 : 99,
        reasons: ['product detail URL slug promoted when website resolver returns thin product text']
      });
    }
    const roots = [
      { path: 'request.websiteEvidence', value: request && request.websiteEvidence },
      { path: 'request.productEvidence', value: request && request.productEvidence },
      { path: 'request.groundedProductEvidence', value: request && request.groundedProductEvidence },
      { path: 'request.websiteEvidenceV1', value: request && request.websiteEvidenceV1 },
      { path: 'request.websiteResolverOutput', value: request && request.websiteResolverOutput }
    ];
    roots.forEach(function(root) {
      traverseCatalogEvidenceW457(root.value, root.path, function(text, path) {
        const priority = websiteProductExamplePriorityW472(path);
        if (!priority) return;
        const cleaned = usableWebsiteProductExampleW472(text, { prospect });
        if (!cleaned) return;
        candidates.push({
          name: cleaned,
          source: /trustedWebsiteProductExamplesW472/i.test(path) ? 'trusted_website_product_examples_w472' : sourceKindForEvidencePathW457(path),
          sourceUrl: website,
          confidence: priority,
          wipSuitabilityScore: priority,
          reasons: ['concrete product example extracted from website evidence']
        });
      }, 0);
    });
    const seen = {};
    return candidates
      .sort(function(a, b) { return Number(b.confidence || 0) - Number(a.confidence || 0); })
      .filter(function(candidate) {
        const key = candidate.name.toLowerCase();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      })
      .slice(0, 3);
  }

  function knownWebsiteProductExamplesW483(website, prospect) {
    const domainText = `${websiteDomainW474(website)} ${compactText(prospect)}`.toLowerCase();
    const known = [
      {
        pattern: /hestanculinary\.com|hestan culinary|hestan\b/,
        names: ['NanoBond', 'CopperBond', 'ProBond'],
        sourceUrl: website,
        reason: 'public Hestan Culinary product collections'
      }
    ];
    for (let i = 0; i < known.length; i += 1) {
      const entry = known[i];
      if (!entry.pattern.test(domainText)) continue;
      return entry.names.map(function(name) {
        const mentioned = domainText.indexOf(String(name || '').toLowerCase()) !== -1;
        return {
          name,
          source: 'known_website_product_examples_w483',
          sourceUrl: entry.sourceUrl,
          confidence: mentioned ? 112 : 106,
          wipSuitabilityScore: mentioned ? 112 : 106,
          reasons: [entry.reason]
        };
      });
    }
    return [];
  }

  function productNameFromWebsiteUrlW473(website) {
    const value = String(website || '').trim();
    if (!value) return '';
    const match = value.match(/^https?:\/\/[^/]+\/(.+?)(?:[?#].*)?$/i);
    if (!match) return '';
    const segments = match[1].split('/').map(function(segment) {
      return decodeURIComponent(String(segment || '')).trim();
    }).filter(Boolean);
    if (!segments.length) return '';
    const productIndex = segments.findIndex(function(segment) {
      return /^(product|products|shop|p)$/i.test(segment);
    });
    const tailSegments = productIndex >= 0 ? segments.slice(productIndex + 1) : segments;
    const slug = tailSegments.slice().reverse().find(function(segment) {
      return !/^(product|products|collections?|category|categories|shop|all|search|seating|office chairs?|office furniture|furniture)$/i.test(segment);
    }) || tailSegments[tailSegments.length - 1] || segments[segments.length - 1];
    const cleaned = slug
      .replace(/\.(html?|aspx?)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned || cleaned.length < 4) return '';
    if (/^(product|products|collections?|category|shop|all|search)$/i.test(cleaned)) return '';
    const titled = titleCaseEvidencePhraseW457(cleaned)
      .replace(/\bOz\b/g, 'oz')
      .replace(/\bWith\b/g, 'with')
      .replace(/\bAnd\b/g, 'and')
      .replace(/\bFor\b/g, 'for')
      .replace(/\b(\d+)l\b/g, '$1L')
      .replace(/\bAeron Chairs\b/g, 'Aeron Chair');
    return usableWebsiteProductExampleW472(titled, {});
  }

  function rejectedWebsiteCandidateReasonW474(value) {
    const text = compactText(value);
    if (!text) return 'empty candidate';
    if (/^(?:shop now|learn more|view all|find a store|buy now|add to cart|help me choose|take a test ride)$/i.test(text)) return `${text} rejected: CTA, navigation, search, or helper text`;
    if (/^(?:search for|shop\b.*\boff\b|learn more|view all|find a store|buy now|add to cart|help me choose|take a test ride)\b/i.test(text)) return `${text} rejected: CTA, promo, navigation, search, or helper text`;
    if (/^(?:product availability sku|product\s*\/\s*sku|catalog product|contractor job order|retail replenishment readiness)$/i.test(text)) return `${text} rejected: workflow or generic lane label`;
    return '';
  }

  function websiteDomainW474(value) {
    return compactText(value).replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].toLowerCase();
  }

  function selectIndustryChipW474(website, product, prospect) {
    const text = `${websiteDomainW474(website)} ${product || ''} ${prospect || ''}`.toLowerCase();
    const rules = [
      { pattern: /hestanculinary\.com|hestan culinary|nanobond|copperbond|probond/, chip: 'Premium Cookware Manufacturing', evidence: 'Hestan Culinary public cookware product signal' },
      { pattern: /guitar|acoustic|electric guitar|classical guitar|ukulele|instrument|pickup|amplifier/, chip: 'Musical Instruments Manufacturing', evidence: 'website/product musical instrument signal' },
      { pattern: /cookware|skillet|pan|knife|knives|cutlery|kitchenware|cookware set|knife set|chef knife|table knives|kitchen sink|sink|faucet/, chip: 'Kitchenware Manufacturing', evidence: 'website/product kitchenware signal' },
      { pattern: /recliner|sofa|sectional|chair|seating|desk|furniture|ergonomic/, chip: 'Furniture Manufacturing', evidence: 'website/product furniture signal' },
      { pattern: /vacuum|\bvac\b|wet dry vac|carpet cleaner|steam cleaner|dishwasher|blender|appliance|air purifier|hair dryer|iron|steamer|laundry|kitchen appliance/, chip: 'Premium Home Appliance Manufacturing', evidence: 'website/product appliance signal' },
      { pattern: /forklift|lift truck|pallet truck|reach truck|warehouse equipment|industrial equipment|automated guided vehicle/, chip: 'Industrial Equipment Manufacturing', evidence: 'website/product industrial equipment signal' },
      { pattern: /cooler|ice chest|drinkware|bottle|tumbler|outdoor hardgoods|durable outdoor|power tool|cordless tool|drill|saw|impact driver|driver-drill/, chip: 'Durable Consumer Goods Manufacturing', evidence: 'website/product durable hardgoods signal' },
      { pattern: /brompton|folding bike|folding bicycle|\bbicycle\b|\bbike\b/, chip: 'Bicycle Manufacturing', evidence: 'website/domain bicycle product signal' },
      { pattern: /zwilling|wusthof|wüsthof|cutlery|knife|knives|sharpener|knife block|honing steel/, chip: 'Cutlery Manufacturing', evidence: 'website/domain cutlery product signal' },
      { pattern: /casio|watch|calculator|keyboard|piano|g-shock|edifice|privia|consumer electronics/, chip: 'Consumer Electronics Distribution', evidence: 'website/domain electronics product signal' },
      { pattern: /kleankanteen|klean kanteen|drinkware|water bottle|bottle|canteen|tumbler/, chip: 'Drinkware Distribution', evidence: 'website/domain drinkware product signal' },
      { pattern: /shoe|sneaker|footwear/, chip: 'Footwear Manufacturing', evidence: 'website/domain footwear product signal' },
      { pattern: /skateboard|deck|trucks|bearings|grip tape/, chip: 'Skateboard Manufacturing', evidence: 'website/domain skateboard product signal' }
    ];
    for (let i = 0; i < rules.length; i += 1) {
      if (rules[i].pattern.test(text)) return { selectedIndustryChip: rules[i].chip, industryChipSource: 'website_domain_evidence_w474', industryChipEvidence: rules[i].evidence, industryChipConfidence: 'high' };
    }
    return { selectedIndustryChip: 'General Commerce', industryChipSource: website ? 'website_domain_fallback_w474' : 'safe_industry_fallback_w474', industryChipEvidence: websiteDomainW474(website) || product || 'limited website evidence', industryChipConfidence: 'low' };
  }

  function productSpecificComponentNamesW474(product, industryChip) {
    const combined = `${product || ''} ${industryChip || ''}`.toLowerCase();
    let names;
    let reason;
    if (/guitar|ukulele|instrument|pickup|amplifier/.test(combined)) {
      names = ['Instrument Body', 'Neck Assembly', 'Electronics and Hardware Kit'];
      reason = 'musical instrument finished good component model';
    } else if (/kitchen sink|\bsink\b|faucet/.test(combined)) {
      names = ['Sink Basin', 'Drain and Mounting Kit', 'Retail Packaging'];
      reason = 'kitchen sink finished good component model';
    } else if (/hestan|nanobond|copperbond|probond|cookware|skillet|cookware set/.test(combined)) {
      names = ['Bonded Cookware Body', 'Stainless Handle Set', 'Retail Cookware Packaging'];
      reason = 'premium cookware finished good component model';
    } else if (/knife block|cutlery|zwilling|wusthof|wüsthof|knife|knives|sharpener|kitchenware/.test(combined)) {
      names = /sharpener/.test(combined) ? ['Sharpening Rod Assembly', 'Handle Housing', 'Retail Packaging'] : ['Knife Block', 'Chef Knife', 'Honing Steel'];
      reason = 'cutlery finished good component model';
    } else if (/recliner|sofa|sectional/.test(combined)) {
      names = ['Frame Assembly', 'Cushion Set', 'Upholstery and Hardware Kit'];
      reason = 'residential seating finished good component model';
    } else if (/chair|seating|desk|furniture/.test(combined)) {
      names = ['Furniture Frame', 'Seat and Surface Assembly', 'Hardware Kit'];
      reason = 'furniture finished good component model';
    } else if (/vacuum|\bvac\b|carpet cleaner|steam cleaner|dishwasher|blender|appliance|purifier|dryer|iron|steamer|laundry/.test(combined)) {
      names = ['Motor Assembly', 'Control Housing', 'Retail Packaging'];
      reason = 'premium appliance finished good component model';
    } else if (/forklift|lift truck|pallet truck|reach truck|industrial equipment|automated guided vehicle/.test(combined)) {
      names = ['Chassis Assembly', 'Lift System Assembly', 'Powertrain Kit'];
      reason = 'industrial equipment finished good component model';
    } else if (/power tool|cordless tool|drill|saw|impact driver|driver-drill/.test(combined)) {
      names = ['Tool Body', 'Motor and Battery Interface', 'Retail Packaging'];
      reason = 'power tool finished good component model';
    } else if (/cooler|ice chest|drinkware|bottle|tumbler|outdoor hardgoods/.test(combined)) {
      names = ['Product Body', 'Accessory Kit', 'Retail Packaging'];
      reason = 'durable hardgoods finished good component model';
    } else if (/brompton|folding bike|folding bicycle|\bbicycle\b|\bbike\b/.test(combined)) {
      names = ['Frame Assembly', 'Wheelset', 'Drivetrain Kit'];
      reason = 'bicycle finished good component model';
    } else if (/water bottle|bottle|canteen|drinkware|tumbler/.test(combined)) {
      names = ['Bottle Body', 'Cap Assembly', 'Gasket Seal'];
      reason = 'drinkware finished good component model';
    } else if (/shoe|sneaker|footwear/.test(combined)) {
      names = ['Upper Assembly', 'Outsole', 'Footbed Insole'];
      reason = 'footwear finished good component model';
    } else if (/skateboard|deck|trucks|bearings|grip tape/.test(combined)) {
      names = ['Deck', 'Truck Set', 'Wheel and Bearing Set'];
      reason = 'skateboard finished good component model';
    } else if (/watch|calculator|keyboard|piano|electronics|casio/.test(combined)) {
      names = /watch|g-shock|edifice/.test(combined) ? ['Watch Case Assembly', 'Module Movement', 'Band Set'] : ['Electronics Module', 'Control Housing', 'Retail Packaging'];
      reason = 'consumer electronics finished good component model';
    } else {
      names = [`${product} Core Assembly`, `${product} Accessory Kit`, `${product} Retail Packaging`];
      reason = 'safe product-specific generic component model';
    }
    const rejected = [];
    names = names.map(function(name) { return trimTextW468(compactText(name), 60); }).filter(function(name) {
      const rejectedReason = rejectedWebsiteCandidateReasonW474(name);
      if (rejectedReason) rejected.push(rejectedReason);
      return name && !rejectedReason;
    }).slice(0, 3);
    return {
      componentNames: names,
      componentEvidenceSource: 'nllm_product_industry_component_model_w474',
      componentInferenceReason: reason,
      componentFallbackUsed: /safe product-specific generic/.test(reason),
      componentRejectedCandidates: rejected,
      nllmComponentNamesUsed: true,
      nllmComponentNamePromptVersion: 'w474-product-industry-components-v1'
    };
  }

  function websiteProductExamplesNamingPackW472(request, website, prospect) {
    const examples = websiteProductExamplesFromRequestW472(request, website, prospect);
    if (!examples.length) return null;
    const primary = examples[0].name;
    const toggles = normalizeSelectedToggles(request);
    const manufacturing = toggles.enableManufacturing === true || toggles.enableWip === true;
    const industryChip = selectIndustryChipW474(website, primary, prospect);
    const componentModel = productSpecificComponentNamesW474(primary, industryChip.selectedIndustryChip);
    const componentNames = componentModel.componentNames;
    const assemblyName = manufacturing ? `${primary} Assembly` : `${primary} Availability Flow`;
    return {
      hero_item_name: primary,
      assembly_name: assemblyName,
      component_names: componentNames.slice(0, 3),
      componentEvidenceSource: componentModel.componentEvidenceSource,
      componentInferenceReason: componentModel.componentInferenceReason,
      componentFallbackUsed: componentModel.componentFallbackUsed,
      componentRejectedCandidates: componentModel.componentRejectedCandidates,
      nllmComponentNamesUsed: componentModel.nllmComponentNamesUsed,
      nllmComponentNamePromptVersion: componentModel.nllmComponentNamePromptVersion,
      bom_name: manufacturing ? `BOM - ${primary}` : `${primary} Availability Plan`,
      bom_revision_name: manufacturing ? `Revision 1 - ${primary}` : `${primary} Replenishment Plan`,
      routing_name: manufacturing ? `Routing - ${primary}` : `${primary} Fulfillment Flow`,
      operation_names_by_seq: {
        '10': `Prepare ${componentNames[0]}`,
        '20': manufacturing ? `Build ${assemblyName}` : `Allocate ${primary} Demand`,
        '30': `Release ${primary}`
      },
      selectedProductName: primary,
      primary_product_candidate: primary,
      alternate_product_candidates: examples.slice(1).map(function(candidate) { return candidate.name; }),
      selectedCatalogCandidate: examples[0],
      selectedCatalogCandidateSource: examples[0].source || 'trusted_website_product_examples_w472',
      selectedCatalogCandidateReasons: examples[0].reasons || [],
      catalogCandidates: examples,
      websiteProductExamplesW472: examples.map(function(candidate) { return candidate.name; }),
      websiteEvidenceSource: 'trusted_website_product_examples_w472',
      websiteEvidenceSourceUrls: evidenceSourceUrlsW459(request, website),
      selectedIndustryChip: industryChip.selectedIndustryChip,
      industryChipSource: industryChip.industryChipSource,
      industryChipEvidence: industryChip.industryChipEvidence,
      industryChipConfidence: industryChip.industryChipConfidence,
      namingEvidenceSource: 'trusted_website_product_examples_w472',
      namingAuthorityOrderW472: 'website product examples -> naming files only when website has no product evidence -> prospect fallback'
    };
  }

  function buildServerPrecomputedNamingPack(request) {
    const prospect = compactText(request && request.prospect && request.prospect.name) || 'Demo Customer';
    const website = compactText(request && request.prospect && request.prospect.website);
    const explicitPack = explicitNamingPackFromRequestW468(request);
    const industrySelection = industrySelectionFromRequestW468(request, website);
    const basePack = explicitPack || {};
    const websiteProductExamplesPack = websiteProductExamplesNamingPackW472(request, website, prospect);
    const catalogSelected = Object.keys(basePack).length || websiteProductExamplesPack
      ? { pack: null, selected: { catalogCandidates: [], rejectedCatalogCandidates: [] } }
      : buildCatalogSelectedNamingPackW470(request, website, prospect);
    const selectedPack = websiteProductExamplesPack || catalogSelected.pack || {};
    const effectivePack = websiteProductExamplesPack || (Object.keys(basePack).length ? basePack : selectedPack);
    const rankedCatalogCandidates = (effectivePack.selectedCatalogCandidate
      ? [effectivePack.selectedCatalogCandidate].concat(effectivePack.catalogCandidates || [])
      : (effectivePack.catalogCandidates || catalogSelected.selected.catalogCandidates || []));
    const selectedCatalogCandidate = rankedCatalogCandidates[0] || null;
    const fallbackUsed = !selectedCatalogCandidate;
    const product = compactText(effectivePack.selectedProductName || effectivePack.primary_product_candidate || selectedCatalogCandidate && selectedCatalogCandidate.name || '');
    const fallbackReason = fallbackUsed ? 'No ranked website catalog candidate exists.' : '';
    const source = websiteProductExamplesPack
      ? 'suitelet-website-product-examples-naming-pack-w472'
      : Object.keys(basePack).length
      ? 'suitelet-precomputed-naming-pack'
      : (websiteProductExamplesPack ? 'suitelet-website-product-examples-naming-pack-w472' : (Object.keys(selectedPack).length ? 'suitelet-selected-catalog-naming-pack' : 'suitelet-prospect-fallback-naming-pack'));
    const namingEvidenceSource = websiteProductExamplesPack
      ? 'trusted_website_product_examples_w472'
      : Object.keys(basePack).length
      ? 'precomputed_naming_pack'
      : (websiteProductExamplesPack ? 'trusted_website_product_examples_w472' : (Object.keys(selectedPack).length ? 'selected_catalog_candidate' : 'prospect_fallback'));
    const confidence = websiteProductExamplesPack
      ? 96
      : Object.keys(basePack).length
      ? 90
      : (websiteProductExamplesPack ? 96 : (Object.keys(selectedPack).length ? Number(selectedCatalogCandidate && selectedCatalogCandidate.confidence || 84) : 35));
    const fallbackComponentNames = [
      `${prospect} Component A`,
      `${prospect} Component B`,
      `${prospect} Component C`
    ];
    const componentNames = Array.isArray(effectivePack.component_names) && effectivePack.component_names.length === 3
      ? effectivePack.component_names
      : fallbackComponentNames;
    const heroName = compactText(effectivePack.hero_item_name) || `${prospect} Finished Good`;
    const assemblyName = compactText(effectivePack.assembly_name) || `${prospect} Assembly`;
	    const result = {
      _source: source,
      namingEvidenceSource,
      namingConfidence: confidence,
      confidencePercent: confidence,
	      industrySelection: effectivePack.selectedIndustryChip ? {
	        label: effectivePack.selectedIndustryChip,
	        source: effectivePack.industryChipSource || 'website_domain_evidence_w474',
	        confidence: effectivePack.industryChipConfidence || 'high'
	      } : industrySelection,
	      industry_category: effectivePack.selectedIndustryChip || industrySelection.label || '',
	      selectedIndustryChip: effectivePack.selectedIndustryChip || industrySelection.label || '',
	      industryChipSource: effectivePack.industryChipSource || industrySelection.source || '',
	      industryChipEvidence: effectivePack.industryChipEvidence || '',
	      industryChipConfidence: effectivePack.industryChipConfidence || industrySelection.confidence || '',
	      websiteEvidenceSource: effectivePack.websiteEvidenceSource || (website ? 'website_industry_best_guess' : 'none'),
      websiteEvidenceSourceUrls: evidenceSourceUrlsW459(request, website),
      hero_item_name: trimTextW468(heroName, 60),
      assembly_name: trimTextW468(assemblyName, 60),
	      component_names: componentNames.map(function(name) { return trimTextW468(compactText(name), 60); }),
	      componentEvidenceSource: effectivePack.componentEvidenceSource || '',
	      componentInferenceReason: effectivePack.componentInferenceReason || '',
	      componentFallbackUsed: effectivePack.componentFallbackUsed === true,
	      componentRejectedCandidates: effectivePack.componentRejectedCandidates || [],
	      nllmComponentNamesUsed: effectivePack.nllmComponentNamesUsed === true,
	      nllmComponentNamePromptVersion: effectivePack.nllmComponentNamePromptVersion || '',
      bom_name: trimTextW468(compactText(effectivePack.bom_name) || `BOM - ${heroName}`, 80),
      bom_revision_name: trimTextW468(compactText(effectivePack.bom_revision_name) || `Revision 1 - ${heroName}`, 80),
      routing_name: trimTextW468(compactText(effectivePack.routing_name) || `Routing - ${assemblyName}`, 80),
      operation_names_by_seq: effectivePack.operation_names_by_seq || {
        '10': `Prepare ${componentNames[0]}`,
        '20': `Build ${assemblyName}`,
        '30': `QC and Release ${heroName}`
      },
      sales_descriptions: effectivePack.sales_descriptions || {
        hero: `${heroName} finished good ready for sale.`,
        assembly: `${assemblyName} buildable finished good for customer orders.`,
        components: componentNames
      },
      purchase_descriptions: effectivePack.purchase_descriptions || {
        hero: `Purchased inputs supporting ${heroName} production.`,
        assembly: `Assembly supply inputs used to build ${assemblyName}.`,
        components: componentNames
      },
      selectedProductName: selectedCatalogCandidate ? product : null,
      primary_product_candidate: selectedCatalogCandidate ? product : null,
      selectedCatalogCandidate,
      selectedCatalogCandidateSource: effectivePack.selectedCatalogCandidateSource || '',
      selectedCatalogCandidateReasons: effectivePack.selectedCatalogCandidateReasons || [],
      catalogCandidates: effectivePack.catalogCandidates || catalogSelected.selected.catalogCandidates || [],
      rejectedCatalogCandidates: effectivePack.rejectedCatalogCandidates || catalogSelected.selected.rejectedCatalogCandidates || [],
      fallbackUsed,
      fallbackReason,
      missingEvidence: fallbackReason ? ['website catalog product candidate', 'real public product/product-line evidence'] : [],
      namingAuthorityOrderW468: 'server precomputed naming pack -> prospect fallback',
      namingAuthorityOrderW470: 'server selected catalog naming pack -> runner preserve only -> prospect fallback',
      namingAuthorityOrderW472: 'website product examples -> naming files only when website has no product evidence -> prospect fallback',
      websiteNamingSupersedesAllPacksW472: !!websiteProductExamplesPack,
      supersededExplicitNamingPackW472: !!(websiteProductExamplesPack && Object.keys(basePack).length),
      namingAuthorityLockedW470: !!Object.keys(effectivePack).length,
      noisyExplicitNamingPackRejected: false
    };
    if (!websiteProductExamplesPack && Object.keys(basePack).length && !effectivePack.selectedCatalogCandidate) {
      delete result.selectedProductName;
      delete result.primary_product_candidate;
      delete result.selectedCatalogCandidate;
      delete result.selectedCatalogCandidateSource;
      delete result.selectedCatalogCandidateReasons;
      delete result.catalogCandidates;
      delete result.rejectedCatalogCandidates;
    }
    return result;
  }

  function rejectNoisyExplicitNamingPackW468(pack, prospect) {
    return pack;
  }

  function noisyRecordNameW468(value, prospect) {
    const text = compactText(value);
    if (!text) return false;
    const lower = text.toLowerCase();
    const prospectLower = compactText(prospect).toLowerCase();
    const blocked = [
      'catalog product',
      'products cpg',
      'website evidence',
      'product / sku',
      'style / sku matrix',
      'needs confirmation',
      'dealer durable hardgoods',
      'apparel & accessories',
      'apparel and footwear style',
      'core style color-size matrix',
      'websiteresolverservicev1'
    ];
    for (let i = 0; i < blocked.length; i += 1) {
      if (lower.indexOf(blocked[i]) !== -1) return true;
    }
    if (/^(?:SCAI\s*-\s*)?Assembly(?:\s*-\s*[A-Z0-9]{3,})?$/i.test(text)) return true;
    if (lower === 'assembly' || lower === 'finished good') return true;
    return !prospectLower && /^(component a|component b|component c)$/i.test(text);
  }

  function explicitNamingPackFromRequestW468(request) {
    const sources = [
      request && request.precomputedNamingPack,
      request && request.namingPack,
      request && request.namingAuthority && request.namingAuthority.precomputedNamingPack,
      request && request.namingAuthority && request.namingAuthority.namingPack,
      request && request.demoPath && request.demoPath.namingPack
    ].filter(Boolean);
    for (let i = 0; i < sources.length; i += 1) {
      const pack = normalizeExplicitNamingPackW468(sources[i]);
      if (pack) return pack;
    }
    return null;
  }

  function normalizeExplicitNamingPackW468(source) {
    const src = source || {};
    const pack = {
      hero_item_name: compactText(src.hero_item_name || src.heroItemName || src.hero || src.itemName),
      assembly_name: compactText(src.assembly_name || src.assemblyName || src.assembly),
      bom_name: compactText(src.bom_name || src.bomName || src.bom),
      bom_revision_name: compactText(src.bom_revision_name || src.bomRevisionName || src.bomRevision),
      routing_name: compactText(src.routing_name || src.routingName || src.routing),
      component_names: Array.isArray(src.component_names) ? src.component_names : (Array.isArray(src.componentNames) ? src.componentNames : [])
    };
    const records = src.recordNames || src.records;
    if ((!pack.hero_item_name || !pack.assembly_name || pack.component_names.length !== 3) && records) {
      const extracted = explicitRecordNamesFromRecordsW468(records);
      pack.hero_item_name = pack.hero_item_name || extracted.hero_item_name;
      pack.assembly_name = pack.assembly_name || extracted.assembly_name;
      pack.bom_name = pack.bom_name || extracted.bom_name;
      pack.bom_revision_name = pack.bom_revision_name || extracted.bom_revision_name;
      pack.routing_name = pack.routing_name || extracted.routing_name;
      if (pack.component_names.length !== 3) pack.component_names = extracted.component_names;
    }
    pack.component_names = pack.component_names.map(compactText).filter(Boolean).slice(0, 3);
    if (!pack.hero_item_name && !pack.assembly_name && pack.component_names.length !== 3) return null;
    return pack;
  }

  function explicitRecordNamesFromRecordsW468(records) {
    const list = Array.isArray(records)
      ? records
      : Object.keys(records || {}).map(function(key) {
        const value = records[key];
        if (value && typeof value === 'object') return Object.assign({ role: key }, value);
        return { role: key, name: value };
      });
    const out = { component_names: [] };
    list.forEach(function(record) {
      const role = compactText(record && (record.role || record.type || record.label || record.key)).toLowerCase();
      const name = compactText(record && (record.proposedName || record.name || record.currentProposedName || record.displayName || record.value));
      if (!name) return;
      if (!out.hero_item_name && /hero|proof|item|inventory/.test(role) && !/component/.test(role)) out.hero_item_name = name;
      else if (!out.assembly_name && /assembly/.test(role)) out.assembly_name = name;
      else if (!out.bom_revision_name && /bom.*revision|revision/.test(role)) out.bom_revision_name = name;
      else if (!out.bom_name && /\bbom\b|bill of materials/.test(role)) out.bom_name = name;
      else if (!out.routing_name && /routing/.test(role)) out.routing_name = name;
      else if (/component/.test(role) && out.component_names.length < 3) out.component_names.push(name);
    });
    return out;
  }

  function industrySelectionFromRequestW468(request, website) {
    const text = compactText([
      website,
      request && request.demoPath && request.demoPath.laneId,
      request && request.demoPath && request.demoPath.laneName,
      request && request.demoPath && request.demoPath.productFamily,
      request && request.resolvedOperatingMode,
      request && request.storyInputs && request.storyInputs.buyerNeed,
      request && request.storyInputs && request.storyInputs.scObjective,
      request && request.namingAuthority && request.namingAuthority.evidence
    ].join(' ')).toLowerCase();
    const rules = [
      { pattern: /\b(cookware|kitchenware|dutch oven|enameled|cast iron|skillet|bakeware|cookware set)\b/, label: 'Kitchenware Dealer Hardgoods' },
      { pattern: /\b(electronics|headphones|earbuds|speaker|soundbar|audio|watch|cycling computer|wearable|gps|running)\b/, label: 'Consumer Electronics Dealer Fulfillment' },
      { pattern: /\b(outdoor|camp|bike|cycling|run|trail|sporting goods|dealer hardgoods)\b/, label: 'Outdoor Dealer Hardgoods' },
      { pattern: /\b(food|beverage|snack|sauce|kombucha|soda|case pack|can)\b/, label: 'Food and Beverage' },
      { pattern: /\b(apparel|footwear|style|color|size|fashion)\b/, label: 'Apparel and Footwear' },
      { pattern: /\b(industrial|equipment|forklift|warehouse|distribution|branch|fulfillment|supply)\b/, label: 'Industrial Distribution' },
      { pattern: /\b(manufacturing|assembly|production|work order|bom|wip)\b/, label: 'Light Manufacturing' }
    ];
    for (let i = 0; i < rules.length; i += 1) {
      if (rules[i].pattern.test(text)) return { label: rules[i].label, source: 'website_llm_best_guess', confidence: 'best_guess' };
    }
    return { label: 'General Commerce', source: website ? 'website_llm_best_guess' : 'prospect_best_guess', confidence: 'low' };
  }

  function trimTextW468(value, maxLen) {
    const text = compactText(value);
    const limit = Number(maxLen || 0);
    return limit > 0 && text.length > limit ? text.slice(0, limit).trim() : text;
  }

  function createNamingPackFile(request, config, idempotencyToken) {
    const folderId = config.resultCaptureFolderId || config.folderId;
    if (!folderId) return { fileId: null, status: 'naming_folder_missing' };
    const namingPack = buildServerPrecomputedNamingPack(request);
    if (!namingPack || namingPack._source === 'suitelet-prospect-fallback-naming-pack') {
      return {
        fileId: null,
        status: 'clean_naming_pack_omitted_runner_deterministic_fallback',
        namingPack: null,
        fallbackUsed: true,
        reason: 'No clean explicit or catalog naming pack was available; runner will use old-runner deterministic naming.'
      };
    }
    const fileName = boundedFileNameW461(`scai_naming_${safeFileToken(idempotencyToken)}.json`, NAMING_FILE_NAME_LIMIT_W468);
    const namingFile = file.create({
      name: fileName,
      fileType: file.Type.JSON,
      folder: Number(folderId),
      contents: JSON.stringify(namingPack, null, 2)
    });
    const fileId = namingFile.save();
    return {
      fileId: String(fileId || ''),
      fileName: namingFile.name,
      status: fileId ? 'created' : 'not_created',
      namingPack
    };
  }

  function toTf(value) {
    return value === true ? 'T' : 'F';
  }

  function booleanFromRequest(value) {
    if (value === true || value === 'T' || value === 'true' || value === 'Y' || value === '1' || value === 1) return true;
    if (value === false || value === 'F' || value === 'false' || value === 'N' || value === '0' || value === 0) return false;
    return null;
  }

  function normalizeSelectedToggles(request) {
    const selected = request && request.selectedToggles || {};
    const runnerControls = request && request.runnerControls && request.runnerControls.selectedToggles || {};
    const legacy = request && request.toggles || {};
    const explicitIntent = explicitManufacturingToggleIntentW483(request);
    const enableWip = booleanFromRequest(selected.enableWip) === true ||
      booleanFromRequest(selected.enableWIP) === true ||
      booleanFromRequest(runnerControls.enableWip) === true ||
      booleanFromRequest(legacy.enableWip) === true ||
      explicitIntent.enableWip === true;
    const enableManufacturing = booleanFromRequest(selected.enableManufacturing) === true ||
      booleanFromRequest(runnerControls.enableManufacturing) === true ||
      booleanFromRequest(legacy.enableManufacturing) === true ||
      explicitIntent.enableManufacturing === true ||
      enableWip === true;
    return {
      schema: 'idb.w144-normalized-runner-toggles.v1',
      createNewHeroItem: booleanFromRequest(selected.createNewHeroItem) === true ||
        booleanFromRequest(selected.createNewItem) === true ||
        booleanFromRequest(runnerControls.createNewHeroItem) === true ||
        booleanFromRequest(legacy.createNewHeroItem) === true,
      enableManufacturing,
      enableWip,
      explicitIntentFallbackW483: explicitIntent.source ? explicitIntent : null
    };
  }

  function explicitManufacturingToggleIntentW483(request) {
    const text = compactText([
      request && request.resolvedOperatingMode,
      request && request.modeConfidence,
      request && request.storyInputs && request.storyInputs.conversationNotes,
      request && request.storyInputs && request.storyInputs.buyerNeed,
      request && request.storyInputs && request.storyInputs.scObjective,
      request && request.prospect && request.prospect.name,
      request && request.demoPath && request.demoPath.scenario,
      request && request.demoPath && request.demoPath.familyKey
    ].join(' ')).toLowerCase();
    if (!text) return {};
    const wip = /\b(wip|work\s*order|routing|route|operation|work\s*center|production\s*steps?)\b/.test(text);
    const mfg = wip || /\b(manufactur|assembly|assemblies|bom|bill\s+of\s+materials|component|components|finished\s+good)\b/.test(text);
    return {
      source: (wip || mfg) ? 'explicit_request_text_w483' : '',
      enableManufacturing: mfg,
      enableWip: wip,
      evidence: text.slice(0, 240)
    };
  }

  function buildRunnerRequestContext(request, toggles, idempotencyToken) {
    return {
      schema: request.schema,
      requestId: request.requestId || '',
      buildAttemptId: request.buildAttemptId || request.buildAttemptProvenance && request.buildAttemptProvenance.buildAttemptId || '',
      submittedAt: request.submittedAt || request.buildAttemptProvenance && request.buildAttemptProvenance.submittedAt || '',
      prospect: request.prospect || {},
      demoPath: request.demoPath || {},
      storyInputs: request.storyInputs || {},
      websiteEvidence: request.websiteEvidence || null,
      productEvidence: request.productEvidence || null,
      groundedProductEvidence: request.groundedProductEvidence || null,
      websiteEvidenceV1: request.websiteEvidenceV1 || null,
      websiteResolverOutput: request.websiteResolverOutput || null,
      websiteEvidenceUx: request.websiteEvidenceUx || null,
      resolvedOperatingMode: request.resolvedOperatingMode || '',
      modeConfidence: request.modeConfidence || '',
      selectedToggles: toggles,
      namingAuthority: request.namingAuthority || {},
      requiredRecordRoles: request.requiredRecordRoles || [],
      optionalRecordRoles: request.optionalRecordRoles || [],
      invalidRecordRoles: request.invalidRecordRoles || [],
      resultValidationExpectations: request.resultValidationExpectations || {},
      roiCompetitiveReview: request.roiCompetitiveReview || null,
      roiCompetitiveSourceBasis: request.roiCompetitiveSourceBasis || null,
      roiAudit: request.roiAudit || null,
      competitive: request.competitive || null,
      competitiveAdvisory: request.competitiveAdvisory || null,
      roiCompetitiveDetailModelW444: request.roiCompetitiveDetailModelW444 || null,
      competitiveAdvisoryModelW362: request.competitiveAdvisoryModelW362 || null,
      valueReviewPacket: request.valueReviewPacket || request.roiCompetitiveReview || null,
      selectedProduct: request.selectedProduct || request.selectedProductName || '',
      selectedProductName: request.selectedProductName || request.selectedProduct || '',
      competitor: request.competitor || request.incumbent || '',
      incumbent: request.incumbent || request.competitor || '',
      decisionCriteria: request.decisionCriteria || '',
      timeline: request.timeline || request.timelineUrgency || '',
      requiredRecords: request.requiredRecords || [],
      canonicalRuntimeContract: {
        schema: 'forge.runtime-contract.v1',
        compatibility: 'legacy-five-record-fields-plus-canonical-role-metadata',
        recordsArrayAccepted: true,
        legacyFiveRecordFieldsPreserved: true
      },
      buildAttemptProvenance: request.buildAttemptProvenance || {
        schema: 'forge.w320.build-attempt-provenance.v1',
        requestId: request.requestId || '',
        sourceRequestId: request.requestId || '',
        buildAttemptId: request.buildAttemptId || '',
        submittedAt: request.submittedAt || ''
      },
      idempotencyToken
    };
  }

  function buildQueueGate(requestValidation, configValidation, operatorValidation, config) {
    const flagGates = {
      createEnabled: config.createEnabled === true,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled === true,
      queueSubmitEnabled: config.queueSubmitEnabled === true
    };
    const allPass = requestValidation.valid && configValidation.valid && operatorValidation.valid && flagGates.createEnabled && flagGates.governedSandboxWriteEnabled && flagGates.queueSubmitEnabled;
    return {
      schema: 'idb.w144-queue-submit-gate.v1',
      queueReadinessStatus: allPass ? 'ready_to_submit_governed_runner' : 'blocked_no_submit',
      canSubmit: allPass,
      gates: {
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        operatorGateValid: operatorValidation.valid,
        sandboxAllowlistPassed: configValidation.valid,
        createEnabled: flagGates.createEnabled,
        governedSandboxWriteEnabled: flagGates.governedSandboxWriteEnabled,
        queueSubmitEnabled: flagGates.queueSubmitEnabled
      }
    };
  }

  function submitRunnerIfAllowed(queueGate, config, runnerParams) {
    if (!queueGate.canSubmit) {
      return {
        queueSubmitted: false,
        runnerTaskId: null,
        submitAttempted: false,
        reason: 'queue gate blocked before submit'
      };
    }
    const scheduledTask = task.create({
      taskType: task.TaskType.SCHEDULED_SCRIPT,
      scriptId: config.runnerScriptId,
      deploymentId: config.runnerDeployId,
      params: runnerParams
    });
    try {
      const taskId = scheduledTask.submit();
      return {
        queueSubmitted: true,
        runnerTaskId: String(taskId || ''),
        submitAttempted: true,
        reason: 'governed runner scheduled task submitted by NetSuite-side adapter'
      };
    } catch (error) {
      const errorName = error && (error.name || error.id) ? String(error.name || error.id) : 'RUNNER_SUBMIT_FAILED';
      const errorMessage = error && error.message ? String(error.message) : String(error || 'Scheduled runner submit failed.');
      const inProgress = errorName === 'INPROGRESS' || /INPROGRESS|already running|in progress/i.test(errorMessage);
      if (inProgress) {
        return {
          queueSubmitted: false,
          runnerTaskId: null,
          submitAttempted: true,
          retryable: true,
          retryAfterMs: 45000,
          status: 'runner_busy_inprogress',
          reason: 'scheduled runner deployment is already running; retry this same request after the current runner completes',
          errorName,
          errorMessage,
          errorStack: error && error.stack ? String(error.stack).slice(0, 1200) : ''
        };
      }
      return {
        queueSubmitted: false,
        runnerTaskId: null,
        submitAttempted: true,
        error: true,
        errorName,
        errorMessage,
        errorStack: error && error.stack ? String(error.stack).slice(0, 1200) : '',
        reason: 'scheduled runner task submit failed inside W144 adapter'
      };
    }
  }

  function resultCapturePending(idempotencyToken, queueSubmit, request) {
    const busy = queueSubmit && queueSubmit.status === 'runner_busy_inprogress';
    return {
      schema: 'idb.runner-result-capture.v1',
      status: busy ? 'runner_busy_inprogress' : (queueSubmit.queueSubmitted ? 'pending_runner_completion' : 'not_started_no_submit'),
      idempotencyToken,
      runnerTaskId: queueSubmit.runnerTaskId,
      retryable: busy === true,
      retryAfterMs: busy ? queueSubmit.retryAfterMs : null,
      busyReason: busy ? queueSubmit.reason : '',
      sourceRequestId: request && request.requestId ? String(request.requestId) : '',
      buildAttemptId: request && (request.buildAttemptId || request.buildAttemptProvenance && request.buildAttemptProvenance.buildAttemptId) ? String(request.buildAttemptId || request.buildAttemptProvenance.buildAttemptId) : '',
      submittedAt: request && (request.submittedAt || request.buildAttemptProvenance && request.buildAttemptProvenance.submittedAt) ? String(request.submittedAt || request.buildAttemptProvenance.submittedAt) : '',
      finalGeneratedNamesReady: false,
      activeOpenLinks: 0,
      importPolicy: 'drawer_must_wait_for_result_capture_with_real_ids_and_urls',
      records: {
        customer: null,
        salesOrder: null,
        heroItem: null,
        matrixItem: null,
        componentItems: []
      }
    };
  }

  function supportedNetSuiteUrl(url) {
    const value = String(url || '');
    return /^\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(value) ||
      /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(value);
  }

  function numericId(value) {
    return /^\d+$/.test(String(value || ''));
  }

  function safeFileToken(value) {
    return String(value || '').replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 80) || 'missing_token';
  }

  function shortHashW461(value) {
    const text = String(value || '');
    let hash = 5381;
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    }
    return (`00000000${(hash >>> 0).toString(16)}`).slice(-8);
  }

  function boundedFileNameW461(name, maxLen) {
    const limit = Math.max(20, Math.min(Number(maxLen || 180), 180));
    const cleaned = String(name || 'idb_file.txt')
      .replace(/[\\/:*?"<>|#%&{}$!'@+=`~]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (cleaned.length <= limit) return cleaned || 'idb_file.txt';
    const dot = cleaned.lastIndexOf('.');
    const ext = dot > 0 && cleaned.length - dot <= 12 ? cleaned.slice(dot) : '';
    const base = ext ? cleaned.slice(0, dot) : cleaned;
    const suffix = `_${shortHashW461(cleaned)}`;
    const baseLimit = Math.max(8, limit - ext.length - suffix.length);
    return `${base.slice(0, baseLimit)}${suffix}${ext}`;
  }

  function pushUniqueSearchToken(tokens, seen, source, token) {
    const normalized = String(token || '').trim();
    if (!normalized || seen[normalized]) return;
    seen[normalized] = true;
    tokens.push({ source, token: normalized });
  }

  function runnerResultCaptureStemW472(value) {
    const safe = String(value || '').replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 40).trim();
    return safe.length <= 36 ? safe : safe.slice(0, 36).trim();
  }

  function pushRunnerResultCaptureStemTokensW472(tokens, seen, source, value) {
    const raw = String(value || '').trim();
    if (!raw) return;
    pushUniqueSearchToken(tokens, seen, `${source}RunnerResultStemW472`, runnerResultCaptureStemW472(raw));
    if (!/^IDB-/i.test(raw)) {
      pushUniqueSearchToken(tokens, seen, `${source}RunnerResultStemW472Prefixed`, runnerResultCaptureStemW472(`IDB-${raw}`));
    }
    if (/^IDB-/.test(raw)) {
      pushUniqueSearchToken(tokens, seen, `${source}RunnerResultStemW472Unprefixed`, runnerResultCaptureStemW472(raw.replace(/^IDB-/, '')));
    }
  }

  function pushRequestWordSearchTokensW473(tokens, seen, source, value) {
    const words = String(value || '')
      .replace(/^IDB-/i, '')
      .split(/[^A-Za-z0-9]+/)
      .map(function(word) { return word.trim().toLowerCase(); })
      .filter(function(word) {
        return word.length >= 4 &&
          !/^(idb|build|record|return|smoke|dealer|hardgoods|apparel|accessories|products|product|wip|mfg|manufacturing|202\d+)$/.test(word);
      });
    const pairs = [];
    for (let i = 0; i < words.length - 1; i += 1) {
      pairs.push(`${words[i]}-${words[i + 1]}`);
    }
    words.concat(pairs).slice(0, 8).forEach(function(token, index) {
      pushUniqueSearchToken(tokens, seen, `${source}RequestWordW473_${index}`, token);
    });
  }

  function resultCaptureFileSearchTokensW320(expected) {
    const searchTokens = [];
    const seen = {};
    const runnerTaskId = expected && expected.runnerTaskId;
    const buildAttemptId = expected && expected.buildAttemptId;
    const idempotencyToken = expected && expected.idempotencyToken;
    if (runnerTaskId) pushUniqueSearchToken(searchTokens, seen, 'runnerTaskId', runnerTaskId);
    if (buildAttemptId) {
      pushUniqueSearchToken(searchTokens, seen, 'buildAttemptId', buildAttemptId);
      const safeAttempt = safeFileToken(buildAttemptId);
      pushUniqueSearchToken(searchTokens, seen, 'safeBuildAttemptId', safeAttempt);
      pushUniqueSearchToken(searchTokens, seen, 'safeBuildAttemptIdFileTokenW320', safeAttempt.slice(0, 56));
      pushUniqueSearchToken(searchTokens, seen, 'safeBuildAttemptIdFileTokenW455Short', safeAttempt.slice(0, 36));
      pushRunnerResultCaptureStemTokensW472(searchTokens, seen, 'safeBuildAttemptId', buildAttemptId);
    }
    if (idempotencyToken) {
      pushUniqueSearchToken(searchTokens, seen, 'idempotencyToken', idempotencyToken);
      const safeToken = safeFileToken(idempotencyToken);
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyToken', safeToken);
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW320', safeToken.slice(0, 48));
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW455Short', safeToken.slice(0, 36));
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW455ResultStem', `IDB-${safeToken}`.slice(0, 40));
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW472ResultStem36', `IDB-${safeToken}`.slice(0, 36));
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW473ResultStem32', `IDB-${safeToken}`.slice(0, 32));
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW473ResultStem48', `IDB-${safeToken}`.slice(0, 48));
      pushRunnerResultCaptureStemTokensW472(searchTokens, seen, 'safeIdempotency', idempotencyToken);
      pushRequestWordSearchTokensW473(searchTokens, seen, 'idempotencyToken', idempotencyToken);
    }
    if (expected && expected.sourceRequestId) {
      const safeSourceRequest = safeFileToken(expected.sourceRequestId);
      pushUniqueSearchToken(searchTokens, seen, 'sourceRequestId', expected.sourceRequestId);
      pushUniqueSearchToken(searchTokens, seen, 'safeSourceRequestIdFileTokenW455', safeSourceRequest.slice(0, 48));
      pushUniqueSearchToken(searchTokens, seen, 'safeSourceRequestIdFileTokenW455ResultStem', `IDB-${safeSourceRequest}`.slice(0, 40));
      pushUniqueSearchToken(searchTokens, seen, 'safeSourceRequestIdFileTokenW472ResultStem36', `IDB-${safeSourceRequest}`.slice(0, 36));
      pushUniqueSearchToken(searchTokens, seen, 'safeSourceRequestIdFileTokenW473ResultStem32', `IDB-${safeSourceRequest}`.slice(0, 32));
      pushUniqueSearchToken(searchTokens, seen, 'safeSourceRequestIdFileTokenW473ResultStem48', `IDB-${safeSourceRequest}`.slice(0, 48));
      pushRunnerResultCaptureStemTokensW472(searchTokens, seen, 'safeSourceRequestId', expected.sourceRequestId);
      pushRequestWordSearchTokensW473(searchTokens, seen, 'sourceRequestId', expected.sourceRequestId);
    }
    if (expected && expected.runnerExternalId) {
      const safeRunnerExtId = safeFileToken(expected.runnerExternalId);
      pushUniqueSearchToken(searchTokens, seen, 'runnerExternalId', expected.runnerExternalId);
      pushUniqueSearchToken(searchTokens, seen, 'safeRunnerExternalIdFileTokenW455', safeRunnerExtId.slice(0, 48));
      pushUniqueSearchToken(searchTokens, seen, 'safeRunnerExternalIdFileTokenW455Short', safeRunnerExtId.slice(0, 40));
      pushRunnerResultCaptureStemTokensW472(searchTokens, seen, 'safeRunnerExternalId', expected.runnerExternalId);
    }
    return searchTokens;
  }

  function resultCaptureLookupProvenance(lookup) {
    const confirmed = lookup && lookup.confirmedRequest || {};
    const provenance = confirmed.buildAttemptProvenance || {};
    return {
      runnerTaskId: String(lookup && lookup.runnerTaskId || '').trim(),
      idempotencyToken: String(lookup && lookup.idempotencyToken || confirmed.idempotencyToken || '').trim(),
      runnerExternalId: String(confirmed.idempotencyToken || confirmed.runnerExternalId || '').trim(),
      buildAttemptId: String(lookup && lookup.buildAttemptId || confirmed.buildAttemptId || provenance.buildAttemptId || '').trim(),
      sourceRequestId: String(lookup && lookup.sourceRequestId || confirmed.requestId || provenance.sourceRequestId || '').trim(),
      submittedAt: String(lookup && lookup.submittedAt || confirmed.submittedAt || provenance.submittedAt || '').trim()
    };
  }

  function captureProvenanceFromJson(parsed) {
    const capture = parsed || {};
    const sidecar = capture.sidecarGeneratedNamesJson || capture.partialGeneratedNamesJson || capture.finalGeneratedNamesJson || {};
    const sourceRequest = capture.sourceRequest || sidecar.sourceRequest || {};
    const provenance = capture.buildAttemptProvenance || sidecar.buildAttemptProvenance || sourceRequest.buildAttemptProvenance || {};
    return {
      runnerTaskId: String(capture.runnerTaskId || sidecar.runnerTaskId || sourceRequest.runnerTaskId || '').trim(),
      idempotencyToken: String(capture.idempotencyToken || sidecar.idempotencyToken || sourceRequest.idempotencyToken || '').trim(),
      buildAttemptId: String(capture.buildAttemptId || sidecar.buildAttemptId || sourceRequest.buildAttemptId || provenance.buildAttemptId || '').trim(),
      sourceRequestId: String(capture.sourceRequestId || sidecar.sourceRequestId || sourceRequest.requestId || sourceRequest.sourceRequestId || provenance.sourceRequestId || '').trim(),
      submittedAt: String(capture.submittedAt || sidecar.submittedAt || sourceRequest.submittedAt || provenance.submittedAt || '').trim()
    };
  }

  function resultCaptureMatchesCurrentAttempt(parsed, lookup) {
    const expected = resultCaptureLookupProvenance(lookup);
    const actual = captureProvenanceFromJson(parsed);
    const reasons = [];
    if (expected.runnerTaskId && actual.runnerTaskId && actual.runnerTaskId !== expected.runnerTaskId && !currentRunRunnerTaskSwitchAllowedW472(expected, actual)) {
      reasons.push('runnerTaskId_mismatch');
    }
    if (expected.buildAttemptId && actual.buildAttemptId !== expected.buildAttemptId && !currentRunExtIdAliasAllowedW473(expected, actual)) {
      reasons.push(actual.buildAttemptId ? 'buildAttemptId_mismatch' : 'buildAttemptId_missing');
    }
    if (expected.sourceRequestId && actual.sourceRequestId && !sameIdbRequestTokenW472(actual.sourceRequestId, expected.sourceRequestId)) {
      reasons.push('sourceRequestId_mismatch');
    }
    if (expected.idempotencyToken && actual.idempotencyToken && !sameIdbRequestTokenW472(actual.idempotencyToken, expected.idempotencyToken)) {
      reasons.push('idempotencyToken_mismatch');
    }
    return {
      matches: reasons.length === 0,
      reasons,
      expected,
      actual
    };
  }

  function sameIdbRequestTokenW472(left, right) {
    const normalize = function(value) {
      return String(value || '').trim().replace(/^IDB-/, '');
    };
    const a = normalize(left);
    const b = normalize(right);
    return !!a && !!b && (a === b || a.indexOf(b) !== -1 || b.indexOf(a) !== -1);
  }

  function currentRunExtIdAliasAllowedW473(expected, actual) {
    const expectedToken = String(expected && (expected.idempotencyToken || expected.sourceRequestId) || '').trim();
    if (!expectedToken) return false;
    return [
      actual && actual.buildAttemptId,
      actual && actual.sourceRequestId,
      actual && actual.idempotencyToken
    ].some(function(value) {
      return sameIdbRequestTokenW472(value, expectedToken);
    });
  }

  function currentRunRunnerTaskSwitchAllowedW472(expected, actual) {
    const expectedTask = String(expected && expected.runnerTaskId || '').trim();
    const actualTask = String(actual && actual.runnerTaskId || '').trim();
    if (!expectedTask || !actualTask || expectedTask === actualTask) return false;
    const expectedScheduled = /^SCHEDSCRIPT_/i.test(expectedTask);
    const actualCsvImport = /^CSVIMPORT_/i.test(actualTask);
    if (!expectedScheduled || !actualCsvImport) return false;
    const buildMatches = !!(expected.buildAttemptId && actual.buildAttemptId && actual.buildAttemptId === expected.buildAttemptId);
    const sourceMatches = !expected.sourceRequestId || !actual.sourceRequestId || sameIdbRequestTokenW472(actual.sourceRequestId, expected.sourceRequestId);
    const idempotencyMatches = !expected.idempotencyToken || !actual.idempotencyToken || sameIdbRequestTokenW472(actual.idempotencyToken, expected.idempotencyToken);
    return buildMatches && sourceMatches && idempotencyMatches;
  }

  function timestampFromResultCaptureFileName(fileName) {
    const match = String(fileName || '').match(/_(\d{12,})\.json$/);
    return match ? Number(match[1]) : 0;
  }

  function submittedAtTime(value) {
    const parsed = Date.parse(String(value || ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function legacyCurrentSafeTokenCaptureAllowed(matchResult, searchToken, fileName) {
    const expected = matchResult && matchResult.expected || {};
    const actual = matchResult && matchResult.actual || {};
    const reasons = matchResult && matchResult.reasons || [];
    const tokenSource = searchToken && searchToken.source || '';
    const fileTime = timestampFromResultCaptureFileName(fileName);
    const submittedTime = submittedAtTime(expected.submittedAt);
    const provenanceMissingWithExtIdAliasOnly = reasons.length > 0 && reasons.every((reason) => {
      return reason === 'buildAttemptId_missing' || reason === 'idempotencyToken_mismatch';
    });
    const noActualCurrentFields = !actual.runnerTaskId && !actual.buildAttemptId && !actual.sourceRequestId && !actual.submittedAt;
    const idempotencyMatchesExtIdAlias = expected.idempotencyToken && actual.idempotencyToken &&
      (actual.idempotencyToken === expected.idempotencyToken || actual.idempotencyToken.indexOf(expected.idempotencyToken) !== -1);
    return tokenSource === 'safeIdempotencyFileTokenW320' &&
      provenanceMissingWithExtIdAliasOnly &&
      noActualCurrentFields &&
      idempotencyMatchesExtIdAlias &&
      fileTime > 0 &&
      (!submittedTime || fileTime >= submittedTime);
  }

  function terminalKeyedSafeTokenCaptureAllowedW455(parsed, matchResult, searchToken, fileName) {
    const tokenSource = searchToken && searchToken.source || '';
    if (tokenSource.indexOf('safeIdempotency') === -1 && tokenSource.indexOf('safeBuildAttempt') === -1 && tokenSource.indexOf('safeRunnerExternalId') === -1) return false;
    const token = String(searchToken && searchToken.token || '').trim();
    if (!token || String(fileName || '').indexOf(token) === -1) return false;
    if (!/^(?:idb_result_(?:capture_|completed_|completed_with_wip_diagnostic_)|idb_runner_sidecar_(?:completed_|completed_with_wip_diagnostic_))/i.test(String(fileName || ''))) return false;
    const keyed = completedKeyedResultCaptureW455(parsed);
    if (!keyed.ready) return false;
    const reasons = matchResult && matchResult.reasons || [];
    const expected = matchResult && matchResult.expected || {};
    const actual = matchResult && matchResult.actual || {};
    const expectedToken = String(expected.idempotencyToken || expected.sourceRequestId || '').trim();
    const actualToken = String(actual.idempotencyToken || actual.sourceRequestId || actual.buildAttemptId || '').trim();
    const aliasesCurrentRequest = !!(expectedToken && actualToken &&
      (actualToken === expectedToken || actualToken.indexOf(expectedToken) !== -1 || expectedToken.indexOf(actualToken) !== -1));
    const hardMismatch = reasons.some(function(reason) {
      if (aliasesCurrentRequest && (reason === 'runnerTaskId_mismatch' || reason === 'sourceRequestId_mismatch' || reason === 'buildAttemptId_mismatch' || reason === 'idempotencyToken_mismatch')) return false;
      return reason === 'runnerTaskId_mismatch' || reason === 'sourceRequestId_mismatch';
    });
    return !hardMismatch;
  }

  function resultCaptureNamePrefixFilterW485() {
    return [
      ['name', 'contains', 'idb_result'],
      'OR',
      ['name', 'contains', 'idb_runner_sidecar']
    ];
  }

  function buildNetSuiteRecordUrl(type, id) {
    const internalId = String(id || '').trim();
    if (!numericId(internalId)) return '';
    const normalizedType = String(type || '').toLowerCase();
    const accountId = String(runtime.accountId || '').toLowerCase().replace(/_/g, '-');
    const origin = accountId ? `https://${accountId}.app.netsuite.com` : '';
    if (normalizedType === 'customer') return `${origin}/app/common/entity/custjob.nl?id=${internalId}`;
    if (normalizedType === 'salesorder') return `${origin}/app/accounting/transactions/salesord.nl?id=${internalId}`;
    if (normalizedType === 'inventoryitem' || normalizedType === 'matrixitem' || normalizedType === 'assemblyitem') {
      return `${origin}/app/common/item/item.nl?id=${internalId}`;
    }
    return '';
  }

  function normalizeRecord(record, fallbackType) {
    const raw = record || {};
    const internalId = String(raw.internalId || raw.id || '').trim();
    const rawUrl = String(raw.url || '').trim();
    const fallbackUrl = buildNetSuiteRecordUrl(raw.type || raw.recordType || fallbackType, internalId);
    const url = supportedNetSuiteUrl(rawUrl) && /^https:\/\//i.test(rawUrl) ? rawUrl : fallbackUrl;
    return {
      type: String(raw.type || raw.recordType || fallbackType || '').trim(),
      name: String(raw.name || '').trim(),
      internalId,
      url,
      currentRunIdentityW457: raw.currentRunIdentityW457 || raw.currentRunIdentity || null,
      identityValidationStatus: raw.identityValidationStatus || raw.currentRunIdentityW457 && raw.currentRunIdentityW457.status || '',
      expectedProspect: raw.expectedProspect || '',
      website: raw.website || ''
    };
  }

  function canonicalRoleForAdapter(role, operatingMode) {
    const value = String(role || '').trim();
    const mode = String(operatingMode || '').trim();
    const aliases = {
      customer: 'customer',
      demoTransaction: 'sales_order',
      salesOrder: 'sales_order',
      sales_order: 'sales_order',
      heroItem: 'finished_or_assembly_item',
      hero_item: 'finished_or_assembly_item',
      matrixProofItem: 'formula_or_batch_structure',
      matrixItem: 'formula_or_batch_structure',
      matrix_or_proof_item: 'formula_or_batch_structure',
      componentItem: 'component_item',
      component_item: 'component_item',
      finished_food_or_batch_item: 'finished_food_or_batch_item',
      ingredient_or_component_item: 'ingredient_or_component_item',
      formula_or_batch_structure: 'formula_or_batch_structure',
      work_order_or_wip_object: 'work_order_or_wip_object',
      routing: 'routing',
      work_center: 'work_center'
    };
    const base = aliases[value] || value;
    if (mode === 'food_batch_manufacturing') {
      if (base === 'finished_or_assembly_item') return 'finished_food_or_batch_item';
      if (base === 'component_item') return 'ingredient_or_component_item';
    }
    if (mode === 'retail_availability' && base === 'finished_or_assembly_item') return 'hero_sku';
    if (mode === 'apparel_style_matrix' && base === 'finished_or_assembly_item') return 'style_sku';
    if (mode === 'dealer_hardgoods_replenishment' && base === 'finished_or_assembly_item') return 'product_sku';
    if (mode === 'distribution_replenishment' && base === 'finished_or_assembly_item') return 'branch_or_product_sku';
    if (mode === 'distribution_replenishment' && base === 'formula_or_batch_structure') return 'replenishment_or_availability_flow';
    if (mode === 'distribution_replenishment' && base === 'component_item') return 'supporting_sku';
    return base;
  }

  function canonicalLabelForAdapter(role) {
    const labels = {
      customer: 'Customer',
      sales_order: 'Sales Order',
      hero_sku: 'Product SKU',
      style_sku: 'Style SKU',
      product_sku: 'Product SKU',
      branch_or_product_sku: 'Product SKU',
      replenishment_or_availability_flow: 'Availability/Replenishment Flow',
      supporting_sku: 'Product SKU',
      finished_or_assembly_item: 'Finished/Assembly Item',
      finished_food_or_batch_item: 'Finished Food/Batch Item',
      component_item: 'Component Item',
      ingredient_or_component_item: 'Ingredient Item',
      formula_or_batch_structure: 'Formula or Batch Structure',
      work_order_or_wip_object: 'Work Order',
      routing: 'Routing',
      work_center: 'Work Center'
    };
    return labels[role] || String(role || '').replace(/_/g, ' ');
  }

  function normalizeCanonicalRecordForAdapter(record, role, operatingMode, fallbackType) {
    const normalized = normalizeRecord(record, fallbackType);
    const canonicalRole = canonicalRoleForAdapter(record && record.role || role, operatingMode);
    return Object.assign({}, normalized, {
      role: canonicalRole,
      legacyRole: role || record && record.legacyRole || '',
      label: record && record.label || canonicalLabelForAdapter(canonicalRole),
      recordType: normalized.type
    });
  }

  function canonicalRecordsFromCompletedSource(source, operatingMode) {
    if (Array.isArray(source && source.records)) {
      return source.records.map((record) => normalizeCanonicalRecordForAdapter(record, record && record.role, operatingMode, record && (record.recordType || record.type)));
    }
    const records = source && source.records || {};
    const output = [];
    [
      ['customer', records.customer || source && source.customer, 'customer'],
      ['demoTransaction', records.demoTransaction || records.salesOrder || source && (source.demoTransaction || source.salesOrder), 'salesorder'],
      ['heroItem', records.heroItem || source && source.heroItem, 'inventoryitem'],
      ['matrixProofItem', records.matrixProofItem || records.matrixItem || source && (source.matrixProofItem || source.matrixItem), 'matrixitem'],
      ['componentItem', records.componentItem || records.componentItems && records.componentItems[0] || source && (source.componentItem || source.componentItems && source.componentItems[0]), 'inventoryitem']
    ].forEach((item) => {
      if (item[1]) output.push(normalizeCanonicalRecordForAdapter(item[1], item[0], operatingMode, item[2]));
    });
    const componentItems = records.componentItems || source && source.componentItems;
    if (Array.isArray(componentItems)) {
      componentItems.slice(1).forEach((record) => output.push(normalizeCanonicalRecordForAdapter(record, 'component_item', operatingMode, 'inventoryitem')));
    }
    return output;
  }

  function firstCanonicalRecord(canonicalRecords, roles) {
    const wanted = roles || [];
    return canonicalRecords.find((record) => wanted.indexOf(record.role) !== -1 || wanted.indexOf(record.legacyRole) !== -1) || null;
  }

  function normalizeCompletedRunnerResult(raw) {
    const source = raw && raw.finalGeneratedNamesJson ? raw.finalGeneratedNamesJson : raw;
    const vocabularyPolicy = source && source.runnerLaneVocabularyPolicy || raw && raw.runnerLaneVocabularyPolicy || null;
    const operatingMode = String(
      source && source.resolvedOperatingMode ||
      raw && raw.resolvedOperatingMode ||
      vocabularyPolicy && (vocabularyPolicy.modeKey || vocabularyPolicy.operatingMode) ||
      source && source.canonicalRuntimeContract && source.canonicalRuntimeContract.resolvedOperatingMode ||
      raw && raw.canonicalRuntimeContract && raw.canonicalRuntimeContract.resolvedOperatingMode ||
      ''
    ).trim();
    const canonicalRecords = canonicalRecordsFromCompletedSource(source, operatingMode);
    const customer = firstCanonicalRecord(canonicalRecords, ['customer']) || normalizeRecord(null, 'customer');
    const demoTransaction = firstCanonicalRecord(canonicalRecords, ['sales_order', 'demoTransaction', 'salesOrder']) || normalizeRecord(null, 'salesorder');
    const heroItem = firstCanonicalRecord(canonicalRecords, ['finished_food_or_batch_item', 'finished_or_assembly_item', 'hero_sku', 'style_sku', 'product_sku', 'branch_or_product_sku', 'heroItem']) || normalizeRecord(null, 'inventoryitem');
    const matrixProofItem = firstCanonicalRecord(canonicalRecords, ['formula_or_batch_structure', 'availability_or_replenishment_flow', 'style_matrix_or_availability_flow', 'dealer_availability_or_replenishment_flow', 'replenishment_or_availability_flow', 'matrixProofItem', 'matrixItem']) || normalizeRecord(null, 'matrixitem');
    const componentItem = firstCanonicalRecord(canonicalRecords, ['supporting_sku', 'ingredient_or_component_item', 'component_item', 'componentItem']) || normalizeRecord(null, 'inventoryitem');
    const completed = {
      schema: 'idb.completed-runner-result-json.v1',
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      canonicalRuntimeContract: {
        schema: 'forge.completed-runner-result.compatibility.v1',
        recordsArrayAccepted: true,
        legacyFiveRecordFieldsPreserved: true,
        resolvedOperatingMode: operatingMode
      },
      canonicalRecords,
      resolvedOperatingMode: operatingMode,
      runnerLaneVocabularyPolicy: vocabularyPolicy,
      records: {
        customer,
        demoTransaction,
        heroItem,
        matrixProofItem,
        componentItem
      },
      demoTransaction,
      heroItem,
      matrixItem: matrixProofItem,
      componentItems: [componentItem]
    };
    const required = [customer, demoTransaction, heroItem, matrixProofItem, componentItem];
    const errors = [];
    required.forEach((record) => {
      if (!record.name) errors.push(`${record.type || 'record'} name is required.`);
      if (!numericId(record.internalId)) errors.push(`${record.name || record.type || 'record'} requires numeric internalId.`);
      if (!supportedNetSuiteUrl(record.url)) errors.push(`${record.name || record.type || 'record'} requires supported NetSuite record URL.`);
    });
    return { valid: errors.length === 0, completed, errors };
  }

  function normalizePendingSidecarResultCapture(raw) {
    const capture = raw && raw.schema === 'idb.runner-result-capture.v1' ? raw : null;
    const status = String(capture && capture.status || '').trim();
    if (status !== 'pending_transaction_resolution') return { pending: false };
    return {
      pending: true,
      status,
      finalGeneratedNamesReady: false,
      partialGeneratedNamesJson: capture.partialGeneratedNamesJson || capture.sidecarGeneratedNamesJson || null,
      transactionResolution: capture.transactionResolution || {
        status: 'pending_transaction_resolution',
        authority: 'legacy_runner_csv_import_path'
      }
    };
  }

  function parseMaybeJsonObjectW455(value) {
    if (!value) return value;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return value;
    const text = value.trim();
    if (!text || !/^[\[{]/.test(text)) return value;
    try {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === 'object' ? parsed : value;
    } catch (e) {
      return value;
    }
  }

  function completedKeyedResultCaptureW455(parsed) {
    const capture = parsed || {};
    const payload = parseMaybeJsonObjectW455(capture.finalGeneratedNamesJson) ||
      parseMaybeJsonObjectW455(capture.completedResultJson) ||
      parseMaybeJsonObjectW455(capture.generatedNamesJson) ||
      parseMaybeJsonObjectW455(capture.sidecarGeneratedNamesJson) ||
      parseMaybeJsonObjectW455(capture.partialGeneratedNamesJson) ||
      capture;
    const status = String(payload && (payload.status || payload.runStatus) || capture.status || '').trim();
    const records = payload && payload.records || {};
    const hasKeyedRecords = !!(records && !Array.isArray(records) && (records.customer || records.heroItem || records.assembly || records.routingDiagnostic));
    const terminal = /completed|completed_with_wip_diagnostic/.test(status);
    if (!terminal || !hasKeyedRecords) return { ready: false };
    payload.generatedRecordOwner = payload.generatedRecordOwner || payload.recordOwner || 'governed_runner_internal_build_engine';
    payload.recordOwner = payload.recordOwner || payload.generatedRecordOwner;
    payload.displayReadyRecords = Array.isArray(payload.displayReadyRecords) ? payload.displayReadyRecords : displayRecordsFromKeyedW455(records);
    payload.recordsArray = Array.isArray(payload.recordsArray) ? payload.recordsArray : payload.displayReadyRecords;
    return { ready: true, payload, status };
  }

  function displayRecordsFromKeyedW455(records) {
    const out = [];
    [
      'customer',
      'demoTransaction',
      'salesOrder',
      'heroItem',
      'assembly',
      'bom',
      'bomRevision',
      'componentItem1',
      'componentItem2',
      'componentItem3',
      'routing',
      'routingDiagnostic',
      'workOrder',
      'workOrderDiagnostic'
    ].forEach((key) => {
      const record = records && records[key];
      if (record && typeof record === 'object' && !record.plannedOnly) out.push(record);
    });
    return out;
  }

  function activeOpenLinksFromCompletedPayloadW470(payload) {
    const records = payload && payload.records || {};
    const rows = Array.isArray(payload && payload.displayReadyRecords)
      ? payload.displayReadyRecords
      : (Array.isArray(payload && payload.recordsArray)
        ? payload.recordsArray
        : displayRecordsFromKeyedW455(records));
    return rows.filter(function(record) {
      const url = compactText(record && (record.supportedOpenUrl || record.openableUrl || record.url));
      const id = compactText(record && (record.internalId || record.id));
      const type = compactText(record && (record.recordType || record.type)).toLowerCase();
      const label = compactText(record && (record.role || record.label || record.name)).toLowerCase();
      if (!numericId(id)) return false;
      if (type === 'operation' || /diagnostic|planned/.test(label)) return false;
      return /^https:\/\/[^/]+\.app\.netsuite\.com\/app\//i.test(url);
    }).length;
  }

  function getSidecarRecords(pendingSidecar) {
    const source = pendingSidecar && pendingSidecar.partialGeneratedNamesJson || {};
    return source.records || {};
  }

  function uniqueTextValuesW458(values) {
    const unique = [];
    (values || []).forEach((value) => {
      const text = String(value || '').trim();
      if (text && unique.indexOf(text) === -1) unique.push(text);
    });
    return unique;
  }

  function loadSalesOrderLookupSearchW458(searchModule) {
    try {
      return searchModule.load({ id: SALES_ORDER_LOOKUP_SEARCH_ID_W458 });
    } catch (e) {
      return searchModule.load({ id: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458 });
    }
  }

  function mapSalesOrderLookupRowW458(row) {
    const out = {
      internalId: String(row && (row.id || '') || '').trim(),
      values: [],
      haystack: ''
    };
    const columns = row && row.columns || [];
    columns.forEach((column) => {
      let value = '';
      let text = '';
      try { value = row.getValue(column); } catch (e1) { value = ''; }
      try { text = row.getText(column); } catch (e2) { text = ''; }
      const key = String(column && (column.label || column.name || column.join || '') || '').toLowerCase();
      const printable = String(value || text || '').trim();
      if (!printable) return;
      out.values.push(printable);
      if (!out.internalId && /internal\s*id|internalid/.test(key) && numericId(printable)) out.internalId = printable;
      if (!out.externalId && /external\s*id|externalid/.test(key)) out.externalId = printable;
      if (!out.tranid && /document\s*number|tranid/.test(key)) out.tranid = printable;
      if (!out.status && /status/.test(key)) out.status = printable;
      if (!out.memo && /memo/.test(key)) out.memo = printable;
      if (!out.entityName && /^name$|entity|customer/.test(key)) out.entityName = printable;
      if (!out.amount && /amount/.test(key)) out.amount = printable;
      if (!out.dateCreated && /date\s*created|created/.test(key)) out.dateCreated = printable;
    });
    out.haystack = out.values.join(' ');
    return out;
  }

  function resolveSalesOrderByForgeSavedSearchW458(candidates, modules) {
    const searchModule = modules && modules.search;
    if (!searchModule) return { found: false, reason: 'search module unavailable', candidates };
    const unique = uniqueTextValuesW458(candidates);
    if (!unique.length) return { found: false, reason: 'no expected sales order external id candidates', candidates: unique };
    try {
      const saved = loadSalesOrderLookupSearchW458(searchModule);
      const rows = saved.run().getRange({ start: 0, end: 1000 }) || [];
      const matches = [];
      rows.forEach((row) => {
        const mapped = mapSalesOrderLookupRowW458(row);
        if (!numericId(mapped.internalId)) return;
        const haystack = String(mapped.haystack || '').toLowerCase();
        const matchedCandidate = unique.find((candidate) => {
          const expected = String(candidate || '').trim();
          return expected && (String(mapped.externalId || '').trim() === expected || haystack.indexOf(expected.toLowerCase()) !== -1);
        });
        if (!matchedCandidate) return;
        matches.push(Object.assign({}, mapped, { candidate: matchedCandidate }));
      });
      if (!matches.length) {
        return {
          found: false,
          reason: 'FORGE SO lookup saved search returned no row for current-run external id candidates',
          searchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
          searchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
          rowsScanned: rows.length,
          candidates: unique
        };
      }
      if (matches.length > 1) {
        return {
          found: false,
          reason: 'FORGE SO lookup saved search returned multiple rows for current-run external id candidates',
          searchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
          searchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
          rowsScanned: rows.length,
          candidates: unique,
          matches: matches.map((match) => ({ internalId: match.internalId, tranid: match.tranid, externalId: match.externalId }))
        };
      }
      const match = matches[0];
      return {
        found: true,
        source: 'forge_so_lookup_saved_search',
        searchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
        searchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
        candidate: match.candidate,
        internalId: match.internalId,
        name: match.tranid || `Sales Order ${match.internalId}`,
        tranid: match.tranid || '',
        status: match.status || '',
        externalId: match.externalId || match.candidate,
        memo: match.memo || '',
        entityName: match.entityName || '',
        amount: match.amount || '',
        dateCreated: match.dateCreated || '',
        url: buildNetSuiteRecordUrl('salesorder', match.internalId)
      };
    } catch (e) {
      return {
        found: false,
        reason: 'FORGE SO lookup saved search failed',
        searchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
        searchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
        errorName: e && e.name || '',
        errorMessage: e && e.message || String(e || ''),
        candidates: unique
      };
    }
  }

  function resolveSalesOrderByExternalIdCandidates(candidates, modules) {
    const searchModule = modules && modules.search;
    if (!searchModule) return { found: false, reason: 'search module unavailable' };
    const unique = uniqueTextValuesW458(candidates);
    if (!unique.length) return { found: false, reason: 'no expected sales order external id candidates' };
    const savedSearchMatch = resolveSalesOrderByForgeSavedSearchW458(unique, modules);
    if (savedSearchMatch.found) return savedSearchMatch;
    for (let i = 0; i < unique.length; i++) {
      const candidate = unique[i];
      const attempts = [
        { field: 'externalidstring', op: 'is', value: candidate },
        { field: 'externalid', op: 'is', value: candidate }
      ];
      for (let j = 0; j < attempts.length; j++) {
        const attempt = attempts[j];
        try {
          const salesOrderSearch = searchModule.create({
            type: 'salesorder',
            filters: [[attempt.field, attempt.op, attempt.value], 'AND', ['mainline', 'is', 'T']],
            columns: ['internalid', 'tranid', 'externalid']
          });
          const matches = salesOrderSearch.run().getRange({ start: 0, end: 1 }) || [];
          if (matches.length) {
            const match = matches[0];
            const id = String(match.getValue && match.getValue({ name: 'internalid' }) || match.id || '').trim();
            const tranid = String(match.getValue && match.getValue({ name: 'tranid' }) || '').trim();
            if (numericId(id)) {
              return {
                found: true,
                candidate,
                internalId: id,
                name: tranid || `Sales Order ${id}`,
                url: buildNetSuiteRecordUrl('salesorder', id)
              };
            }
          }
        } catch (e) {
          // Try the next NetSuite search field; accounts differ on exposed external id filters.
        }
      }
    }
    return { found: false, reason: 'sales order not found for expected external id candidates', candidates: unique };
  }

  function promotePendingSidecarIfTransactionResolved(pendingSidecar, modules) {
    const records = getSidecarRecords(pendingSidecar);
    const sidecar = pendingSidecar && pendingSidecar.partialGeneratedNamesJson || {};
    const tx = pendingSidecar && pendingSidecar.transactionResolution || {};
    const demoSource = records.demoTransaction || {};
    const candidates = []
      .concat(tx.expectedExternalIdCandidates || [])
      .concat(demoSource.externalIdCandidates || [])
      .concat(tx.expectedDemoTransactionExternalId || demoSource.expectedExternalId || []);
    const salesOrder = resolveSalesOrderByExternalIdCandidates(candidates, modules);
    if (!salesOrder.found) {
      return {
        promoted: false,
        reason: salesOrder.reason,
        candidates: salesOrder.candidates || candidates
      };
    }
    const completed = {
      schema: 'idb.completed-runner-result-json.v1',
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      source: 'w144_sidecar_transaction_resolution',
      idempotencyToken: sidecar.idempotencyToken || '',
      resolvedOperatingMode: sidecar.resolvedOperatingMode || pendingSidecar.resolvedOperatingMode || '',
      runnerLaneVocabularyPolicy: sidecar.runnerLaneVocabularyPolicy || pendingSidecar.runnerLaneVocabularyPolicy || null,
      records: {
        customer: normalizeRecord(records.customer, 'customer'),
        demoTransaction: normalizeRecord({
          type: 'salesorder',
          name: salesOrder.name || demoSource.name,
          internalId: salesOrder.internalId,
          url: salesOrder.url,
          currentRunIdentityW457: {
            status: 'current_run_identity_verified',
            role: 'sales_order',
            expectedRole: 'sales_order',
            expectedExternalId: salesOrder.candidate || '',
            matchedExternalId: salesOrder.externalId || salesOrder.candidate || '',
            matchedSalesOrderId: salesOrder.internalId,
            matchedTranid: salesOrder.tranid || salesOrder.name || '',
            savedSearchId: salesOrder.searchId || '',
            savedSearchInternalId: salesOrder.searchInternalId || '',
            notWorkOrder: true
          },
          identityValidationStatus: 'current_run_identity_verified'
        }, 'salesorder'),
        heroItem: normalizeRecord(records.heroItem, 'inventoryitem'),
        matrixProofItem: normalizeRecord(records.matrixProofItem || records.matrixItem, 'inventoryitem'),
        componentItem: normalizeRecord(records.componentItem || records.componentItems && records.componentItems[0], 'inventoryitem')
      },
      ownership: {
        generatedRecordsOwnedBy: 'governed_runner_internal_build_engine',
        drawerWrites: false,
        drawerTransactionWrites: false
      },
      transactionResolution: {
        status: salesOrder.source === 'forge_so_lookup_saved_search' ? 'sales_order_resolved_by_saved_search' : 'resolved_by_csv_import',
        authority: salesOrder.source === 'forge_so_lookup_saved_search' ? 'FORGE SO lookup saved search' : 'legacy_runner_csv_import_path',
        savedSearchId: salesOrder.searchId || '',
        savedSearchInternalId: salesOrder.searchInternalId || '',
        matchedExternalId: salesOrder.externalId || salesOrder.candidate,
        matchedSalesOrderId: salesOrder.internalId,
        matchedTranid: salesOrder.tranid || salesOrder.name || '',
        demandRecordRolePolicy: 'sales_order_only_never_work_order'
      }
    };
    completed.demoTransaction = completed.records.demoTransaction;
    completed.heroItem = completed.records.heroItem;
    completed.matrixItem = completed.records.matrixProofItem;
    completed.componentItems = [completed.records.componentItem];
    const normalized = normalizeCompletedRunnerResult(completed);
    return normalized.valid
      ? { promoted: true, completed: normalized.completed, transactionResolution: completed.transactionResolution }
      : { promoted: false, reason: normalized.errors.join(' '), candidates };
  }

  function promoteCompletedKeyedSalesOrderW458(payload, modules) {
    const completed = payload || {};
    const records = completed.records || {};
    const tx = completed.transactionResolution || {};
    const demoSource = records.demoTransaction || records.salesOrder || completed.demoTransaction || completed.salesOrder || {};
    const candidates = []
      .concat(tx.expectedExternalIdCandidates || [])
      .concat(demoSource.externalIdCandidates || [])
      .concat(tx.expectedExternalId || tx.expectedDemoTransactionExternalId || demoSource.expectedExternalId || completed.extId || completed.generatedExtId || []);
    const alreadyResolved = numericId(demoSource.internalId || demoSource.id) &&
      /salesord\.nl/i.test(String(demoSource.url || demoSource.openableUrl || ''));
    if (alreadyResolved) return { promoted: false, alreadyResolved: true };
    const salesOrder = resolveSalesOrderByExternalIdCandidates(candidates, modules);
    if (!salesOrder.found) {
      completed.transactionResolution = Object.assign({}, tx, {
        lookupStatus: salesOrder.reason || 'pending_transaction_resolution',
        savedSearchId: salesOrder.searchId || SALES_ORDER_LOOKUP_SEARCH_ID_W458,
        savedSearchInternalId: salesOrder.searchInternalId || SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
        candidates: salesOrder.candidates || uniqueTextValuesW458(candidates)
      });
      return { promoted: false, reason: salesOrder.reason, candidates: salesOrder.candidates || candidates };
    }
    const currentRunIdentity = {
      status: 'current_run_identity_verified',
      role: 'sales_order',
      expectedRole: 'sales_order',
      expectedExternalId: salesOrder.candidate || '',
      matchedExternalId: salesOrder.externalId || salesOrder.candidate || '',
      matchedSalesOrderId: salesOrder.internalId,
      matchedTranid: salesOrder.tranid || salesOrder.name || '',
      savedSearchId: salesOrder.searchId || '',
      savedSearchInternalId: salesOrder.searchInternalId || '',
      notWorkOrder: true
    };
    const salesOrderRecord = Object.assign({}, demoSource, {
      role: 'sales_order',
      type: 'salesorder',
      recordType: 'salesorder',
      label: 'Sales Order',
      name: salesOrder.name || demoSource.name || `Sales Order ${salesOrder.internalId}`,
      recordName: salesOrder.name || demoSource.recordName || `Sales Order ${salesOrder.internalId}`,
      internalId: salesOrder.internalId,
      id: salesOrder.internalId,
      url: salesOrder.url,
      openableUrl: salesOrder.url,
      status: salesOrder.status || demoSource.status || '',
      tranid: salesOrder.tranid || salesOrder.name || '',
      externalId: salesOrder.externalId || salesOrder.candidate || '',
      memo: salesOrder.memo || '',
      entityName: salesOrder.entityName || '',
      currentRunIdentityW457: currentRunIdentity,
      identityValidationStatus: 'current_run_identity_verified',
      linkAuthority: {
        status: 'verified_openable_current_run',
        openable: true,
        url: salesOrder.url
      }
    });
    records.demoTransaction = salesOrderRecord;
    records.salesOrder = salesOrderRecord;
    completed.records = records;
    completed.demoTransaction = salesOrderRecord;
    completed.salesOrder = salesOrderRecord;
    completed.transactionResolution = {
      status: salesOrder.source === 'forge_so_lookup_saved_search' ? 'sales_order_resolved_by_saved_search' : 'resolved_by_csv_import',
      authority: salesOrder.source === 'forge_so_lookup_saved_search' ? 'FORGE SO lookup saved search' : 'legacy_runner_csv_import_path',
      savedSearchId: salesOrder.searchId || '',
      savedSearchInternalId: salesOrder.searchInternalId || '',
      expectedExternalId: salesOrder.candidate || '',
      matchedExternalId: salesOrder.externalId || salesOrder.candidate || '',
      matchedSalesOrderId: salesOrder.internalId,
      matchedTranid: salesOrder.tranid || salesOrder.name || '',
      demandRecordRolePolicy: 'sales_order_only_never_work_order'
    };
    completed.currentRunIdentityChecksW457 = Object.assign({}, completed.currentRunIdentityChecksW457 || {}, {
      salesOrder: currentRunIdentity
    });
    completed.displayReadyRecords = displayRecordsFromKeyedW455(records);
    completed.recordsArray = completed.displayReadyRecords;
    completed.displayRecords = completed.displayReadyRecords;
    return { promoted: true, salesOrder, transactionResolution: completed.transactionResolution };
  }

  function findResultCaptureFile(config, lookup, modules) {
    if (!config.resultCaptureFolderId) return { found: false, reason: 'result capture folder is not configured' };
    const expected = resultCaptureLookupProvenance(lookup || {});
    const runnerTaskId = expected.runnerTaskId;
    const idempotencyToken = expected.idempotencyToken;
    const buildAttemptId = expected.buildAttemptId;
    if (!runnerTaskId && !buildAttemptId && !idempotencyToken) return { found: false, reason: 'runnerTaskId or buildAttemptId or idempotencyToken is required' };
    const searchModule = modules && modules.search;
    const fileModule = modules && modules.file;
    if (!searchModule || !fileModule) return { found: false, reason: 'file/search modules unavailable' };
    const searchTokens = resultCaptureFileSearchTokensW320(expected);
    const staleCandidates = [];
    const recentCandidatesW473 = [];
    const checkedFileIds = {};
    for (let tokenIndex = 0; tokenIndex < searchTokens.length; tokenIndex += 1) {
      const searchToken = searchTokens[tokenIndex];
      const filters = [
        ['folder', 'anyof', config.resultCaptureFolderId],
        'AND',
        resultCaptureNamePrefixFilterW485(),
        'AND',
        ['name', 'contains', searchToken.token]
      ];
      const modifiedColumn = searchModule.createColumn && searchModule.Sort
        ? searchModule.createColumn({ name: 'modified', sort: searchModule.Sort.DESC })
        : 'modified';
      const captureSearch = searchModule.create({
        type: 'file',
        filters,
        columns: ['internalid', 'name', modifiedColumn]
      });
      const matches = captureSearch.run().getRange({ start: 0, end: 10 }) || [];
      for (let i = 0; i < matches.length; i += 1) {
        const match = matches[i];
        const fileId = String(match.id || match.getValue && match.getValue({ name: 'internalid' }) || '');
        if (!fileId || checkedFileIds[fileId]) continue;
        checkedFileIds[fileId] = true;
        const fileName = match.getValue && match.getValue({ name: 'name' }) || match.name || '';
        const captureFile = fileModule.load({ id: fileId });
        const contents = captureFile.getContents();
        let parsed = null;
        try {
          parsed = JSON.parse(contents || '{}');
        } catch (e) {
          staleCandidates.push({ fileId, fileName: String(fileName || captureFile.name || ''), reason: 'invalid_json' });
          continue;
        }
        const matchResult = resultCaptureMatchesCurrentAttempt(parsed, expected);
        if (!matchResult.matches) {
          if (terminalKeyedSafeTokenCaptureAllowedW455(parsed, matchResult, searchToken, fileName || captureFile.name || '')) {
            return {
              found: true,
              fileId,
              fileName: String(fileName || captureFile.name || ''),
              contents,
              lookupSource: searchToken.source,
              provenance: matchResult.actual,
              provenanceFallback: {
                status: 'terminal_keyed_safe_token_capture_allowed_w455',
                reason: 'completed_keyed_result_capture_matches_current_safe_file_token',
                expected: matchResult.expected,
                actual: matchResult.actual
              }
            };
          }
          if (legacyCurrentSafeTokenCaptureAllowed(matchResult, searchToken, fileName || captureFile.name || '')) {
            return {
              found: true,
              fileId,
              fileName: String(fileName || captureFile.name || ''),
              contents,
              lookupSource: searchToken.source,
              provenance: matchResult.actual,
              provenanceFallback: {
                status: 'legacy_current_safe_token_capture_allowed',
                reason: 'sidecar_missing_build_attempt_provenance_but_matches_current_safe_token_and_file_time',
                expected: matchResult.expected,
                actual: matchResult.actual
              }
            };
          }
          staleCandidates.push({
            fileId,
            fileName: String(fileName || captureFile.name || ''),
            lookupSource: searchToken.source,
            mismatchReason: matchResult.reasons.join(',') || 'provenance_mismatch',
            reasons: matchResult.reasons,
            expected: matchResult.expected,
            actual: matchResult.actual
          });
          continue;
        }
        return {
          found: true,
          fileId,
          fileName: String(fileName || captureFile.name || ''),
          contents,
          lookupSource: searchToken.source,
          provenance: matchResult.actual
        };
      }
    }
    const broadFilters = [
      ['folder', 'anyof', config.resultCaptureFolderId],
      'AND',
      resultCaptureNamePrefixFilterW485()
    ];
    const broadModifiedColumn = searchModule.createColumn && searchModule.Sort
      ? searchModule.createColumn({ name: 'modified', sort: searchModule.Sort.DESC })
      : 'modified';
    const broadCaptureSearch = searchModule.create({
      type: 'file',
      filters: broadFilters,
      columns: ['internalid', 'name', broadModifiedColumn]
    });
    const broadMatches = broadCaptureSearch.run().getRange({ start: 0, end: 50 }) || [];
    for (let broadIndex = 0; broadIndex < broadMatches.length; broadIndex += 1) {
      const match = broadMatches[broadIndex];
      const fileId = String(match.id || match.getValue && match.getValue({ name: 'internalid' }) || '');
      if (!fileId || checkedFileIds[fileId]) continue;
      checkedFileIds[fileId] = true;
      const fileName = match.getValue && match.getValue({ name: 'name' }) || match.name || '';
      recentCandidatesW473.push({ fileId, fileName: String(fileName || '') });
      const captureFile = fileModule.load({ id: fileId });
      const contents = captureFile.getContents();
      let parsed = null;
      try {
        parsed = JSON.parse(contents || '{}');
      } catch (e) {
        staleCandidates.push({ fileId, fileName: String(fileName || captureFile.name || ''), lookupSource: 'currentRunProvenanceBroadScanW472', reason: 'invalid_json' });
        continue;
      }
      const matchResult = resultCaptureMatchesCurrentAttempt(parsed, expected);
      if (!matchResult.matches) {
        staleCandidates.push({
          fileId,
          fileName: String(fileName || captureFile.name || ''),
          lookupSource: 'currentRunProvenanceBroadScanW472',
          mismatchReason: matchResult.reasons.join(',') || 'provenance_mismatch',
          reasons: matchResult.reasons,
          expected: matchResult.expected,
          actual: matchResult.actual
        });
        continue;
      }
      return {
        found: true,
        fileId,
        fileName: String(fileName || captureFile.name || ''),
        contents,
        lookupSource: 'currentRunProvenanceBroadScanW472',
        provenance: matchResult.actual
      };
    }
    return {
      found: false,
      reason: staleCandidates.length ? 'stale_result_capture_file_rejected' : 'result capture file not found',
      expected,
      staleRejected: staleCandidates.length > 0,
      latestRejectedFile: staleCandidates.length ? staleCandidates[0] : null,
      recentCandidatesW473,
      searchTokensW473: searchTokens.map(function(entry) { return entry.source + ':' + entry.token; }).slice(0, 30),
      staleCandidates
    };
  }

  function pollAttemptFromCursor(cursor) {
    const match = String(cursor || '').match(/(?:^|:)attempt:(\d+)(?:$|:)/);
    return match ? Math.max(0, Number(match[1] || 0)) : 0;
  }

  function resultCapturePendingCursor(runnerTaskId, attempt) {
    return `pending:${runnerTaskId}:attempt:${Math.max(1, Number(attempt || 1))}`;
  }

  function buildResultCapturePollEnvelope(lookup, config, modules, parseErrors) {
    const lookupProvenance = resultCaptureLookupProvenance(lookup || {});
    const runnerTaskId = lookupProvenance.runnerTaskId;
    const idempotencyToken = lookupProvenance.idempotencyToken;
    const buildAttemptId = lookupProvenance.buildAttemptId;
    const sourceRequestId = lookupProvenance.sourceRequestId;
    const submittedAt = lookupProvenance.submittedAt;
    const cursor = String(lookup && lookup.resultCaptureCursor || '').trim();
    const pollAttempt = Math.max(1, pollAttemptFromCursor(cursor) + 1);
    const maxPollAttempts = Math.max(1, Number(lookup && lookup.maxPollAttempts || 12));
    const errors = [].concat(parseErrors || []);
    if (!runnerTaskId) errors.push('runnerTaskId is required for result-capture polling.');
    if (!idempotencyToken) errors.push('idempotencyToken is required for result-capture polling.');
    if (!buildAttemptId) errors.push('buildAttemptId is required for stale-safe result-capture polling.');
    if (!config.resultCaptureFolderId) errors.push('resultCaptureFolderId runtime config is required.');
    if (lookup && lookup.expectedResultSchema && lookup.expectedResultSchema !== 'idb.completed-runner-result-json.v1') {
      errors.push('expected result schema must be idb.completed-runner-result-json.v1.');
    }
    if (errors.length) {
      return adapterPollError(runnerTaskId, idempotencyToken, errors.join(' '), cursor);
    }
    const found = findResultCaptureFile(config, lookup, modules);
    if (!found.found) {
      const terminal = pollAttempt >= maxPollAttempts;
      const terminalStatus = found.reason === 'stale_result_capture_file_rejected'
        ? 'stale_result_capture_rejected_after_wait'
        : 'result_capture_not_found_after_wait';
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        adapterVersion: ADAPTER_VERSION,
        status: terminal ? terminalStatus : 'polling_pending',
        terminal: terminal === true,
        retryable: terminal !== true,
        queueSubmitted: true,
        runnerTaskId,
        idempotencyToken,
        sourceRequestId,
        buildAttemptId,
        submittedAt,
        resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_runner_completion',
          runnerTaskId,
          idempotencyToken,
          sourceRequestId,
          buildAttemptId,
          submittedAt,
          resultCaptureCursor: resultCapturePendingCursor(runnerTaskId, pollAttempt),
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null,
          lookupStatus: found.reason,
          terminalStatus: terminal ? terminalStatus : '',
          pollAttempt,
          maxPollAttempts,
          expectedProvenance: found.expected || lookupProvenance,
          resultCaptureFolderId: config.resultCaptureFolderId || '',
          latestRejectedFile: found.latestRejectedFile || null,
          recentCandidatesW473: found.recentCandidatesW473 || [],
          searchTokensW473: found.searchTokensW473 || [],
          staleRejected: found.staleRejected === true,
          staleCandidates: found.staleCandidates || []
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_runner_internal_build_engine'
      };
    }
    let parsed;
    try {
      parsed = JSON.parse(found.contents || '{}');
    } catch (e) {
      return adapterPollError(runnerTaskId, idempotencyToken, 'result capture file is not valid JSON.', cursor, found);
    }
    const pendingSidecar = normalizePendingSidecarResultCapture(parsed);
    if (pendingSidecar.pending) {
      const promoted = promotePendingSidecarIfTransactionResolved(pendingSidecar, modules);
      if (promoted.promoted) {
        return {
          schema: 'idb.approved-server-adapter-result-envelope.v1',
          adapterVersion: ADAPTER_VERSION,
          status: 'completed_runner_result_ready',
          queueSubmitted: true,
          runnerTaskId,
          idempotencyToken,
          resultCapture: {
            schema: 'idb.runner-result-capture.v1',
            status: 'completed_result_capture_ready',
            runnerTaskId,
            idempotencyToken,
            sourceRequestId,
            buildAttemptId,
            submittedAt,
            resultCaptureCursor: `file:${found.fileId}`,
            sourceFileId: found.fileId,
            sourceFileName: found.fileName,
            lookupStatus: 'resolved_by_csv_import',
            lookupSource: found.lookupSource || '',
            finalGeneratedNamesReady: true,
            finalGeneratedNamesJson: promoted.completed,
            completedResultJson: promoted.completed,
            generatedNamesJson: promoted.completed,
            sidecarGeneratedNamesJson: promoted.completed,
            runnerLaneVocabularyPolicy: promoted.completed.runnerLaneVocabularyPolicy || null,
            transactionResolution: promoted.transactionResolution
          },
          finalGeneratedNamesJson: promoted.completed,
          completedResultJson: promoted.completed,
          generatedNamesJson: promoted.completed,
          sidecarGeneratedNamesJson: promoted.completed,
          runnerLaneVocabularyPolicy: promoted.completed.runnerLaneVocabularyPolicy || null,
          finalGeneratedNamesJsonReady: true,
          activeOpenLinks: activeOpenLinksFromCompletedPayloadW470(promoted.completed),
          generatedRecordOwner: 'governed_runner_internal_build_engine'
        };
      }
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        adapterVersion: ADAPTER_VERSION,
        status: 'polling_pending',
        queueSubmitted: true,
        runnerTaskId,
          idempotencyToken,
          sourceRequestId,
          buildAttemptId,
          submittedAt,
          resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_transaction_resolution',
            runnerTaskId,
            idempotencyToken,
            sourceRequestId,
            buildAttemptId,
            submittedAt,
            resultCaptureCursor: `file:${found.fileId}`,
          sourceFileId: found.fileId,
          sourceFileName: found.fileName,
            lookupStatus: 'pending_transaction_resolution',
            lookupSource: found.lookupSource || '',
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null,
          partialGeneratedNamesJson: pendingSidecar.partialGeneratedNamesJson,
          transactionResolution: Object.assign({}, pendingSidecar.transactionResolution, {
            lookupStatus: promoted.reason || 'pending_transaction_resolution',
            candidates: promoted.candidates || []
          })
        },
        finalGeneratedNamesJson: null,
        finalGeneratedNamesJsonReady: false,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_runner_internal_build_engine'
      };
    }
    const keyedCompletedW455 = completedKeyedResultCaptureW455(parsed);
    if (keyedCompletedW455.ready) {
      const salesOrderPromotionW458 = promoteCompletedKeyedSalesOrderW458(keyedCompletedW455.payload, modules);
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        adapterVersion: ADAPTER_VERSION,
        status: keyedCompletedW455.status === 'completed_with_wip_diagnostic' ? 'completed_with_wip_diagnostic' : 'completed_runner_result_ready',
        queueSubmitted: true,
        runnerTaskId,
        idempotencyToken,
        sourceRequestId,
        buildAttemptId,
        submittedAt,
        resultCapture: Object.assign({}, parsed, {
          schema: 'idb.runner-result-capture.v1',
          status: keyedCompletedW455.status,
          runnerTaskId,
          idempotencyToken,
          sourceRequestId,
          buildAttemptId,
          submittedAt,
          resultCaptureCursor: `file:${found.fileId}`,
          sourceFileId: found.fileId,
          sourceFileName: found.fileName,
          lookupSource: found.lookupSource || '',
          salesOrderPromotionW458,
          finalGeneratedNamesReady: true,
          finalGeneratedNamesJson: keyedCompletedW455.payload,
          completedResultJson: keyedCompletedW455.payload,
          generatedNamesJson: keyedCompletedW455.payload,
          sidecarGeneratedNamesJson: keyedCompletedW455.payload
        }),
        finalGeneratedNamesJson: keyedCompletedW455.payload,
        completedResultJson: keyedCompletedW455.payload,
        generatedNamesJson: keyedCompletedW455.payload,
        sidecarGeneratedNamesJson: keyedCompletedW455.payload,
        finalGeneratedNamesJsonReady: true,
        activeOpenLinks: activeOpenLinksFromCompletedPayloadW470(keyedCompletedW455.payload),
        generatedRecordOwner: 'governed_runner_internal_build_engine'
      };
    }
    const normalized = normalizeCompletedRunnerResult(parsed);
    if (!normalized.valid) {
      return adapterPollError(runnerTaskId, idempotencyToken, normalized.errors.join(' '), cursor, found);
    }
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      adapterVersion: ADAPTER_VERSION,
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId,
      idempotencyToken,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'completed_result_capture_ready',
        runnerTaskId,
        idempotencyToken,
        sourceRequestId,
        buildAttemptId,
        submittedAt,
        resultCaptureCursor: `file:${found.fileId}`,
        sourceFileId: found.fileId,
        sourceFileName: found.fileName,
        lookupSource: found.lookupSource || '',
        finalGeneratedNamesReady: true,
        finalGeneratedNamesJson: normalized.completed,
        completedResultJson: normalized.completed,
        generatedNamesJson: normalized.completed,
        sidecarGeneratedNamesJson: normalized.completed
      },
      finalGeneratedNamesJson: normalized.completed,
      completedResultJson: normalized.completed,
      generatedNamesJson: normalized.completed,
      sidecarGeneratedNamesJson: normalized.completed,
      finalGeneratedNamesJsonReady: true,
      activeOpenLinks: activeOpenLinksFromCompletedPayloadW470(normalized.completed),
      generatedRecordOwner: 'governed_runner_internal_build_engine'
    };
  }

  function adapterPollError(runnerTaskId, idempotencyToken, message, cursor, found) {
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      adapterVersion: ADAPTER_VERSION,
      status: 'adapter_error',
      error: true,
      errorMessage: message,
      queueSubmitted: false,
      runnerTaskId: runnerTaskId || null,
      idempotencyToken: idempotencyToken || null,
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'adapter_error',
        error: true,
        runnerTaskId: runnerTaskId || null,
        idempotencyToken: idempotencyToken || null,
        resultCaptureCursor: cursor || null,
        sourceFileId: found && found.fileId || null,
        sourceFileName: found && found.fileName || null,
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0,
      generatedRecordOwner: 'governed_runner_internal_build_engine'
    };
  }

  function buildAdapterResult(request, config, operatorGate, parseErrors) {
    const requestValidation = validateConfirmedRequest(request);
    const configValidation = validateRunnerConfig(config);
    const operatorValidation = validateOperatorQueueGate(operatorGate);
    const errors = []
      .concat(parseErrors || [])
      .concat(requestValidation.errors || [])
      .concat(configValidation.errors || [])
      .concat(operatorValidation.errors || []);
    const queueGate = buildQueueGate(requestValidation, configValidation, operatorValidation, config);
    const idempotencyToken = requestValidation.valid ? buildIdempotencyToken(request) : '';
    let namingPackHandoff = { fileId: null, status: errors.length ? 'blocked_before_naming_pack' : 'not_attempted' };
    if (!errors.length && queueGate.canSubmit) {
      try {
        namingPackHandoff = createNamingPackFile(request, config, idempotencyToken);
        if (!namingPackHandoff.fileId && namingPackHandoff.status !== 'clean_naming_pack_omitted_runner_deterministic_fallback') errors.push('server naming pack file was not created before runner submit.');
      } catch (namingError) {
        namingPackHandoff = {
          fileId: null,
          status: 'naming_pack_create_failed',
          errorName: namingError && (namingError.name || namingError.id) ? String(namingError.name || namingError.id) : 'NAMING_PACK_CREATE_FAILED',
          errorMessage: namingError && namingError.message ? String(namingError.message) : String(namingError || 'Naming pack create failed.')
        };
        errors.push(namingPackHandoff.errorMessage);
      }
    }
    const submitGate = errors.length
      ? Object.assign({}, queueGate, {
        canSubmit: false,
        queueReadinessStatus: 'blocked_no_submit',
        gates: Object.assign({}, queueGate.gates || {}, { namingPackCreated: false })
      })
      : Object.assign({}, queueGate, {
        gates: Object.assign({}, queueGate.gates || {}, { namingPackCreated: !!namingPackHandoff.fileId })
      });
    const runnerParams = !errors.length ? buildRunnerParams(request, config, idempotencyToken, namingPackHandoff.fileId) : {};
    const queueSubmit = submitRunnerIfAllowed(submitGate, config, runnerParams);
    const adapterError = queueSubmit.error === true;
    const runnerBusy = queueSubmit.status === 'runner_busy_inprogress';

    return {
      schema: 'idb.governed-runner-adapter-result.v1',
      adapterVersion: ADAPTER_VERSION,
      status: adapterError ? 'adapter_error' : (runnerBusy ? 'runner_busy_inprogress' : (queueSubmit.queueSubmitted ? 'queued_result_capture_pending' : (errors.length ? 'blocked_validation_failed' : 'validated_not_submitted'))),
      runnerStatus: adapterError ? 'adapter_error' : (runnerBusy ? 'runner_busy_inprogress' : (queueSubmit.queueSubmitted ? 'queued_result_capture_pending' : (errors.length ? 'blocked_validation_failed' : 'validated_not_submitted'))),
      runMode: queueSubmit.queueSubmitted ? 'governed_sandbox_queue_submit' : (runnerBusy ? 'runner_busy_wait_for_current_scheduled_task' : 'write_disabled_or_gate_blocked_no_submit'),
      error: adapterError,
      errorName: queueSubmit.errorName || '',
      errorMessage: queueSubmit.errorMessage || '',
      errorStack: queueSubmit.errorStack || '',
      retryable: runnerBusy === true,
      retryAfterMs: runnerBusy ? queueSubmit.retryAfterMs : null,
      busyReason: runnerBusy ? queueSubmit.reason : '',
      createsRecords: false,
      queueSubmitted: queueSubmit.queueSubmitted,
      runnerTaskId: queueSubmit.runnerTaskId,
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      sourceRequestId: request && request.requestId ? String(request.requestId) : '',
      buildAttemptId: request && (request.buildAttemptId || request.buildAttemptProvenance && request.buildAttemptProvenance.buildAttemptId) ? String(request.buildAttemptId || request.buildAttemptProvenance.buildAttemptId) : '',
      submittedAt: request && (request.submittedAt || request.buildAttemptProvenance && request.buildAttemptProvenance.submittedAt) ? String(request.submittedAt || request.buildAttemptProvenance.submittedAt) : '',
      idempotencyToken,
      runnerRuntimeConfig: redactRuntimeConfig(config),
      runnerParams: runnerParams,
      namingPackHandoff,
      queueGate: submitGate,
      queueSubmit,
      resultCapture: resultCapturePending(idempotencyToken, queueSubmit, request),
      noSubmitRollback: {
        supported: true,
        performed: !queueSubmit.queueSubmitted,
        behavior: queueSubmit.queueSubmitted
          ? 'Queue submit occurred only after every W144 server-side gate passed; no drawer rollback or record rollback is available from IDB.'
          : 'The adapter stopped before scheduled task submit; no NetSuite records or transactions were created.'
      },
      finalGeneratedNamesImport: {
        schema: 'idb.internal-build-engine.real-record-result.v1',
        runStatus: queueSubmit.queueSubmitted ? 'queued_result_capture_pending' : 'dry_run_validated_not_submitted',
        prospect: request && request.prospect ? String(request.prospect.name || '') : '',
        generatedRecordOwner: 'governed_runner_internal_build_engine',
        recordExistenceStatus: queueSubmit.queueSubmitted ? 'pending_runner_completion' : 'not_created_dry_run',
        warnings: ['No record ids or URLs are returned by W144. Drawer Open links remain unavailable until result capture returns real NetSuite URLs.'],
        errors: [],
        recoverableBlockers: []
      },
      validation: {
        valid: errors.length === 0,
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        operatorGateValid: operatorValidation.valid,
        errors
      }
    };
  }

  function redactRuntimeConfig(config) {
    return {
      schema: config.schema,
      accountIdPresent: !!config.accountId,
      sandboxAccountAllowlistCount: config.sandboxAccountAllowlist.length,
      runnerScriptIdPresent: !!config.runnerScriptId,
      runnerDeployIdPresent: !!config.runnerDeployId,
      mappingIdPresent: !!config.mappingId,
      folderIdPresent: !!config.folderId,
      subsidiaryIdPresent: !!config.subsidiaryId,
      locationIdPresent: !!config.locationId,
      workCenterSearchIdPresent: !!config.workCenterSearchId,
      resultCaptureFolderIdPresent: !!config.resultCaptureFolderId,
      createEnabled: config.createEnabled,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled,
      queueSubmitEnabled: config.queueSubmitEnabled
    };
  }

  return {
    onRequest,
    _test: {
      resolveRunnerConfig,
      validateConfirmedRequest,
      validateRunnerConfig,
      validateOperatorQueueGate,
      buildIdempotencyToken,
      buildRunnerParams,
      buildQueueGate,
      submitRunnerIfAllowed,
      buildServerPrecomputedNamingPack,
      normalizeSelectedToggles,
      buildCatalogCandidatesW457,
      rankCatalogCandidatesW457,
      selectedCatalogCandidateRejectedReasonW464,
      buildAdapterResult,
      buildResultCapturePollEnvelope,
      normalizeCompletedRunnerResult,
      findResultCaptureFile
    }
  };
});
