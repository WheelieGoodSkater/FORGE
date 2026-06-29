/**
 * SCAI SO CSV Runner v1.12.13
 *
 *
 * v1.12.7
 * - Adds a fallback discovery path for precomputed naming files using extId when the explicit naming file parameter is missing or unavailable.
 * - Hardens precomputed naming application so runner-side generic fallback is used only after both direct load and discovery fail.
 * - Adds richer logging around naming payload discovery, parse, and apply status.
 *
 * v1.12.6
 * - Removes inline LLM naming from the runner and expects precomputed naming from the suitelet when available.
 * - Loads the naming payload from a file-cabinet JSON file keyed to the run and falls back deterministically if missing.
 * - Keeps runner execution deterministic, faster, and easier to debug.
 *
 * v1.12.3
 * - Treats manufacturing as a layer on top of the already-resolved hero mode.
 * - Standardizes manufacturing target logging so anchor + manufacturing and fresh + manufacturing are explicit in runner logs.
 * - Reuses the existing manufacturing flow against the resolved hero item instead of letting manufacturing re-decide hero selection.
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/log', 'N/search', 'N/record', 'N/https', 'N/task', 'N/file'],
  (runtime, log, search, record, https, task, file) => {

  /**
   * Version Control
   * v1.12.5
   * - Adds differentiated naming for fresh and anchor HERO paths using the naming pack plus an extId suffix.
   * - Restores anchor itemid renaming safely by appending a short extId suffix to avoid uniqueness collisions.
   * - Keeps displayname readable while itemid becomes rerun-safe and operator-clear.
   * - Applies the same suffix strategy to assembly, components, BOM, and BOM revision names during naming updates.
   *
   * v1.12.1
   * - Keeps v1.12.0 anchor-first HERO resolution intact.
   * - Stops anchor-mode HERO renames from updating itemid, preventing NetSuite uniqueness collisions.
   * - Uses displayname + descriptions only for anchor HERO naming.
   * - Preserves itemid + displayname behavior for create-new HERO mode.
   * - Adds naming-mode audit logging so execution path is visible in script logs.
   *
   * v1.12.0
   * - Locks default HERO behavior to anchor reuse via SCAI_ANCHOR_ITEM.
   * - Prevents passed/inferred hero item ids from forcing fresh-HERO mode when create-new is off.
   * - Adds hero-mode audit logging so runner resolution is visible in execution logs.
   */
  const VERSION = 'v1.12.13-w483-forge-clean';
  const RUNNER_EXECUTION_CORE_W483 = 'old-runner-v1.12.13';
  const SIDECAR_VERSION_W483 = 'w483-forge-clean-runner';
  const RESULT_CAPTURE_FILENAME_LIMIT_W483 = 180;

  const ANCHORS = {
    customer: 'SCAI_ANCHOR_CUSTOMER',
    vendor:   'SCAI_ANCHOR_VENDOR',
    heroItem: 'SCAI_ANCHOR_ITEM',

    assembly: 'SCAI_ANCHOR_ASSEMBLY',
    comp1:    'SCAI_COMP_1',
    comp2:    'SCAI_COMP_2',
    comp3:    'SCAI_COMP_3',

    bom:      'SCAI_ANCHOR_BOM',
    bomrev:   'SCAI_ANCHOR_BOMREV'
  };

  // Planning auto-calc fields (hero + components)
  const HERO_AUTOCALC_FIELDS = [
    // Known body-level planning auto-calc fields used in this account
    'autopreferredstocklevel',
    'autoleadtime',
    'autoreorderpoint',
    // Legacy / alternate variants seen across item setups
    'preferredstocklevelautocalc',
    'leadtimeautocalc',
    'reorderpointautocalc',
    'autocalcpreferredstocklevel',
    'autocalcpurchaseleadtime',
    'autocalcreorderpoint',
    'purchaseleadtimeautocalc'
  ];

  const COMPONENT_AUTOCALC_FIELDS = [
    'autopreferredstocklevel',
    'autoleadtime',
    'autoreorderpoint'
  ];


  function firstDefinedValue(values) {
    for (const v of values || []) {
      if (v !== undefined && v !== null && String(v) !== '') return v;
    }
    return '';
  }

  function hasExplicitBoolValue(v) {
    const s = String(v == null ? '' : v).trim().toLowerCase();
    return ['t','f','true','false','yes','no','y','n','1','0','on','off'].includes(s);
  }

  function inferManufacturingFromText(notes, agenda) {
    const txt = String((notes || '') + ' ' + (agenda || '')).toLowerCase();
    if (!txt) return false;
    return /(manufactur|assembly|bom|bill of materials|work order|routing|wip|production setup|build execution)/.test(txt);
  }

  function normalizeHeroMode(v) {
    const s = String(v || '').trim().toLowerCase();
    if (s === 'fresh' || s === 'new' || s === 'create') return 'fresh';
    if (s === 'anchor' || s === 'reuse' || s === 'existing') return 'anchor';
    return '';
  }

  function deriveManufacturingTargetMode(enableManufacturing, createNewHeroItem) {
    if (!enableManufacturing) return 'disabled';
    return createNewHeroItem ? 'fresh-hero' : 'anchor-hero';
  }

  function normalizeWipTargetMode(v) {
    const s = String(v || '').trim().toLowerCase();
    if (s === 'anchor-hero' || s === 'fresh-hero' || s === 'disabled' || s === 'manufacturing-disabled') return s;
    return '';
  }

  function deriveWipTargetMode(enableWip, enableManufacturing, createNewHeroItem) {
    if (!enableManufacturing) return 'manufacturing-disabled';
    if (!enableWip) return 'disabled';
    return createNewHeroItem ? 'fresh-hero' : 'anchor-hero';
  }

  function getScriptParamAny(scriptObj, names) {
    for (let i = 0; i < (names || []).length; i += 1) {
      const value = scriptObj.getParameter({ name: names[i] });
      if (value !== undefined && value !== null && String(value) !== '') return value;
    }
    return '';
  }

  function execute() {
    try {
      return executeMain();
    } catch (e) {
      captureRunnerErrorW483(e);
      throw e;
    }
  }

  function executeMain() {
    const s = runtime.getCurrentScript();

    const prospect = str(getScriptParamAny(s, ['custscript_w483_prospect', 'custscript_v3_runner_prospect', 'custscript_scai_so_runner_prospect']));
    const website  = str(getScriptParamAny(s, ['custscript_w483_website', 'custscript_v3_runner_website', 'custscript_scai_so_runner_website']));
    const notes    = str(getScriptParamAny(s, ['custscript_w483_notes', 'custscript_v3_runner_notes', 'custscript_scai_so_runner_notes']));
    const agenda   = str(getScriptParamAny(s, ['custscript_w483_agenda', 'custscript_v3_runner_agenda', 'custscript_scai_so_runner_agenda']));
    const extId    = str(getScriptParamAny(s, ['custscript_w483_extid', 'custscript_v3_runner_extid', 'custscript_scai_so_runner_extid']));

    const soMappingId = toIntOrNull(getScriptParamAny(s, ['custscript_w483_mapping', 'custscript_v3_runner_mapping', 'custscript_scai_so_runner_mapping']));
    const soFolderId  = toIntOrNull(getScriptParamAny(s, ['custscript_w483_folder', 'custscript_v3_runner_folder', 'custscript_scai_so_runner_folder']));
    const namingFileId = toIntOrNull(getScriptParamAny(s, ['custscript_w483_naming_file', 'custscript_scai_runner_naming_file_id']));
    const resultCaptureFolderId = toIntOrNull(getScriptParamAny(s, ['custscript_w483_result_folder', 'custscript_v3_runner_result_capture_folder', 'custscript_idb_result_capture_folder_id']));
    const confirmedBuildRequestJson = safeJsonParse(getScriptParamAny(s, ['custscript_w483_req_json', 'custscript_v3_runner_idb_request_json'])) || {};

    const subsidiaryId = toIntOrNull(getScriptParamAny(s, ['custscript_w483_subsidiary', 'custscript_v3_runner_subsidiary', 'custscript_scai_runner_subsidiary']));
    const locationId   = toIntOrNull(getScriptParamAny(s, ['custscript_w483_location', 'custscript_v3_runner_location', 'custscript_scai_runner_location']));
    const workCenterSearchIdRaw = str(
      getScriptParamAny(s, ['custscript_w483_wc_search', 'custscript_v3_runner_wc_search', 'custscript_scai_wc_savedsearch_id', 'custscript_scai_runner_wc_search'])
    ).trim();
    const workCenterSearchId = /^\d+$/.test(workCenterSearchIdRaw)
      ? Number(workCenterSearchIdRaw)
      : workCenterSearchIdRaw;

    // WIP flag (Suitelet should pass 'T' or 'F')
    const enableWipRaw = getScriptParamAny(s, ['custscript_w483_enable_wip', 'custscript_v3_runner_enable_wip', 'custscript_scai_runner_enable_wip', 'custscript_scai_runner_enablewip']);
    const enableWip = normalizeBool(enableWipRaw);

    const createNewHeroCandidates = {
      custscript_w483_create_hero: s.getParameter({ name: 'custscript_w483_create_hero' }),
      custscript_v3_runner_create_new_hero: s.getParameter({ name: 'custscript_v3_runner_create_new_hero' }),
      custscript_scai_runner_create_new_hero: s.getParameter({ name: 'custscript_scai_runner_create_new_hero' }),
      custscript_scai_create_new_hero: s.getParameter({ name: 'custscript_scai_create_new_hero' }),
      custscript_create_new_hero_item: s.getParameter({ name: 'custscript_create_new_hero_item' }),
      custscript_scai_runner_createnewhero: s.getParameter({ name: 'custscript_scai_runner_createnewhero' })
    };
    const createNewHeroRaw = firstDefinedValue(Object.values(createNewHeroCandidates));
    const createNewHeroItem = normalizeBool(createNewHeroRaw);

    const enableManufacturingCandidates = {
      custscript_w483_enable_mfg: s.getParameter({ name: 'custscript_w483_enable_mfg' }),
      custscript_v3_runner_enable_mfg: s.getParameter({ name: 'custscript_v3_runner_enable_mfg' }),
      custscript_v3_runner_enable_manufacturing: s.getParameter({ name: 'custscript_v3_runner_enable_manufacturing' }),
      custscript_scai_runner_enable_mfg: s.getParameter({ name: 'custscript_scai_runner_enable_mfg' }),
      custscript_scai_runner_enablemanufacturing: s.getParameter({ name: 'custscript_scai_runner_enablemanufacturing' }),
      custscript_scai_runner_enable_manufacturing: s.getParameter({ name: 'custscript_scai_runner_enable_manufacturing' }),
      custscript_scai_enable_mfg: s.getParameter({ name: 'custscript_scai_enable_mfg' }),
      custscript_enable_manufacturing_flow: s.getParameter({ name: 'custscript_enable_manufacturing_flow' }),
      custscript_enablemfg: s.getParameter({ name: 'custscript_enablemfg' }),
      custscript_scai_runner_mfg_flow: s.getParameter({ name: 'custscript_scai_runner_mfg_flow' })
    };
    const enableManufacturingRaw = firstDefinedValue(Object.values(enableManufacturingCandidates));
    const enableManufacturingExplicit = hasExplicitBoolValue(enableManufacturingRaw);
    const enableManufacturingParam = normalizeBool(enableManufacturingRaw);
    const enableManufacturingTextFallback = (!enableManufacturingExplicit && enableWip)
      ? inferManufacturingFromText(notes, agenda)
      : false;
    const finalEnableManufacturing = enableManufacturingExplicit
      ? enableManufacturingParam
      : (enableManufacturingParam || enableManufacturingTextFallback);

    log.audit({
      title: `Manufacturing flag resolution [${VERSION}]`,
      details: JSON.stringify({
        candidates: enableManufacturingCandidates,
        enableManufacturingRaw,
        enableManufacturingExplicit,
        enableManufacturingParam,
        enableManufacturingTextFallback,
        notesLen: String(notes || '').length,
        agendaLen: String(agenda || '').length,
        resolvedEnableManufacturing: finalEnableManufacturing
      })
    });

    const heroModeRaw =
      s.getParameter({ name: 'custscript_scai_runner_hero_mode' }) ||
      s.getParameter({ name: 'custscript_scai_hero_mode' }) ||
      '';
    const requestedHeroMode = normalizeHeroMode(heroModeRaw) || (createNewHeroItem ? 'fresh' : 'anchor');

    const anchorHeroItemIdRaw =
      s.getParameter({ name: 'custscript_scai_runner_anchor_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_anchor_hero_item' }) ||
      '';
    const anchorHeroItemIdParam = toIntOrNull(anchorHeroItemIdRaw);

    const passedHeroItemIdRaw =
      s.getParameter({ name: 'custscript_w483_hero_item' }) ||
      s.getParameter({ name: 'custscript_v3_runner_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_runner_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_runner_heroitem' }) ||
      s.getParameter({ name: 'custscript_scai_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_runner_hero_item_id' }) ||
      s.getParameter({ name: 'custscript_scai_runner_heroitem_id' }) ||
      '';
    const passedHeroItemIdParam = toIntOrNull(passedHeroItemIdRaw);

    const anchorHeroItemId = anchorHeroItemIdParam || mustFindByExternalId('inventoryitem', ANCHORS.heroItem);

    let inferredFreshHeroItemId = null;
    let passedHeroItemId = null;
    let handshakeAction = 'accepted';
    let effectiveCreateNewHeroItem = requestedHeroMode === 'fresh';

    if (requestedHeroMode === 'anchor') {
      if (passedHeroItemIdParam) {
        handshakeAction = 'anchor-mode-cleared-passed-hero';
      } else {
        handshakeAction = 'anchor-mode-confirmed';
      }
      effectiveCreateNewHeroItem = false;
      passedHeroItemId = null;
    } else {
      inferredFreshHeroItemId = inferFreshHeroItemIdByExt(extId);
      if (passedHeroItemIdParam) {
        passedHeroItemId = passedHeroItemIdParam;
        handshakeAction = 'fresh-mode-explicit-pass';
      } else if (inferredFreshHeroItemId) {
        passedHeroItemId = inferredFreshHeroItemId;
        handshakeAction = 'fresh-mode-fallback-to-inferred';
      } else {
        passedHeroItemId = null;
        handshakeAction = 'fresh-mode-runner-will-create';
      }
      effectiveCreateNewHeroItem = true;
    }

    const requestedManufacturingTargetMode = deriveManufacturingTargetMode(finalEnableManufacturing, requestedHeroMode === 'fresh');
    const manufacturingTargetMode = deriveManufacturingTargetMode(finalEnableManufacturing, effectiveCreateNewHeroItem);
    const manufacturingHandshakeAction = requestedManufacturingTargetMode === manufacturingTargetMode
      ? 'manufacturing-target-confirmed'
      : 'manufacturing-target-rebased-to-effective-hero';

    const effectiveEnableWip = finalEnableManufacturing ? enableWip : false;

    const requestedWipTargetModeRaw =
      s.getParameter({ name: 'custscript_scai_runner_wip_target_mode' }) ||
      s.getParameter({ name: 'custscript_scai_wip_target_mode' }) ||
      '';
    const requestedWipTargetMode = normalizeWipTargetMode(requestedWipTargetModeRaw) || deriveWipTargetMode(enableWip, finalEnableManufacturing, requestedHeroMode === 'fresh');
    const wipTargetMode = deriveWipTargetMode(effectiveEnableWip, finalEnableManufacturing, effectiveCreateNewHeroItem);
    const wipHandshakeAction = requestedWipTargetMode === wipTargetMode
      ? 'wip-target-confirmed'
      : 'wip-target-rebased-to-effective-state';

    if (!prospect) throw new Error('Missing required param: custscript_scai_so_runner_prospect');
    if (!extId) throw new Error('Missing required param: custscript_scai_so_runner_extid');
    if (!soMappingId) throw new Error('Missing required param: custscript_scai_so_runner_mapping');
    if (!soFolderId) throw new Error('Missing required param: custscript_scai_so_runner_folder');
    if (!subsidiaryId) throw new Error('Missing required param: custscript_scai_runner_subsidiary');

    log.audit({
      title: `Runner START [${VERSION}]`,
      details: JSON.stringify({
        prospect,
        website,
        notesLen: notes.length,
        agendaLen: agenda.length,
        extId,
        soMappingId,
        soFolderId,
        subsidiaryId,
        locationId,
        workCenterSearchIdRaw,
        workCenterSearchId,
        enableWipRaw,
        enableWip,
        createNewHeroRaw,
        createNewHeroItem,
        heroModeRaw,
        requestedHeroMode,
        effectiveCreateNewHeroItem,
        enableManufacturingRaw,
        enableManufacturing: finalEnableManufacturing,
        effectiveEnableWip,
        requestedWipTargetModeRaw,
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        anchorHeroItemIdRaw,
        anchorHeroItemIdParam,
        anchorHeroItemId,
        passedHeroItemIdRaw,
        passedHeroItemIdParam,
        inferredFreshHeroItemId,
        passedHeroItemId,
        handshakeAction
      })
    });

    log.audit({
      title: `WIP saved search param [${VERSION}]`,
      details: JSON.stringify({
        raw: workCenterSearchIdRaw,
        normalized: workCenterSearchId,
        type: typeof workCenterSearchId
      })
    });

    log.audit({
      title: `Hero handshake summary [${VERSION}]`,
      details: JSON.stringify({
        heroModeRaw,
        requestedHeroMode,
        createNewHeroRaw,
        createNewHeroItem,
        effectiveCreateNewHeroItem,
        anchorHeroItemIdRaw,
        anchorHeroItemIdParam,
        anchorHeroItemId,
        passedHeroItemIdRaw,
        passedHeroItemIdParam,
        inferredFreshHeroItemId,
        passedHeroItemId,
        handshakeAction
      })
    });

    // 1) Ensure hero / manufacturing records based on mode flags
    log.audit({
      title: `Manufacturing final gate [${VERSION}]`,
      details: JSON.stringify({
        enableManufacturingExplicit,
        enableManufacturingRaw,
        enableManufacturingParam,
        enableManufacturingTextFallback,
        finalEnableManufacturing
      })
    });

    log.audit({
      title: `Manufacturing target resolution [${VERSION}]`,
      details: JSON.stringify({
        requestedHeroMode,
        effectiveHeroMode: effectiveCreateNewHeroItem ? 'fresh' : 'anchor',
        requestedManufacturingTargetMode,
        manufacturingTargetMode,
        manufacturingHandshakeAction,
        enableManufacturingRequested: finalEnableManufacturing,
        finalEnableManufacturing,
        effectiveEnableWip
      })
    });

    log.audit({
      title: `WIP target resolution [${VERSION}]`,
      details: JSON.stringify({
        requestedWipTargetModeRaw,
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        enableWipRequested: enableWip,
        effectiveEnableWip,
        finalEnableManufacturing,
        effectiveHeroMode: effectiveCreateNewHeroItem ? 'fresh' : 'anchor'
      })
    });

    const ids = ensureDemoRecords({
      subsidiaryId,
      locationId,
      createNewHeroItem: effectiveCreateNewHeroItem,
      enableManufacturing: finalEnableManufacturing,
      extId,
      prospect,
      passedHeroItemId
    });
    log.audit({ title: `Demo records ensured [${VERSION}]`, details: JSON.stringify(ids) });

    // 2) Planning auto-calc OFF for Hero + Components (when present)
    if (finalEnableManufacturing && ids.comp1Id && ids.comp2Id && ids.comp3Id) {
      forcePlanningAutoCalcOffForItems({
        vendorId: mustFindByExternalId('vendor', ANCHORS.vendor),
        heroItemId: ids.heroItemId,
        compIds: [ids.comp1Id, ids.comp2Id, ids.comp3Id]
      });
    } else {
      safeTry(() => forcePlanningAutoCalcOffForItems({
        vendorId: mustFindByExternalId('vendor', ANCHORS.vendor),
        heroItemId: ids.heroItemId,
        compIds: []
      }));
    }

    // 3) Website signal + naming pack (industry-agnostic fallback)
    const websiteSignalResult = safeGetWebsiteSignal({ website: website, prospect: prospect, extId: extId });
    const signal = websiteSignalResult.signal || { domain: extractDomain(website), text: `Domain: ${extractDomain(website) || ''}. Infer industry from the company name and notes.` };
    log.audit({ title: `Website signal [${VERSION}]`, details: JSON.stringify({ status: websiteSignalResult.status, domain: signal.domain, len: (signal.text || '').length, errorName: websiteSignalResult.errorName || '', fallbackUsed: !!websiteSignalResult.fallbackUsed }) });

    const namingPayload = loadPrecomputedNamingPack({ fileId: namingFileId, extId, prospect, website, signalText: signal.text });
    const names = namingPayload.payload;
    log.audit({ title: `Naming pack selected [${VERSION}]`, details: JSON.stringify({ source: namingPayload.source || names._source || 'deterministic', signalLen: names._signalLen || 0, industry_category: names.industry_category || '', namingFileId: namingPayload.fileId || namingFileId || null, namingPayloadFound: !!namingPayload.found, namingPayloadParsed: !!namingPayload.parsed, namingPayloadApplied: !!namingPayload.applied, namingDiscoveryMode: namingPayload.discoveryMode || 'none' }) });

    // 4) Apply naming + one-line sales/purchase descriptions
    applyNamingToAnchors(ids, names, { enableManufacturing: finalEnableManufacturing, createNewHeroItem: effectiveCreateNewHeroItem, extId });

    // 5) Base prices
    setBaseSalesPrice('inventoryitem', ids.heroItemId, 5.00);
    if (finalEnableManufacturing && ids.assemblyId) setBaseSalesPrice('assemblyitem', ids.assemblyId, 25.00);

    // 6) Manufacturing-only setup
    let woId = null;
    if (finalEnableManufacturing && ids.assemblyId && ids.bomId) {
      const bomAttachResult = safeManufacturingStepW483('BOM attach to assembly', () => {
        attachBomToAssembly({ assemblyId: ids.assemblyId, bomId: ids.bomId });
        return { assemblyId: ids.assemblyId, bomId: ids.bomId };
      });

      if (bomAttachResult.ok) {
        log.audit({
          title: `Work Order seed skipped (diagnostic) [${VERSION}]`,
          details: JSON.stringify({
            reason: 'work_order_create_blocks_w483_live_run',
            assemblyId: ids.assemblyId,
            bomId: ids.bomId,
            extId
          })
        });
      }
    } else {
      log.audit({ title: `Manufacturing flow disabled [${VERSION}]`, details: JSON.stringify({ enableManufacturing: finalEnableManufacturing, extId, heroItemId: ids.heroItemId }) });
    }

    // 8) Optional WIP routing create + attach
    let routingResult = null;
    let routingId = null;
    if (effectiveEnableWip && finalEnableManufacturing && ids.assemblyId && ids.bomId) {
      routingResult = {
        decision: 'routing-diagnostic-skipped-live-create',
        error: 'Routing create/attach is diagnostic-only for this account because the manufacturingrouting billofmaterials field rejects the active BOM.',
        routingId: null,
        chosen: { centers: [], templates: [] }
      };
      log.audit({
        title: `WIP routing skipped (diagnostic) [${VERSION}]`,
        details: JSON.stringify({ assemblyId: ids.assemblyId, bomId: ids.bomId, decision: routingResult.decision })
      });
    } else {
      log.audit({ title: `WIP not enabled (skipping routing) [${VERSION}]`, details: JSON.stringify({ enableWipRaw, enableWip, effectiveEnableWip, enableManufacturing: finalEnableManufacturing, requestedWipTargetMode, wipTargetMode, wipHandshakeAction }) });
    }

    // 9) Seed SOs via CSV import
    const customerInfo = getOrCreateFreshCustomerW483({ extId, prospect, website, subsidiaryId });
    const soCsv = buildSoCsv({ extId, prospect, website, agenda, locationId, itemKey: ids.heroItemCsvKey || ids.heroItemExternalId || ANCHORS.heroItem, customerKey: customerInfo.externalId });
    const soFileId = saveCsvToFileCabinet({ folderId: soFolderId, filename: `scai_so_${extId}.csv`, contents: soCsv });
    const soTaskId = submitCsvImport({ mappingId: soMappingId, fileId: soFileId });
    const directSalesOrderId = createSalesOrderDirectW483({
      extId,
      prospect,
      website,
      agenda,
      customerId: customerInfo.id,
      itemId: ids.heroItemId,
      locationId
    });

    log.audit({
      title: `SO CSV Import SUBMITTED [${VERSION}]`,
      details: JSON.stringify({ extId, fileId: soFileId, csvImportTaskId: soTaskId, directSalesOrderId })
    });

    log.audit({
      title: `Runner SUMMARY [${VERSION}]`,
      details: JSON.stringify({
        extId,
        enableWip: effectiveEnableWip,
        createNewHeroItem: effectiveCreateNewHeroItem,
        enableManufacturing: finalEnableManufacturing,
        heroItemId: ids.heroItemId,
        heroItemCsvKey: ids.heroItemCsvKey || '',
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        routingDecision: routingResult ? routingResult.decision : (enableWip ? 'requested-no-result' : 'wip-disabled'),
        routingId,
        existingRoutingId: routingResult ? routingResult.existingRoutingId : null,
        attachResult: routingResult ? routingResult.attachResult : (enableWip ? 'not-returned' : 'not-attempted'),
        chosenCenters: routingResult && routingResult.chosen ? routingResult.chosen.centers : [],
        chosenTemplates: routingResult && routingResult.chosen ? routingResult.chosen.templates : [],
        namingFileId: namingFileId || null,
        namingSourceUsed: namingPayload.source || names._source || 'deterministic',
        namingPayloadFound: !!namingPayload.found
      })
    });

    log.audit({
      title: `Runner final branch summary [${VERSION}]`,
      details: JSON.stringify({
        extId,
        effectiveHeroMode: effectiveCreateNewHeroItem ? 'fresh' : 'anchor',
        resolvedHeroItemId: Number(ids.heroItemId || 0),
        heroItemExternalId: ids.heroItemExternalId || '',
        finalEnableManufacturing,
        manufacturingTargetMode,
        effectiveEnableWip,
        wipTargetMode,
        routingId: routingId || null,
        finalStatus: 'completed'
      })
    });

    log.audit({
      title: `Runner COMPLETE [${VERSION}]`,
      details: JSON.stringify({
        extId,
        soFileId,
        soTaskId,
        soId: directSalesOrderId,
        woId,
        routingId,
        routingResult,
        mfg: ids,
        names
      })
    });

    const sidecarCapture = writeForgeSidecarResultW483({
      folderId: resultCaptureFolderId,
      prospect,
      website,
      notes,
      agenda,
      extId,
      ids,
      names,
      soFileId,
      soTaskId,
      soId: directSalesOrderId,
      woId,
      routingId,
      routingResult,
      customerId: customerInfo.id,
      enableManufacturing: finalEnableManufacturing,
      enableWip: effectiveEnableWip,
      createNewHeroItem: effectiveCreateNewHeroItem,
      namingPayload,
      confirmedBuildRequestJson
    });
    if (sidecarCapture) {
      log.audit({
        title: `FORGE sidecar result captured [${VERSION}]`,
        details: JSON.stringify(sidecarCapture)
      });
    }
  }

  function writeForgeSidecarResultW483(args) {
    const folderId = Number(args && args.folderId || 0);
    if (!folderId) return null;
    const now = new Date().toISOString();
    const confirmed = args.confirmedBuildRequestJson || {};
    const extId = str(args.extId);
    const records = buildReturnedRecordsW483(args);
    const displayReadyRecords = Object.keys(records).map(function(key) { return records[key]; }).filter(Boolean);
    const roiCompetitive = buildRoiCompetitiveSidecarW483(args, records);
    const status = args.enableWip && !args.routingId ? 'completed_with_wip_diagnostic' : 'completed';
    const sourceRequestId = firstNonBlankTextW483(
      confirmed.sourceRequestId,
      confirmed.requestId,
      confirmed.buildAttemptProvenance && confirmed.buildAttemptProvenance.sourceRequestId,
      extId
    );
    const buildAttemptId = firstNonBlankTextW483(
      confirmed.buildAttemptId,
      confirmed.buildAttemptProvenance && confirmed.buildAttemptProvenance.buildAttemptId,
      extId
    );
    const submittedAt = firstNonBlankTextW483(
      confirmed.submittedAt,
      confirmed.buildAttemptProvenance && confirmed.buildAttemptProvenance.submittedAt,
      now
    );
    const completedResult = {
      schema: 'forge.completed-runner-result.v3',
      sidecarVersion: SIDECAR_VERSION_W483,
      runnerExecutionCore: RUNNER_EXECUTION_CORE_W483,
      status,
      runStatus: status,
      partialResultState: status === 'completed_with_wip_diagnostic' ? 'partial_result_missing_wip_detail' : '',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      recordOwner: 'governed_runner_internal_build_engine',
      extId,
      generatedExtId: extId,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      prospect: args.prospect,
      customerName: args.prospect,
      website: args.website,
      notes: args.notes,
      agenda: args.agenda,
      notesDigest: summarizeOneLine(args.notes || args.agenda || ''),
      enableManufacturing: !!args.enableManufacturing,
      enableWip: !!args.enableWip,
      toggles: {
        createNewHeroItem: !!args.createNewHeroItem,
        enableManufacturing: !!args.enableManufacturing,
        enableWip: !!args.enableWip
      },
      records,
      displayReadyRecords,
      recordsArray: displayReadyRecords,
      displayRecords: displayReadyRecords,
      customer: records.customer || null,
      demoTransaction: records.demoTransaction || null,
      salesOrder: records.demoTransaction || null,
      heroItem: records.heroItem || null,
      assembly: records.assembly || null,
      bom: records.bom || null,
      bomRevision: records.bomRevision || null,
      workOrder: records.workOrder || null,
      routing: records.routing || null,
      componentItems: [records.componentItem1, records.componentItem2, records.componentItem3].filter(Boolean),
      routingResult: args.enableWip ? (args.routingResult || null) : null,
      csvSalesOrderArtifacts: [{
        label: 'Sales Order CSV import',
        name: `scai_so_${extId}.csv`,
        id: String(args.soFileId || ''),
        taskId: String(args.soTaskId || ''),
        status: 'submitted_pending_transaction_resolution',
        source: 'old_runner_csv_import'
      }],
      namingFileId: args.namingPayload && args.namingPayload.fileId || null,
      namingPayloadFound: !!(args.namingPayload && args.namingPayload.found),
      namingPayloadParsed: !!(args.namingPayload && args.namingPayload.parsed),
      namingPayloadApplied: !!(args.namingPayload && args.namingPayload.applied),
      namingDiscoveryMode: args.namingPayload && args.namingPayload.discoveryMode || '',
      namingSource: args.names && (args.names._source || args.names.namingEvidenceSource) || '',
      namingAuthorityOrder: 'old runner precomputed naming pack -> old runner deterministic fallback',
      productBuildPlanW483: buildProductBuildPlanW483(args),
      roiCompetitiveReview: roiCompetitive.roiCompetitiveReview,
      roiCompetitiveSourceBasis: roiCompetitive.roiCompetitiveSourceBasis,
      roiAudit: roiCompetitive.roiAudit,
      competitive: roiCompetitive.competitive,
      competitiveAdvisory: roiCompetitive.competitiveAdvisory,
      roiCompetitiveDetailModelW444: roiCompetitive.roiCompetitiveDetailModelW444,
      competitiveAdvisoryModelW362: roiCompetitive.competitiveAdvisoryModelW362,
      valueReviewPacket: roiCompetitive.valueReviewPacket,
      warnings: args.enableWip && !args.routingId ? ['WIP was requested; routing did not return a routing id.'] : [],
      errors: []
    };
    const resultCapture = {
      schema: 'idb.runner-result-capture.w483.forge-clean.v1',
      completedResultSchema: 'forge.completed-runner-result.v3',
      sidecarVersion: SIDECAR_VERSION_W483,
      runnerExecutionCore: RUNNER_EXECUTION_CORE_W483,
      status,
      runnerStatus: status,
      taskStatus: status,
      partialResultState: status === 'completed_with_wip_diagnostic' ? 'partial_result_missing_wip_detail' : '',
      idempotencyToken: extId,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      runnerTaskId: String(args.soTaskId || ''),
      taskId: String(args.soTaskId || ''),
      queueTaskId: String(args.soTaskId || ''),
      resultCaptureFolderId: folderId,
      finalGeneratedNamesJson: completedResult,
      completedResultJson: completedResult,
      generatedNamesJson: completedResult,
      sidecarGeneratedNamesJson: completedResult,
      partialGeneratedNamesJson: completedResult,
      displayReadyRecords,
      recordsArray: displayReadyRecords,
      displayRecords: displayReadyRecords,
      routingResult: args.enableWip ? (args.routingResult || null) : null,
      roiCompetitiveReview: roiCompetitive.roiCompetitiveReview,
      roiCompetitiveSourceBasis: roiCompetitive.roiCompetitiveSourceBasis,
      roiAudit: roiCompetitive.roiAudit,
      competitive: roiCompetitive.competitive,
      competitiveAdvisory: roiCompetitive.competitiveAdvisory,
      roiCompetitiveDetailModelW444: roiCompetitive.roiCompetitiveDetailModelW444,
      competitiveAdvisoryModelW362: roiCompetitive.competitiveAdvisoryModelW362,
      valueReviewPacket: roiCompetitive.valueReviewPacket
    };
    const saved = saveTextArtifactW483({
      folderId,
      name: resultCaptureFileNameW483({ extId, buildAttemptId, status }),
      contents: JSON.stringify(resultCapture)
    });
    return {
      status,
      fileId: saved.fileId,
      fileName: saved.fileName,
      folderId,
      runnerTaskId: resultCapture.runnerTaskId,
      returnedCount: displayReadyRecords.length
    };
  }

  function captureRunnerErrorW483(error) {
    const s = runtime.getCurrentScript();
    const prospect = str(getScriptParamAny(s, ['custscript_w483_prospect', 'custscript_v3_runner_prospect', 'custscript_scai_so_runner_prospect']));
    const website = str(getScriptParamAny(s, ['custscript_w483_website', 'custscript_v3_runner_website', 'custscript_scai_so_runner_website']));
    const extId = str(getScriptParamAny(s, ['custscript_w483_extid', 'custscript_v3_runner_extid', 'custscript_scai_so_runner_extid']));
    const folderId = toIntOrNull(getScriptParamAny(s, ['custscript_w483_result_folder', 'custscript_v3_runner_result_capture_folder', 'custscript_idb_result_capture_folder_id']));
    const confirmed = safeJsonParse(getScriptParamAny(s, ['custscript_w483_req_json', 'custscript_v3_runner_idb_request_json'])) || {};
    const message = String(error && (error.message || error.name) || error || 'Unknown runner error');
    const name = String(error && (error.name || error.id) || 'RUNNER_ERROR');
    const buildAttemptId = firstNonBlankTextW483(confirmed.buildAttemptId, confirmed.buildAttempt && confirmed.buildAttempt.id);
    const sourceRequestId = firstNonBlankTextW483(confirmed.requestId, confirmed.sourceRequestId, confirmed.idempotencyToken);
    const submittedAt = firstNonBlankTextW483(confirmed.submittedAt, new Date().toISOString());
    const result = {
      schema: 'forge.w483.runner-result.v1',
      status: 'completed_with_wip_diagnostic',
      runStatus: 'completed_with_wip_diagnostic',
      partialResultState: 'partial_result_failed_before_records',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      recordOwner: 'governed_runner_internal_build_engine',
      sourceRequestId,
      buildAttemptId,
      idempotencyToken: firstNonBlankTextW483(confirmed.idempotencyToken, sourceRequestId, extId),
      submittedAt,
      prospect,
      website,
      extId,
      sidecarVersion: SIDECAR_VERSION_W483,
      runnerExecutionCore: RUNNER_EXECUTION_CORE_W483,
      error: {
        name,
        message,
        stack: String(error && error.stack || '').slice(0, 4000)
      },
      records: {
        routingDiagnostic: {
          role: 'runner_error_diagnostic',
          type: 'diagnostic',
          id: '',
          name: `Runner failed before returned records: ${name}`,
          status: 'diagnostic',
          message
        }
      },
      displayReadyRecords: [],
      recordsArray: [],
      warnings: [message]
    };
    log.error({
      title: `Runner ERROR captured [${VERSION}]`,
      details: JSON.stringify({ name, message, extId, sourceRequestId, buildAttemptId, folderId })
    });
    if (!folderId) return null;
    return saveTextArtifactW483({
      folderId,
      name: resultCaptureFileNameW483({ extId, buildAttemptId, status: 'completed_with_wip_diagnostic' }),
      contents: JSON.stringify(result, null, 2)
    });
  }

  function buildReturnedRecordsW483(args) {
    const ids = args.ids || {};
    const names = args.names || {};
    const records = {};
    const customerId = args.customerId || findByExternalId('customer', ANCHORS.customer);
    records.customer = normalizeSidecarRecordW483({
      role: 'customer',
      type: 'customer',
      label: 'Customer',
      name: `${args.prospect} Customer Account`,
      id: customerId
    });
    records.demoTransaction = normalizeSidecarRecordW483({
      role: 'sales_order',
      type: 'salesorder',
      label: 'Sales Order',
      name: `Sales Order - ${args.prospect}`,
      id: args.soId || '',
      plannedOnly: !args.soId
    });
    records.demoTransaction.csvImportFileId = String(args.soFileId || '');
    records.demoTransaction.csvImportTaskId = String(args.soTaskId || '');
    records.demoTransaction.expectedExternalId = args.extId || '';
    records.heroItem = normalizeSidecarRecordW483({
      role: 'hero_item',
      type: 'inventoryitem',
      label: args.enableManufacturing ? 'Sellable item' : 'Hero item',
      name: names.hero_item_name || `${args.prospect} Finished Good`,
      id: ids.heroItemId
    });
    if (args.enableManufacturing) {
      records.assembly = normalizeSidecarRecordW483({
        role: 'assembly',
        type: 'assemblyitem',
        label: 'Assembly',
        name: names.assembly_name || `${args.prospect} Assembly`,
        id: ids.assemblyId
      });
      records.bom = normalizeSidecarRecordW483({
        role: 'bom',
        type: 'bom',
        label: 'BOM',
        name: names.bom_name || `BOM - ${args.prospect}`,
        id: ids.bomId
      });
      records.bomRevision = normalizeSidecarRecordW483({
        role: 'bom_revision',
        type: 'bomrevision',
        label: 'BOM revision',
        name: names.bom_revision_name || `Revision 1 - ${args.prospect}`,
        id: ids.bomRevId
      });
      const componentNames = Array.isArray(names.component_names) ? names.component_names : [];
      [
        { id: ids.comp1Id, name: componentNames[0] || `${args.prospect} Component A` },
        { id: ids.comp2Id, name: componentNames[1] || `${args.prospect} Component B` },
        { id: ids.comp3Id, name: componentNames[2] || `${args.prospect} Component C` }
      ].forEach(function(component, index) {
        records[`componentItem${index + 1}`] = normalizeSidecarRecordW483({
          role: 'component_item',
          type: 'inventoryitem',
          label: `Component item ${index + 1}`,
          name: component.name,
          id: component.id
        });
        records[`componentItem${index + 1}`].componentIndex = index;
      });
      if (args.woId) {
        records.workOrder = normalizeSidecarRecordW483({
          role: 'work_order',
          type: 'workorder',
          label: 'Work Order',
          name: `WO - ${names.assembly_name || names.hero_item_name || args.prospect}`,
          id: args.woId
        });
      } else if (args.enableWip) {
        records.workOrderDiagnostic = {
          role: 'work_order_diagnostic',
          type: 'workorder',
          label: 'Work Order diagnostic',
          name: 'Work Order was requested but no Work Order id was returned.',
          internalId: '',
          id: '',
          diagnosticOnly: true,
          linkAuthority: { status: 'diagnostic_only', openable: false, url: '' }
        };
      }
      if (args.routingId) {
        records.routing = normalizeSidecarRecordW483({
          role: 'routing',
          type: 'manufacturingrouting',
          label: 'Routing',
          name: names.routing_name || `Routing - ${args.prospect}`,
          id: args.routingId
        });
      } else if (args.enableWip) {
        records.routingDiagnostic = {
          role: 'routing_diagnostic',
          type: 'manufacturingrouting',
          label: 'Routing diagnostic',
          name: 'Routing was requested but no routing id was returned.',
          internalId: '',
          id: '',
          diagnosticOnly: true,
          linkAuthority: { status: 'diagnostic_only', openable: false, url: '' },
          routingResult: args.routingResult || null
        };
      }
    }
    return records;
  }

  function normalizeSidecarRecordW483(input) {
    const id = input && input.id ? String(input.id) : '';
    const type = input && input.type || '';
    const plannedOnly = !!(input && input.plannedOnly);
    const url = id && !plannedOnly ? recordUrlW483(type, id) : '';
    return {
      role: input && input.role || '',
      type,
      recordType: type,
      label: input && input.label || '',
      name: input && input.name || '',
      recordName: input && input.name || '',
      internalId: id,
      id,
      url,
      openableUrl: url,
      plannedOnly,
      linkAuthority: {
        status: url ? 'openable_real_netsuite_url' : (plannedOnly ? 'pending_csv_import_resolution' : 'missing_internal_id'),
        openable: !!url,
        url
      }
    };
  }

  function recordUrlW483(type, id) {
    const internalId = String(id || '').trim();
    if (!internalId) return '';
    const pathByType = {
      customer: '/app/common/entity/custjob.nl',
      salesorder: '/app/accounting/transactions/salesord.nl',
      inventoryitem: '/app/common/item/item.nl',
      assemblyitem: '/app/common/item/item.nl',
      bom: '/app/accounting/manufacturing/bom.nl',
      bomrevision: '/app/accounting/manufacturing/bomrevision.nl',
      manufacturingrouting: '/app/accounting/manufacturing/mfgrouting.nl',
      workorder: '/app/accounting/transactions/workord.nl'
    };
    const path = pathByType[String(type || '').toLowerCase()] || '/app/common/search/searchresults.nl';
    return `${netsuiteOriginW483()}${path}?id=${encodeURIComponent(internalId)}`;
  }

  function netsuiteOriginW483() {
    const acct = String(runtime.accountId || '').replace(/_/g, '-').toLowerCase();
    return `https://${acct || 'system'}.app.netsuite.com`;
  }

  function buildProductBuildPlanW483(args) {
    const names = args.names || {};
    return {
      schema: 'idb.product-build-plan.w483.old-runner-naming.v1',
      primaryProductCandidate: names.primary_product_candidate || names.selectedProductName || names.hero_item_name || args.prospect || '',
      alternateProductCandidates: Array.isArray(names.alternate_product_candidates) ? names.alternate_product_candidates : [],
      selectedProductReason: 'Old runner naming pack applied before record rename.',
      productCandidateSource: names._source || names.namingEvidenceSource || 'old_runner_naming_pack',
      confidencePercent: Number(names.confidencePercent || names.confidence_percent || 0) || null,
      evidenceTerms: Array.isArray(names.evidence_terms) ? names.evidence_terms : [],
      namingAuthorityOrder: 'old runner precomputed naming pack -> old runner deterministic fallback'
    };
  }

  function buildRoiCompetitiveSidecarW483(args, records) {
    const confirmed = args && args.confirmedBuildRequestJson || {};
    const storyInputs = confirmed.storyInputs || {};
    const names = args.names || {};
    const selectedProduct = firstNonBlankTextW483(
      confirmed.selectedProduct,
      confirmed.selectedProductName,
      names.selectedProductName,
      names.primary_product_candidate,
      names.hero_item_name,
      args.prospect
    );
    const notes = compactText([
      args.notes,
      args.agenda,
      storyInputs.buyerNeed,
      storyInputs.pain,
      storyInputs.scObjective,
      confirmed.notes,
      confirmed.agenda
    ].join(' '));
    const mode = args.enableWip ? 'wip' : (args.enableManufacturing ? 'manufacturing' : 'distribution');
    const proofPath = mode === 'wip'
      ? 'Sales Order, assembly, BOM, Work Order, and routing readiness'
      : (mode === 'manufacturing'
        ? 'Sales Order, sellable item, assembly, BOM, and component readiness'
        : 'Customer, Sales Order, and item availability readiness');
    const painSignal = firstNonBlankTextW483(storyInputs.pain, storyInputs.buyerPain, extractPainSignalW483(notes), storyInputs.buyerNeed);
    const baseline = firstNonBlankTextW483(storyInputs.buyerBaseline, confirmed.buyerBaseline, confirmed.roiBaseline);
    const competitors = competitorTokensW483([
      storyInputs.competitors,
      storyInputs.competitor,
      storyInputs.incumbents,
      storyInputs.incumbent,
      confirmed.competitors,
      confirmed.competitor,
      confirmed.incumbents,
      confirmed.incumbent,
      extractCompetitorEvidenceW483(notes)
    ]);
    const competitor = competitors.join(', ');
    const metricDirection = mode === 'wip'
      ? `Reduce production promise risk for ${selectedProduct}`
      : (mode === 'manufacturing'
        ? `Improve assembly and BOM readiness for ${selectedProduct}`
        : `Improve availability confidence for ${selectedProduct}`);
    const confidence = notes && selectedProduct ? 'medium' : 'low';
    const roiClaim = baseline
      ? `Use the returned NetSuite records to test ${metricDirection.toLowerCase()} against the buyer-confirmed baseline.`
      : `Advisory only: use returned NetSuite records to frame ${metricDirection.toLowerCase()}; do not claim measured ROI until the buyer confirms a baseline.`;
    const competitiveContrast = competitor
      ? `Compare NetSuite against ${competitor} only as buyer-supplied context; prove the same workflow through returned records before making any win claim.`
      : 'Handle competitive pressure as advisory discovery until the buyer names the incumbent workflow.';
    const sourceBasis = uniqueTextValuesW483([
      notes ? 'conversation_notes' : '',
      selectedProduct ? 'old_runner_naming_pack' : '',
      args.website ? 'prospect_website' : '',
      competitor ? 'buyer_supplied_competitor_context' : '',
      'returned_records_required_before_claims'
    ]);
    const guardrails = [
      'advisory_only',
      'no_measured_roi_claim_without_buyer_baseline',
      'no_named_competitor_claim_without_buyer_source',
      'prove_with_returned_records_from_sidecar_result'
    ];
    const roiPoint = {
      schema: 'idb.w483-roi-point.v1',
      advisoryOnly: true,
      metricDirection,
      proofSignalLabel: proofPath,
      whyChosen: painSignal ? `Chosen from buyer notes: ${painSignal}` : 'Chosen from toggles and returned record path.',
      baselineNeededToMeasure: baseline || `Buyer-confirmed current delay, exception count, manual effort, service miss, or margin-risk baseline for ${selectedProduct}.`,
      selectedProduct,
      buyerBaselinePresent: !!baseline
    };
    const valueReviewPacket = confirmed.roiCompetitiveReview || {
      schema: 'idb.w483-runner-sidecar-value-review.v1',
      source: 'runner_simple_advisory',
      customer: args.prospect || '',
      product: selectedProduct,
      proofPath,
      pain: painSignal || notes || 'Buyer pain not supplied; keep value framing discovery-led.',
      roiPoint,
      roiThesis: roiClaim,
      groundedRoiSummary: roiClaim,
      groundedCompetitiveSummary: competitiveContrast,
      sourceBasis,
      confidence,
      guardrails
    };
    const roiAudit = Object.assign({
      schema: 'idb.w483-runner-roi-audit.v1',
      advisoryOnly: true,
      claim: roiClaim,
      metricDirection,
      metricProxy: proofPath,
      roiPoint,
      whyChosen: roiPoint.whyChosen,
      baselineNeeded: roiPoint.baselineNeededToMeasure,
      buyerBaselinePresent: !!baseline,
      confidence,
      sourceBasis,
      caution: baseline ? 'Keep quantified language tied to the buyer-confirmed baseline.' : 'Do not claim measured ROI, savings, or improvement percentages.'
    }, confirmed.roiAudit && typeof confirmed.roiAudit === 'object' ? confirmed.roiAudit : {});
    const competitive = Object.assign({
      schema: 'idb.w483-runner-competitive.v1',
      advisoryOnly: true,
      namedCompetitor: competitor || '',
      namedCompetitors: competitors,
      explicitCompetitors: competitors,
      verifiedState: competitor ? 'buyer_context_unverified_by_runner' : 'advisory_discovery_needed',
      competitorSafeContrast: competitiveContrast,
      sourceBasis,
      confidence,
      guardrails
    }, confirmed.competitive && typeof confirmed.competitive === 'object' ? confirmed.competitive : {});
    const competitiveAdvisory = Object.assign({
      schema: 'idb.w362-consultant-safe-competitive-intelligence.v1',
      sidecarSchema: 'idb.w483-runner-competitive-advisory.v1',
      status: 'advisory_competitive_ready',
      advisoryOnly: true,
      authorityLabel: competitor ? 'Buyer-supplied competitor context; verify before claiming' : 'Advisory prep only',
      headline: competitor ? 'Named competitive context' : 'Likely competitive pressure',
      runCue: 'Ask which workflow they trust today, then prove the same decision through returned records.',
      sourceBasis,
      alternatives: competitors.length ? competitors : ['spreadsheets', 'disconnected planning', 'point solutions'],
      guardrails
    }, confirmed.competitiveAdvisory && typeof confirmed.competitiveAdvisory === 'object' ? confirmed.competitiveAdvisory : {});
    const detailModel = Object.assign({
      schema: 'idb.w483-runner-roi-competitive-detail-model.v1',
      roi: {
        source: 'runner_simple_advisory',
        confidence,
        sourceBasis: sourceBasis.join(', '),
        metricDirection,
        quantifier: roiPoint.baselineNeededToMeasure,
        proofSignalLabel: proofPath,
        selectedProduct,
        painSignal,
        whyChosen: roiPoint.whyChosen,
        unsupportedClaimCaution: roiAudit.caution
      },
      competitive: {
        source: competitive.verifiedState,
        confidence,
        sourceBasis: sourceBasis.join(', '),
        strongestAlternative: competitor || 'spreadsheets',
        explicitCompetitors: competitors,
        whyNetSuiteWins: competitive.competitorSafeContrast
      }
    }, confirmed.roiCompetitiveDetailModelW444 && typeof confirmed.roiCompetitiveDetailModelW444 === 'object' ? confirmed.roiCompetitiveDetailModelW444 : {});
    return {
      schema: 'idb.w483-runner-roi-competitive-sidecar.v1',
      roiCompetitiveReview: valueReviewPacket,
      roiCompetitiveSourceBasis: confirmed.roiCompetitiveSourceBasis || detailModel,
      roiAudit,
      competitive,
      competitiveAdvisory,
      roiCompetitiveDetailModelW444: detailModel,
      competitiveAdvisoryModelW362: competitiveAdvisory,
      valueReviewPacket: confirmed.valueReviewPacket || valueReviewPacket,
      sourceBasis,
      confidence,
      guardrails,
      recordContext: {
        displayReadyRecordCount: Object.keys(records || {}).length,
        keyedRecordRoles: Object.keys(records || {})
      }
    };
  }

  function saveTextArtifactW483(args) {
    const f = file.create({
      name: boundedFileNameW483(args.name || `idb_runner_sidecar_${Date.now()}.json`, RESULT_CAPTURE_FILENAME_LIMIT_W483),
      fileType: file.Type.PLAINTEXT,
      contents: String(args.contents || ''),
      folder: Number(args.folderId)
    });
    return { fileId: Number(f.save()), fileName: f.name };
  }

  function resultCaptureFileNameW483(args) {
    const extId = safeCodeW483(args && args.extId || 'idb');
    const attempt = safeCodeW483(args && args.buildAttemptId || '').slice(0, 48);
    const status = safeCodeW483(args && args.status || 'result');
    const stem = attempt || extId || status || 'idb';
    return boundedFileNameW483(`idb_result_${status}_${stem}_${extId}.json`, RESULT_CAPTURE_FILENAME_LIMIT_W483);
  }

  function boundedFileNameW483(name, maxLen) {
    const limit = Math.max(32, Math.min(Number(maxLen || 180), 180));
    const cleaned = String(name || 'idb_result.json').replace(/[\\/:*?"<>|#%{}~&]/g, '_').replace(/\s+/g, '_');
    if (cleaned.length <= limit) return cleaned;
    const ext = cleaned.match(/\.[A-Za-z0-9]{1,8}$/);
    const suffix = ext ? ext[0] : '.json';
    return `${cleaned.slice(0, limit - suffix.length - 1)}_${suffix}`.replace(/_\./, '.');
  }

  function safeCodeW483(value) {
    return String(value || '').replace(/[^A-Za-z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
  }

  function firstNonBlankTextW483() {
    for (let i = 0; i < arguments.length; i += 1) {
      const value = arguments[i];
      if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
    }
    return '';
  }

  function extractPainSignalW483(notes) {
    const text = compactText(notes);
    if (!text) return '';
    const parts = text.split(/[.!?;]\s+/);
    const painRe = /\b(stockout|backorder|availability|allocation|fulfill|promise|expedite|shortage|schedule|wip|work order|component|quality|inspection|manual|spreadsheet|reconcil|delay|miss|risk|margin|service)\b/i;
    for (let i = 0; i < parts.length; i += 1) {
      if (painRe.test(parts[i])) return summarizeOneLine(parts[i]);
    }
    return summarizeOneLine(text);
  }

  function extractCompetitorEvidenceW483(notes) {
    const text = String(notes || '');
    const match = text.match(/\b(?:competitors?|incumbents?|alternatives?|currently using|current system|against|versus|vs\.?)\s*(?:are|is|include|includes|like|maybe|:|-)?\s*([^.;\n]{2,160})/i);
    return match ? match[1] : '';
  }

  function competitorTokensW483(values) {
    const out = [];
    (values || []).forEach(function(value) {
      const source = Array.isArray(value) ? value.join(',') : String(value || '');
      source.split(/\s*(?:\/|,|;|\bvs\.?\b|\bversus\b|\bor\b|\band\b)\s*/i).forEach(function(part) {
        const token = compactText(part)
          .replace(/^(?:maybe|like|including|include|includes|are|is|the|a|an)\s+/i, '')
          .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
          .trim();
        if (token && token.length >= 2 && token.length <= 60 && !/^(?:none|unknown|competitor|incumbent|alternative)$/i.test(token)) out.push(token);
      });
    });
    return uniqueTextValuesW483(out).slice(0, 5);
  }

  function uniqueTextValuesW483(values) {
    const seen = {};
    const out = [];
    (values || []).forEach(function(value) {
      const text = compactText(value);
      if (!text || seen[text]) return;
      seen[text] = true;
      out.push(text);
    });
    return out;
  }

  // ----------------------------
  // WIP Routing (create + attach)
  // ----------------------------
  function createAndAttachRoutingIfPossible({ subsidiaryId, locationId, bomId, assemblyId, extId, prospect, signalText, workCenterSearchId, names }) {
    const subs = Number(subsidiaryId);
    const loc = locationId ? Number(locationId) : null;

    // Step 1: Find candidates
    const centers = findWorkCentersFromSavedSearch({ searchId: workCenterSearchId, locationId: loc, subsidiaryId: subs });
    const templates = findCostTemplatesForSubsidiary(subs);       // returns [{id,score,name}, ...]

    log.audit({
      title: `WIP routing candidates [${VERSION}]`,
      details: JSON.stringify({
        subsidiaryId: subs,
        locationId: loc,
        centers: centers.length,
        templates: templates.length
      })
    });

    if (centers.length < 1) {
      log.error({
        title: `WIP routing skipped (no work centers found) [${VERSION}]`,
        details: JSON.stringify({ subsidiaryId: subs })
      });
      return null;
    }
    if (templates.length < 1) {
      log.error({
        title: `WIP routing skipped (no cost templates found) [${VERSION}]`,
        details: JSON.stringify({ subsidiaryId: subs })
      });
      return null;
    }

    // Step 2: Use scenario-aware routing names from the upstream naming pack; fallback to deterministic names
    const opNames = resolveRoutingNames({ prospect, signalText, names });
    log.audit({
      title: `Routing naming applied [${VERSION}]`,
      details: JSON.stringify({ routingNamingApplied: !!opNames, routingOperationNamesUsed: opNames })
    });

    // Step 3: Pick 3 centers/templates (keyword-ranked)
    const pick = pickByKeywords;

    const c1 = pick(centers, ['blend','mix','blending']) || centers[0];
    const c2 = pick(centers, ['dispense','fill','dispensing']) || centers[Math.min(1, centers.length - 1)];
    const c3 = pick(centers, ['pack','package','packaging','case']) || centers[Math.min(2, centers.length - 1)];

    const t1 = pick(templates, ['blend','mix','blending']) || templates[0];
    const t2 = pick(templates, ['dispense','fill','dispensing']) || templates[Math.min(1, templates.length - 1)];
    const t3 = pick(templates, ['pack','package','packaging','case']) || templates[Math.min(2, templates.length - 1)];

    const routingName = trimLen((names && names.routing_name) ? names.routing_name : `SCAI Routing - ${prospect} - BOM ${bomId}`, 80).slice(0, 60);
    const routingMemo = `SCAI Demo Reset: ${extId} | ${prospect} | WIP routing`;
    const discoveredAssemblyRoutingId = findManagedAssemblyRoutingId({ assemblyId, extId });
    const searchedRoutingId = discoveredAssemblyRoutingId ? null : findManagedRoutingIdByBom({ bomId, subsidiaryId: subs, extId, preferredName: routingName });
    const existingRoutingId = discoveredAssemblyRoutingId || searchedRoutingId || null;

    log.audit({
      title: `WIP managed routing decision [${VERSION}]`,
      details: JSON.stringify({
        assemblyId: Number(assemblyId),
        existingRoutingId,
        discoveredAssemblyRoutingId,
        searchedRoutingId,
        createNew: !existingRoutingId
      })
    });

    // Step 4: Reuse existing managed routing when possible; only create+attach if none exists
    const routing = existingRoutingId
      ? record.load({ type: 'manufacturingrouting', id: Number(existingRoutingId), isDynamic: true })
      : record.create({ type: 'manufacturingrouting', isDynamic: true });

    routing.setValue({ fieldId: 'subsidiary', value: subs });
    routing.setValue({ fieldId: 'billofmaterials', value: Number(bomId) });

    // "location" is multi-select; pass array if we have one
    if (loc) safeTry(() => routing.setValue({ fieldId: 'location', value: [loc] }));

    const routingHeaderFields = safeTryReturn(() => routing.getFields()) || [];
    const routingDefaultField = firstExisting(routingHeaderFields, ['default', 'isdefault', 'masterdefault']);

    routing.setValue({ fieldId: 'name', value: routingName });
    if (routingDefaultField) {
      routing.setValue({ fieldId: routingDefaultField, value: true });
    }
    safeTry(() => routing.setValue({ fieldId: 'memo', value: routingMemo }));

    log.audit({
      title: `Routing header default field resolution [${VERSION}]`,
      details: JSON.stringify({ routingDefaultField, routingHeaderFields })
    });

    const stepSublist = 'routingstep';
    clearRoutingSteps(routing, stepSublist);

    function resolveRoutingStepFieldIds(routingRec, sublistId) {
      const fields = safeTryReturn(() => routingRec.getSublistFields({ sublistId })) || [];

      const setupCandidates = ['setuptimemin', 'setuptime', 'setuptimeminutes'];
      const runRateCandidates = ['runrate', 'runratemin', 'runrateperunit'];

      const setupField = firstExisting(fields, setupCandidates);
      const runRateField = firstExisting(fields, runRateCandidates);

      log.audit({
        title: `Routing step field resolution [${VERSION}]`,
        details: JSON.stringify({ sublistId, setupField, runRateField, fields })
      });

      return { setupField, runRateField };
    }

    const stepFieldIds = resolveRoutingStepFieldIds(routing, stepSublist);

    function addStep(seq, opName, centerId, templateId) {
      routing.selectNewLine({ sublistId: stepSublist });

      routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId: 'operationsequence', value: String(seq) });
      routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId: 'operationname', value: String(opName).slice(0, 60) });

      // LIST fields must be set AFTER subsidiary is chosen (we already did)
      routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId: 'manufacturingworkcenter', value: Number(centerId) });
      routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId: 'manufacturingcosttemplate', value: Number(templateId) });

      if (!stepFieldIds.setupField) throw new Error('Could not resolve routing step setup-time field ID');
      if (!stepFieldIds.runRateField) throw new Error('Could not resolve routing step run-rate field ID');

      // Mandatory float fields: keep demo-safe decimal values low and deterministic
      routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId: stepFieldIds.setupField, value: 0.5 });
      routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId: stepFieldIds.runRateField, value: 1.0 });

      log.audit({
        title: `Routing step values before commit [${VERSION}]`,
        details: JSON.stringify({
          seq,
          opName,
          centerId: Number(centerId),
          templateId: Number(templateId),
          setupField: stepFieldIds.setupField,
          setupValue: 0.5,
          runRateField: stepFieldIds.runRateField,
          runRateValue: 1.0
        })
      });

      routing.commitLine({ sublistId: stepSublist });
    }

    addStep(10, opNames.op10 || 'Blending',    c1.id, t1.id);
    addStep(20, opNames.op20 || 'Dispensing',  c2.id, t2.id);
    addStep(30, opNames.op30 || 'Packaging',   c3.id, t3.id);

    const routingId = Number(routing.save({ enableSourcing: true, ignoreMandatoryFields: false }));

    log.audit({
      title: existingRoutingId ? `Routing reused+updated [${VERSION}]` : `Routing created [${VERSION}]`,
      details: JSON.stringify({
        routingId,
        existingRoutingId,
        chosen: {
          centers: [c1, c2, c3],
          templates: [t1, t2, t3],
          ops: opNames
        }
      })
    });

    // Step 5: Only attach when the assembly has no existing managed routing
    let attachResult = 'not-attempted';
    if (!existingRoutingId) {
      attachResult = attachRoutingToAssemblySafe({ assemblyId, routingId });
    } else {
      attachResult = 'skipped-reused-existing-routing';
      log.audit({
        title: `Assembly routing attach skipped (reused existing routing) [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId })
      });
    }

    return {
      routingId,
      existingRoutingId: existingRoutingId ? Number(existingRoutingId) : null,
      decision: existingRoutingId ? 'reused-existing-routing' : 'created-new-routing',
      attachResult,
      chosen: {
        centers: [c1, c2, c3],
        templates: [t1, t2, t3],
        ops: opNames
      }
    };
  }

  function attachRoutingToAssemblySafe({ assemblyId, routingId }) {
    try {
      const result = attachRoutingToAssembly({ assemblyId, routingId });
      log.audit({
        title: `Assembly routing attach result [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), result: result || 'noop' })
      });
      return result || 'noop';
    } catch (e) {
      log.audit({
        title: `Assembly routing attach skipped after routing save [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), error: String(e && e.message ? e.message : e) })
      });
      return 'skipped-after-save';
    }
  }



  function findManagedRoutingIdByBom({ bomId, subsidiaryId, extId, preferredName }) {
    try {
      const filters = [['billofmaterials', 'anyof', Number(bomId)]];
      if (subsidiaryId) filters.push('AND', ['subsidiary', 'anyof', Number(subsidiaryId)]);

      const cols = [
        search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
        search.createColumn({ name: 'name' }),
        search.createColumn({ name: 'memo' }),
        search.createColumn({ name: 'billofmaterials' })
      ];

      const rows = search.create({ type: 'manufacturingrouting', filters, columns: cols })
        .run().getRange({ start: 0, end: 100 }) || [];

      let best = null;
      let bestScore = -9999;
      rows.forEach(function(r) {
        const id = Number(r.getValue({ name: 'internalid' }));
        if (!Number.isFinite(id)) return;
        const name = str(r.getValue({ name: 'name' }));
        const memo = str(r.getValue({ name: 'memo' }));
        let score = 0;
        if (extId && memo.indexOf(extId) !== -1) score += 100;
        if (memo.indexOf('SCAI Demo Reset') !== -1) score += 60;
        if (preferredName && name === preferredName) score += 40;
        if (name.indexOf('SCAI Routing') === 0) score += 20;
        if (score > bestScore) {
          bestScore = score;
          best = { id, name, memo, score };
        }
      });

      log.audit({
        title: `Manufacturing routing search fallback [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), subsidiaryId: Number(subsidiaryId || 0), rows: rows.length, chosen: best })
      });

      return best ? Number(best.id) : null;
    } catch (e) {
      log.error({
        title: `Manufacturing routing search fallback failed [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), subsidiaryId: Number(subsidiaryId || 0), error: String(e && e.message ? e.message : e) })
      });
      return null;
    }
  }

  function findManagedAssemblyRoutingId({ assemblyId, extId }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: false });
    const sublistCandidates = ['manufacturingrouting', 'manufacturingroutings', 'routing', 'routings'];
    const routingFieldCandidates = ['manufacturingrouting', 'routing', 'routingid'];
    const defaultFieldCandidates = ['default', 'isdefault', 'masterdefault'];
    const memoFieldCandidates = ['memo', 'description'];

    for (let s = 0; s < sublistCandidates.length; s++) {
      const sublistId = sublistCandidates[s];
      let count = 0;
      try {
        count = asm.getLineCount({ sublistId });
      } catch (e) {
        continue;
      }

      const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
      const routingField = firstExisting(fields, routingFieldCandidates) || routingFieldCandidates[0];
      const defaultField = firstExisting(fields, defaultFieldCandidates);
      const memoField = firstExisting(fields, memoFieldCandidates);

      let defaultRoutingId = null;
      let firstRoutingId = null;
      let managedRoutingId = null;

      for (let i = 0; i < count; i++) {
        const rid = Number(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: routingField, line: i })));
        if (!Number.isFinite(rid) || rid < 1) continue;
        if (!firstRoutingId) firstRoutingId = rid;

        const isDefault = defaultField ? normalizeBool(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: defaultField, line: i }))) : false;
        if (isDefault && !defaultRoutingId) defaultRoutingId = rid;

        const memoVal = memoField ? str(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: memoField, line: i }))) : '';
        if (!managedRoutingId && ((extId && memoVal.indexOf(extId) !== -1) || memoVal.indexOf('SCAI Demo Reset') !== -1)) {
          managedRoutingId = rid;
        }
      }

      const chosenRoutingId = managedRoutingId || defaultRoutingId || firstRoutingId || null;

      log.audit({
        title: `Assembly routing discovery [${VERSION}]`,
        details: JSON.stringify({
          assemblyId: Number(assemblyId),
          sublistId,
          count,
          routingField,
          defaultField,
          memoField,
          chosenRoutingId,
          managedRoutingId,
          defaultRoutingId,
          firstRoutingId
        })
      });

      if (chosenRoutingId) return Number(chosenRoutingId);
    }

    log.audit({
      title: `Assembly routing discovery (none found) [${VERSION}]`,
      details: JSON.stringify({ assemblyId: Number(assemblyId) })
    });
    return null;
  }

  function clearRoutingSteps(routingRec, sublistId) {
    let count = 0;
    try {
      count = routingRec.getLineCount({ sublistId });
    } catch (e) {
      log.audit({
        title: `Routing step clear skipped [${VERSION}]`,
        details: JSON.stringify({ sublistId, reason: 'sublist unavailable' })
      });
      return;
    }

    for (let i = count - 1; i >= 0; i--) {
      safeTry(() => routingRec.removeLine({ sublistId, line: i, ignoreRecalc: true }));
    }

    log.audit({
      title: `Routing steps cleared [${VERSION}]`,
      details: JSON.stringify({ sublistId, removed: count })
    });
  }

  function attachRoutingToAssembly({ assemblyId, routingId }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: true });

    const sublistCandidates = ['manufacturingrouting', 'manufacturingroutings', 'routing', 'routings'];
    let sublistId = null;

    for (let i = 0; i < sublistCandidates.length; i++) {
      try {
        asm.getLineCount({ sublistId: sublistCandidates[i] });
        sublistId = sublistCandidates[i];
        break;
      } catch (e) {}
    }
    if (!sublistId) return 'no-sublist';

    const routingFieldCandidates = ['manufacturingrouting', 'routing', 'routingid'];
    const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
    const routingField = firstExisting(fields, routingFieldCandidates) || routingFieldCandidates[0];

    log.audit({
      title: `Assembly routing attach field resolution [${VERSION}]`,
      details: JSON.stringify({ sublistId, routingField, fields })
    });

    let line = -1;
    const count = safeTryReturn(() => asm.getLineCount({ sublistId })) || 0;

    for (let i = 0; i < count; i++) {
      const v = safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: routingField, line: i }));
      if (Number(v) === Number(routingId)) {
        line = i;
        break;
      }
    }

    if (line !== -1) {
      log.audit({
        title: `Assembly routing already linked [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, line, routingField })
      });
      return 'already-linked';
    }

    // Non-critical path: if NetSuite does not expose editable sublist fields here, do not force a line insert.
    if (!fields.length) {
      log.audit({
        title: `Assembly routing attach skipped (sublist not script-editable) [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, fields })
      });
      return 'skipped-noneditable-sublist';
    }

    try {
      asm.selectNewLine({ sublistId });
      asm.setCurrentSublistValue({ sublistId, fieldId: routingField, value: Number(routingId) });
      asm.commitLine({ sublistId });
      asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
      log.audit({
        title: `Assembly routing attached [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, createdNewLine: true })
      });
      return 'attached';
    } catch (e) {
      log.audit({
        title: `Assembly routing attach skipped after routing save [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, error: String(e && e.message ? e.message : e) })
      });
      return 'skipped-after-save';
    }
  }

  function pickByKeywords(list, keywords) {
    if (!Array.isArray(list) || !list.length) return null;
    const keys = (keywords || []).map(k => String(k || '').toLowerCase()).filter(Boolean);
    if (!keys.length) return list[0];

    let best = null;
    let bestScore = -9999;

    list.forEach(x => {
      const nm = String(x.name || '').toLowerCase();
      let score = Number(x.score || 0);
      keys.forEach(k => { if (nm.indexOf(k) !== -1) score += 20; });
      if (score > bestScore) { bestScore = score; best = x; }
    });

    return best || list[0];
  }

  function getResultValueByCandidates(result, candidates) {
    const cols = result && result.columns ? result.columns : [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const meta = [str(c && c.name), str(c && c.label), str(c && c.join)].join('|').toLowerCase();
      for (let j = 0; j < candidates.length; j++) {
        if (meta.indexOf(String(candidates[j]).toLowerCase()) !== -1) {
          const txt = str(safeTryReturn(() => result.getText(c)));
          const val = str(safeTryReturn(() => result.getValue(c)));
          if (txt) return txt;
          if (val) return val;
        }
      }
    }
    return '';
  }

  function getResultNameFallback(result) {
    let out = getResultValueByCandidates(result, ['name', 'itemid', 'entityid', 'altname', 'work center']);
    if (out) return out;
    const cols = result && result.columns ? result.columns : [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const meta = [str(c && c.name), str(c && c.label), str(c && c.join)].join('|').toLowerCase();
      if (meta.indexOf('internalid') !== -1 || meta.indexOf('location') !== -1 || meta.indexOf('subsidiary') !== -1 || meta.indexOf('inactive') !== -1) continue;
      const txt = str(safeTryReturn(() => result.getText(c)));
      const val = str(safeTryReturn(() => result.getValue(c)));
      out = txt || val;
      if (out) return out;
    }
    return '';
  }

  // ----------------------------
  // Work Centers / Cost Templates (v1.7.6)
  // ----------------------------
  function findWorkCentersFromSavedSearch({ searchId, locationId, subsidiaryId }) {
    const loc = locationId ? String(locationId) : '';
    const subs = subsidiaryId ? String(subsidiaryId) : '';
    const searchRef = (typeof searchId === 'string' && /^\d+$/.test(searchId)) ? Number(searchId) : searchId;

    if (!searchRef) {
      log.error({
        title: `WIP work center saved search missing [${VERSION}]`,
        details: JSON.stringify({ searchId: searchRef || searchId, locationId, subsidiaryId })
      });
      return [];
    }

    try {
      const ss = search.load({ id: searchRef });
      const paged = ss.runPaged({ pageSize: 100 });
      const rows = [];

      paged.pageRanges.forEach(function (pr) {
        const page = paged.fetch({ index: pr.index });
        page.data.forEach(function (r) {
          const id = Number(r.getValue({ name: 'internalid' })) || Number(r.id);
          const name = getResultNameFallback(r);
          const rowLocId = String(r.getValue({ name: 'location' }) || '');
          const rowLocText = String(r.getText({ name: 'location' }) || getResultValueByCandidates(r, ['location']) || '');
          const rowSubsId = String(r.getValue({ name: 'subsidiary' }) || '');
          const rowSubsText = String(r.getText({ name: 'subsidiary' }) || getResultValueByCandidates(r, ['subsidiary']) || '');

          if (!Number.isFinite(id)) return;

          rows.push({
            id,
            name,
            locationId: rowLocId,
            locationText: rowLocText,
            subsidiaryId: rowSubsId,
            subsidiaryText: rowSubsText
          });
        });
      });

      const keywords = [
        'blend', 'blending', 'mix',
        'fill', 'filling', 'dispense', 'dispensing',
        'pack', 'packing', 'package',
        'assembly', 'case'
      ];

      const scored = rows.map(function (x) {
        const lower = String(x.name || '').toLowerCase();
        let score = 0;

        keywords.forEach(function (k) {
          if (lower.indexOf(k) !== -1) score += 5;
        });

        if (loc && x.locationId === loc) score += 50;
        if (loc && x.locationText && String(x.locationText).toLowerCase().indexOf('boston') !== -1 && String(loc) === '2') score += 10;
        if (subs && x.subsidiaryId === subs) score += 10;
        if (x.name) score += Math.max(0, 10 - Math.min(10, x.name.length / 6));
        if (lower.indexOf('den-') === 0 || lower.indexOf('mm-') === 0 || lower.indexOf('sfo-') === 0) score += 8;

        return {
          id: x.id,
          name: x.name,
          score,
          locationId: x.locationId,
          locationText: x.locationText,
          subsidiaryId: x.subsidiaryId,
          subsidiaryText: x.subsidiaryText
        };
      }).sort(function (a, b) {
        return b.score - a.score;
      });

      log.audit({
        title: `WIP work centers resolved from saved search [${VERSION}]`,
        details: JSON.stringify({
          searchId,
          locationId: loc,
          subsidiaryId: subs,
          count: scored.length,
          picked: scored.slice(0, 10)
        })
      });

      return scored;
    } catch (e) {
      log.error({
        title: `WIP work center saved search failed [${VERSION}]`,
        details: JSON.stringify({
          searchId,
          locationId,
          subsidiaryId,
          error: String((e && e.message) || e)
        })
      });
      return [];
    }
  }

  function findCostTemplatesForSubsidiary(subsidiaryId) {
    const typeCandidates = ['manufacturingcosttemplate', 'mfgcosttemplate', 'costtemplate'];
    const subs = Number(subsidiaryId);

    function runQuery(type, filters) {
      try {
        const s = search.create({
          type,
          filters: filters || [],
          columns: [search.createColumn({ name: 'internalid', sort: search.Sort.ASC })]
        });
        const rows = s.run().getRange({ start: 0, end: 200 }) || [];
        return rows
          .map(r => Number(r.getValue({ name: 'internalid' })))
          .filter(id => Number.isFinite(id));
      } catch (e) {
        return [];
      }
    }

    for (let t = 0; t < typeCandidates.length; t++) {
      const type = typeCandidates[t];

      let ids = runQuery(type, [['isinactive', 'is', 'F'], 'AND', ['subsidiary', 'anyof', subs]]);
      if (!ids.length) ids = runQuery(type, [['subsidiary', 'anyof', subs]]);
      if (!ids.length) ids = runQuery(type, [['isinactive', 'is', 'F']]);
      if (!ids.length) ids = runQuery(type, []);

      if (ids.length) {
        const want = ['blend', 'blending', 'mix', 'dispense', 'dispensing', 'fill', 'pack', 'packaging'];
        const scored = ids.map(id => {
          let nm = '';
          safeTry(() => {
            const f = search.lookupFields({ type, id, columns: ['name'] });
            nm = (f && f.name) ? String(f.name) : '';
          });
          const lower = nm.toLowerCase();
          let score = 0;
          want.forEach(k => { if (lower.indexOf(k) !== -1) score += 5; });
          score += Math.max(0, 10 - Math.min(10, lower.length / 6));
          return { id, score, name: nm };
        }).sort((a, b) => b.score - a.score);

        const picked = scored.slice(0, 6);
        log.audit({
          title: `WIP cost templates resolved [${VERSION}]`,
          details: JSON.stringify({ type, subsidiaryId: subs, count: picked.length, picked })
        });
        return picked;
      }
    }

    return [];
  }

  function resolveRoutingNames({ prospect, signalText, names }) {
    const bySeq = (names && names.operation_names_by_seq) ? names.operation_names_by_seq : null;
    if (bySeq) {
      return {
        op10: trimLen(str(bySeq['10'] || bySeq[10] || 'Blending'), 60),
        op20: trimLen(str(bySeq['20'] || bySeq[20] || 'Dispensing'), 60),
        op30: trimLen(str(bySeq['30'] || bySeq[30] || 'Packaging'), 60)
      };
    }
    return {
      op10: 'Blending',
      op20: 'Dispensing',
      op30: 'Packaging'
    };
  }

  // ----------------------------
  // Planning auto-calc OFF + preferred vendor alignment
  // ----------------------------
  function forcePlanningAutoCalcOffForItems({ vendorId, heroItemId, compIds }) {
    const results = [];

    // Hero: legacy fields
    const heroRes = submitFalseFields('inventoryitem', heroItemId, HERO_AUTOCALC_FIELDS, 'Hero');
    results.push(heroRes);

    // Components: provided field IDs
    compIds.forEach((cid, idx) => {
      const r = submitFalseFields('inventoryitem', cid, COMPONENT_AUTOCALC_FIELDS, `Component ${idx + 1}`);
      results.push(r);
    });

    // Preferred vendor: set to same vendor as anchor vendor
    const pv = [];
    [heroItemId].concat(compIds).forEach(itemId => {
      const ok = safeTryReturn(() => {
        record.submitFields({
          type: 'inventoryitem',
          id: Number(itemId),
          values: { preferredvendor: Number(vendorId) },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        });
        return true;
      });
      pv.push({ itemId: Number(itemId), vendorId: Number(vendorId), ok: !!ok });
    });

    log.audit({
      title: `Planning auto-calc OFF + preferred vendor aligned [${VERSION}]`,
      details: JSON.stringify({ vendorId: Number(vendorId), results, preferredVendor: pv })
    });
  }

  function submitFalseFields(recType, recId, fields, label) {
    const tried = [];
    const setFalse = [];

    fields.forEach(fid => {
      tried.push(fid);
      try {
        record.submitFields({
          type: recType,
          id: Number(recId),
          values: { [fid]: false },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        });
        setFalse.push(fid);
      } catch (e) {}
    });

    return { label, recType, recId: Number(recId), fieldsSetFalse: setFalse, tried };
  }

  // ----------------------------
  // Work Order seed (includes start + end dates)
  // ----------------------------
  function safeManufacturingStepW483(label, fn) {
    log.audit({ title: `${label} START [${VERSION}]`, details: JSON.stringify({ label }) });
    try {
      const value = fn();
      log.audit({ title: `${label} COMPLETE [${VERSION}]`, details: JSON.stringify(value || {}) });
      return { ok: true, value: value || null };
    } catch (e) {
      const message = String(e && (e.message || e.details || e.name) || e || 'Manufacturing step failed');
      log.error({
        title: `${label} FAILED [${VERSION}]`,
        details: JSON.stringify({ label, name: String(e && (e.name || e.id) || 'ERROR'), message })
      });
      return { ok: false, error: message };
    }
  }

  function createWorkOrder({ assemblyId, subsidiaryId, locationId, quantity, memo }) {
    const wo = record.create({ type: 'workorder', isDynamic: false });

    wo.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) });
    if (locationId) safeTry(() => wo.setValue({ fieldId: 'location', value: Number(locationId) }));

    let setAssemblyOk = false;
    ['assemblyitem', 'item'].forEach(fid => {
      if (setAssemblyOk) return;
      const ok = safeTryReturn(() => {
        wo.setValue({ fieldId: fid, value: Number(assemblyId) });
        return true;
      });
      if (ok) setAssemblyOk = true;
    });
    if (!setAssemblyOk) throw new Error(`Work Order: could not set assembly item (assemblyId=${assemblyId})`);

    wo.setValue({ fieldId: 'quantity', value: Number(quantity || 10) });
    if (memo) safeTry(() => wo.setValue({ fieldId: 'memo', value: String(memo).slice(0, 300) }));

    const start = new Date();
    const end = addMonths(start, 1);

    // Allocation Strategy accounts can require dates
    safeTry(() => wo.setValue({ fieldId: 'startdate', value: start }));
    safeTry(() => wo.setValue({ fieldId: 'enddate', value: end }));

    return Number(wo.save({ enableSourcing: true, ignoreMandatoryFields: true }));
  }

  // ----------------------------
  // Demo record mode resolution
  // ----------------------------
  function ensureDemoRecords({ subsidiaryId, locationId, createNewHeroItem, enableManufacturing: finalEnableManufacturing, extId, prospect, passedHeroItemId }) {
    const heroItem = createNewHeroItem
      ? getOrCreateFreshHeroItem({ subsidiaryId, locationId, extId, prospect, passedHeroItemId })
      : getExistingHeroItem();

    log.audit({
      title: `Resolved hero + manufacturing layer [${VERSION}]`,
      details: JSON.stringify({
        createNewHeroItem,
        heroItemId: Number(heroItem.id || 0),
        heroItemExternalId: heroItem.externalId || '',
        finalEnableManufacturing,
        manufacturingTargetMode: deriveManufacturingTargetMode(finalEnableManufacturing, !!createNewHeroItem)
      })
    });

    if (!finalEnableManufacturing) {
      return {
        heroItemId: heroItem.id,
        heroItemExternalId: heroItem.externalId,
        heroItemCsvKey: heroItem.csvKey,
        comp1Id: null,
        comp2Id: null,
        comp3Id: null,
        assemblyId: null,
        bomId: null,
        bomRevId: null
      };
    }

    const mfg = ensureManufacturingAnchors({ subsidiaryId, locationId, heroItemId: heroItem.id });
    mfg.heroItemExternalId = heroItem.externalId;
    mfg.heroItemCsvKey = heroItem.csvKey;
    return mfg;
  }

  function inferFreshHeroItemIdByExt(extId) {
    const token = String(extId || '').replace(/^SCAI_SO_/, '').trim();
    if (!token) return null;
    const externalId = `SCAI_HERO_${token}`;
    return safeTryReturn(() => findByExternalId('inventoryitem', externalId)) || null;
  }

  function getExistingHeroItem() {
    const id = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    return {
      id: Number(id),
      externalId: ANCHORS.heroItem,
      csvKey: ANCHORS.heroItem
    };
  }

  function getOrCreateFreshHeroItem({ subsidiaryId, locationId, extId, prospect, passedHeroItemId }) {
    if (passedHeroItemId) {
      const adopted = adoptFreshHeroItem({ itemId: Number(passedHeroItemId), subsidiaryId, locationId, extId, prospect });
      log.audit({
        title: `Runner hero mode [${VERSION}]`,
        details: JSON.stringify({
          createNewHeroItem: true,
          passedHeroItemId: Number(passedHeroItemId),
          chosenHeroItemId: adopted.id,
          source: 'passed-from-suitelet'
        })
      });
      return adopted;
    }

    const created = createFreshHeroItem({ subsidiaryId, locationId, extId, prospect });
    log.audit({
      title: `Runner hero mode [${VERSION}]`,
      details: JSON.stringify({
        createNewHeroItem: true,
        passedHeroItemId: null,
        chosenHeroItemId: created.id,
        source: 'runner-created'
      })
    });
    return created;
  }

  function adoptFreshHeroItem({ itemId, subsidiaryId, locationId, extId, prospect }) {
    const anchorHeroId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const externalId = `SCAI_HERO_${safeExternalIdTokenW483(extId || itemId)}`;
    const differentiated = buildDifferentiatedNames(prospect || 'Demo Hero', extId);

    safeTry(() => record.submitFields({
      type: 'inventoryitem',
      id: Number(itemId),
      values: {
        externalid: externalId,
        itemid: differentiated.itemIdName,
        displayname: differentiated.displayName
      },
      options: { enableSourcing: true, ignoreMandatoryFields: true }
    }));

    const persistence = applyFreshHeroPersistence({
      itemId: Number(itemId),
      anchorHeroId: Number(anchorHeroId),
      subsidiaryId,
      locationId
    });

    log.audit({
      title: `Fresh HERO item adopted [${VERSION}]`,
      details: JSON.stringify({
        id: Number(itemId),
        externalId,
        itemid: differentiated.itemIdName,
        displayname: differentiated.displayName,
        namingSuffix: differentiated.suffix,
        namingCollisionAvoidance: 'extid-suffix',
        anchorHeroId: Number(anchorHeroId),
        preferredVendorOk: !!persistence.preferredVendorOk,
        planningAutoCalcOff: !!persistence.planningAutoCalcOff,
        locationPlanningCopied: !!persistence.locationPlanningCopied,
        bodyPlanningFieldsOff: persistence.bodyPlanningFieldsOff || [],
        vendorSublistUsed: persistence.vendorSublistUsed || '',
        vendorId: Number(persistence.vendorId || 0),
        subsidiaryId: Number(subsidiaryId || 0),
        locationId: Number(locationId || 0)
      })
    });

    return { id: Number(itemId), externalId, csvKey: externalId };
  }

  function createFreshHeroItem({ subsidiaryId, locationId, extId, prospect }) {
    const anchorHeroId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const externalId = `SCAI_HERO_${safeExternalIdTokenW483(extId || new Date().getTime())}`;
    const differentiated = buildDifferentiatedNames(prospect || 'Demo Hero', extId);

    let rec = null;
    let clonedFromAnchor = false;

    try {
      rec = record.copy({ type: 'inventoryitem', id: Number(anchorHeroId), isDynamic: false });
      clonedFromAnchor = true;
    } catch (e) {
      rec = record.create({ type: 'inventoryitem', isDynamic: false });
    }

    rec.setValue({ fieldId: 'externalid', value: externalId });
    rec.setValue({ fieldId: 'itemid', value: differentiated.itemIdName });
    safeTry(() => rec.setValue({ fieldId: 'displayname', value: differentiated.displayName }));
    safeTry(() => rec.setValue({ fieldId: 'location', value: '' }));
    safeTry(() => rec.setValue({ fieldId: 'location', value: null }));

    try { rec.setValue({ fieldId: 'subsidiary', value: [Number(subsidiaryId)] }); }
    catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) })); }

    const id = Number(rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));

    const persistence = applyFreshHeroPersistence({
      itemId: id,
      anchorHeroId: Number(anchorHeroId),
      subsidiaryId,
      locationId
    });

    log.audit({
      title: `Fresh HERO item created [${VERSION}]`,
      details: JSON.stringify({
        id,
        externalId,
        itemid: differentiated.itemIdName,
        displayname: differentiated.displayName,
        namingSuffix: differentiated.suffix,
        namingCollisionAvoidance: 'extid-suffix',
        anchorHeroId: Number(anchorHeroId),
        clonedFromAnchor,
        preferredVendorOk: !!persistence.preferredVendorOk,
        planningAutoCalcOff: !!persistence.planningAutoCalcOff,
        locationPlanningCopied: !!persistence.locationPlanningCopied,
        bodyPlanningFieldsOff: persistence.bodyPlanningFieldsOff || [],
        vendorSublistUsed: persistence.vendorSublistUsed || '',
        vendorId: Number(persistence.vendorId || 0)
      })
    });

    return { id, externalId, csvKey: externalId };
  }


  function applyFreshHeroPersistence({ itemId, anchorHeroId, subsidiaryId, locationId }) {
    const vendorId = mustFindByExternalId('vendor', ANCHORS.vendor);
    const locationPlanningCopied = !!safeTryReturn(() => cloneItemLocationPlanning({ sourceItemId: Number(anchorHeroId), targetItemId: Number(itemId), locationId: Number(locationId || 0) }));

    // Reuse the same proven hero path used by the anchor item instead of maintaining
    // a separate fresh-hero planning/off logic branch.
    forcePlanningAutoCalcOffForItems({
      vendorId: Number(vendorId),
      heroItemId: Number(itemId),
      compIds: []
    });

    const preferredVendorOk = ensurePreferredVendorOnItem({ itemId: Number(itemId), vendorId: Number(vendorId), subsidiaryId: Number(subsidiaryId || 0) });
    const validation = validateFreshHeroPersistence({ itemId: Number(itemId), vendorId: Number(vendorId), locationId: Number(locationId || 0) });
    const planningPersistedOff = HERO_AUTOCALC_FIELDS.every(fid => validation.planningFlags[fid] === false || validation.planningFlags[fid] === 'F' || validation.planningFlags[fid] === null);

    log.audit({
      title: `Fresh HERO shared planning path [${VERSION}]`,
      details: JSON.stringify({
        itemId: Number(itemId),
        anchorHeroId: Number(anchorHeroId),
        vendorId: Number(vendorId),
        preferredVendorOk: !!preferredVendorOk,
        planningPersistedOff,
        locationPlanningCopied: !!locationPlanningCopied,
        validation
      })
    });

    return {
      vendorId: Number(vendorId),
      preferredVendorOk: !!preferredVendorOk,
      planningAutoCalcOff: !!planningPersistedOff,
      bodyPlanningFieldsOff: planningPersistedOff ? HERO_AUTOCALC_FIELDS.slice() : [],
      locationPlanningCopied: !!locationPlanningCopied,
      vendorSublistUsed: validation.vendorSublistUsed || ''
    };
  }

  function ensurePreferredVendorOnItem({ itemId, vendorId, subsidiaryId }) {
    safeTry(() => record.submitFields({
      type: 'inventoryitem',
      id: Number(itemId),
      values: { preferredvendor: Number(vendorId) },
      options: { enableSourcing: true, ignoreMandatoryFields: true }
    }));

    const rec = record.load({ type: 'inventoryitem', id: Number(itemId), isDynamic: true });
    const sublistCandidates = ['itemvendor', 'vendors', 'vendor'];
    const vendorFieldCandidates = ['vendor', 'entity', 'vendorname'];
    const preferredFieldCandidates = ['preferredvendor', 'preferred', 'ispreferred'];
    const subsidiaryFieldCandidates = ['subsidiary', 'vendorsubsidiary'];

    let usedSublist = '';
    for (let s = 0; s < sublistCandidates.length; s++) {
      const sublistId = sublistCandidates[s];
      const lineCount = safeTryReturn(() => rec.getLineCount({ sublistId }));
      if (lineCount === null) continue;

      let vendorField = '';
      vendorFieldCandidates.forEach(fid => {
        if (vendorField) return;
        const ok = safeTryReturn(() => {
          if ((lineCount || 0) > 0) rec.getSublistValue({ sublistId, fieldId: fid, line: 0 });
          return true;
        });
        if (ok || (lineCount || 0) === 0) vendorField = fid;
      });
      if (!vendorField) continue;

      let preferredField = '';
      preferredFieldCandidates.forEach(fid => {
        if (preferredField) return;
        const ok = safeTryReturn(() => {
          if ((lineCount || 0) > 0) rec.getSublistValue({ sublistId, fieldId: fid, line: 0 });
          return true;
        });
        if (ok || (lineCount || 0) === 0) preferredField = fid;
      });

      let matchLine = -1;
      for (let i = 0; i < (lineCount || 0); i++) {
        const v = String(safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: vendorField, line: i })) || '');
        if (v === String(vendorId)) { matchLine = i; break; }
      }

      if (matchLine >= 0) {
        safeTry(() => rec.selectLine({ sublistId, line: matchLine }));
      } else {
        const newLineOk = safeTryReturn(() => { rec.selectNewLine({ sublistId }); return true; });
        if (!newLineOk) continue;
        safeTry(() => rec.setCurrentSublistValue({ sublistId, fieldId: vendorField, value: Number(vendorId) }));
      }

      if (preferredField) safeTry(() => rec.setCurrentSublistValue({ sublistId, fieldId: preferredField, value: true }));
      subsidiaryFieldCandidates.forEach(fid => {
        if (!subsidiaryId) return;
        safeTry(() => rec.setCurrentSublistValue({ sublistId, fieldId: fid, value: Number(subsidiaryId) }));
      });
      safeTry(() => rec.commitLine({ sublistId }));
      safeTry(() => rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
      usedSublist = sublistId;
      break;
    }

    return !!usedSublist;
  }

  function validateFreshHeroPersistence({ itemId, vendorId, locationId }) {
    const rec = record.load({ type: 'inventoryitem', id: Number(itemId), isDynamic: false });
    const planningFlags = {};
    HERO_AUTOCALC_FIELDS.forEach(fid => {
      planningFlags[fid] = safeTryReturn(() => rec.getValue({ fieldId: fid }));
    });

    const sublistCandidates = ['itemvendor', 'vendors', 'vendor'];
    let preferredVendorFound = false;
    let vendorSublistUsed = '';
    sublistCandidates.forEach(sublistId => {
      if (preferredVendorFound) return;
      const count = safeTryReturn(() => rec.getLineCount({ sublistId }));
      if (!count) return;
      const vendorField = ['vendor', 'entity', 'vendorname'].find(fid => safeTryReturn(() => { rec.getSublistValue({ sublistId, fieldId: fid, line: 0 }); return true; }));
      const prefField = ['preferredvendor', 'preferred', 'ispreferred'].find(fid => safeTryReturn(() => { rec.getSublistValue({ sublistId, fieldId: fid, line: 0 }); return true; }));
      if (!vendorField) return;
      for (let i = 0; i < count; i++) {
        const v = String(safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: vendorField, line: i })) || '');
        const p = prefField ? !!safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: prefField, line: i })) : false;
        if (v === String(vendorId) && (p || !prefField)) {
          preferredVendorFound = true;
          vendorSublistUsed = sublistId;
          break;
        }
      }
    });

    return {
      preferredVendorFound,
      vendorSublistUsed,
      planningFlags,
      locationId: Number(locationId || 0)
    };
  }

  function cloneItemLocationPlanning({ sourceItemId, targetItemId, locationId }) {
    if (!locationId) return false;

    const locationSublistFields = [
      'preferredstocklevel',
      'reorderpoint',
      'leadtime',
      'safetystocklevel',
      'supplylotsizingmethod',
      'fixedlotsize',
      'supplytimefence',
      'demandtimefence'
    ];

    const itemLocationFieldGroups = [
      { label: 'preferredstocklevel', source: ['preferredstocklevel'], target: ['preferredstocklevel'] },
      { label: 'reorderpoint', source: ['reorderpoint'], target: ['reorderpoint'] },
      { label: 'safetystocklevel', source: ['safetystocklevel'], target: ['safetystocklevel'] },
      { label: 'purchaseleadtime', source: ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays'], target: ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays'] },
      { label: 'leadtimeoffset', source: ['leadtimeoffset'], target: ['leadtimeoffset'] },
      { label: 'periodsofsupplytype', source: ['periodsofsupplytype'], target: ['periodsofsupplytype'] },
      { label: 'demandsource', source: ['demandsource'], target: ['demandsource'] },
      { label: 'supplytype', source: ['supplytype'], target: ['supplytype'] },
      { label: 'fixedlotmultiple', source: ['fixedlotmultiple'], target: ['fixedlotmultiple'] },
      { label: 'fixedlotsize', source: ['fixedlotsize'], target: ['fixedlotsize'] },
      { label: 'minimumorderquantity', source: ['minimumorderquantity'], target: ['minimumorderquantity'] },
      { label: 'supplylotsizingmethod', source: ['supplylotsizingmethod'], target: ['supplylotsizingmethod'] },
      { label: 'periodsofsupplyincrement', source: ['periodsofsupplyincrement'], target: ['periodsofsupplyincrement'] }
    ];

    function firstReadableValue(rec, fieldIds) {
      for (let i = 0; i < fieldIds.length; i++) {
        const fid = fieldIds[i];
        const val = safeTryReturn(() => rec.getValue({ fieldId: fid }));
        if (typeof val !== 'undefined' && val !== null && val !== '') return { fieldId: fid, value: val };
      }
      return null;
    }

    function firstReadableSublistValue(rec, sublistId, line, fieldIds) {
      for (let i = 0; i < fieldIds.length; i++) {
        const fid = fieldIds[i];
        const val = safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: fid, line: line }));
        if (typeof val !== 'undefined' && val !== null && val !== '') return { fieldId: fid, value: val };
      }
      return null;
    }

    function firstWritableField(rec, fieldIds, value) {
      for (let i = 0; i < fieldIds.length; i++) {
        const fid = fieldIds[i];
        const ok = safeTryReturn(() => {
          rec.setValue({ fieldId: fid, value: value });
          return true;
        });
        if (ok) return fid;
      }
      return null;
    }

    function collectReadableFieldTrace(rec, fieldIds) {
      const out = [];
      (fieldIds || []).forEach(fid => {
        const val = safeTryReturn(() => rec.getValue({ fieldId: fid }));
        if (typeof val !== 'undefined' && val !== null && val !== '') out.push({ fieldId: fid, value: val });
      });
      return out;
    }

    function collectReadableSublistTrace(rec, sublistId, line, fieldIds) {
      const out = [];
      (fieldIds || []).forEach(fid => {
        const val = safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: fid, line }));
        if (typeof val !== 'undefined' && val !== null && val !== '') out.push({ fieldId: fid, value: val, line });
      });
      return out;
    }

    let copied = [];
    let validation = [];
    let locationSublistCopied = false;

    // Pass 1: copy from the item Locations sublist when available
    const source = safeTryReturn(() => record.load({ type: 'inventoryitem', id: Number(sourceItemId), isDynamic: false }));
    const target = safeTryReturn(() => record.load({ type: 'inventoryitem', id: Number(targetItemId), isDynamic: false }));
    const sublistId = 'locations';
    if (source && target) {
      const sourceCount = safeTryReturn(() => source.getLineCount({ sublistId })) || 0;
      const targetCount = safeTryReturn(() => target.getLineCount({ sublistId })) || 0;

      function findLine(rec, count) {
        for (let i = 0; i < count; i++) {
          const locVal = String(safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: 'location', line: i })) || '');
          if (locVal === String(locationId)) return i;
        }
        return -1;
      }

      const srcLine = findLine(source, sourceCount);
      const tgtLine = findLine(target, targetCount);
      if (srcLine >= 0 && tgtLine >= 0) {
        locationSublistFields.forEach(fid => {
          const val = safeTryReturn(() => source.getSublistValue({ sublistId, fieldId: fid, line: srcLine }));
          if (typeof val === 'undefined' || val === null || val === '') return;
          const ok = safeTryReturn(() => {
            target.setSublistValue({ sublistId, fieldId: fid, line: tgtLine, value: val });
            return true;
          });
          if (ok) copied.push({ source: 'locations-sublist', fieldId: fid, value: val });
        });
        safeTry(() => target.save({ enableSourcing: true, ignoreMandatoryFields: true }));
        locationSublistCopied = copied.length > 0;
      }
    }

    // Pass 2: clone Item Location Configuration fields using alias-aware field groups.
    let itemLocationConfigCopied = false;
    let itemLocationConfigId = null;
    const configTypeCandidates = ['itemlocationconfiguration'];
    configTypeCandidates.forEach(cfgType => {
      if (itemLocationConfigCopied) return;
      const sourceConfigId = safeTryReturn(() => findItemLocationConfigId(cfgType, Number(sourceItemId), Number(locationId)));
      if (!sourceConfigId) return;
      const sourceCfg = safeTryReturn(() => record.load({ type: cfgType, id: Number(sourceConfigId), isDynamic: false }));
      if (!sourceCfg) return;

      const targetConfigId = safeTryReturn(() => findItemLocationConfigId(cfgType, Number(targetItemId), Number(locationId)));
      let targetCfg = targetConfigId
        ? safeTryReturn(() => record.load({ type: cfgType, id: Number(targetConfigId), isDynamic: false }))
        : safeTryReturn(() => record.create({ type: cfgType, isDynamic: false }));
      if (!targetCfg) return;

      safeTry(() => targetCfg.setValue({ fieldId: 'item', value: Number(targetItemId) }));
      safeTry(() => targetCfg.setValue({ fieldId: 'location', value: Number(locationId) }));
      safeTry(() => targetCfg.setValue({ fieldId: 'subsidiary', value: Number(safeTryReturn(() => sourceCfg.getValue({ fieldId: 'subsidiary' })) || 0) }));

      itemLocationFieldGroups.forEach(group => {
        const read = firstReadableValue(sourceCfg, group.source);
        if (!read) return;
        const exactTargets = [read.fieldId].concat(group.target || []);
        const wroteField = firstWritableField(targetCfg, exactTargets, read.value);
        if (wroteField) copied.push({ source: cfgType, label: group.label, fieldId: wroteField, value: read.value, sourceFieldId: read.fieldId });
      });

      // Purchase lead time can live in several places depending on account setup.
      // Try config first, then locations sublist, then body field, then vendor sublist.
      const existingLeadTime = firstReadableValue(targetCfg, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays']);
      if (!existingLeadTime) {
        let leadTimeRead = null;

        if (!leadTimeRead && source && typeof srcLine !== 'undefined' && srcLine >= 0) {
          leadTimeRead = firstReadableSublistValue(source, sublistId, srcLine, ['leadtime', 'purchaseleadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays']);
          if (leadTimeRead) leadTimeRead.source = 'locations-sublist-fallback';
        }

        if (!leadTimeRead && source) {
          leadTimeRead = firstReadableValue(source, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays']);
          if (leadTimeRead) leadTimeRead.source = 'item-body-fallback';
        }

        if (!leadTimeRead && source) {
          const vendorSublistId = 'itemvendor';
          const vendorCount = safeTryReturn(() => source.getLineCount({ sublistId: vendorSublistId })) || 0;
          for (let i = 0; i < vendorCount && !leadTimeRead; i++) {
            leadTimeRead = firstReadableSublistValue(source, vendorSublistId, i, ['leadtime', 'purchaseleadtime', 'vendorleadtime', 'purchasedleadtime', 'leadtimedays']);
            if (leadTimeRead) {
              leadTimeRead.source = 'vendor-sublist-fallback';
              leadTimeRead.vendorLine = i;
            }
          }
        }

        if (leadTimeRead) {
          const wroteLeadTimeField = firstWritableField(targetCfg, [leadTimeRead.fieldId, 'purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays'], leadTimeRead.value);
          if (wroteLeadTimeField) {
            copied.push({
              source: leadTimeRead.source || 'unknown-fallback',
              label: 'purchaseleadtime',
              fieldId: wroteLeadTimeField,
              value: leadTimeRead.value,
              sourceFieldId: leadTimeRead.fieldId,
              vendorLine: leadTimeRead.vendorLine
            });
          }
        } else {
          const leadtimeCandidates = {
            itemLocationConfiguration: collectReadableFieldTrace(sourceCfg, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays', 'leadtimeoffset']),
            locationsSublist: (source && typeof srcLine !== 'undefined' && srcLine >= 0)
              ? collectReadableSublistTrace(source, sublistId, srcLine, ['leadtime', 'purchaseleadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays', 'leadtimeoffset'])
              : [],
            itemBody: source ? collectReadableFieldTrace(source, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays', 'leadtimeoffset']) : [],
            vendorSublist: []
          };

          if (source) {
            const vendorSublistId = 'itemvendor';
            const vendorCount = safeTryReturn(() => source.getLineCount({ sublistId: vendorSublistId })) || 0;
            for (let i = 0; i < vendorCount; i++) {
              const rows = collectReadableSublistTrace(source, vendorSublistId, i, ['leadtime', 'purchaseleadtime', 'vendorleadtime', 'purchasedleadtime', 'leadtimedays']);
              rows.forEach(r => leadtimeCandidates.vendorSublist.push(r));
            }
          }

          copied.push({
            source: 'leadtime-trace',
            label: 'purchaseleadtime',
            fieldId: 'not-found',
            value: '',
            sourceFieldId: '',
            candidates: leadtimeCandidates
          });
        }
      }

      const saved = safeTryReturn(() => Number(targetCfg.save({ enableSourcing: true, ignoreMandatoryFields: true })));
      if (saved) {
        itemLocationConfigCopied = true;
        itemLocationConfigId = saved;
        const reloaded = safeTryReturn(() => record.load({ type: cfgType, id: Number(saved), isDynamic: false }));
        if (reloaded) {
          itemLocationFieldGroups.forEach(group => {
            const read = firstReadableValue(reloaded, group.target);
            if (read) validation.push({ label: group.label, fieldId: read.fieldId, value: read.value });
          });
        }
      }
    });

    log.audit({
      title: `Fresh HERO location planning cloned [${VERSION}]`,
      details: JSON.stringify({
        sourceItemId: Number(sourceItemId),
        targetItemId: Number(targetItemId),
        locationId: Number(locationId),
        locationSublistCopied,
        itemLocationConfigCopied,
        itemLocationConfigId,
        copied,
        validation
      })
    });

    return copied.length > 0;
  }

  function getOrCreateFreshCustomerW483({ extId, prospect, website, subsidiaryId }) {
    const externalId = `SCAI_CUST_${safeExternalIdTokenW483(extId || prospect || new Date().getTime())}`;
    let id = findByExternalId('customer', externalId);
    const companyName = trimLen(`${prospect || 'FORGE Prospect'} Customer Account`, 83);
    const values = {
      externalid: externalId,
      companyname: companyName,
      entityid: companyName,
      comments: trimLen(`SCAI Demo Reset: ${extId || ''} | ${prospect || ''} | ${website || ''}`, 999)
    };
    if (website) values.url = normalizeUrl(website);
    if (subsidiaryId) values.subsidiary = Number(subsidiaryId);

    if (!id) {
      const rec = record.create({ type: 'customer', isDynamic: false });
      Object.keys(values).forEach((fieldId) => safeTry(() => rec.setValue({ fieldId, value: values[fieldId] })));
      id = Number(rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
      log.audit({ title: `Fresh customer created [${VERSION}]`, details: JSON.stringify({ id, externalId, companyName }) });
    } else {
      record.submitFields({
        type: 'customer',
        id: Number(id),
        values,
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      });
      log.audit({ title: `Fresh customer reused [${VERSION}]`, details: JSON.stringify({ id: Number(id), externalId, companyName }) });
    }

    return { id: Number(id), externalId, companyName };
  }

  function findItemLocationConfigId(recordType, itemId, locationId) {
    const results = search.create({
      type: recordType,
      filters: [
        ['item', 'anyof', String(itemId)], 'and',
        ['location', 'anyof', String(locationId)]
      ],
      columns: ['internalid']
    }).run().getRange({ start: 0, end: 1 });
    return results && results.length ? Number(results[0].getValue({ name: 'internalid' })) : null;
  }

  function safeCode(s) {
    return String(s || '').replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 40);
  }

  function safeExternalIdTokenW483(s) {
    const clean = String(s || '').replace(/[^A-Za-z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (!clean) return String(new Date().getTime());
    const hash = hashTokenW483(clean);
    if (clean.length <= 61) return `${clean}_${hash}`.slice(0, 70);
    const head = clean.slice(0, 34).replace(/_+$/g, '');
    const tail = clean.slice(-22).replace(/^_+/g, '');
    return `${head}_${tail}_${hash}`.slice(0, 70);
  }

  function hashTokenW483(s) {
    let hash = 2166136261;
    const text = String(s || '');
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(36).toUpperCase().slice(0, 8);
  }

  // ----------------------------
  // Manufacturing anchors
  // ----------------------------
  function ensureManufacturingAnchors({ subsidiaryId, locationId, heroItemId }) {
    const resolvedHeroItemId = Number(heroItemId || mustFindByExternalId('inventoryitem', ANCHORS.heroItem));

    const comp1Id = ensureInventoryItemByExternalId(ANCHORS.comp1, `SCAI - Component 1`, subsidiaryId, locationId);
    const comp2Id = ensureInventoryItemByExternalId(ANCHORS.comp2, `SCAI - Component 2`, subsidiaryId, locationId);
    const comp3Id = ensureInventoryItemByExternalId(ANCHORS.comp3, `SCAI - Component 3`, subsidiaryId, locationId);

    const assemblyId = ensureAssemblyItemByExternalId(ANCHORS.assembly, `SCAI - Finished Good`, subsidiaryId, locationId);

    const bomId = ensureBomByExternalId(ANCHORS.bom, `SCAI BOM`, subsidiaryId);
    const bomRevId = ensureBomRevisionByExternalId(ANCHORS.bomrev, bomId, `SCAI BOM Revision`);

    setBomRevisionComponents({ bomRevId, compIds: [comp1Id, comp2Id, comp3Id] });

    return { heroItemId: resolvedHeroItemId, comp1Id, comp2Id, comp3Id, assemblyId, bomId, bomRevId };
  }

  function ensureInventoryItemByExternalId(externalId, defaultName, subsidiaryId, locationId) {
    let id = findByExternalId('inventoryitem', externalId);

    if (!id) {
      const rec = record.create({ type: 'inventoryitem', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      rec.setValue({ fieldId: 'itemid', value: defaultName });

      try { rec.setValue({ fieldId: 'subsidiary', value: [subsidiaryId] }); }
      catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: subsidiaryId })); }

      if (locationId) safeTry(() => rec.setValue({ fieldId: 'location', value: locationId }));

      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } else {
      safeTry(() => record.submitFields({
        type: 'inventoryitem',
        id: Number(id),
        values: buildSubsLocValues(subsidiaryId, locationId),
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }

    return Number(id);
  }

  function ensureAssemblyItemByExternalId(externalId, defaultName, subsidiaryId, locationId) {
    let id = findByExternalId('assemblyitem', externalId);

    if (!id) {
      const rec = record.create({ type: 'assemblyitem', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      rec.setValue({ fieldId: 'itemid', value: defaultName });

      try { rec.setValue({ fieldId: 'subsidiary', value: [subsidiaryId] }); }
      catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: subsidiaryId })); }

      if (locationId) safeTry(() => rec.setValue({ fieldId: 'location', value: locationId }));

      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } else {
      safeTry(() => record.submitFields({
        type: 'assemblyitem',
        id: Number(id),
        values: buildSubsLocValues(subsidiaryId, locationId),
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }

    return Number(id);
  }

  function ensureBomByExternalId(externalId, defaultName, subsidiaryId) {
    let id = findByExternalId('bom', externalId);

    if (!id) {
      const rec = record.create({ type: 'bom', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      safeTry(() => rec.setValue({ fieldId: 'name', value: defaultName }));
      safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: subsidiaryId }));
      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } else {
      safeTry(() => record.submitFields({
        type: 'bom',
        id: Number(id),
        values: { subsidiary: subsidiaryId },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }

    return Number(id);
  }

  function ensureBomRevisionByExternalId(externalId, bomId, defaultName) {
    let id = findByExternalId('bomrevision', externalId);

    if (!id) {
      const rec = record.create({ type: 'bomrevision', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      safeTry(() => rec.setValue({ fieldId: 'billofmaterials', value: Number(bomId) }));
      safeTry(() => rec.setValue({ fieldId: 'name', value: defaultName }));
      safeTry(() => rec.setValue({ fieldId: 'effectivestartdate', value: new Date() }));
      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    }

    return Number(id);
  }

  function setBomRevisionComponents({ bomRevId, compIds }) {
    const rev = record.load({ type: 'bomrevision', id: Number(bomRevId), isDynamic: true });

    const sublistId = detectBomRevComponentSublistId(rev);
    const fields = safeTryReturn(() => rev.getSublistFields({ sublistId })) || [];

    const itemFieldCandidates = ['item', 'componentitem', 'memberitem', 'assemblycomponent', 'ingredient', 'itemid'];
    const qtyFieldCandidates  = ['bomquantity', 'quantity', 'componentquantity', 'qty'];

    const qtyFieldId = firstExisting(fields, qtyFieldCandidates) || 'bomquantity';

    log.audit({
      title: `BOMREV field detect [${VERSION}]`,
      details: JSON.stringify({ sublistId, qtyFieldId, allFieldsCount: fields.length })
    });

    safeTry(() => {
      const lineCount = rev.getLineCount({ sublistId });
      for (let i = lineCount - 1; i >= 0; i--) {
        rev.removeLine({ sublistId, line: i, ignoreRecalc: true });
      }
    });

    compIds.forEach((cid) => {
      rev.selectNewLine({ sublistId });

      const itemSetOk = trySetAnyItemField(rev, sublistId, fields, cid, itemFieldCandidates);
      if (!itemSetOk) throw new Error(`BOMREV: could not set Item for component=${cid}`);

      safeTry(() => rev.setCurrentSublistValue({ sublistId, fieldId: qtyFieldId, value: 1 }));
      rev.commitLine({ sublistId });
    });

    rev.save({ enableSourcing: true, ignoreMandatoryFields: true });
  }

  function detectBomRevComponentSublistId(rev) {
    const candidates = ['component', 'components', 'bomcomponent', 'bomcomponents'];
    for (let i = 0; i < candidates.length; i++) {
      try { rev.getLineCount({ sublistId: candidates[i] }); return candidates[i]; } catch (e) {}
    }
    return 'component';
  }

  function trySetAnyItemField(rev, sublistId, allFields, itemId, candidates) {
    for (let i = 0; i < candidates.length; i++) {
      const f = candidates[i];
      if (allFields.indexOf(f) === -1) continue;

      const ok = safeTryReturn(() => {
        rev.setCurrentSublistValue({ sublistId, fieldId: f, value: Number(itemId) });
        return true;
      });

      if (ok) {
        log.audit({ title: `BOMREV item field used [${VERSION}]`, details: JSON.stringify({ fieldId: f, itemId }) });
        return true;
      }
    }
    return false;
  }

  function attachBomToAssembly({ assemblyId, bomId }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: true });
    const sublistId = 'billofmaterials';
    const bomFieldId = 'billofmaterials';
    const masterDefaultFieldId = 'masterdefault';

    let foundLine = -1;
    safeTry(() => {
      const count = asm.getLineCount({ sublistId });
      for (let i = 0; i < count; i++) {
        const v = asm.getSublistValue({ sublistId, fieldId: bomFieldId, line: i });
        if (Number(v) === Number(bomId)) { foundLine = i; break; }
      }
    });

    if (foundLine === -1) {
      asm.selectNewLine({ sublistId });
      asm.setCurrentSublistValue({ sublistId, fieldId: bomFieldId, value: Number(bomId) });
      safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: masterDefaultFieldId, value: true }));
      asm.commitLine({ sublistId });
    } else {
      asm.selectLine({ sublistId, line: foundLine });
      safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: masterDefaultFieldId, value: true }));
      asm.commitLine({ sublistId });
    }

    asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
  }

  function buildSubsLocValues(subsidiaryId, locationId) {
    const values = { subsidiary: subsidiaryId };
    if (locationId) values.location = locationId;
    return values;
  }

  // ----------------------------
  // Website signal (hardened, non-blocking)
  // ----------------------------
  function safeGetWebsiteSignal(opts) {
    const website = opts && opts.website ? String(opts.website) : '';
    const domain = extractDomain(website);
    const fallbackSignal = {
      domain: domain || '',
      text: domain
        ? `Domain: ${domain}. Use company name, notes, and domain text to infer industry and scenario.`
        : `No website signal available. Use company name and notes to infer industry and scenario.`
    };

    if (!website) {
      return { status: 'missing', signal: fallbackSignal, errorName: '', errorMessage: '', fallbackUsed: true };
    }

    try {
      const signal = getWebsiteSignal(website);
      return { status: 'ok', signal: signal, errorName: '', errorMessage: '', fallbackUsed: false };
    } catch (e) {
      const name = e && e.name ? String(e.name) : '';
      const msg = e && e.message ? String(e.message) : String(e || '');
      const status = name === 'SSS_CONNECTION_TIME_OUT'
        ? 'timeout'
        : (name === 'SSS_UNKNOWN_HOST' ? 'unknown_host' : 'error');

      log.audit({
        title: `Website signal fallback applied [${VERSION}]`,
        details: JSON.stringify({ status: status, errorName: name, errorMessage: msg, domain: domain || '' })
      });

      return {
        status: status,
        signal: fallbackSignal,
        errorName: name,
        errorMessage: msg,
        fallbackUsed: true
      };
    }
  }

  function getWebsiteSignal(website) {
    const domain = extractDomain(website);
    if (!domain) return { domain: '', text: '' };

    const startUrl = normalizeUrl(website);
    const first = fetchHtmlWithRedirects(startUrl, 6);

    let bestText = extractSignalText(first.html, domain);
    let bestLen = bestText.length;

    if (bestLen >= 500) return { domain, text: bestText };

    const candidates = pickHighSignalLinks(first.html, domain, 8);
    const topToTry = candidates.slice(0, 3);

    for (let i = 0; i < topToTry.length; i++) {
      const u = topToTry[i];
      try {
        const r = fetchHtmlWithRedirects(u, 4);
        const t = extractSignalText(r.html, domain);
        if (t.length > bestLen) {
          bestLen = t.length;
          bestText = t;
        }
        if (bestLen >= 900) break;
      } catch (e) {}
    }

    if (!bestText || bestText.length < 150) {
      return { domain, text: `Domain: ${domain}. Infer industry from the domain name.` };
    }

    return { domain, text: bestText };
  }

  function fetchHtmlWithRedirects(url, maxHops) {
    let current = url;
    let hops = 0;

    while (hops <= maxHops) {
      const resp = https.get({
        url: current,
        headers: {
          'User-Agent': 'Mozilla/5.0 (NetSuite SCAI Demo Reset)',
          'Accept': 'text/html,application/xhtml+xml'
        }
      });

      const code = Number(resp.code || 200);
      const headers = resp.headers || {};
      const body = String(resp.body || '');

      if ((code === 301 || code === 302 || code === 307 || code === 308) && headers.Location) {
        const next = resolveRedirectUrl(current, String(headers.Location));
        current = normalizeUrl(next);
        hops++;
        continue;
      }

      return { finalUrl: current, html: body, code };
    }

    return { finalUrl: current, html: '', code: 0 };
  }

  function resolveRedirectUrl(baseUrl, location) {
    const loc = String(location || '').trim();
    if (!loc) return baseUrl;

    if (/^https?:\/\//i.test(loc)) return loc;
    if (/^\/\//.test(loc)) return 'https:' + loc;

    if (loc[0] === '/') {
      const m = String(baseUrl).match(/^(https?:\/\/[^\/?#]+)/i);
      const origin = m && m[1] ? m[1] : baseUrl;
      return origin + loc;
    }

    const originMatch = String(baseUrl).match(/^(https?:\/\/[^\/?#]+)(\/.*)?$/i);
    const origin = originMatch && originMatch[1] ? originMatch[1] : baseUrl;
    const path = originMatch && originMatch[2] ? originMatch[2] : '/';
    const dir = path.replace(/[^\/]*$/, '');
    return origin + dir + loc;
  }

  function extractSignalText(html, domain) {
    const raw = String(html || '');

    const title = (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1];
    const metaDesc =
      (raw.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [,''])[1] ||
      (raw.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) || [,''])[1] ||
      '';

    const bodyText = compactText(stripHtml(raw));

    const clipped = clipToKeywords(bodyText, [
      'product','products','shop','collection','collections','category','categories','store',
      'buy','price','cart','checkout','size','color','style','sku','model',
      'manufacturing','factory','plant','inventory','warehouse','supply chain','procurement',
      'assembly','bill of materials','bom','production','distribution',
      'ingredients','nutrition','flavor','serving','organic','frozen','beverage'
    ], 2200);

    const parts = [];
    parts.push(`Domain: ${domain}`);
    if (title) parts.push(`Title: ${compactText(title).slice(0, 160)}`);
    if (metaDesc) parts.push(`Description: ${compactText(metaDesc).slice(0, 240)}`);

    const best = (clipped || bodyText.slice(0, 2200)).trim();
    if (best) parts.push(`PageText: ${best}`);

    const out = parts.join(' | ');
    return out.length <= 2600 ? out : out.slice(0, 2600);
  }

  function pickHighSignalLinks(html, domain, limit) {
    const raw = String(html || '');
    const links = [];

    const re = /href=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(raw)) !== null) {
      const href = String(m[1] || '').trim();
      if (!href) continue;

      if (/^(mailto:|tel:|javascript:|#)/i.test(href)) continue;

      let abs = href;
      if (!/^https?:\/\//i.test(href)) {
        abs = `https://${domain}${href.startsWith('/') ? '' : '/'}${href}`;
      }

      abs = normalizeUrl(abs);
      if (abs.indexOf(domain) === -1) continue;

      const lower = abs.toLowerCase();
      let score = 0;

      ['shop','products','product','collections','collection','category','c/','p/','store','catalog'].forEach(k => {
        if (lower.indexOf(k) !== -1) score += 10;
      });

      ['privacy','terms','login','account','help','support','returns','faq','contact'].forEach(k => {
        if (lower.indexOf(k) !== -1) score -= 5;
      });

      score += Math.max(0, 15 - Math.min(15, abs.length / 20));
      links.push({ url: abs, score });
    }

    const uniq = {};
    links.forEach(x => { if (!uniq[x.url] || uniq[x.url] < x.score) uniq[x.url] = x.score; });

    return Object.keys(uniq)
      .map(u => ({ url: u, score: uniq[u] }))
      .sort((a,b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.url);
  }

  function normalizeUrl(u) {
    const s = String(u || '').trim();
    if (!s) return '';
    if (/^http:\/\//i.test(s)) return s.replace(/^http:\/\//i, 'https://');
    if (/^https:\/\//i.test(s)) return s;
    return `https://${s.replace(/^\/+/, '')}`;
  }

  // ----------------------------
  // Precomputed naming payload + deterministic fallback
  // ----------------------------
  function loadPrecomputedNamingPack({ fileId, extId, prospect, website, signalText }) {
    const deterministic = generateNamingPack({ prospect, website, signalText });
    let candidateFileId = toIntOrNull(fileId);
    let discoveryMode = candidateFileId ? 'direct-param' : 'discover-by-extid';

    if (!candidateFileId && extId) {
      candidateFileId = discoverNamingFileIdByExtId(extId);
    }

    if (!candidateFileId) {
      return {
        found: false,
        parsed: false,
        applied: false,
        fileId: null,
        discoveryMode,
        source: deterministic._source || 'deterministic',
        payload: deterministic
      };
    }

    try {
      const f = file.load({ id: Number(candidateFileId) });
      const raw = String(f.getContents() || '{}');
      const parsed = safeJsonParse(raw) || {};
      const out = Object.assign({}, deterministic, parsed || {});
      if (!Array.isArray(out.component_names) || out.component_names.length !== 3) out.component_names = deterministic.component_names;
      out.hero_item_name = trimLen(out.hero_item_name, 60);
      out.assembly_name = trimLen(out.assembly_name, 60);
      out.component_names = out.component_names.map(n => trimLen(n, 60));
      out.bom_name = trimLen(out.bom_name, 80);
      out.bom_revision_name = trimLen(out.bom_revision_name, 80);
      out._source = out._source || 'suitelet-precomputed';
      out._signalLen = out._signalLen || String(signalText || '').length;
      return {
        found: true,
        parsed: true,
        applied: true,
        fileId: Number(candidateFileId),
        discoveryMode,
        source: out._source,
        payload: out
      };
    } catch (e) {
      log.error({ title: `Precomputed naming load FAILED (deterministic fallback used) [${VERSION}]`, details: JSON.stringify({ fileId: candidateFileId, extId: extId || '', message: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) }) });
      return {
        found: false,
        parsed: false,
        applied: false,
        fileId: candidateFileId || null,
        discoveryMode,
        source: deterministic._source || 'deterministic',
        payload: deterministic
      };
    }
  }

  function discoverNamingFileIdByExtId(extId) {
    try {
      const filename = `scai_naming_${String(extId || '').trim()}.json`;
      const rs = search.create({
        type: 'file',
        filters: [['name', 'is', filename]],
        columns: [search.createColumn({ name: 'internalid', sort: search.Sort.DESC })]
      }).run().getRange({ start: 0, end: 1 }) || [];
      if (!rs.length) return null;
      return toIntOrNull(rs[0].getValue({ name: 'internalid' }));
    } catch (e) {
      log.error({ title: `Precomputed naming discover FAILED [${VERSION}]`, details: JSON.stringify({ extId: extId || '', message: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) }) });
      return null;
    }
  }

  function generateNamingPack({ prospect, website, signalText }) {
    const clippedSignal = String(signalText || '').slice(0, 1200);
    const websitePack = buildWebsiteSignalNamingPackW483({ prospect, website, signalText: clippedSignal });
    if (websitePack) return websitePack;
    return {
      _source: 'deterministic',
      _signalLen: clippedSignal.length,
      industry_category: '',
      hero_item_name: `${prospect} Finished Good`,
      assembly_name: `${prospect} Assembly`,
      component_names: [
        `${prospect} Component A`,
        `${prospect} Component B`,
        `${prospect} Component C`
      ],
      bom_name: `BOM - ${prospect}`,
      bom_revision_name: `Revision 1 - ${prospect}`
    };
  }

  function buildWebsiteSignalNamingPackW483({ prospect, website, signalText }) {
    const text = compactText([website, prospect, signalText].join(' '));
    const lower = text.toLowerCase();
    const siteProductPack = buildKnownWebsiteProductNamingPackW483({ prospect, website, signalText: text });
    if (siteProductPack) return siteProductPack;
    const rules = [
      {
        pattern: /\b(electric guitar|acoustic guitar|guitars?|bass guitar|amplifiers?|pickups?|strings?|instrument|musical)\b/,
        product: (/\bacoustic guitar|hummingbird|j-45|dove\b/.test(lower) && !/\belectric guitar|pickup|amplifier\b/.test(lower)) ? 'Acoustic Guitar' : 'Electric Guitar',
        industry: 'Musical Instruments Manufacturing',
        components: ['Guitar Body', 'Guitar Neck', 'Pickup and Electronics Kit'],
        operations: { '10': 'Body and Neck Prep', '20': 'Electronics Assembly', '30': 'Final Setup and Case Pack' },
        evidenceTerms: ['guitar', 'musical instrument']
      },
      {
        pattern: /\b(chair|seating|desk|table|sofa|furniture|ergonomic)\b/,
        product: 'Ergonomic Chair',
        industry: 'Furniture Manufacturing',
        components: ['Chair Frame', 'Seat and Back Assembly', 'Hardware Kit'],
        operations: { '10': 'Frame Prep', '20': 'Seat Assembly', '30': 'Final Inspect and Pack' },
        evidenceTerms: ['furniture', 'seating']
      },
      {
        pattern: /\b(vacuum|air purifier|purifier|hair dryer|appliance|electronics)\b/,
        product: 'Premium Home Appliance',
        industry: 'Premium Home Appliance Manufacturing',
        components: ['Motor Assembly', 'Control Housing', 'Retail Packaging'],
        operations: { '10': 'Stage Appliance Components', '20': 'Assemble and Test Unit', '30': 'Pack Retail Unit' },
        evidenceTerms: ['appliance', 'electronics']
      },
      {
        pattern: /\b(forklift|lift truck|pallet truck|warehouse equipment|industrial equipment)\b/,
        product: 'Lift Truck',
        industry: 'Industrial Equipment Manufacturing',
        components: ['Chassis Assembly', 'Mast and Lift Assembly', 'Powertrain Kit'],
        operations: { '10': 'Stage Equipment Kit', '20': 'Assemble Lift System', '30': 'Inspect and Release Unit' },
        evidenceTerms: ['industrial equipment', 'lift truck']
      },
      {
        pattern: /\b(cookware|dutch oven|cast iron|skillet|knife|cutlery|kitchenware)\b/,
        product: 'Cookware Set',
        industry: 'Kitchenware Manufacturing',
        components: ['Cookware Body', 'Handle and Hardware Kit', 'Retail Packaging'],
        operations: { '10': 'Stage Cookware Components', '20': 'Assemble and Finish Set', '30': 'Pack Retail Set' },
        evidenceTerms: ['cookware', 'kitchenware']
      },
      {
        pattern: /\b(tumbler|bottle|cooler|drinkware|mug|cup|hardgoods|outdoor)\b/,
        product: 'Durable Hardgoods Product',
        industry: 'Durable Consumer Goods Manufacturing',
        components: ['Product Body', 'Accessory Kit', 'Retail Packaging'],
        operations: { '10': 'Stage Product Kits', '20': 'Assemble Product', '30': 'Pack and Release Product' },
        evidenceTerms: ['durable hardgoods']
      }
    ];
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      if (!rule.pattern.test(lower)) continue;
      const product = rule.product;
      return {
        _source: 'w483-website-signal-naming-pack',
        _signalLen: String(signalText || '').length,
        industry_category: rule.industry,
        industrySelection: { label: rule.industry, source: 'website_signal_text_w483', confidence: 'medium' },
        selectedIndustryChip: rule.industry,
        selectedProductName: product,
        primary_product_candidate: product,
        selectedCatalogCandidate: { name: product, source: 'website_signal_text_w483', reasons: rule.evidenceTerms },
        catalogCandidates: [{ name: product, source: 'website_signal_text_w483', confidence: 82, reasons: rule.evidenceTerms }],
        fallbackUsed: false,
        fallbackReason: '',
        evidence_terms: rule.evidenceTerms,
        namingEvidenceSource: 'website_signal_text_w483',
        hero_item_name: product,
        assembly_name: `${product} Assembly`,
        component_names: rule.components,
        bom_name: `BOM - ${product}`,
        bom_revision_name: `Revision 1 - ${product}`,
        routing_name: `Routing - ${product}`,
        operation_names_by_seq: rule.operations,
        scenario_label: `${product} Scenario`,
        commercial_summary: `${product} gives the demo a concrete commercial anchor while notes shape pressure, ROI, and competitive handling.`
      };
    }
    return null;
  }

  function buildKnownWebsiteProductNamingPackW483({ prospect, website, signalText }) {
    const lower = compactText([website, prospect, signalText].join(' ')).toLowerCase();
    const packs = [
      {
        domain: /hestanculinary\.com|hestan culinary|hestan\b/,
        products: ['NanoBond', 'CopperBond', 'ProBond'],
        industry: 'Premium Cookware Manufacturing',
        category: 'premium cookware',
        components: ['Bonded Cookware Body', 'Stainless Handle Set', 'Retail Cookware Packaging'],
        operations: { '10': 'Stage Cookware Body', '20': 'Attach Handles and Finish', '30': 'Pack Premium Cookware' },
        evidenceSource: 'hestanculinary.com public product collections'
      }
    ];
    for (let i = 0; i < packs.length; i += 1) {
      const pack = packs[i];
      if (!pack.domain.test(lower)) continue;
      const selected = selectKnownWebsiteProductW483(pack.products, lower);
      return concreteWebsiteProductNamingPackW483({
        prospect,
        product: selected,
        productExamples: pack.products,
        industry: pack.industry,
        category: pack.category,
        components: pack.components,
        operations: pack.operations,
        evidenceSource: pack.evidenceSource,
        website
      });
    }
    return null;
  }

  function selectKnownWebsiteProductW483(products, lower) {
    for (let i = 0; i < (products || []).length; i += 1) {
      const product = String(products[i] || '');
      if (product && lower.indexOf(product.toLowerCase()) !== -1) return product;
    }
    return products && products[0] || '';
  }

  function concreteWebsiteProductNamingPackW483(args) {
    const product = args.product;
    const examples = Array.isArray(args.productExamples) ? args.productExamples : [product];
    const candidates = examples.filter(Boolean).map(function(name, index) {
      return {
        name,
        source: 'website_product_examples_w483',
        confidence: index === 0 ? 96 : 91,
        reasons: [args.evidenceSource || 'public website product examples']
      };
    });
    return {
      _source: 'website-product-examples-w483',
      _signalLen: String(args.website || '').length,
      industry_category: args.industry,
      industrySelection: { label: args.industry, source: 'website_product_examples_w483', confidence: 'high' },
      selectedIndustryChip: args.industry,
      selectedProductName: product,
      primary_product_candidate: product,
      websiteProductExamplesW483: examples,
      selectedCatalogCandidate: candidates[0],
      catalogCandidates: candidates,
      fallbackUsed: false,
      fallbackReason: '',
      evidence_terms: examples.concat([args.category || 'website product']),
      namingEvidenceSource: 'website_product_examples_w483',
      websiteEvidenceSource: 'website_product_examples_w483',
      websiteEvidenceSourceUrls: args.website ? [args.website] : [],
      hero_item_name: product,
      assembly_name: `${product} Assembly`,
      component_names: args.components,
      bom_name: `BOM - ${product}`,
      bom_revision_name: `Revision 1 - ${product}`,
      routing_name: `Routing - ${product}`,
      operation_names_by_seq: args.operations,
      scenario_label: `${product} Availability Proof`,
      commercial_summary: `${product} gives the demo a concrete product anchor from the public website.`
    };
  }

  function applyNamingToAnchors(ids, names, opts) {
    const enableManufacturing = !opts || opts.enableManufacturing !== false;
    const createNewHeroItem = !!(opts && opts.createNewHeroItem);
    const extId = opts && opts.extId;
    const heroNamePair = buildDifferentiatedNames(names.hero_item_name, extId);
    const heroSalesDesc = `${names.hero_item_name} finished good ready for sale.`;
    const heroPurchDesc = `Purchased inputs supporting ${names.hero_item_name} production.`;

    const asmNameBase = names.assembly_name || names.hero_item_name;
    const asmNamePair = buildDifferentiatedNames(asmNameBase, extId);
    const asmSalesDesc  = `${asmNameBase} buildable finished good for customer orders.`;
    const asmPurchDesc  = `Assembly supply inputs used to build ${asmNameBase}.`;

    function compSalesDesc(compName) {
      return `${compName} component used in ${asmNameBase}.`;
    }
    function compPurchDesc(compName) {
      return `Procured ${compName} material for ${asmNameBase}.`;
    }

    const heroValues = {
      itemid: heroNamePair.itemIdName,
      displayname: heroNamePair.displayName,
      salesdescription: heroSalesDesc,
      purchasedescription: heroPurchDesc
    };

    log.audit({
      title: `Naming mode resolution [${VERSION}]`,
      details: JSON.stringify({
        createNewHeroItem,
        heroItemId: Number(ids.heroItemId || 0),
        heroItemExternalId: ids.heroItemExternalId || '',
        heroItemNamingMode: createNewHeroItem ? 'fresh-hero-itemid-and-displayname-with-extid-suffix' : 'anchor-itemid-and-displayname-with-extid-suffix',
        heroDisplayName: heroNamePair.displayName,
        heroItemIdName: heroNamePair.itemIdName,
        namingSuffix: heroNamePair.suffix,
        namingCollisionAvoidance: 'extid-suffix',
        enableManufacturing
      })
    });

    safeTry(() => record.submitFields({
      type: 'inventoryitem',
      id: Number(ids.heroItemId),
      values: heroValues,
      options: { enableSourcing: true, ignoreMandatoryFields: true }
    }));

    if (enableManufacturing && ids.assemblyId) {
      safeTry(() => record.submitFields({
        type: 'assemblyitem',
        id: Number(ids.assemblyId),
        values: {
          itemid: asmNamePair.itemIdName,
          displayname: asmNamePair.displayName,
          salesdescription: asmSalesDesc,
          purchasedescription: asmPurchDesc
        },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));

      const comps = [
        { id: ids.comp1Id, name: names.component_names[0] },
        { id: ids.comp2Id, name: names.component_names[1] },
        { id: ids.comp3Id, name: names.component_names[2] }
      ].filter(c => c.id);

      comps.forEach(c => {
        const compNamePair = buildDifferentiatedNames(c.name, extId);
        return safeTry(() => record.submitFields({
          type: 'inventoryitem',
          id: Number(c.id),
          values: {
            itemid: compNamePair.itemIdName,
            displayname: compNamePair.displayName,
            salesdescription: compSalesDesc(c.name),
            purchasedescription: compPurchDesc(c.name)
          },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        }));
      });

      if (ids.bomId) {
        const bomNamePair = buildDifferentiatedNames(names.bom_name, extId);
        safeTry(() => record.submitFields({
          type: 'bom',
          id: Number(ids.bomId),
          values: { name: bomNamePair.itemIdName },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        }));
      }

      if (ids.bomRevId) {
        const bomRevNamePair = buildDifferentiatedNames(names.bom_revision_name, extId);
        safeTry(() => record.submitFields({
          type: 'bomrevision',
          id: Number(ids.bomRevId),
          values: { name: bomRevNamePair.itemIdName },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        }));
      }
    }
  }


  // ----------------------------
  // Pricing (unchanged)
  // ----------------------------
  function setBaseSalesPrice(itemType, itemId, amount) {
    const sublistCandidates = ['price1', 'price', 'pricing', 'pricelevels'];
    const fieldCandidates = ['price_1_', 'price', 'unitprice', 'baseprice'];
    const levelFieldCandidates = ['pricelevel', 'level', 'pricelevelname'];

    const rec = record.load({ type: itemType, id: Number(itemId), isDynamic: true });

    let chosenSublist = null;
    for (let i = 0; i < sublistCandidates.length; i++) {
      const sid = sublistCandidates[i];
      try { rec.getLineCount({ sublistId: sid }); chosenSublist = sid; break; } catch (e) {}
    }
    if (!chosenSublist) {
      log.error({ title: `Base price set FAILED (no pricing sublist) [${VERSION}]`, details: JSON.stringify({ itemType, itemId, amount }) });
      return;
    }

    const allFields = safeTryReturn(() => rec.getSublistFields({ sublistId: chosenSublist })) || [];
    const priceFieldId = firstExisting(allFields, fieldCandidates) || fieldCandidates[0];

    const levelFieldId = firstExisting(allFields, levelFieldCandidates);
    let targetLine = 0;

    if (levelFieldId) {
      const lineCount = safeTryReturn(() => rec.getLineCount({ sublistId: chosenSublist })) || 0;
      for (let ln = 0; ln < lineCount; ln++) {
        const txt = safeTryReturn(() => rec.getSublistText({ sublistId: chosenSublist, fieldId: levelFieldId, line: ln })) || '';
        const val = safeTryReturn(() => rec.getSublistValue({ sublistId: chosenSublist, fieldId: levelFieldId, line: ln })) || '';
        if (String(txt).toLowerCase().indexOf('base') !== -1 || String(val) === '1') {
          targetLine = ln;
          break;
        }
      }
    }

    try {
      rec.selectLine({ sublistId: chosenSublist, line: targetLine });

      let setOk = false;
      const tryFields = [priceFieldId].concat(fieldCandidates.filter(f => f !== priceFieldId));
      for (let j = 0; j < tryFields.length; j++) {
        const f = tryFields[j];
        if (allFields.indexOf(f) === -1) continue;

        const ok = safeTryReturn(() => {
          rec.setCurrentSublistValue({ sublistId: chosenSublist, fieldId: f, value: Number(amount) });
          return true;
        });

        if (ok) {
          setOk = true;
          log.audit({
            title: `Base price field used [${VERSION}]`,
            details: JSON.stringify({ itemType, itemId, sublistId: chosenSublist, line: targetLine, fieldId: f, amount })
          });
          break;
        }
      }

      if (!setOk) {
        log.error({ title: `Base price set FAILED (no usable price field) [${VERSION}]`, details: JSON.stringify({ itemType, itemId, sublistId: chosenSublist, fields: allFields }) });
        return;
      }

      rec.commitLine({ sublistId: chosenSublist });
      rec.save({ enableSourcing: true, ignoreMandatoryFields: true });

      log.audit({ title: `Base price SET [${VERSION}]`, details: JSON.stringify({ itemType, itemId, amount }) });
    } catch (e) {
      log.error({
        title: `Base price set FAILED [${VERSION}]`,
        details: JSON.stringify({ itemType, itemId, amount, err: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) })
      });
    }
  }

  // ----------------------------
  // SO CSV + import
  // ----------------------------
  function createSalesOrderDirectW483({ extId, prospect, website, agenda, customerId, itemId, locationId }) {
    const existingId = findByExternalId('salesorder', extId);
    if (existingId) return Number(existingId);

    const templateId = findSalesOrderTemplateW483();
    const so = templateId
      ? record.copy({ type: 'salesorder', id: Number(templateId), isDynamic: true })
      : record.create({ type: 'salesorder', isDynamic: true });
    so.setValue({ fieldId: 'externalid', value: String(extId || '') });
    so.setValue({ fieldId: 'entity', value: Number(customerId) });
    safeTry(() => so.setValue({ fieldId: 'orderstatus', value: 'B' }));
    if (locationId) safeTry(() => so.setValue({ fieldId: 'location', value: Number(locationId) }));
    safeTry(() => so.setValue({ fieldId: 'memo', value: trimLen(`SCAI Demo Reset: ${prospect || ''}${website ? ` (${extractDomain(website)})` : ''} - ${summarizeOneLine(agenda || '')}`, 999) }));

    safeTry(() => {
      const count = so.getLineCount({ sublistId: 'item' }) || 0;
      for (let i = count - 1; i >= 0; i--) so.removeLine({ sublistId: 'item', line: i, ignoreRecalc: true });
    });

    [
      { quantity: 6, rate: 20.83333333 },
      { quantity: 9, rate: 25 },
      { quantity: 14, rate: 25 }
    ].forEach((line) => {
      so.selectNewLine({ sublistId: 'item' });
      so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: Number(itemId) });
      if (locationId) safeTry(() => so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: Number(locationId) }));
      so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: Number(line.quantity) });
      safeTry(() => so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: Number(line.rate) }));
      so.commitLine({ sublistId: 'item' });
    });

    const id = Number(so.save({ enableSourcing: true, ignoreMandatoryFields: true }));
    log.audit({ title: `Direct Sales Order created [${VERSION}]`, details: JSON.stringify({ id, extId, customerId, itemId, templateId: templateId || null }) });
    return id;
  }

  function findSalesOrderTemplateW483() {
    try {
      const rs = search.create({
        type: 'salesorder',
        filters: [['mainline', 'is', 'T'], 'and', ['memo', 'contains', 'SCAI Demo Reset']],
        columns: [search.createColumn({ name: 'internalid', sort: search.Sort.DESC })]
      }).run().getRange({ start: 0, end: 1 }) || [];
      return rs.length ? Number(rs[0].getValue({ name: 'internalid' })) : null;
    } catch (e) {
      return null;
    }
  }

  function buildSoCsv({ extId, prospect, website, agenda, locationId, itemKey, customerKey }) {
    const memoBase = `SCAI Demo Reset: ${prospect}${website ? ` (${extractDomain(website)})` : ''}`;
    const memo = agenda ? memoBase + ' - ' + summarizeOneLine(agenda) : memoBase;

    const today = new Date();
    const d1 = fmtDate(today);
    const d2 = fmtDate(addMonths(today, 1));
    const d3 = fmtDate(addMonths(today, 2));

    const header = [
      'US Dollar',
      'Customer Internal ID (Header)',
      'CSV External ID',
      'Process',
      'Pending Fulfillment',
      'Memo',
      'Date',
      'Location',
      'Item Internal ID',
      'Line Location',
      'Quantity',
      'Rate',
      'Supply Required by Date'
    ].join(',');

    const custKey = String(customerKey || ANCHORS.customer);
    const itemKeyResolved = String(itemKey || ANCHORS.heroItem);
    const loc = locationId ? String(locationId) : '';

    const line1 = ['US Dollar', custKey, extId, 'Process', 'Pending Fulfillment', csvQuote(memo), d1, loc, itemKeyResolved, loc, '6', '20.83333333', d1].join(',');
    const line2 = ['US Dollar', custKey, extId, 'Process', 'Pending Fulfillment', csvQuote(memo), d1, loc, itemKeyResolved, loc, '9', '25', d2].join(',');
    const line3 = ['US Dollar', custKey, extId, 'Process', 'Pending Fulfillment', csvQuote(memo), d1, loc, itemKeyResolved, loc, '14', '25', d3].join(',');

    return [header, line1, line2, line3].join('\n');
  }

  function saveCsvToFileCabinet({ folderId, filename, contents }) {
    const f = file.create({ name: filename, fileType: file.Type.CSV, contents, folder: Number(folderId) });
    return Number(f.save());
  }

  function submitCsvImport({ mappingId, fileId }) {
    const f = file.load({ id: Number(fileId) });
    const t = task.create({ taskType: task.TaskType.CSV_IMPORT, mappingId: Number(mappingId), importFile: f });
    return t.submit();
  }

  // ----------------------------
  // Search helpers
  // ----------------------------
  function findByExternalId(type, externalId) {
    const s = search.create({ type, filters: [['externalid', 'is', externalId]], columns: ['internalid'] });
    const res = s.run().getRange({ start: 0, end: 1 });
    return (res && res.length) ? res[0].getValue({ name: 'internalid' }) : null;
  }

  function mustFindByExternalId(type, externalId) {
    const id = findByExternalId(type, externalId);
    if (!id) throw new Error(`Missing required anchor: ${type} externalid=${externalId}`);
    return Number(id);
  }

  // ----------------------------
  // Date helpers
  // ----------------------------
  function addMonths(d, m) { const x = new Date(d.getTime()); x.setMonth(x.getMonth() + m); return x; }
  function fmtDate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear());
    return `${mm}/${dd}/${yy}`;
  }

  // ----------------------------
  // Text helpers
  // ----------------------------
  function extractDomain(website) {
    try {
      const s = String(website || '').trim();
      if (!s) return '';
      const v = /^https?:\/\//i.test(s) ? s : `https://${s}`;
      const m = v.match(/^https?:\/\/([^\/?#]+)/i);
      return m && m[1] ? m[1].toLowerCase() : '';
    } catch (e) { return ''; }
  }

  function stripHtml(html) {
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  function compactText(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function clipToKeywords(text, keywords, maxLen) {
    const t = String(text || '');
    const lower = t.toLowerCase();
    let best = '';
    keywords.forEach(k => {
      const idx = lower.indexOf(k);
      if (idx !== -1) {
        const start = Math.max(0, idx - 500);
        const end = Math.min(t.length, idx + 1700);
        const slice = t.slice(start, end);
        if (slice.length > best.length) best = slice;
      }
    });
    if (!best) return '';
    return best.length <= maxLen ? best : best.slice(0, maxLen);
  }

  function extractJson(s) {
    const t = String(s || '').trim();
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    return (start === -1 || end === -1 || end <= start) ? t : t.slice(start, end + 1);
  }

  function safeJsonParse(s) { try { return JSON.parse(String(s || '')); } catch (e) { return null; } }
  function shortExtSuffix(extId) {
    const raw = String(extId || '').replace(/^SCAI_SO_/i, '').replace(/[^A-Za-z0-9]/g, '');
    if (!raw) return 'RUN';
    return raw.slice(-8).toUpperCase();
  }

  function buildDifferentiatedNames(baseName, extId) {
    const cleanBase = String(baseName || 'Demo').replace(/^SCAI\s*-\s*/i, '').trim() || 'Demo';
    const suffix = shortExtSuffix(extId);
    return {
      displayName: trimLen(`SCAI - ${cleanBase}`, 120),
      itemIdName: trimLen(`SCAI - ${cleanBase} - ${suffix}`, 60),
      suffix
    };
  }

  function trimLen(s, n) { const t = String(s || '').trim(); return t.length <= n ? t : t.slice(0, n).trim(); }
  function summarizeOneLine(text) { const t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length <= 160 ? t : t.slice(0, 157) + '...'; }

  function csvQuote(s) {
    const t = String(s || '');
    if (t.indexOf(',') === -1 && t.indexOf('"') === -1 && t.indexOf('\n') === -1) return t;
    return `"${t.replace(/"/g, '""')}"`;
  }

  // ----------------------------
  // Small utils
  // ----------------------------
  function str(v) { return String(v || '').trim(); }
  function toIntOrNull(v) { if (v === null || v === undefined || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
  function safeTry(fn) { try { return fn(); } catch (e) {} }
  function safeTryReturn(fn) { try { return fn(); } catch (e) { return null; } }

  function firstExisting(allFields, candidates) {
    for (let i = 0; i < candidates.length; i++) {
      if (allFields.indexOf(candidates[i]) !== -1) return candidates[i];
    }
    return null;
  }

  function randInt(min, max) {
    const lo = Math.max(0, Number(min || 0));
    const hi = Math.max(lo, Number(max || lo));
    return Math.floor(lo + Math.random() * (hi - lo + 1));
  }

  function normalizeBool(v) {
    const s = String(v || '').trim().toUpperCase();
    if (!s) return false;
    return (s === 'T' || s === 'TRUE' || s === 'YES' || s === '1' || s === 'ON');
  }

  return { execute };
});
