/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
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
 * - Defines a tiny Food / Beverage sandbox pilot path for Customer + Finished Good only.
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
 * - Customer write path is lookup-first, idempotent, sandbox-gated, and result-trace required.
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
 * - Defines the exact branch/runtime toggle path for a sandbox-only Customer + Proof Item pilot.
 * - Main package keeps CREATE_ENABLED = false.
 * - A pilot branch that flips CREATE_ENABLED still must pass sandbox runtime flags and type-to-confirm before writes.
 */
define(['N/record', 'N/runtime', 'N/url', 'N/search'], (record, runtime, url, search) => {
  const CREATE_ENABLED = false;
  const TRANSACTION_CONTEXT_ENABLED = false;
  const WRITE_PATH_TYPE = 'suitescript_direct_write';
  const TRACE_EVENT = 'suitescript_write_path_result';
  const CREATION_PACKET_SCHEMA = 'idb.creation-packet.v2';
  const PILOT_LANE_ID = 'food_beverage';
  const PILOT_ALLOWED_ROLES = ['customer', 'proof anchor'];
  const CUSTOMER_PILOT_ROLE = 'customer';
  const PROOF_PILOT_ROLE = 'proof anchor';
  const RUNTIME_FLAGS = {
    enablePilotWritesParameter: 'custscript_idb_enable_pilot_writes',
    allowCustomerPilotParameter: 'custscript_idb_allow_customer_pilot',
    allowProofItemPilotParameter: 'custscript_idb_allow_proof_item_pilot',
    sandboxAccountParameter: 'custscript_idb_sandbox_account_only',
    requireTypeToConfirmParameter: 'custscript_idb_require_type_confirm',
    defaultCreateEnabled: CREATE_ENABLED,
    approvedLaneId: PILOT_LANE_ID,
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
        'sandbox runtime parameter allows pilot writes',
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

  function governedWritePilotBranchPlan(packet, writePlan) {
    const customer = writePlan.find((item) => item.role === CUSTOMER_PILOT_ROLE);
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const toggle = governedPilotRuntimeToggle(packet);
    return {
      schema: 'idb.governed-write-pilot-branch.v1',
      status: toggle.allowed ? 'pilot_runtime_ready' : toggle.status,
      mainPackageCreateEnabled: CREATE_ENABLED,
      approvedBranchOnly: true,
      runtimeToggle: toggle,
      approvedPilotScope: {
        laneId: PILOT_LANE_ID,
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
        'sandbox runtime flags enabled in pilot branch',
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

  function governedPilotRuntimeToggle(packet) {
    const expectedPhrase = typeToConfirmPhrase(packet);
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
        status: runtimeFlagEnabled(RUNTIME_FLAGS.sandboxAccountParameter) && isSandboxRuntime() ? 'ready' : 'blocked',
        detail: 'Runtime must be sandbox and sandbox-only parameter must be enabled.'
      },
      {
        key: RUNTIME_FLAGS.requireTypeToConfirmParameter,
        status: runtimeFlagEnabled(RUNTIME_FLAGS.requireTypeToConfirmParameter) ? 'ready' : 'blocked',
        detail: 'Runtime parameter must require the type-to-confirm phrase.'
      },
      {
        key: 'type_to_confirm_phrase',
        status: packet && packet.typeToConfirmPhrase === expectedPhrase ? 'ready' : 'blocked',
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
      gates,
      allowedRoles: PILOT_ALLOWED_ROLES,
      blockedTransactionContext: true,
      noRegression: {
        mainPackageCreateDisabled: CREATE_ENABLED === false,
        sandboxOnly: true,
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

  function runtimeEnvironment() {
    return runtime.envType || runtime.executionContext || 'unknown';
  }

  function isSandboxRuntime() {
    const env = String(runtimeEnvironment()).toUpperCase();
    return env.indexOf('SANDBOX') !== -1;
  }

  function typeToConfirmPhrase(packet) {
    const customerName = packet && packet.customer && packet.customer.name ? packet.customer.name : 'CUSTOMER';
    const normalizedCustomer = String(customerName).replace(/[^a-z0-9]+/gi, ' ').trim().replace(/\s+/g, ' ').toUpperCase() || 'CUSTOMER';
    const lane = packet && packet.selectedLaneId ? String(packet.selectedLaneId).replace(/[^a-z0-9]+/gi, '_').toUpperCase() : PILOT_LANE_ID.toUpperCase();
    return `CREATE ${normalizedCustomer} ${lane}`;
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
    return packet.selectedLaneId === PILOT_LANE_ID && PILOT_ALLOWED_ROLES.indexOf(item.role) !== -1;
  }

  function smallWriteSmokePlan(packet, writePlan) {
    const pilotRecords = writePlan.filter((item) => pilotRoleAllowed(item, packet));
    const skippedRecords = writePlan.filter((item) => !pilotRoleAllowed(item, packet));
    return {
      schema: 'idb.small-write-smoke-plan.v1',
      createEnabled: CREATE_ENABLED,
      pilotLaneId: PILOT_LANE_ID,
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

  function customerWritePilotPlan(packet, writePlan) {
    const customer = writePlan.find((item) => item.role === CUSTOMER_PILOT_ROLE);
    return {
      schema: 'idb.customer-write-pilot.v1',
      createEnabled: CREATE_ENABLED,
      status: CREATE_ENABLED ? 'runtime_flags_required' : 'blocked_create_disabled',
      laneId: packet.selectedLaneId,
      approvedLaneId: PILOT_LANE_ID,
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
        recordId: null,
        url: null,
        recoverableErrors: []
      } : null,
      fieldMapping: {
        companyname: packet.customer && packet.customer.name ? packet.customer.name : 'review_required',
        url: packet.customer && packet.customer.website ? packet.customer.website : 'review_required',
        comments: packet.customer && packet.customer.notes ? packet.customer.notes : '',
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
      blockedReason: CREATE_ENABLED ? 'Runtime pilot flags must be inspected before writing.' : 'Main package create is disabled.',
      nonRegression: {
        noCustomerWriteInMainPackage: true,
        noTransactionWrite: true,
        noProofItemWriteInW15: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function proofItemWritePilotPlan(packet, writePlan, customerPilotResult) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    const customerReady = customerResult.status === 'ready';
    return {
      schema: 'idb.proof-item-write-pilot.v1',
      createEnabled: CREATE_ENABLED,
      status: customerReady ? (CREATE_ENABLED ? 'runtime_flags_required' : 'blocked_create_disabled') : 'blocked_missing_customer_result',
      laneId: packet.selectedLaneId,
      approvedLaneId: PILOT_LANE_ID,
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
        recordId: null,
        url: null,
        recoverableErrors: []
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
      blockedReason: customerReady
        ? (CREATE_ENABLED ? 'Runtime pilot flags must be inspected before writing the proof item.' : 'Main package create is disabled.')
        : 'Customer result ID and URL are required before proof item write can be planned for execution.',
      nonRegression: {
        noProofItemWriteWithoutCustomerResult: true,
        noTransactionWrite: true,
        noAutomaticCreationFromDrawer: true,
        noSilentRetry: true,
        noSilentDeletion: true
      }
    };
  }

  function executeCustomerWritePilot(packet, writePlan) {
    const customer = writePlan.find((item) => item.role === CUSTOMER_PILOT_ROLE);
    if (!customer) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(0, 'customer', 'Customer record is required for the W15 pilot.')]
      };
    }
    if (packet.selectedLaneId !== PILOT_LANE_ID) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(customer.sequence, customer.label, 'Customer pilot is only enabled for the approved pilot lane.')]
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
    const recordId = upsertCustomerRecord(packet, lookup.recordId);
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

  function executeProofItemWritePilot(packet, writePlan, customerPilotResult) {
    const proof = writePlan.find((item) => item.role === PROOF_PILOT_ROLE);
    const customerResult = parentCustomerResult(packet, customerPilotResult);
    if (!proof) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(0, 'proof anchor', 'Proof item record is required for the W16 pilot.')]
      };
    }
    if (packet.selectedLaneId !== PILOT_LANE_ID) {
      return {
        status: 'blocked',
        createdRecords: [],
        errors: [errorLine(proof.sequence, proof.label, 'Proof item pilot is only enabled for the approved pilot lane.')]
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
    const recordId = upsertProofItemRecord(packet, proof, lookup.recordId, customerResult);
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

  function upsertCustomerRecord(packet, recordId) {
    const customer = packet.customer || {};
    const customerRecord = recordId
      ? record.load({ type: record.Type.CUSTOMER, id: recordId, isDynamic: true })
      : record.create({ type: record.Type.CUSTOMER, isDynamic: true });
    customerRecord.setValue({ fieldId: 'companyname', value: customer.name });
    customerRecord.setValue({ fieldId: 'url', value: customer.website });
    if (customer.notes) customerRecord.setValue({ fieldId: 'comments', value: customer.notes });
    safeSetValue(customerRecord, 'custentity_idb_packet_id', packet.trace && packet.trace.packetId ? packet.trace.packetId : '');
    safeSetValue(customerRecord, 'custentity_idb_lane', packet.selectedLaneId);
    safeSetValue(customerRecord, 'custentity_idb_proof_anchor', packet.proofAnchor);
    return customerRecord.save({ enableSourcing: true, ignoreMandatoryFields: false });
  }

  function upsertProofItemRecord(packet, proof, recordId, customerResult) {
    const proofRecord = recordId
      ? record.load({ type: proof.recordType, id: recordId, isDynamic: true })
      : record.create({ type: proof.recordType, isDynamic: true });
    proofRecord.setValue({ fieldId: 'itemid', value: proof.plannedName });
    proofRecord.setValue({ fieldId: 'displayname', value: proof.plannedName });
    if (packet.customer && packet.customer.notes) {
      proofRecord.setValue({ fieldId: 'salesdescription', value: packet.customer.notes });
    }
    safeSetValue(proofRecord, 'custitem_idb_packet_id', packet.trace && packet.trace.packetId ? packet.trace.packetId : '');
    safeSetValue(proofRecord, 'custitem_idb_lane', packet.selectedLaneId);
    safeSetValue(proofRecord, 'custitem_idb_proof_anchor', packet.proofAnchor);
    safeSetValue(proofRecord, 'custitem_idb_parent_customer', customerResult.recordId);
    return proofRecord.save({ enableSourcing: true, ignoreMandatoryFields: false });
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
      context.response.write(JSON.stringify(Object.assign(response('validated', packet, [
        errorLine(0, 'createEnabled', 'SuiteScript write path package is installed as create-disabled.')
      ]), {
        writePlan,
        runtimeFlagStrategy: runtimeFlagStrategy(),
        customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
        proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan),
        governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan),
        smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
        partialFailureSimulation: partialFailureSimulation(packet, writePlan),
        transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan),
        fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
      })));
      return;
    }

    const runtimeToggle = governedPilotRuntimeToggle(packet);
    if (!runtimeToggle.allowed) {
      context.response.write(JSON.stringify(Object.assign(response('blocked', packet, [
        errorLine(0, 'governedPilotRuntimeToggle', runtimeToggle.status)
      ]), {
        writePlan,
        runtimeFlagStrategy: runtimeFlagStrategy(),
        governedPilotRuntimeToggle: runtimeToggle,
        governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan),
        customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
        proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan),
        smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
        partialFailureSimulation: partialFailureSimulation(packet, writePlan),
        transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan),
        fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
      })));
      return;
    }

    const customerPilotResult = executeCustomerWritePilot(packet, writePlan);
    const proofItemPilotResult = executeProofItemWritePilot(packet, writePlan, customerPilotResult);
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
      customerWritePilotPlan: customerWritePilotPlan(packet, writePlan),
      proofItemWritePilotPlan: proofItemWritePilotPlan(packet, writePlan, customerPilotResult),
      governedWritePilotBranchPlan: governedWritePilotBranchPlan(packet, writePlan),
      smallWriteSmokePlan: smallWriteSmokePlan(packet, writePlan),
      partialFailureSimulation: partialFailureSimulation(packet, writePlan),
      transactionContextPilotPlan: transactionContextPilotPlan(packet, writePlan, customerPilotResult, proofItemPilotResult),
      fiveConsultantExecutablePilotPack: fiveConsultantExecutablePilotPack(packet, writePlan)
    })));
  }

  return { onRequest };
});
