/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 *
 * W24 GOVERNED PILOT COPY.
 *
 * This file is intentionally separate from idb_suitescript_write_path_suitelet.js.
 * It may be uploaded only to an approved NetSuite pilot deployment after W23
 * create-disabled smoke evidence is preserved.
 *
 * Approved W24/W40 scope:
 * - Customer write first.
 * - Proof Item write second only after Customer ID/URL exists.
 * - No Sales Order / transaction context write.
 *
 * Intelligent Demo Builder SuiteScript direct-write package scaffold.
 *
 * G9 boundary:
 * - Create disabled by default.
 * - Validates the reviewed packet shape.
 * - Maps lane/role intent to NetSuite record types.
 * - Returns blocked/validated responses until the write path is deliberately enabled.
 *
 * U12 boundary:
 * - Requires Creation Packet Contract V2 fields before any future create path.
 * - Aligns server validation with the drawer review packet.
 * - Adds lookup-first and idempotency metadata before any future create/update.
 *
 * V13 boundary:
 * - Defines a tiny Food / Beverage pilot path for Customer + Finished Good only.
 * - Main package still has CREATE_ENABLED = false, so no live writes execute here.
 *
 * V14 boundary:
 * - Defines partial-failure and rollback evidence before any additional record type is enabled.
 * - No silent retry and no silent deletion.
 *
 * V15 boundary:
 * - Defines the transaction context pilot only after Customer + Finished Good parent results are stable.
 * - No transaction write without customer and proof result IDs.
 * - Still returns create-disabled results; no live writes are enabled here.
 *
 * W14-W15 boundary:
 * - Main CREATE_ENABLED remains false.
 * - Adds explicit runtime flag strategy and Customer-only pilot execution shape.
 * - Customer write path is lookup-first, idempotent, approved-environment-gated, and result-trace required.
 *
 * W16 boundary:
 * - Adds the proof-item pilot only after Customer result IDs/URLs are present.
 * - Proof item write remains create-disabled in the main package.
 * - Transaction context remains blocked until both Customer and Proof Item results exist.
 *
 * W19-W21 boundary:
 * - Describes the governed write pilot branch without enabling writes in the main package.
 * - Transaction context can only plan against traceable Customer and Proof Item parent results.
 * - Five-consultant pilot packaging must preserve exact files, reset steps, and evidence gates.
 *
 * W22 boundary:
 * - Defines the exact branch/runtime toggle path for an approved-environment Customer + Proof Item pilot.
 * - Main package keeps CREATE_ENABLED = false.
 * - A pilot branch that flips CREATE_ENABLED still must pass approved runtime flags and type-to-confirm before writes.
 */
define(['N/record', 'N/runtime', 'N/url', 'N/search'], (record, runtime, url, search) => {
  const CREATE_ENABLED = true;
  const TRANSACTION_CONTEXT_ENABLED = false;
  const WRITE_PATH_TYPE = 'suitescript_direct_write';
  const TRACE_EVENT = 'suitescript_write_path_result';
  const CREATION_PACKET_SCHEMA = 'idb.creation-packet.v2';
  const PILOT_LANE_IDS = ['food_beverage', 'products_cpg'];
  const PILOT_LANE_ID = PILOT_LANE_IDS[0];
  const PILOT_ALLOWED_ROLES = ['customer', 'proof anchor'];
  const CUSTOMER_PILOT_ROLE = 'customer';
  const PROOF_PILOT_ROLE = 'proof anchor';
  const APPROVED_DEMO_ACCOUNT_IDS = ['TD3021666', '3021666'];
  const APPROVED_DEMO_HOSTS = ['YOUR_ACCOUNT_ID.app.netsuite.com'];
  const RUNTIME_FLAGS = {
    enablePilotWritesParameter: 'custscript_idb_enable_pilot_writes',
    allowCustomerPilotParameter: 'custscript_idb_allow_customer_pilot',
    allowProofItemPilotParameter: 'custscript_idb_allow_proof_item_pilot',
    sandboxAccountParameter: 'custscript_idb_sandbox_account_only',
    requireTypeToConfirmParameter: 'custscript_idb_require_type_confirm',
    defaultSubsidiaryParameter: 'custscript_idb_default_subsidiary',
    defaultLocationParameter: 'custscript_idb_default_location',
    defaultTaxScheduleParameter: 'custscript_idb_default_taxschedule',
    defaultCurrencyParameter: 'custscript_idb_default_currency',
    defaultTermsParameter: 'custscript_idb_default_terms',
    defaultDepartmentParameter: 'custscript_idb_default_department',
    defaultClassParameter: 'custscript_idb_default_class',
    defaultVendorParameter: 'custscript_idb_default_vendor',
    requireVendorAttachParameter: 'custscript_idb_require_vendor_attach',
    defaultPurchasePriceParameter: 'custscript_idb_default_purchase_price',
    planningPolicyParameter: 'custscript_idb_planning_policy',
    disableAutoPlanningParameter: 'custscript_idb_disable_auto_planning',
    replenishmentMethodParameter: 'custscript_idb_default_replenishment_method',
    defaultCreateEnabled: CREATE_ENABLED,
    approvedLaneId: PILOT_LANE_ID,
    approvedLaneIds: PILOT_LANE_IDS,
    approvedCustomerRole: CUSTOMER_PILOT_ROLE,
    approvedProofRole: PROOF_PILOT_ROLE,
    transactionContextRequiresParentResults: true
  };
  const REQUIRED_CREATION_CONTRACT_FIELDS = [
    'sequence',
    'label',
    'recordType',
    'proposedName',
    'createIntent',
    'idempotencyKey',
    'existingRecordLookup',
    'dependencies',
    'rollbackLabel',
    'traceResultRequired'
  ];
  const RECORD_TYPES = {
    CUSTOMER: 'customer',
    SALES_ORDER: 'salesorder',
    VENDOR: 'vendor',
    INVENTORY_ITEM: 'inventoryitem',
    ASSEMBLY_ITEM: 'assemblyitem',
    LOT_NUMBERED_INVENTORY_ITEM: 'lotnumberedinventoryitem'
  };

  const LANE_RECORD_TYPE_MAP = {
    products_cpg: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.INVENTORY_ITEM,
      supportingProof: 'customrecord_idb_cpg_readiness'
    },
    food_beverage: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.INVENTORY_ITEM,
      supportingProof: 'customrecord_idb_food_readiness'
    },
    industrial_equipment: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.ASSEMBLY_ITEM,
      supportingProof: 'customrecord_idb_assembly_readiness'
    },
    life_sciences: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.LOT_NUMBERED_INVENTORY_ITEM,
      supportingProof: 'customrecord_idb_lot_release'
    },
    industrial_distribution: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.INVENTORY_ITEM,
      supportingProof: 'customrecord_idb_branch_availability'
    },
    dealer_hardgoods: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.INVENTORY_ITEM,
      supportingProof: 'customrecord_idb_dealer_readiness'
    },
    apparel_accessories: {
      customer: RECORD_TYPES.CUSTOMER,
      transaction: RECORD_TYPES.SALES_ORDER,
      proofAnchor: RECORD_TYPES.INVENTORY_ITEM,
      supportingProof: 'customrecord_idb_style_availability'
    }
  };

  function response(status, packet, errors, createdRecords) {
    return {
      status,
      traceEvent: TRACE_EVENT,
      writePathType: WRITE_PATH_TYPE,
      createEnabled: CREATE_ENABLED,
      packetId: packet && packet.trace && packet.trace.packetId ? packet.trace.packetId : null,
      selectedLaneId: packet ? packet.selectedLaneId : null,
      proofAnchor: packet ? packet.proofAnchor : null,
      createdRecords: createdRecords || [],
      runtimeFlags: runtimeFlagStrategy(),
      partialFailurePolicy: partialFailurePolicy(),
      errors: errors || []
    };
  }

  function runtimeFlagStrategy() {
    return {
      schema: 'idb.runtime-flag-strategy.v1',
      createEnabled: CREATE_ENABLED,
      writePathType: WRITE_PATH_TYPE,
      flags: RUNTIME_FLAGS,
      mainPackageStatus: 'create_disabled',
      pilotBranchStatus: CREATE_ENABLED ? 'runtime_flags_required' : 'blocked_create_disabled',
      requiredBeforeAnyWrite: [
        'pilot branch has deliberately set CREATE_ENABLED true',
        'approved pilot environment parameter allows pilot writes',
        'customer pilot flag is enabled',
        'proof item pilot flag is enabled',
        'reviewed Creation Packet Contract V2 is valid',
        'consultantConfirmed is true',
        'type-to-confirm phrase matches the reviewed packet',
        'trace result capture is available'
      ],
      nonRegression: {
        mainCreateDisabled: true,
        noAutomaticCreation: true,
        noTransactionWriteWithoutCustomerAndProofResult: true,
        llmAdvisoryOnly: true
      }
    };
  }

  function partialFailurePolicy() {
    return {
      schema: 'idb.partial-failure-policy.v1',
      status: 'partial_failed',
      rule: 'Return partial_failed when at least one parent record succeeds and a dependent write fails.',
      noSilentRetry: true,
      noSilentDeletion: true,
      requiredTraceFields: ['sequence', 'label', 'recordType', 'recordId', 'url', 'operation', 'rollbackLabel', 'recoverableErrors'],
      stopDependentWritesOnParentFailure: true
    };
  }

  function governedWritePilotBranchPlan(packet, writePlan, context) {
    const customer = writePlan.find((item) => item.role === CUSTOMER_PILOT_ROLE);
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const toggle = governedPilotRuntimeToggle(packet, context);
    return {
      schema: 'idb.governed-write-pilot-branch.v1',
      status: toggle.allowed ? 'pilot_runtime_ready' : toggle.status,
      mainPackageCreateEnabled: CREATE_ENABLED,
      approvedBranchOnly: true,
      runtimeToggle: toggle,
      approvedPilotScope: {
        laneId: packet && packet.selectedLaneId ? packet.selectedLaneId : PILOT_LANE_ID,
        laneIds: PILOT_LANE_IDS,
        roles: PILOT_ALLOWED_ROLES,
        customerRecord: customer ? customer.plannedName : null,
        proofRecord: proof ? proof.plannedName : null,
        transactionContext: 'blocked_until_w20_parent_results'
      },
      requiredRuntimeFlags: [
        RUNTIME_FLAGS.enablePilotWritesParameter,
        RUNTIME_FLAGS.allowCustomerPilotParameter,
        RUNTIME_FLAGS.allowProofItemPilotParameter,
        RUNTIME_FLAGS.sandboxAccountParameter,
        RUNTIME_FLAGS.requireTypeToConfirmParameter
      ],
      requiredBeforeWrite: [
        'reviewed Creation Packet Contract V2',
        'consultantConfirmed true',
        'type-to-confirm phrase matches packet',
        'approved environment runtime flags enabled in pilot branch',
        'trace result capture ready'
      ],
      traceResultContract: {
        event: TRACE_EVENT,
        packetId: packet && packet.trace ? packet.trace.packetId : null,
        recordIds: true,
        urls: true,
        operations: true,
        lookupStatus: true,
        rollbackLabels: true,
        recoverableErrors: true,
        blockedDependents: true
      },
      noRegression: {
        noWritesFromMainDrawer: true,
        noAutomaticCreation: true,
        noTransactionContextUntilParentsStable: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function governedPilotRuntimeToggle(packet, context) {
    const expectedPhrase = typeToConfirmPhrase(packet);
    const environmentGate = pilotEnvironmentAllowed(context);
    const gates = [
      {
        key: 'compile_create_enabled',
        status: CREATE_ENABLED ? 'ready' : 'blocked',
        detail: CREATE_ENABLED ? 'Pilot branch compile flag is enabled.' : 'Main package compile flag keeps creation disabled.'
      },
      {
        key: RUNTIME_FLAGS.enablePilotWritesParameter,
        status: runtimeFlagEnabled(RUNTIME_FLAGS.enablePilotWritesParameter) ? 'ready' : 'blocked',
        detail: 'Runtime parameter must explicitly allow pilot writes.'
      },
      {
        key: RUNTIME_FLAGS.allowCustomerPilotParameter,
        status: runtimeFlagEnabled(RUNTIME_FLAGS.allowCustomerPilotParameter) ? 'ready' : 'blocked',
        detail: 'Runtime parameter must explicitly allow Customer pilot writes.'
      },
      {
        key: RUNTIME_FLAGS.allowProofItemPilotParameter,
        status: runtimeFlagEnabled(RUNTIME_FLAGS.allowProofItemPilotParameter) ? 'ready' : 'blocked',
        detail: 'Runtime parameter must explicitly allow Proof Item pilot writes.'
      },
      {
        key: RUNTIME_FLAGS.sandboxAccountParameter,
        status: runtimeFlagEnabled(RUNTIME_FLAGS.sandboxAccountParameter) && environmentGate.allowed ? 'ready' : 'blocked',
        detail: environmentGate.detail
      },
      {
        key: RUNTIME_FLAGS.requireTypeToConfirmParameter,
        status: runtimeFlagEnabled(RUNTIME_FLAGS.requireTypeToConfirmParameter) ? 'ready' : 'blocked',
        detail: 'Runtime parameter must require the type-to-confirm phrase.'
      },
      {
        key: 'type_to_confirm_phrase',
        status: providedTypeToConfirm(packet) === expectedPhrase ? 'ready' : 'blocked',
        detail: `Consultant must submit exact phrase: ${expectedPhrase}`
      }
    ];
    const allowed = gates.every((gate) => gate.status === 'ready');
    return {
      schema: 'idb.w22-governed-pilot-runtime-toggle.v1',
      status: allowed ? 'pilot_runtime_ready' : (CREATE_ENABLED ? 'blocked_runtime_toggle' : 'blocked_main_create_disabled'),
      allowed,
      expectedPhrase,
      environment: runtimeEnvironment(),
      accountId: runtimeAccountId(),
      requestHost: requestHost(context),
      pilotEnvironment: environmentGate,
      gates,
      allowedLaneIds: PILOT_LANE_IDS,
      allowedRoles: PILOT_ALLOWED_ROLES,
      blockedTransactionContext: true,
      noRegression: {
        mainPackageCreateDisabled: CREATE_ENABLED === false,
        approvedPilotEnvironmentOnly: true,
        noWriteWithoutTypeToConfirm: true,
        noTransactionWriteInToggle: true
      }
    };
  }

  function runtimeFlagEnabled(parameterName) {
    try {
      const value = runtime.getCurrentScript().getParameter({ name: parameterName });
      return value === true || value === 'T' || value === 'true' || value === 'Y' || value === '1';
    } catch (error) {
      return false;
    }
  }

  function runtimeParameter(parameterName) {
    try {
      const value = runtime.getCurrentScript().getParameter({ name: parameterName });
      if (value === false) return '';
      return value === null || value === undefined ? '' : String(value).trim();
    } catch (error) {
      return '';
    }
  }

  function accountContextResolver() {
    const subsidiaryId = runtimeParameter(RUNTIME_FLAGS.defaultSubsidiaryParameter);
    const locationId = runtimeParameter(RUNTIME_FLAGS.defaultLocationParameter);
    const taxScheduleId = runtimeParameter(RUNTIME_FLAGS.defaultTaxScheduleParameter);
    const currencyId = runtimeParameter(RUNTIME_FLAGS.defaultCurrencyParameter);
    const termsId = runtimeParameter(RUNTIME_FLAGS.defaultTermsParameter);
    const departmentId = runtimeParameter(RUNTIME_FLAGS.defaultDepartmentParameter);
    const classId = runtimeParameter(RUNTIME_FLAGS.defaultClassParameter);
    const missingRuntimeParameters = [];

    if (!subsidiaryId) missingRuntimeParameters.push(RUNTIME_FLAGS.defaultSubsidiaryParameter);
    if (!taxScheduleId) missingRuntimeParameters.push(RUNTIME_FLAGS.defaultTaxScheduleParameter);

    return {
      schema: 'idb.account-context-resolver.v2',
      status: missingRuntimeParameters.length ? 'blocked_missing_account_context' : 'account_context_ready',
      requiredRuntimeParameters: [
        RUNTIME_FLAGS.defaultSubsidiaryParameter,
        RUNTIME_FLAGS.defaultTaxScheduleParameter
      ],
      optionalRuntimeParameters: [
        RUNTIME_FLAGS.defaultLocationParameter,
        RUNTIME_FLAGS.defaultCurrencyParameter,
        RUNTIME_FLAGS.defaultTermsParameter,
        RUNTIME_FLAGS.defaultDepartmentParameter,
        RUNTIME_FLAGS.defaultClassParameter
      ],
      recommendedRuntimeParameters: [
        RUNTIME_FLAGS.defaultLocationParameter,
        RUNTIME_FLAGS.defaultCurrencyParameter,
        RUNTIME_FLAGS.defaultTermsParameter
      ],
      missingRuntimeParameters,
      values: {
        subsidiaryId,
        locationId,
        taxScheduleId,
        currencyId,
        termsId,
        departmentId,
        classId
      },
      source: {
        subsidiaryId: subsidiaryId ? RUNTIME_FLAGS.defaultSubsidiaryParameter : 'missing',
        locationId: locationId ? RUNTIME_FLAGS.defaultLocationParameter : 'not_configured',
        taxScheduleId: taxScheduleId ? RUNTIME_FLAGS.defaultTaxScheduleParameter : 'missing',
        currencyId: currencyId ? RUNTIME_FLAGS.defaultCurrencyParameter : 'not_configured',
        termsId: termsId ? RUNTIME_FLAGS.defaultTermsParameter : 'not_configured',
        departmentId: departmentId ? RUNTIME_FLAGS.defaultDepartmentParameter : 'not_configured',
        classId: classId ? RUNTIME_FLAGS.defaultClassParameter : 'not_configured'
      },
      writeRequirementsByRole: {
        customer: {
          required: [
            RUNTIME_FLAGS.defaultSubsidiaryParameter
          ],
          optional: [
            RUNTIME_FLAGS.defaultCurrencyParameter,
            RUNTIME_FLAGS.defaultTermsParameter,
            RUNTIME_FLAGS.defaultDepartmentParameter,
            RUNTIME_FLAGS.defaultClassParameter
          ]
        },
        proofAnchor: {
          required: [
            RUNTIME_FLAGS.defaultSubsidiaryParameter,
            RUNTIME_FLAGS.defaultTaxScheduleParameter
          ],
          optional: [
            RUNTIME_FLAGS.defaultLocationParameter,
            RUNTIME_FLAGS.defaultDepartmentParameter,
            RUNTIME_FLAGS.defaultClassParameter
          ]
        }
      },
      noRegression: {
        resolveBeforeCustomerWrite: true,
        resolveBeforeProofItemWrite: true,
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true
      }
    };
  }

  function accountContextBlockedResponse(packet, writePlan, accountContext, context) {
    const vendorContext = vendorContextResolver(packet);
    const planningContext = planningContextResolver(packet);
    return Object.assign(response('blocked_missing_account_context', packet, [
      errorLine(0, 'accountContext', `Missing required runtime parameter(s): ${accountContext.missingRuntimeParameters.join(', ')}`)
    ]), {
      writePlan,
      runtimeFlagStrategy: runtimeFlagStrategy(),
      governedPilotRuntimeToggle: governedPilotRuntimeToggle(packet, context),
      governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan, context),
      accountContext,
      vendorContext,
      vendorAttachPilotPlan: vendorAttachPilotPlan(packet, writePlan, vendorContext),
      planningContext,
      planningControlPlan: planningControlPlan(packet, writePlan, planningContext),
      customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
      proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan),
      proofItemWriteV2: proofItemWriteV2Contract(packet, writePlan, accountContext, vendorContext, planningContext),
      w49PilotHardening: w49PilotHardening(packet, writePlan, null, null, 'blocked_missing_account_context'),
      blockedDependentWrites: blockedDependentWritesForPilot(packet, writePlan, null, null),
      rollbackRecoveryInstructions: rollbackRecoveryInstructions('blocked_missing_account_context', null, null),
      smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
      partialFailureSimulation: partialFailureSimulation(packet, writePlan),
      transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan),
      fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
    });
  }

  function vendorContextResolver(packet) {
    const packetVendor = packet.vendor || packet.preferredVendor || packet.procurementVendor || {};
    const configuredVendorId = runtimeParameter(RUNTIME_FLAGS.defaultVendorParameter);
    const configuredPurchasePrice = runtimeParameter(RUNTIME_FLAGS.defaultPurchasePriceParameter);
    const packetVendorId = packetVendor.internalId || packetVendor.id || '';
    const packetVendorName = packetVendor.name || packetVendor.companyName || packetVendor.entityId || '';
    const requireVendorAttach = runtimeFlagEnabled(RUNTIME_FLAGS.requireVendorAttachParameter) ||
      !!(packet.creationPacketContract && packet.creationPacketContract.vendorRequired);
    const lookup = (!configuredVendorId && !packetVendorId && packetVendorName)
      ? lookupVendorByName(packetVendorName)
      : { status: 'not_required', recordId: null, error: '' };
    const vendorId = configuredVendorId || packetVendorId || lookup.recordId || '';
    const missing = requireVendorAttach && !vendorId;
    const blocked = missing || !!lookup.error;

    return {
      schema: 'idb.vendor-context-resolver.v1',
      status: blocked
        ? (lookup.error ? 'blocked_ambiguous_vendor_context' : 'blocked_missing_vendor_context')
        : (vendorId ? 'vendor_context_ready' : 'vendor_context_optional_not_configured'),
      vendorAttachRequired: requireVendorAttach,
      requiredRuntimeParameters: requireVendorAttach ? [
        RUNTIME_FLAGS.defaultVendorParameter
      ] : [],
      optionalRuntimeParameters: [
        RUNTIME_FLAGS.defaultVendorParameter,
        RUNTIME_FLAGS.defaultPurchasePriceParameter
      ],
      missingRuntimeParameters: missing ? [RUNTIME_FLAGS.defaultVendorParameter] : [],
      values: {
        vendorId,
        vendorName: packetVendorName,
        purchasePrice: configuredPurchasePrice
      },
      source: {
        vendorId: configuredVendorId
          ? RUNTIME_FLAGS.defaultVendorParameter
          : (packetVendorId ? 'reviewed_packet_vendor_id' : (lookup.recordId ? 'reviewed_packet_vendor_lookup' : 'not_configured')),
        purchasePrice: configuredPurchasePrice ? RUNTIME_FLAGS.defaultPurchasePriceParameter : 'not_configured'
      },
      lookup,
      procurementDefaults: {
        preferredVendor: !!vendorId,
        purchasePrice: configuredPurchasePrice || 'not_configured',
        noSilentVendorCreation: true
      },
      noRegression: {
        noSilentVendorCreation: true,
        noVendorAttachWhenAmbiguous: true,
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true
      }
    };
  }

  function lookupVendorByName(vendorName) {
    if (!vendorName) return { status: 'not_required', recordId: null, error: '' };
    const searchResult = search.create({
      type: record.Type.VENDOR || RECORD_TYPES.VENDOR,
      filters: [
        ['entityid', 'is', vendorName],
        'OR',
        ['companyname', 'is', vendorName]
      ],
      columns: ['internalid']
    }).run().getRange({ start: 0, end: 2 });
    if (searchResult.length > 1) return { status: 'ambiguous', recordId: null, error: 'Multiple vendors matched the lookup; manual review required.' };
    if (!searchResult.length) return { status: 'not_found', recordId: null, error: '' };
    return {
      status: 'matched',
      recordId: searchResult[0].id || searchResult[0].getValue({ name: 'internalid' }),
      error: ''
    };
  }

  function vendorContextBlockedResponse(packet, writePlan, accountContext, vendorContext, context) {
    const planningContext = planningContextResolver(packet);
    return Object.assign(response(vendorContext.status, packet, [
      errorLine(0, 'vendorContext', vendorContext.lookup && vendorContext.lookup.error
        ? vendorContext.lookup.error
        : `Missing required runtime parameter(s): ${vendorContext.missingRuntimeParameters.join(', ')}`)
    ]), {
      writePlan,
      runtimeFlagStrategy: runtimeFlagStrategy(),
      governedPilotRuntimeToggle: governedPilotRuntimeToggle(packet, context),
      governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan, context),
      accountContext,
      vendorContext,
      vendorAttachPilotPlan: vendorAttachPilotPlan(packet, writePlan, vendorContext),
      planningContext,
      planningControlPlan: planningControlPlan(packet, writePlan, planningContext),
      customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
      proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan),
      proofItemWriteV2: proofItemWriteV2Contract(packet, writePlan, accountContext, vendorContext, planningContext),
      w49PilotHardening: w49PilotHardening(packet, writePlan, null, null, vendorContext.status),
      blockedDependentWrites: blockedDependentWritesForPilot(packet, writePlan, null, null),
      rollbackRecoveryInstructions: rollbackRecoveryInstructions(vendorContext.status, null, null),
      smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
      partialFailureSimulation: partialFailureSimulation(packet, writePlan),
      transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan),
      fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
    });
  }

  function planningContextResolver(packet) {
    const packetPlanning = packet.planning || packet.itemPlanning || (packet.creationPacketContract && packet.creationPacketContract.planning) || {};
    const runtimePolicy = runtimeParameter(RUNTIME_FLAGS.planningPolicyParameter);
    const runtimeDisableAutoPlanning = runtimeParameter(RUNTIME_FLAGS.disableAutoPlanningParameter);
    const runtimeReplenishmentMethod = runtimeParameter(RUNTIME_FLAGS.replenishmentMethodParameter);
    const policy = runtimePolicy || packetPlanning.policy || 'stable_manual_planning';
    const disableAutoPlanning = runtimeDisableAutoPlanning === false || runtimeDisableAutoPlanning === ''
      ? policy === 'stable_manual_planning'
      : runtimeFlagEnabled(RUNTIME_FLAGS.disableAutoPlanningParameter);

    return {
      schema: 'idb.planning-control-rail.v1',
      status: 'planning_control_ready',
      policy,
      source: {
        policy: runtimePolicy ? RUNTIME_FLAGS.planningPolicyParameter : (packetPlanning.policy ? 'reviewed_packet_planning_policy' : 'default_stable_manual_planning'),
        disableAutoPlanning: runtimeDisableAutoPlanning === false || runtimeDisableAutoPlanning === ''
          ? 'default_from_policy'
          : RUNTIME_FLAGS.disableAutoPlanningParameter,
        replenishmentMethod: runtimeReplenishmentMethod ? RUNTIME_FLAGS.replenishmentMethodParameter : (packetPlanning.replenishmentMethod ? 'reviewed_packet_replenishment_method' : 'not_configured')
      },
      runtimeParameters: {
        optional: [
          RUNTIME_FLAGS.planningPolicyParameter,
          RUNTIME_FLAGS.disableAutoPlanningParameter,
          RUNTIME_FLAGS.replenishmentMethodParameter
        ]
      },
      values: {
        disableAutoPlanning,
        replenishmentMethod: runtimeReplenishmentMethod || packetPlanning.replenishmentMethod || ''
      },
      fieldIntent: disableAutoPlanning ? [
        'autoleadtime=false',
        'autoreorderpoint=false',
        'autopreferredstocklevel=false',
        'autosafetystocklevel=false'
      ] : [],
      noRegression: {
        noHiddenPlanningChanges: true,
        planningShownBeforeWrite: true,
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true
      }
    };
  }

  function runtimeEnvironment() {
    return runtime.envType || runtime.executionContext || 'unknown';
  }

  function runtimeAccountId() {
    return runtime.accountId || runtime.accountID || 'unknown';
  }

  function requestHost(context) {
    const headers = context && context.request && context.request.headers ? context.request.headers : {};
    return String(headers.host || headers.Host || '').toLowerCase();
  }

  function isSandboxRuntime() {
    const env = String(runtimeEnvironment()).toUpperCase();
    return env.indexOf('SANDBOX') !== -1;
  }

  function isApprovedDemoRuntime(context) {
    const accountId = String(runtimeAccountId()).toUpperCase();
    const host = requestHost(context);
    return APPROVED_DEMO_ACCOUNT_IDS.indexOf(accountId) !== -1 || APPROVED_DEMO_HOSTS.indexOf(host) !== -1;
  }

  function pilotEnvironmentAllowed(context) {
    if (isSandboxRuntime()) {
      return {
        allowed: true,
        mode: 'sandbox',
        detail: 'Runtime is sandbox and the approved pilot environment parameter is enabled.'
      };
    }
    if (isApprovedDemoRuntime(context)) {
      return {
        allowed: true,
        mode: 'approved_production_demo_account',
        detail: 'Runtime is an explicitly approved production demo account and the approved pilot environment parameter is enabled.'
      };
    }
    return {
      allowed: false,
      mode: 'blocked_unapproved_environment',
      detail: 'Runtime must be sandbox or an explicitly approved production demo account, and the approved pilot environment parameter must be enabled.'
    };
  }

  function typeToConfirmPhrase(packet) {
    const customerName = packet && packet.customer && packet.customer.name ? packet.customer.name : 'CUSTOMER';
    const normalizedCustomer = String(customerName).replace(/[^a-z0-9]+/gi, ' ').trim().replace(/\s+/g, ' ').toUpperCase() || 'CUSTOMER';
    const lane = packet && packet.selectedLaneId ? String(packet.selectedLaneId).replace(/[^a-z0-9]+/gi, '_').toUpperCase() : PILOT_LANE_ID.toUpperCase();
    return `CREATE ${normalizedCustomer} ${lane}`;
  }

  function providedTypeToConfirm(packet) {
    return packet ? (packet.typeToConfirmPhrase || packet.typeToConfirm || '') : '';
  }

  function pilotLaneAllowed(packet) {
    return !!(packet && PILOT_LANE_IDS.indexOf(packet.selectedLaneId) !== -1);
  }

  function parsePacket(context) {
    const body = context.request.body || '{}';
    const parsed = JSON.parse(body);
    return parsed.idbReviewedPacket || parsed;
  }

  function validatePacket(packet) {
    const errors = [];
    if (!packet) errors.push(errorLine(0, 'Packet', 'Missing reviewed IDB packet.'));
    if (packet && packet.writePathType !== WRITE_PATH_TYPE) errors.push(errorLine(0, 'writePathType', 'Write path type must be suitescript_direct_write.'));
    if (packet && packet.mode !== 'create') errors.push(errorLine(0, 'mode', 'Mode must be create.'));
    if (packet && packet.consultantConfirmed !== true) errors.push(errorLine(0, 'consultantConfirmed', 'Consultant confirmation is required.'));
    if (packet && packet.packetMode !== 'reviewed_create_request') errors.push(errorLine(0, 'packetMode', 'Packet mode must be reviewed_create_request.'));
    if (packet && !LANE_RECORD_TYPE_MAP[packet.selectedLaneId]) errors.push(errorLine(0, 'selectedLaneId', 'Selected lane is not authorized.'));
    if (packet && (!Array.isArray(packet.records) || !packet.records.length)) errors.push(errorLine(0, 'records', 'Reviewed records are required.'));
    if (packet) errors.push(...validateCreationPacketContract(packet));
    return errors;
  }

  function validateCreationPacketContract(packet) {
    const errors = [];
    const contract = packet.creationPacketContract;
    if (!contract) {
      return [errorLine(0, 'creationPacketContract', 'Creation Packet Contract V2 is required.')];
    }
    if (contract.schema !== CREATION_PACKET_SCHEMA) {
      errors.push(errorLine(0, 'creationPacketContract.schema', 'Creation Packet Contract schema must be idb.creation-packet.v2.'));
    }
    if (contract.creationAllowed !== false) {
      errors.push(errorLine(0, 'creationAllowed', 'Creation Packet Contract must remain create-disabled.'));
    }
    if (!Array.isArray(contract.records) || !contract.records.length) {
      errors.push(errorLine(0, 'creationPacketContract.records', 'Creation Packet Contract records are required.'));
      return errors;
    }
    if (Array.isArray(packet.records) && packet.records.length !== contract.records.length) {
      errors.push(errorLine(0, 'creationPacketContract.records', 'Creation Packet Contract record count must match reviewed records.'));
    }

    const idempotencyKeys = {};
    const lookupKeys = {};
    contract.records.forEach((item, index) => {
      REQUIRED_CREATION_CONTRACT_FIELDS.forEach((field) => {
        if (item[field] === undefined || item[field] === null || item[field] === '') {
          errors.push(errorLine(item.sequence || index + 1, field, `Creation Packet Contract record is missing ${field}.`));
        }
      });
      if (item.idempotencyKey) {
        if (idempotencyKeys[item.idempotencyKey]) {
          errors.push(errorLine(item.sequence || index + 1, 'idempotencyKey', 'Idempotency keys must be unique within a reviewed packet.'));
        }
        idempotencyKeys[item.idempotencyKey] = true;
      }
      const packetRecord = Array.isArray(packet.records)
        ? packet.records.find((recordItem) => recordItem.sequence === item.sequence || recordItem.label === item.label)
        : null;
      const duplicateKey = lookupKeyFor(packet, packetRecord || item, item);
      if (duplicateKey) {
        if (lookupKeys[duplicateKey]) {
          errors.push(errorLine(item.sequence || index + 1, 'existingRecordLookup', 'Duplicate lookup target detected inside the reviewed packet.'));
        }
        lookupKeys[duplicateKey] = true;
      }
      if (!Array.isArray(item.dependencies)) {
        errors.push(errorLine(item.sequence || index + 1, 'dependencies', 'Dependencies must be an array.'));
      }
      if (item.traceResultRequired !== true) {
        errors.push(errorLine(item.sequence || index + 1, 'traceResultRequired', 'Trace result is required for every future write result.'));
      }
    });
    return errors;
  }

  function errorLine(sequence, label, message) {
    return {
      sequence,
      label,
      message,
      recoverable: true
    };
  }

  function recordTypeFor(packet, item) {
    const laneMap = LANE_RECORD_TYPE_MAP[packet.selectedLaneId];
    if (!laneMap) return null;
    if (item.role === 'customer') return laneMap.customer;
    if (item.role === 'transaction') return laneMap.transaction;
    if (item.role === 'proof anchor') return laneMap.proofAnchor;
    return laneMap.supportingProof;
  }

  function buildWritePlan(packet) {
    const contractRecords = (packet.creationPacketContract && packet.creationPacketContract.records) || [];
    return packet.records.map((item) => {
      const contract = contractFor(item, contractRecords);
      const lookupKey = lookupKeyFor(packet, item, contract);
      return {
        sequence: item.sequence,
        label: item.label,
        plannedName: item.plannedName,
        recordType: recordTypeFor(packet, item),
        operation: operationFor(item),
        role: item.role,
        createContract: contract,
        lookupKey,
        lookupStatus: 'lookup_required_before_write',
        idempotencyStatus: contract.idempotencyKey ? 'idempotency_key_ready' : 'idempotency_key_missing',
        duplicateAction: 'update_or_skip_if_lookup_matches',
        writeStatusIfEnabled: writeStatusIfEnabled(item, packet),
        transactionPilotStatus: transactionPilotStatusFor(item),
        rollbackLabel: contract.rollbackLabel,
        parentDependencies: parentDependenciesFor(item, contract),
        stopIfParentFailed: parentDependenciesFor(item, contract).length > 0,
        rollbackEvidence: rollbackEvidenceFor(packet, item, contract),
        recordId: null,
        url: null,
        recoverableErrors: [],
        status: CREATE_ENABLED ? 'ready_to_write' : 'blocked_create_disabled'
      };
    });
  }

  function contractFor(item, contractRecords) {
    const match = contractRecords.find((recordItem) => recordItem.sequence === item.sequence || recordItem.label === item.label) || {};
    return {
      createIntent: match.createIntent || operationFor(item),
      idempotencyKey: match.idempotencyKey || '',
      existingRecordLookup: match.existingRecordLookup || {},
      dependencies: match.dependencies || [],
      rollbackLabel: match.rollbackLabel || `${item.label} rollback`,
      traceResultRequired: match.traceResultRequired === true
    };
  }

  function operationFor(item) {
    if (item.role === 'customer') return 'create_or_update_customer';
    if (item.role === 'transaction') return 'create_sales_order_context_or_view';
    if (item.role === 'proof anchor') return 'create_or_update_lane_proof_anchor';
    return 'create_or_update_supporting_proof_record';
  }

  function lookupKeyFor(packet, item, contract) {
    const lookup = contract && contract.existingRecordLookup ? contract.existingRecordLookup : {};
    if (typeof lookup === 'string') return `${recordTypeFor(packet, item)}:${lookup}`;
    if (lookup && lookup.field && lookup.value) return `${recordTypeFor(packet, item)}:${lookup.field}:${lookup.value}`;
    if (lookup && lookup.toString && typeof lookup !== 'object') return `${recordTypeFor(packet, item)}:${lookup}`;
    return `${recordTypeFor(packet, item)}:${item.plannedName || item.proposedName || item.label}`;
  }

  function writeStatusIfEnabled(item, packet) {
    if (!pilotRoleAllowed(item, packet)) return 'skipped_outside_small_write_pilot';
    if (item.role === 'customer') return 'lookup_then_update_or_create_customer';
    if (item.role === 'proof anchor') return 'lookup_then_update_or_create_proof_item';
    return 'skipped_until_customer_and_proof_are_stable';
  }

  function transactionPilotStatusFor(item) {
    if (item.role !== 'transaction') return 'not_transaction_context';
    return 'blocked_until_customer_and_proof_results';
  }

  function parentDependenciesFor(item, contract) {
    const dependencies = Array.isArray(contract.dependencies) ? contract.dependencies : [];
    return dependencies.filter((dependency) => /Customer|Finished Good|proof|item/i.test(String(dependency)));
  }

  function rollbackEvidenceFor(packet, item, contract) {
    return {
      packetId: packet && packet.trace && packet.trace.packetId ? packet.trace.packetId : null,
      sequence: item.sequence,
      label: item.label,
      rollbackLabel: contract.rollbackLabel,
      recordId: null,
      url: null,
      operation: operationFor(item),
      recoverableErrors: [],
      manualRollbackRequired: false,
      silentRetryAllowed: false,
      silentDeletionAllowed: false
    };
  }

  function pilotRoleAllowed(item, packet) {
    return pilotLaneAllowed(packet) && PILOT_ALLOWED_ROLES.indexOf(item.role) !== -1;
  }

  function smallWriteSmokePlan(packet, writePlan) {
    const pilotRecords = writePlan.filter((item) => pilotRoleAllowed(item, packet));
    const skippedRecords = writePlan.filter((item) => !pilotRoleAllowed(item, packet));
    return {
      schema: 'idb.small-write-smoke-plan.v1',
      createEnabled: CREATE_ENABLED,
      pilotLaneId: PILOT_LANE_ID,
      pilotLaneIds: PILOT_LANE_IDS,
      approvedRoles: PILOT_ALLOWED_ROLES,
      explicitConfirmationRequired: true,
      typeToConfirmRequired: true,
      noTransactionCreationUntilStable: true,
      status: CREATE_ENABLED ? 'ready_for_sandbox_smoke' : 'blocked_create_disabled',
      pilotRecords,
      skippedRecords: skippedRecords.map((item) => ({
        sequence: item.sequence,
        label: item.label,
        role: item.role,
        status: item.writeStatusIfEnabled
      }))
    };
  }

  function createdRecordResultStatus(result, role, fallbackStatus) {
    const created = createdRecordByRole(result, role);
    if (!created) return fallbackStatus;
    if (/^update/.test(String(created.operation || ''))) return 'updated';
    if (/^create/.test(String(created.operation || ''))) return 'created';
    return 'result_captured';
  }

  function customerWritePilotPlan(packet, writePlan, customerPilotResult) {
    const customer = writePlan.find((item) => item.role === CUSTOMER_PILOT_ROLE);
    const customerResult = createdRecordByRole(customerPilotResult, CUSTOMER_PILOT_ROLE);
    const fallbackStatus = CREATE_ENABLED ? 'runtime_flags_required' : 'blocked_create_disabled';
    return {
      schema: 'idb.customer-write-pilot.v1',
      createEnabled: CREATE_ENABLED,
      status: createdRecordResultStatus(customerPilotResult, CUSTOMER_PILOT_ROLE, fallbackStatus),
      laneId: packet.selectedLaneId,
      approvedLaneId: PILOT_LANE_ID,
      approvedLaneIds: PILOT_LANE_IDS,
      approvedRole: CUSTOMER_PILOT_ROLE,
      customerRecord: customer ? {
        sequence: customer.sequence,
        label: customer.label,
        plannedName: customer.plannedName,
        recordType: customer.recordType,
        operation: 'lookup_then_create_or_update_customer',
        lookupKey: customer.lookupKey,
        idempotencyKey: customer.createContract.idempotencyKey,
        rollbackLabel: customer.rollbackLabel,
        recordId: customerResult ? customerResult.recordId : null,
        url: customerResult ? customerResult.url : null,
        recoverableErrors: customerResult ? customerResult.recoverableErrors || [] : []
      } : null,
      fieldMapping: {
        companyname: packet.customer && packet.customer.name ? packet.customer.name : 'review_required',
        url: packet.customer && packet.customer.website ? packet.customer.website : 'review_required',
        comments: packet.customer && packet.customer.notes ? packet.customer.notes : '',
        subsidiary: 'resolved_from_account_context',
        currency: 'optional_resolved_from_account_context',
        terms: 'optional_resolved_from_account_context',
        department: 'optional_resolved_from_account_context',
        class: 'optional_resolved_from_account_context',
        custentity_idb_packet_id: packet.trace && packet.trace.packetId ? packet.trace.packetId : '',
        custentity_idb_lane: packet.selectedLaneId,
        custentity_idb_proof_anchor: packet.proofAnchor
      },
      lookupFirstRules: {
        byCompanyNameAndWebsite: true,
        updateIfMatched: true,
        createIfNoMatch: true,
        duplicateMatchBlocksWrite: true
      },
      traceResultRequired: {
        recordId: true,
        url: true,
        operation: true,
        lookupStatus: true,
        recoverableErrors: true
      },
      blockedReason: customerResult
        ? ''
        : (CREATE_ENABLED ? 'Runtime pilot flags must be inspected before writing.' : 'Main package create is disabled.'),
      nonRegression: {
        noCustomerWriteInMainPackage: true,
        noTransactionWrite: true,
        noProofItemWriteInW15: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function proofItemWritePilotPlan(packet, writePlan, customerPilotResult, proofItemPilotResult, planningContext) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    const proofResult = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    const customerReady = customerResult.status === 'ready';
    const fallbackStatus = customerReady ? (CREATE_ENABLED ? 'runtime_flags_required' : 'blocked_create_disabled') : 'blocked_missing_customer_result';
    return {
      schema: 'idb.proof-item-write-pilot.v1',
      createEnabled: CREATE_ENABLED,
      status: createdRecordResultStatus(proofItemPilotResult, PROOF_PILOT_ROLE, fallbackStatus),
      laneId: packet.selectedLaneId,
      approvedLaneId: PILOT_LANE_ID,
      approvedLaneIds: PILOT_LANE_IDS,
      approvedRole: PROOF_PILOT_ROLE,
      proofItemRecord: proof ? {
        sequence: proof.sequence,
        label: proof.label,
        plannedName: proof.plannedName,
        recordType: proof.recordType,
        operation: 'lookup_then_create_or_update_proof_item',
        lookupKey: proof.lookupKey,
        idempotencyKey: proof.createContract.idempotencyKey,
        rollbackLabel: proof.rollbackLabel,
        recordId: proofResult ? proofResult.recordId : null,
        url: proofResult ? proofResult.url : null,
        recoverableErrors: proofResult ? proofResult.recoverableErrors || [] : []
      } : null,
      requiredParentResult: {
        role: 'customer',
        required: true,
        recordId: customerResult.recordId,
        url: customerResult.url,
        operation: customerResult.operation,
        lookupStatus: customerResult.lookupStatus,
        status: customerResult.status,
        source: customerResult.source
      },
      fieldMapping: {
        itemid: proof && proof.plannedName ? proof.plannedName : 'review_required',
        displayname: proof && proof.plannedName ? proof.plannedName : 'review_required',
        salesdescription: packet.customer && packet.customer.notes ? packet.customer.notes : '',
        subsidiary: 'resolved_from_account_context',
        location: 'optional_resolved_from_account_context',
        taxschedule: 'resolved_from_account_context',
        department: 'optional_resolved_from_account_context',
        class: 'optional_resolved_from_account_context',
        preferredvendor: 'optional_resolved_from_vendor_context',
        purchaseprice: 'optional_resolved_from_vendor_context',
        planningPolicy: planningContext ? planningContext.policy : 'stable_manual_planning',
        disableAutoPlanning: planningContext && planningContext.values ? planningContext.values.disableAutoPlanning : true,
        replenishmentMethod: planningContext && planningContext.values && planningContext.values.replenishmentMethod ? 'optional_resolved_from_planning_context' : 'not_configured',
        custitem_idb_packet_id: packet.trace && packet.trace.packetId ? packet.trace.packetId : '',
        custitem_idb_lane: packet.selectedLaneId,
        custitem_idb_proof_anchor: packet.proofAnchor,
        custitem_idb_parent_customer: customerResult.recordId || 'missing_customer_result'
      },
      lookupFirstRules: {
        byItemId: true,
        createIfNoMatch: true,
        updateIfMatched: true,
        duplicateMatchBlocksWrite: true,
        blockIfCustomerResultMissing: true
      },
      traceResultRequired: {
        recordId: true,
        url: true,
        operation: true,
        lookupStatus: true,
        parentCustomerRecordId: true,
        rollbackLabel: true,
        recoverableErrors: true
      },
      blockedReason: proofResult
        ? ''
        : (customerReady
          ? (CREATE_ENABLED ? 'Runtime pilot flags must be inspected before writing the proof item.' : 'Main package create is disabled.')
          : 'Customer result ID and URL are required before proof item write can be planned for execution.'),
      nonRegression: {
        noProofItemWriteWithoutCustomerResult: true,
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function proofItemWriteV2Contract(packet, writePlan, accountContext, vendorContext, planningContext, customerPilotResult, proofItemPilotResult) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    const proofResult = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    const accountStatus = accountContext ? accountContext.status : 'not_evaluated';
    const vendorStatus = vendorContext ? vendorContext.status : 'not_evaluated';
    const planningStatus = planningContext ? planningContext.status : 'not_evaluated';
    const accountBlocked = accountStatus.indexOf('blocked_') === 0;
    const vendorBlocked = vendorStatus.indexOf('blocked_') === 0;
    const planningBlocked = planningStatus !== 'not_evaluated' && planningStatus !== 'planning_control_ready';
    let status = 'ready_for_proof_item_write';

    if (!proof) {
      status = 'blocked_missing_proof_record';
    } else if (proofResult) {
      status = 'proof_item_v2_ready';
    } else if (accountBlocked) {
      status = accountStatus;
    } else if (vendorBlocked) {
      status = vendorStatus;
    } else if (customerResult.status !== 'ready') {
      status = 'blocked_missing_customer_result';
    } else if (!CREATE_ENABLED) {
      status = 'blocked_create_disabled';
    } else if (planningBlocked) {
      status = planningStatus;
    }

    return {
      schema: 'idb.proof-item-write-v2.v1',
      createEnabled: CREATE_ENABLED,
      transactionContextEnabled: TRANSACTION_CONTEXT_ENABLED,
      status,
      packetId: packet.trace && packet.trace.packetId ? packet.trace.packetId : null,
      laneId: packet.selectedLaneId,
      approvedLaneIds: PILOT_LANE_IDS,
      proofAnchor: packet.proofAnchor,
      proofItemRecord: proof ? {
        sequence: proof.sequence,
        label: proof.label,
        plannedName: proof.plannedName,
        recordType: proof.recordType,
        operation: 'lookup_then_create_or_update_demo_usable_proof_item',
        lookupKey: proof.lookupKey,
        idempotencyKey: proof.createContract.idempotencyKey,
        rollbackLabel: proof.rollbackLabel,
        recordId: proofResult ? proofResult.recordId : null,
        url: proofResult ? proofResult.url : null,
        lookupStatus: proofResult ? proofResult.lookupStatus : null,
        recoverableErrors: proofResult ? proofResult.recoverableErrors || [] : []
      } : null,
      parentCustomerResult: {
        role: 'customer',
        required: true,
        status: customerResult.status,
        recordId: customerResult.recordId,
        url: customerResult.url,
        operation: customerResult.operation,
        lookupStatus: customerResult.lookupStatus,
        source: customerResult.source
      },
      readinessGates: [
        {
          key: 'customer_result',
          status: customerResult.status === 'ready' ? 'ready' : 'blocked',
          detail: customerResult.recordId ? `Customer ${customerResult.recordId} is available.` : 'Customer result ID and URL are required before Proof Item write.'
        },
        {
          key: 'account_context',
          status: accountStatus === 'account_context_ready' ? 'ready' : accountStatus,
          detail: accountContext ? 'Subsidiary, tax schedule, and optional account defaults were evaluated.' : 'Account context has not been evaluated in this response path.'
        },
        {
          key: 'vendor_context',
          status: vendorStatus.indexOf('blocked_') === 0 ? vendorStatus : 'ready',
          detail: vendorContext && vendorContext.vendorAttachRequired ? 'Required vendor attach is configured.' : 'Vendor attach is optional or skipped.'
        },
        {
          key: 'planning_context',
          status: planningStatus === 'planning_control_ready' ? 'ready' : planningStatus,
          detail: planningContext ? `Planning policy: ${planningContext.policy}.` : 'Planning context has not been evaluated in this response path.'
        },
        {
          key: 'transaction_context',
          status: TRANSACTION_CONTEXT_ENABLED ? 'ready' : 'blocked_transaction_context_disabled',
          detail: 'Sales Order / transaction-context writes remain outside W46.'
        }
      ],
      governedFieldGroups: {
        identity: {
          itemid: proof && proof.plannedName ? proof.plannedName : 'review_required',
          displayname: proof && proof.plannedName ? proof.plannedName : 'review_required',
          salesdescription: packet.customer && packet.customer.notes ? packet.customer.notes : '',
          source: 'reviewed_packet'
        },
        account: {
          subsidiary: accountContext && accountContext.values ? accountContext.values.subsidiary : 'not_evaluated',
          location: accountContext && accountContext.values && accountContext.values.location ? accountContext.values.location : 'not_configured',
          taxschedule: accountContext && accountContext.values ? accountContext.values.taxschedule : 'not_evaluated',
          currency: accountContext && accountContext.values && accountContext.values.currency ? accountContext.values.currency : 'not_configured',
          department: accountContext && accountContext.values && accountContext.values.department ? accountContext.values.department : 'not_configured',
          class: accountContext && accountContext.values && accountContext.values.classId ? accountContext.values.classId : 'not_configured',
          source: accountContext && accountContext.source ? accountContext.source : {}
        },
        procurement: {
          vendorAttachRequired: vendorContext ? vendorContext.vendorAttachRequired : false,
          preferredVendor: vendorContext && vendorContext.values && vendorContext.values.vendorId ? vendorContext.values.vendorId : 'not_configured',
          purchasePrice: vendorContext && vendorContext.procurementDefaults ? vendorContext.procurementDefaults.purchasePrice : '',
          writeBehavior: vendorContext && vendorContext.values && vendorContext.values.vendorId ? 'attach_preferred_vendor' : 'skip_optional_vendor_attach',
          noSilentVendorCreation: true
        },
        planning: {
          policy: planningContext ? planningContext.policy : 'not_evaluated',
          disableAutoPlanning: planningContext && planningContext.values ? planningContext.values.disableAutoPlanning : true,
          replenishmentMethod: planningContext && planningContext.values && planningContext.values.replenishmentMethod ? planningContext.values.replenishmentMethod : 'not_configured',
          fieldIntent: planningContext ? planningContext.fieldIntent : []
        },
        trace: {
          packetId: packet.trace && packet.trace.packetId ? packet.trace.packetId : '',
          lane: packet.selectedLaneId,
          proofAnchor: packet.proofAnchor,
          parentCustomerRecordId: customerResult.recordId || 'missing_customer_result'
        }
      },
      writeBehavior: 'lookup_then_update_or_create_demo_usable_proof_item',
      resultContract: {
        recordId: true,
        url: true,
        operation: true,
        lookupStatus: true,
        parentCustomerRecordId: true,
        rollbackLabel: true,
        recoverableErrors: true,
        vendorContextStatus: true,
        planningPolicy: true
      },
      consultantMessage: proofResult
        ? 'Proof Item result is captured with account, vendor, planning, and parent Customer context. Transaction context remains blocked.'
        : 'Proof Item is not complete yet. Resolve the blocked gates before moving toward transaction context.',
      noRegression: {
        noProofItemWriteWithoutCustomerResult: true,
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true,
        noSilentVendorCreation: true,
        noHiddenPlanningChanges: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function vendorAttachPilotPlan(packet, writePlan, vendorContext, proofItemPilotResult) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const proofResult = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    return {
      schema: 'idb.vendor-attach-pilot.v1',
      createEnabled: CREATE_ENABLED,
      status: vendorContext.status,
      attachRequired: vendorContext.vendorAttachRequired,
      proofItemRecord: proof ? {
        sequence: proof.sequence,
        label: proof.label,
        plannedName: proof.plannedName,
        recordType: proof.recordType,
        recordId: proofResult ? proofResult.recordId : null,
        url: proofResult ? proofResult.url : null
      } : null,
      vendor: {
        recordId: vendorContext.values.vendorId || null,
        name: vendorContext.values.vendorName || null,
        source: vendorContext.source.vendorId
      },
      procurementDefaults: vendorContext.procurementDefaults,
      writeBehavior: vendorContext.values.vendorId
        ? 'attach_preferred_vendor_to_proof_item'
        : (vendorContext.vendorAttachRequired ? 'blocked_until_vendor_context_ready' : 'skip_optional_vendor_attach'),
      blockedReason: vendorContext.status.indexOf('blocked_') === 0
        ? 'Vendor attach is required but no safe single vendor was resolved.'
        : '',
      noRegression: {
        noSilentVendorCreation: true,
        noVendorAttachWhenAmbiguous: true,
        proofItemStillRequiresCustomerResult: true,
        noTransactionWrite: true
      }
    };
  }

  function planningControlPlan(packet, writePlan, planningContext, proofItemPilotResult) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const proofResult = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    return {
      schema: 'idb.planning-control-plan.v1',
      createEnabled: CREATE_ENABLED,
      status: planningContext.status,
      policy: planningContext.policy,
      proofItemRecord: proof ? {
        sequence: proof.sequence,
        label: proof.label,
        plannedName: proof.plannedName,
        recordType: proof.recordType,
        recordId: proofResult ? proofResult.recordId : null,
        url: proofResult ? proofResult.url : null
      } : null,
      fieldIntent: planningContext.fieldIntent,
      writeBehavior: planningContext.values.disableAutoPlanning
        ? 'apply_stable_manual_planning_defaults'
        : 'leave_planning_automation_available',
      replenishmentMethod: planningContext.values.replenishmentMethod || 'not_configured',
      noRegression: {
        noHiddenPlanningChanges: true,
        visibleBeforeWrite: true,
        proofItemStillRequiresCustomerResult: true,
        noTransactionWrite: true
      }
    };
  }

  function pilotResultSummary(packet, customerPilotResult, proofItemPilotResult, finalStatus) {
    const customer = createdRecordByRole(customerPilotResult, CUSTOMER_PILOT_ROLE);
    const proof = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    const customerStatus = customer ? createdRecordResultStatus(customerPilotResult, CUSTOMER_PILOT_ROLE, 'result_captured') : 'not_written';
    const proofStatus = proof ? createdRecordResultStatus(proofItemPilotResult, PROOF_PILOT_ROLE, 'result_captured') : 'not_written';
    return {
      schema: 'idb.w41-pilot-result-summary.v1',
      status: finalStatus,
      packetId: packet && packet.trace ? packet.trace.packetId : null,
      selectedLaneId: packet ? packet.selectedLaneId : null,
      customer: {
        status: customerStatus,
        label: 'Customer Record',
        recordId: customer ? customer.recordId : null,
        url: customer ? customer.url : null,
        operation: customer ? customer.operation : null,
        lookupStatus: customer ? customer.lookupStatus : null
      },
      proofItem: {
        status: proofStatus,
        label: proof ? proof.label : (packet ? packet.proofAnchor : 'Proof Item'),
        recordId: proof ? proof.recordId : null,
        url: proof ? proof.url : null,
        operation: proof ? proof.operation : null,
        lookupStatus: proof ? proof.lookupStatus : null,
        parentCustomerRecordId: proof ? proof.parentCustomerRecordId : null
      },
      transactionContext: {
        status: 'blocked_transaction_context_disabled',
        message: 'Sales Order / transaction-context write remains disabled until the dedicated transaction pilot.'
      },
      consultantMessage: customer && proof
        ? 'Customer and Proof Item results are captured. Review the record links; transaction writes remain blocked.'
        : 'Customer and Proof Item results are not both captured. Resolve the recoverable errors before moving on.',
      noRegression: {
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true,
        traceableRecordLinksRequired: true
      }
    };
  }

  function blockedDependentWritesForPilot(packet, writePlan, customerPilotResult, proofItemPilotResult) {
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    const proofResult = parentProofResult(packet, proofItemPilotResult);
    return writePlan
      .filter((item) => item.role === 'transaction' || !pilotRoleAllowed(item, packet))
      .map((item) => ({
        sequence: item.sequence,
        label: item.label,
        role: item.role,
        recordType: item.recordType,
        reason: item.role === 'transaction'
          ? 'Transaction context write is blocked in W49. Customer and Proof Item evidence may be reviewed, but Sales Order write requires a future dedicated transaction pilot.'
          : 'Supporting proof records are outside the W49 Customer + Proof Item pilot scope.',
        recoverable: true,
        requiresBeforeFutureWrite: item.role === 'transaction'
          ? ['transaction pilot approval', 'Customer record ID and URL', 'Proof Item record ID and URL', 'transaction runtime flag']
          : ['dedicated supporting-proof pilot scope'],
        currentParentState: {
          customer: customerResult.status,
          proofItem: proofResult.status
        }
      }));
  }

  function rollbackRecoveryInstructions(finalStatus, customerPilotResult, proofItemPilotResult) {
    const customer = createdRecordByRole(customerPilotResult, CUSTOMER_PILOT_ROLE);
    const proof = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    return [
      'Do not silently retry a failed Customer or Proof Item write.',
      'Do not silently delete or roll back records from SuiteScript.',
      customer
        ? `Inspect Customer ${customer.recordId} using the returned URL before rerunning.`
        : 'If Customer is missing, fix the blocker and rerun the same reviewed packet only after confirming no partial record exists.',
      proof
        ? `Inspect Proof Item ${proof.recordId} and confirm parentCustomerRecordId matches the Customer result.`
        : 'If Proof Item is missing after Customer succeeded, keep the Customer link in trace and fix the Proof Item blocker before retry.',
      finalStatus === 'partial_failed'
        ? 'Export the partial_failed response, trace JSON, and reviewed packet before any manual cleanup.'
        : 'Export the Suitelet response and trace JSON before pilot handoff.'
    ];
  }

  function w49PilotHardening(packet, writePlan, customerPilotResult, proofItemPilotResult, finalStatus) {
    const customer = createdRecordByRole(customerPilotResult, CUSTOMER_PILOT_ROLE);
    const proof = createdRecordByRole(proofItemPilotResult, PROOF_PILOT_ROLE);
    const customerReady = !!(customer && customer.recordId && customer.url);
    const proofReady = !!(proof && proof.recordId && proof.url && proof.parentCustomerRecordId === customer.recordId);
    const blockedDependents = blockedDependentWritesForPilot(packet, writePlan, customerPilotResult, proofItemPilotResult);
    return {
      schema: 'idb.w49-governed-customer-proof-item-pilot-hardening.v1',
      status: finalStatus || 'preflight',
      objective: 'Customer writes first. Proof Item writes only after Customer ID and URL exist. Transaction write remains blocked.',
      approvedWriteScope: {
        laneIds: PILOT_LANE_IDS,
        roles: PILOT_ALLOWED_ROLES,
        transactionContextEnabled: TRANSACTION_CONTEXT_ENABLED
      },
      sequenceGate: {
        customerFirst: true,
        customerReady,
        proofItemRequiresCustomerIdAndUrl: true,
        proofItemReady: proofReady,
        proofItemParentMatchesCustomer: proofReady,
        transactionBlocked: true
      },
      postTestPack: {
        requiredMethod: 'POST',
        requiredPacketMode: 'reviewed_create_request',
        requiredConfirmation: 'consultantConfirmed true plus exact type-to-confirm phrase',
        requiredRuntimeParameters: [
          RUNTIME_FLAGS.enablePilotWritesParameter,
          RUNTIME_FLAGS.allowCustomerPilotParameter,
          RUNTIME_FLAGS.allowProofItemPilotParameter,
          RUNTIME_FLAGS.sandboxAccountParameter,
          RUNTIME_FLAGS.requireTypeToConfirmParameter,
          RUNTIME_FLAGS.defaultSubsidiaryParameter,
          RUNTIME_FLAGS.defaultTaxScheduleParameter
        ],
        expectedSuccessStatus: 'created',
        expectedBlockedStatuses: [
          'blocked_runtime_toggle',
          'blocked_missing_account_context',
          'blocked_missing_vendor_context',
          'partial_failed'
        ]
      },
      resultRequirements: {
        customerRecordId: true,
        customerUrl: true,
        proofItemRecordId: true,
        proofItemUrl: true,
        parentCustomerRecordId: true,
        blockedDependentWrites: true,
        rollbackLabels: true,
        recoverableErrors: true,
        proofItemWriteV2: true
      },
      blockedDependentWrites: blockedDependents,
      rollbackRecoveryInstructions: rollbackRecoveryInstructions(finalStatus, customerPilotResult, proofItemPilotResult),
      noRegression: {
        noTransactionWrite: true,
        noProofItemWithoutCustomerResult: true,
        noSilentRetry: true,
        noSilentDeletion: true,
        noAutomaticCreationFromDrawer: true
      }
    };
  }

  function executeCustomerWritePilot(packet, writePlan, accountContext) {
    const customer = writePlan.find((item) => item.role === CUSTOMER_PILOT_ROLE);
    if (!customer) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(0, 'customer', 'Customer record is required for the W15 pilot.')]
      };
    }
    if (!pilotLaneAllowed(packet)) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(customer.sequence, customer.label, 'Customer pilot is only enabled for the approved pilot lanes.')]
      };
    }
    const lookup = lookupCustomer(packet);
    if (lookup.error) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(customer.sequence, customer.label, lookup.error)]
      };
    }
    const operation = lookup.recordId ? 'update_customer' : 'create_customer';
    let recordId;
    try {
      recordId = upsertCustomerRecord(packet, lookup.recordId, accountContext);
    } catch (error) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(customer.sequence, customer.label, `Customer write failed: ${error.message || error.name || error}`)]
      };
    }
    return {
      status: 'created',
      createdRecords: [{
        sequence: customer.sequence,
        label: customer.label,
        role: customer.role,
        recordType: customer.recordType,
        recordId,
        url: recordUrl(record.Type.CUSTOMER, recordId),
        operation,
        lookupStatus: lookup.recordId ? 'matched_existing_customer' : 'created_new_customer',
        rollbackLabel: customer.rollbackLabel,
        recoverableErrors: []
      }],
      errors: []
    };
  }

  function executeProofItemWritePilot(packet, writePlan, customerPilotResult, accountContext, vendorContext, planningContext) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    if (!proof) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(0, 'proof anchor', 'Proof item record is required for the W16 pilot.')]
      };
    }
    if (!pilotLaneAllowed(packet)) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(proof.sequence, proof.label, 'Proof item pilot is only enabled for the approved pilot lanes.')]
      };
    }
    if (customerResult.status !== 'ready') {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(proof.sequence, proof.label, 'Customer result ID and URL are required before proof item write.')]
      };
    }
    const lookup = lookupProofItem(packet, proof);
    if (lookup.error) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(proof.sequence, proof.label, lookup.error)]
      };
    }
    const operation = lookup.recordId ? 'update_proof_item' : 'create_proof_item';
    let recordId;
    try {
      recordId = upsertProofItemRecord(packet, proof, lookup.recordId, customerResult, accountContext, vendorContext, planningContext);
    } catch (error) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(proof.sequence, proof.label, `Proof item write failed: ${error.message || error.name || error}`)]
      };
    }
    return {
      status: 'created',
      createdRecords: [{
        sequence: proof.sequence,
        label: proof.label,
        role: proof.role,
        recordType: proof.recordType,
        recordId,
        url: recordUrl(proof.recordType, recordId),
        operation,
        lookupStatus: lookup.recordId ? 'matched_existing_proof_item' : 'created_new_proof_item',
        parentCustomerRecordId: customerResult.recordId,
        rollbackLabel: proof.rollbackLabel,
        recoverableErrors: []
      }],
      errors: []
    };
  }

  function parentCustomerResult(packet, customerPilotResult) {
    const customerFromCurrentRun = createdRecordByRole(customerPilotResult, 'customer');
    if (customerFromCurrentRun) {
      return normalizeParentResult(customerFromCurrentRun, 'current_customer_pilot_result');
    }

    const sources = [
      packet.parentResults,
      packet.writeResults,
      packet.createdRecords ? { createdRecords: packet.createdRecords } : null,
      packet.results
    ].filter(Boolean);
    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index];
      const directCustomer = source.customer || source.customerRecord || source.customerResult;
      if (directCustomer && directCustomer.recordId && directCustomer.url) {
        return normalizeParentResult(directCustomer, `packet_parent_result_${index + 1}`);
      }
      const createdCustomer = createdRecordByRole(source, 'customer');
      if (createdCustomer) {
        return normalizeParentResult(createdCustomer, `packet_created_record_${index + 1}`);
      }
    }
    return {
      status: 'missing_parent_result',
      recordId: null,
      url: null,
      operation: null,
      lookupStatus: null,
      source: 'none'
    };
  }

  function parentProofResult(packet, proofPilotResult) {
    const proofFromCurrentRun = createdRecordByRole(proofPilotResult, 'proof anchor');
    if (proofFromCurrentRun) {
      return normalizeParentResult(proofFromCurrentRun, 'current_proof_item_pilot_result');
    }

    const sources = [
      packet.parentResults,
      packet.writeResults,
      packet.createdRecords ? { createdRecords: packet.createdRecords } : null,
      packet.results
    ].filter(Boolean);
    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index];
      const directProof = source.proofAnchor || source.proofItem || source.proofItemResult || source.proofResult;
      if (directProof && directProof.recordId && directProof.url) {
        return normalizeParentResult(directProof, `packet_parent_result_${index + 1}`);
      }
      const createdProof = createdRecordByRole(source, 'proof anchor');
      if (createdProof) {
        return normalizeParentResult(createdProof, `packet_created_record_${index + 1}`);
      }
    }
    return {
      status: 'missing_parent_result',
      recordId: null,
      url: null,
      operation: null,
      lookupStatus: null,
      source: 'none'
    };
  }

  function createdRecordByRole(source, role) {
    if (!source || !Array.isArray(source.createdRecords)) return null;
    return source.createdRecords.find((item) => item.role === role && item.recordId && item.url) || null;
  }

  function normalizeParentResult(result, source) {
    return {
      status: 'ready',
      recordId: result.recordId,
      url: result.url,
      operation: result.operation || 'parent_customer_result',
      lookupStatus: result.lookupStatus || 'parent_result_ready',
      source
    };
  }

  function lookupCustomer(packet) {
    const customer = packet.customer || {};
    if (!customer.name) return { error: 'Customer name is required.' };
    if (!customer.website) return { error: 'Customer website is required.' };
    const searchResult = search.create({
      type: record.Type.CUSTOMER,
      filters: [
        ['companyname', 'is', customer.name],
        'AND',
        ['url', 'is', customer.website]
      ],
      columns: ['internalid']
    }).run().getRange({ start: 0, end: 2 });
    if (searchResult.length > 1) return { error: 'Multiple customers matched the lookup; manual review required.' };
    if (!searchResult.length) return { recordId: null };
    return { recordId: searchResult[0].id || searchResult[0].getValue({ name: 'internalid' }) };
  }

  function lookupProofItem(packet, proof) {
    if (!proof || !proof.plannedName) return { error: 'Proof item planned name is required.' };
    const searchResult = search.create({
      type: proof.recordType,
      filters: [
        ['itemid', 'is', proof.plannedName]
      ],
      columns: ['internalid']
    }).run().getRange({ start: 0, end: 2 });
    if (searchResult.length > 1) return { error: 'Multiple proof items matched the lookup; manual review required.' };
    if (!searchResult.length) return { recordId: null };
    return { recordId: searchResult[0].id || searchResult[0].getValue({ name: 'internalid' }) };
  }

  function upsertCustomerRecord(packet, recordId, accountContext) {
    const customer = packet.customer || {};
    const customerRecord = recordId
      ? record.load({ type: record.Type.CUSTOMER, id: recordId, isDynamic: true })
      : record.create({ type: record.Type.CUSTOMER, isDynamic: true });
    customerRecord.setValue({ fieldId: 'companyname', value: customer.name });
    customerRecord.setValue({ fieldId: 'subsidiary', value: accountContext.values.subsidiaryId });
    customerRecord.setValue({ fieldId: 'url', value: customer.website });
    if (accountContext.values.currencyId) safeSetValue(customerRecord, 'currency', accountContext.values.currencyId);
    if (accountContext.values.termsId) safeSetValue(customerRecord, 'terms', accountContext.values.termsId);
    if (accountContext.values.departmentId) safeSetValue(customerRecord, 'department', accountContext.values.departmentId);
    if (accountContext.values.classId) safeSetValue(customerRecord, 'class', accountContext.values.classId);
    if (customer.notes) customerRecord.setValue({ fieldId: 'comments', value: customer.notes });
    safeSetValue(customerRecord, 'custentity_idb_packet_id', packet.trace && packet.trace.packetId ? packet.trace.packetId : '');
    safeSetValue(customerRecord, 'custentity_idb_lane', packet.selectedLaneId);
    safeSetValue(customerRecord, 'custentity_idb_proof_anchor', packet.proofAnchor);
    return customerRecord.save({ enableSourcing: true, ignoreMandatoryFields: false });
  }

  function upsertProofItemRecord(packet, proof, recordId, customerResult, accountContext, vendorContext, planningContext) {
    const proofRecord = recordId
      ? record.load({ type: proof.recordType, id: recordId, isDynamic: true })
      : record.create({ type: proof.recordType, isDynamic: true });
    proofRecord.setValue({ fieldId: 'itemid', value: proof.plannedName });
    proofRecord.setValue({ fieldId: 'displayname', value: proof.plannedName });
    setItemSubsidiary(proofRecord, accountContext.values.subsidiaryId);
    if (accountContext.values.locationId) safeSetValue(proofRecord, 'location', accountContext.values.locationId);
    if (accountContext.values.taxScheduleId) safeSetValue(proofRecord, 'taxschedule', accountContext.values.taxScheduleId);
    if (accountContext.values.departmentId) safeSetValue(proofRecord, 'department', accountContext.values.departmentId);
    if (accountContext.values.classId) safeSetValue(proofRecord, 'class', accountContext.values.classId);
    attachPreferredVendor(proofRecord, vendorContext);
    applyPlanningControls(proofRecord, planningContext);
    if (packet.customer && packet.customer.notes) {
      proofRecord.setValue({ fieldId: 'salesdescription', value: packet.customer.notes });
    }
    safeSetValue(proofRecord, 'custitem_idb_packet_id', packet.trace && packet.trace.packetId ? packet.trace.packetId : '');
    safeSetValue(proofRecord, 'custitem_idb_lane', packet.selectedLaneId);
    safeSetValue(proofRecord, 'custitem_idb_proof_anchor', packet.proofAnchor);
    safeSetValue(proofRecord, 'custitem_idb_parent_customer', customerResult.recordId);
    return proofRecord.save({ enableSourcing: true, ignoreMandatoryFields: false });
  }

  function attachPreferredVendor(proofRecord, vendorContext) {
    if (!vendorContext || !vendorContext.values || !vendorContext.values.vendorId) return;
    const vendorId = vendorContext.values.vendorId;
    const purchasePrice = vendorContext.values.purchasePrice;
    try {
      if (typeof proofRecord.selectNewLine === 'function') {
        proofRecord.selectNewLine({ sublistId: 'itemvendor' });
        proofRecord.setCurrentSublistValue({ sublistId: 'itemvendor', fieldId: 'vendor', value: vendorId });
        proofRecord.setCurrentSublistValue({ sublistId: 'itemvendor', fieldId: 'preferredvendor', value: true });
        if (purchasePrice) {
          proofRecord.setCurrentSublistValue({ sublistId: 'itemvendor', fieldId: 'purchaseprice', value: purchasePrice });
        }
        proofRecord.commitLine({ sublistId: 'itemvendor' });
        return;
      }
    } catch (error) {
      safeSetValue(proofRecord, 'vendor', vendorId);
      safeSetValue(proofRecord, 'preferredvendor', true);
      if (purchasePrice) safeSetValue(proofRecord, 'cost', purchasePrice);
      return;
    }
    safeSetValue(proofRecord, 'vendor', vendorId);
    safeSetValue(proofRecord, 'preferredvendor', true);
    if (purchasePrice) safeSetValue(proofRecord, 'cost', purchasePrice);
  }

  function applyPlanningControls(proofRecord, planningContext) {
    if (!planningContext || !planningContext.values) return;
    if (planningContext.values.disableAutoPlanning) {
      safeSetValue(proofRecord, 'autoleadtime', false);
      safeSetValue(proofRecord, 'autoreorderpoint', false);
      safeSetValue(proofRecord, 'autopreferredstocklevel', false);
      safeSetValue(proofRecord, 'autosafetystocklevel', false);
    }
    if (planningContext.values.replenishmentMethod) {
      safeSetValue(proofRecord, 'supplyreplenishmentmethod', planningContext.values.replenishmentMethod);
    }
  }

  function setItemSubsidiary(itemRecord, subsidiaryId) {
    try {
      itemRecord.setValue({ fieldId: 'subsidiary', value: [subsidiaryId] });
    } catch (error) {
      itemRecord.setValue({ fieldId: 'subsidiary', value: subsidiaryId });
    }
  }

  function safeSetValue(customerRecord, fieldId, value) {
    try {
      customerRecord.setValue({ fieldId, value });
    } catch (error) {
      // Custom fields may not exist in every sandbox. Core customer fields still write.
    }
  }

  function recordUrl(recordType, recordId) {
    return url.resolveRecord({
      recordType,
      recordId,
      isEditMode: false
    });
  }

  function partialFailureSimulation(packet, writePlan) {
    const customer = writePlan.find((item) => item.role === 'customer');
    const proof = writePlan.find((item) => item.role === 'proof anchor');
    const dependent = writePlan.find((item) => item.role === 'transaction') || writePlan.find((item) => item.parentDependencies.length);
    return {
      schema: 'idb.partial-failure-simulation.v1',
      statusIfDependentFailsAfterParentSuccess: 'partial_failed',
      completedBeforeFailure: [customer, proof].filter(Boolean).map((item) => ({
        sequence: item.sequence,
        label: item.label,
        recordType: item.recordType,
        recordId: null,
        url: null,
        operation: item.writeStatusIfEnabled,
        rollbackLabel: item.rollbackLabel,
        recoverableErrors: []
      })),
      blockedDependentWrites: dependent ? [{
        sequence: dependent.sequence,
        label: dependent.label,
        reason: 'Parent write failed or dependent write is outside the current smoke scope.',
        recoverable: true
      }] : [],
      recoveryInstruction: 'Return partial_failed with completed record IDs/URLs, rollback labels, and recoverable errors. Do not silently retry or delete.',
      noSilentRetry: true,
      noSilentDeletion: true
    };
  }

  function transactionContextPilotPlan(packet, writePlan, customerPilotResult, proofPilotResult) {
    const transaction = writePlan.find((item) => item.role === 'transaction');
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    const proofResult = parentProofResult(packet, proofPilotResult);
    const parentResults = [
      {
        role: 'customer',
        required: true,
        recordId: customerResult.recordId,
        url: customerResult.url,
        operation: customerResult.operation,
        lookupStatus: customerResult.lookupStatus,
        status: customerResult.status,
        source: customerResult.source
      },
      {
        role: 'proof anchor',
        required: true,
        recordId: proofResult.recordId,
        url: proofResult.url,
        operation: proofResult.operation,
        lookupStatus: proofResult.lookupStatus,
        status: proofResult.status,
        source: proofResult.source
      }
    ];
    const parentsReady = parentResults.every((item) => item.status === 'ready');
    return {
      schema: 'idb.transaction-context-pilot.v1',
      status: parentsReady
        ? (CREATE_ENABLED && TRANSACTION_CONTEXT_ENABLED ? 'runtime_flags_required' : (CREATE_ENABLED ? 'blocked_transaction_context_disabled' : 'blocked_create_disabled'))
        : 'blocked_missing_customer_or_proof_result',
      createEnabled: CREATE_ENABLED,
      transactionContextEnabled: TRANSACTION_CONTEXT_ENABLED,
      laneId: packet.selectedLaneId,
      transactionLookupRule: transaction ? transaction.createContract.existingRecordLookup : 'reviewed transaction record is required',
      transactionRecord: transaction ? {
        sequence: transaction.sequence,
        label: transaction.label,
        recordType: transaction.recordType,
        plannedName: transaction.plannedName,
        operation: 'lookup_then_create_or_update_sales_order_context',
        lookupKey: transaction.lookupKey,
        rollbackLabel: transaction.rollbackLabel
      } : null,
      requiredParentResults: parentResults,
      blockedReason: parentsReady
        ? (TRANSACTION_CONTEXT_ENABLED ? 'Main package create is disabled.' : 'Transaction context remains disabled until the dedicated transaction pilot block.')
        : 'Customer and proof item record IDs/URLs are required before transaction context can write.',
      traceResultRequired: {
        recordId: true,
        url: true,
        operation: true,
        recoverableErrors: true,
        parentCustomerRecordId: true,
        parentProofRecordId: true
      },
      nonRegression: {
        noTransactionWriteWithoutCustomerAndProofResult: true,
        noTransactionCreationInMainPackage: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function fiveConsultantExecutablePilotPack(packet, writePlan) {
    return {
      schema: 'idb.five-consultant-executable-pilot-pack.v1',
      status: 'pilot_pack_ready_create_disabled',
      audience: 'five_consultants',
      installFiles: [
        'idb-drawer.user.js',
        'netsuite/suitescript/idb_suitescript_write_path_suitelet.js',
        'data/w19_governed_write_execution_pilot_branch.json',
        'data/w20_transaction_context_execution_design.json',
        'data/w21_five_consultant_executable_pilot_pack.json'
      ],
      safeInMain: [
        'Tampermonkey guided drawer',
        'review packet export',
        'trace export',
        'create-disabled SuiteScript validation'
      ],
      pilotBranchOnly: [
        'Customer write',
        'Proof item write',
        'transaction context write after parent IDs and URLs exist'
      ],
      evidenceRequired: [
        'before screenshot',
        'reviewed packet JSON',
        'SuiteScript response with traceEvent',
        'record IDs and URLs if a pilot branch write is enabled',
        'reset or clear-session confirmation'
      ],
      goNoGo: {
        packageReviewed: true,
        writePathStillBlockedInMain: CREATE_ENABLED === false,
        exactWriteListVisible: writePlan.length > 0,
        rollbackEvidenceRequired: true,
        consultantFeedbackRequired: true
      }
    };
  }

  function onRequest(context) {
    if (context.request.method !== 'POST') {
      context.response.write(JSON.stringify(response('blocked', null, [
        errorLine(0, 'method', 'POST is required.')
      ])));
      return;
    }

    let packet;
    try {
      packet = parsePacket(context);
    } catch (error) {
      context.response.write(JSON.stringify(response('blocked', null, [
        errorLine(0, 'json', `Invalid JSON: ${error.message}`)
      ])));
      return;
    }

    const errors = validatePacket(packet);
    if (errors.length) {
      context.response.write(JSON.stringify(response('blocked', packet, errors)));
      return;
    }

    const writePlan = buildWritePlan(packet);
    if (!CREATE_ENABLED) {
      const vendorContext = vendorContextResolver(packet);
      const planningContext = planningContextResolver(packet);
      context.response.write(JSON.stringify(Object.assign(response('validated', packet, [
        errorLine(0, 'createEnabled', 'SuiteScript write path package is installed as create-disabled.')
      ]), {
        writePlan,
        runtimeFlagStrategy: runtimeFlagStrategy(),
        customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
        proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan),
        proofItemWriteV2: proofItemWriteV2Contract(packet, writePlan, null, vendorContext, planningContext),
        vendorContext,
        vendorAttachPilotPlan: vendorAttachPilotPlan(packet, writePlan, vendorContext),
        planningContext,
        planningControlPlan: planningControlPlan(packet, writePlan, planningContext),
        governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan, context),
        w49PilotHardening: w49PilotHardening(packet, writePlan, null, null, 'validated'),
        blockedDependentWrites: blockedDependentWritesForPilot(packet, writePlan, null, null),
        rollbackRecoveryInstructions: rollbackRecoveryInstructions('validated', null, null),
        smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
        partialFailureSimulation: partialFailureSimulation(packet, writePlan),
        transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan),
        fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
      })));
      return;
    }

    const runtimeToggle = governedPilotRuntimeToggle(packet, context);
    if (!runtimeToggle.allowed) {
      const vendorContext = vendorContextResolver(packet);
      const planningContext = planningContextResolver(packet);
      context.response.write(JSON.stringify(Object.assign(response('blocked', packet, [
        errorLine(0, 'governedPilotRuntimeToggle', runtimeToggle.status)
      ]), {
        writePlan,
        runtimeFlagStrategy: runtimeFlagStrategy(),
        governedPilotRuntimeToggle: runtimeToggle,
        governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan, context),
        customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
        proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan),
        proofItemWriteV2: proofItemWriteV2Contract(packet, writePlan, null, vendorContext, planningContext),
        vendorContext,
        vendorAttachPilotPlan: vendorAttachPilotPlan(packet, writePlan, vendorContext),
        planningContext,
        planningControlPlan: planningControlPlan(packet, writePlan, planningContext),
        w49PilotHardening: w49PilotHardening(packet, writePlan, null, null, 'blocked_runtime_toggle'),
        blockedDependentWrites: blockedDependentWritesForPilot(packet, writePlan, null, null),
        rollbackRecoveryInstructions: rollbackRecoveryInstructions('blocked_runtime_toggle', null, null),
        smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
        partialFailureSimulation: partialFailureSimulation(packet, writePlan),
        transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan),
        fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
      })));
      return;
    }

    const accountContext = accountContextResolver();
    if (accountContext.status !== 'account_context_ready') {
      context.response.write(JSON.stringify(accountContextBlockedResponse(packet, writePlan, accountContext, context)));
      return;
    }

    const vendorContext = vendorContextResolver(packet);
    if (vendorContext.status.indexOf('blocked_') === 0) {
      context.response.write(JSON.stringify(vendorContextBlockedResponse(packet, writePlan, accountContext, vendorContext, context)));
      return;
    }

    const customerPilotResult = executeCustomerWritePilot(packet, writePlan, accountContext);
    const planningContext = planningContextResolver(packet);
    const proofItemPilotResult = executeProofItemWritePilot(packet, writePlan, customerPilotResult, accountContext, vendorContext, planningContext);
    const createdRecords = []
      .concat(customerPilotResult.createdRecords || [])
      .concat(proofItemPilotResult.createdRecords || []);
    const combinedErrors = []
      .concat(customerPilotResult.errors || [])
      .concat(proofItemPilotResult.errors || []);
    const finalStatus = combinedErrors.length ? (createdRecords.length ? 'partial_failed' : 'blocked') : 'created';
    context.response.write(JSON.stringify(Object.assign(response(finalStatus, packet, combinedErrors, createdRecords), {
      writePlan,
      runtimeFlagStrategy: runtimeFlagStrategy(),
      accountContext,
      vendorContext,
      planningContext,
      pilotResultSummary: pilotResultSummary(packet, customerPilotResult, proofItemPilotResult, finalStatus),
      customerWritePilotPlan: customerWritePilotPlan(packet, writePlan, customerPilotResult),
      proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan, customerPilotResult, proofItemPilotResult, planningContext),
      proofItemWriteV2: proofItemWriteV2Contract(packet, writePlan, accountContext, vendorContext, planningContext, customerPilotResult, proofItemPilotResult),
      vendorAttachPilotPlan: vendorAttachPilotPlan(packet, writePlan, vendorContext, proofItemPilotResult),
      planningControlPlan: planningControlPlan(packet, writePlan, planningContext, proofItemPilotResult),
      governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan, context),
      w49PilotHardening: w49PilotHardening(packet, writePlan, customerPilotResult, proofItemPilotResult, finalStatus),
      blockedDependentWrites: blockedDependentWritesForPilot(packet, writePlan, customerPilotResult, proofItemPilotResult),
      rollbackRecoveryInstructions: rollbackRecoveryInstructions(finalStatus, customerPilotResult, proofItemPilotResult),
      smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
      partialFailureSimulation: partialFailureSimulation(packet, writePlan),
      transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan, customerPilotResult, proofItemPilotResult),
      fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
    })));
  }

  return { onRequest };
});
