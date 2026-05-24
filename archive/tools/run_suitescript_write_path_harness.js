const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const suiteletPath = path.join(root, 'netsuite', 'suitescript', 'idb_suitescript_write_path_suitelet.js');
const w24PilotSuiteletPath = path.join(root, 'netsuite', 'suitescript', 'idb_suitescript_write_path_suitelet_w24_pilot.js');
const pilotPath = path.join(root, 'data', 'food_beverage_controlled_create_pilot.json');
const reportPath = path.join(root, 'reports', 'g12_suitescript_harness_results.md');
const tracePath = path.join(root, 'trace_samples', 'g12_suitescript_harness_trace_sample.json');
const w49PostTestPackPath = path.join(root, 'data', 'w49_post_test_pack.json');
const w49SuccessSamplePath = path.join(root, 'trace_samples', 'w49_success_response_sample.json');
const w49BlockedSamplePath = path.join(root, 'trace_samples', 'w49_blocked_response_sample.json');

function loadSuitelet(options = {}) {
  let source = fs.readFileSync(options.suiteletPath || suiteletPath, 'utf8');
  if (options.forceCreateEnabled) {
    source = source.replace('const CREATE_ENABLED = false;', 'const CREATE_ENABLED = true;');
  }
  const recordMock = {
    Type: {
      CUSTOMER: 'customer',
      SALES_ORDER: 'salesorder',
      VENDOR: 'vendor',
      INVENTORY_ITEM: 'inventoryitem',
      ASSEMBLY_ITEM: 'assemblyitem',
      LOT_NUMBERED_INVENTORY_ITEM: 'lotnumberedinventoryitem'
    },
    create({ type }) {
      return recordInstance(type);
    },
    load({ type, id }) {
      return recordInstance(type, id);
    }
  };
  const runtimeMock = {
    envType: options.envType || 'SANDBOX',
    accountId: options.accountId || 'SB_TEST',
    getCurrentScript() {
      return {
        getParameter({ name }) {
          return options.parameters && Object.prototype.hasOwnProperty.call(options.parameters, name)
            ? options.parameters[name]
            : false;
        }
      };
    }
  };
  const urlMock = {
    resolveRecord({ recordType, recordId }) {
      return `/app/common/${recordType}.nl?id=${recordId}`;
    }
  };
  const searchMock = {
    create() {
      return {
        run() {
          return {
            getRange() {
              return [];
            }
          };
        }
      };
    }
  };
  let exported;
  const sandbox = {
    define(deps, factory) {
      exported = factory(recordMock, runtimeMock, urlMock, searchMock);
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: options.suiteletPath || suiteletPath });
  return exported;
}

let nextRecordId = 1000;
function recordInstance(type, existingId) {
  const values = {};
  return {
    setValue({ fieldId, value }) {
      values[fieldId] = value;
    },
    save() {
      if (existingId) return existingId;
      nextRecordId += 1;
      return String(nextRecordId);
    },
    values,
    type
  };
}

function context(method, body, headers = {}) {
  let written = '';
  return {
    request: {
      method,
      body: body == null ? '' : JSON.stringify(body),
      headers
    },
    response: {
      write(value) {
        written = value;
      }
    },
    read() {
      return JSON.parse(written);
    }
  };
}

function reviewedFoodBeveragePacket() {
  const pilot = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));
  const reviewedRecords = pilot.requiredRecords.map((record) => ({
    sequence: record.sequence,
    label: record.label,
    plannedName: `Georgetown Foods ${record.label}`,
    role: record.role
  }));
  return {
    idbReviewedPacket: {
      source: 'Intelligent Demo Builder',
      packetMode: 'reviewed_create_request',
      mode: 'create',
      writePathType: 'suitescript_direct_write',
      consultantConfirmed: true,
      selectedLaneId: pilot.pilotLaneId,
      proofAnchor: 'Finished Good',
      customer: {
        name: 'Georgetown Foods',
        website: 'https://georgetownfoods.example',
        notes: 'Ingredient readiness, packaging timing, finished-good availability, and promotion replenishment risk.'
      },
      trace: {
        packetId: 'g12-food-beverage-reviewed-packet'
      },
      records: reviewedRecords,
      creationPacketContract: {
        schema: 'idb.creation-packet.v2',
        creationAllowed: false,
        writePathType: 'suitescript_direct_write',
        records: reviewedRecords.map((record) => ({
          sequence: record.sequence,
          label: record.label,
          recordType: record.role,
          proposedName: record.plannedName,
          createIntent: intentFor(record),
          idempotencyKey: `food_beverage:g12:${record.sequence}:${record.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          existingRecordLookup: lookupFor(record),
          dependencies: dependenciesFor(record),
          rollbackLabel: `Rollback ${record.label}`,
          traceResultRequired: true
        }))
      }
    }
  };
}

function reviewedProductsCpgPacket() {
  const packet = JSON.parse(JSON.stringify(reviewedFoodBeveragePacket()));
  const reviewed = packet.idbReviewedPacket;
  reviewed.selectedLaneId = 'products_cpg';
  reviewed.proofAnchor = 'Sales Order View';
  reviewed.customer = {
    name: 'Milk Bone',
    website: 'https://www.milkbone.com',
    notes: 'Prospect is big on inventory visibility and has multiple locations to track.'
  };
  reviewed.trace.packetId = 'w40-milk-bone-products-cpg-reviewed-packet';
  reviewed.typeToConfirm = 'CREATE MILK BONE PRODUCTS_CPG';
  reviewed.records = [
    { sequence: 1, label: 'Customer Record', plannedName: 'Milk Bone', role: 'customer' },
    { sequence: 2, label: 'Sales Order View', plannedName: 'Milk Bone - retail pet-treat replenishment Demo Order', role: 'transaction' },
    { sequence: 3, label: 'Finished Good', plannedName: 'Milk Bone Original Dog Biscuits Variety Pack', role: 'proof anchor' }
  ];
  reviewed.creationPacketContract.records = reviewed.records.map((record) => ({
    sequence: record.sequence,
    label: record.label,
    recordType: record.role,
    proposedName: record.plannedName,
    createIntent: intentFor(record),
    idempotencyKey: `products_cpg:w40:${record.sequence}:${record.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    existingRecordLookup: record.role === 'customer'
      ? { field: 'companyname', value: 'Milk Bone' }
      : { field: record.role === 'transaction' ? 'tranid' : 'itemid', value: record.plannedName },
    dependencies: dependenciesFor(record),
    rollbackLabel: `Rollback ${record.label}`,
    traceResultRequired: true
  }));
  return packet;
}

function intentFor(record) {
  if (record.role === 'customer') return 'create_or_update_customer';
  if (record.role === 'transaction') return 'create_sales_order_context';
  if (record.role === 'proof anchor') return 'create_or_update_proof_item';
  return 'create_or_update_supporting_proof';
}

function lookupFor(record) {
  if (record.role === 'customer') {
    return { field: 'companyname', value: 'Georgetown Foods' };
  }
  return { field: 'name', value: record.plannedName };
}

function dependenciesFor(record) {
  if (record.role === 'customer') return [];
  if (record.role === 'transaction') return ['Customer Record'];
  if (record.role === 'proof anchor') return ['Customer Record'];
  return ['Customer Record', 'Finished Good'];
}

function runScenario(name, requestContext, expectedStatus, expectedErrorLabel, checker, suiteletOptions) {
  const suitelet = loadSuitelet(suiteletOptions);
  suitelet.onRequest(requestContext);
  const actual = requestContext.read();
  const statusPass = actual.status === expectedStatus;
  const errorPass = expectedErrorLabel
    ? (actual.errors || []).some((error) => error.label === expectedErrorLabel)
    : true;
  const checkerPass = checker ? checker(actual) : true;
  return {
    name,
    pass: statusPass && errorPass && checkerPass,
    expectedStatus,
    actualStatus: actual.status,
    expectedErrorLabel: expectedErrorLabel || '',
    createEnabled: actual.createEnabled,
    response: actual
  };
}

function w49PostTestPack(successPacket, blockedPacket) {
  return {
    schema: 'idb.w49-post-test-pack.v1',
    objective: 'Exercise governed Customer + Proof Item pilot writes with Customer first, Proof Item second, and transaction writes blocked.',
    suitelet: 'netsuite/suitescript/idb_suitescript_write_path_suitelet_w24_pilot.js',
    method: 'POST',
    cases: [
      {
        id: 'w49_success_customer_then_proof_item',
        expectedStatus: 'created',
        packet: successPacket,
        requiredRuntimeParameters: {
          custscript_idb_enable_pilot_writes: true,
          custscript_idb_allow_customer_pilot: true,
          custscript_idb_allow_proof_item_pilot: true,
          custscript_idb_sandbox_account_only: true,
          custscript_idb_require_type_confirm: true,
          custscript_idb_default_subsidiary: '1',
          custscript_idb_default_location: '2',
          custscript_idb_default_taxschedule: '1'
        }
      },
      {
        id: 'w49_blocked_missing_vendor_context',
        expectedStatus: 'blocked_missing_vendor_context',
        packet: blockedPacket,
        requiredRuntimeParameters: {
          custscript_idb_enable_pilot_writes: true,
          custscript_idb_allow_customer_pilot: true,
          custscript_idb_allow_proof_item_pilot: true,
          custscript_idb_sandbox_account_only: true,
          custscript_idb_require_type_confirm: true,
          custscript_idb_default_subsidiary: '1',
          custscript_idb_default_location: '2',
          custscript_idb_default_taxschedule: '1',
          custscript_idb_require_vendor_attach: true
        }
      }
    ],
    assertions: [
      'Customer record appears before Proof Item in createdRecords',
      'Proof Item parentCustomerRecordId equals Customer recordId',
      'createdRecords never contains transaction',
      'blockedDependentWrites contains transaction context',
      'proofItemWriteV2 is present',
      'w49PilotHardening is present',
      'rollbackRecoveryInstructions are present'
    ],
    noRegression: {
      noTransactionWrite: true,
      noProofItemWithoutCustomerResult: true,
      noSilentRetry: true,
      noSilentDeletion: true
    }
  };
}

function compactResponseSample(scenario) {
  const response = scenario.response || {};
  return {
    schema: 'idb.w49-response-sample.v1',
    scenario: scenario.name,
    expectedStatus: scenario.expectedStatus,
    actualStatus: scenario.actualStatus,
    createEnabled: response.createEnabled,
    packetId: response.packetId,
    selectedLaneId: response.selectedLaneId,
    createdRecords: response.createdRecords || [],
    blockedDependentWrites: response.blockedDependentWrites || [],
    errors: response.errors || [],
    pilotResultSummary: response.pilotResultSummary || null,
    proofItemWriteV2: response.proofItemWriteV2 || null,
    w49PilotHardening: response.w49PilotHardening || null,
    rollbackRecoveryInstructions: response.rollbackRecoveryInstructions || [],
    transactionContextPilotPlan: response.transactionContextPilotPlan || null,
    noRegression: {
      noTransactionWrite: true,
      noAutomaticCreationFromDrawer: true
    }
  };
}

function main() {
  const validPacket = reviewedFoodBeveragePacket();
  const noConfirmPacket = JSON.parse(JSON.stringify(validPacket));
  noConfirmPacket.idbReviewedPacket.consultantConfirmed = false;
  const wrongLanePacket = JSON.parse(JSON.stringify(validPacket));
  wrongLanePacket.idbReviewedPacket.selectedLaneId = 'not_authorized';
  const missingContractPacket = JSON.parse(JSON.stringify(validPacket));
  delete missingContractPacket.idbReviewedPacket.creationPacketContract;
  const duplicateIdempotencyPacket = JSON.parse(JSON.stringify(validPacket));
  duplicateIdempotencyPacket.idbReviewedPacket.creationPacketContract.records[1].idempotencyKey = duplicateIdempotencyPacket.idbReviewedPacket.creationPacketContract.records[0].idempotencyKey;
  const duplicateLookupPacket = JSON.parse(JSON.stringify(validPacket));
  duplicateLookupPacket.idbReviewedPacket.records[2].role = 'customer';
  duplicateLookupPacket.idbReviewedPacket.creationPacketContract.records[2].existingRecordLookup = duplicateLookupPacket.idbReviewedPacket.creationPacketContract.records[0].existingRecordLookup;
  const proofReadyPacket = JSON.parse(JSON.stringify(validPacket));
  proofReadyPacket.idbReviewedPacket.parentResults = {
    customer: {
      role: 'customer',
      recordId: '123',
      url: '/app/common/customer.nl?id=123',
      operation: 'create_customer',
      lookupStatus: 'created_new_customer'
    }
  };
  const transactionParentsReadyPacket = JSON.parse(JSON.stringify(validPacket));
  transactionParentsReadyPacket.idbReviewedPacket.parentResults = {
    customer: {
      role: 'customer',
      recordId: '123',
      url: '/app/common/customer.nl?id=123',
      operation: 'create_customer',
      lookupStatus: 'created_new_customer'
    },
    proofAnchor: {
      role: 'proof anchor',
      recordId: '456',
      url: '/app/common/inventoryitem.nl?id=456',
      operation: 'create_proof_item',
      lookupStatus: 'created_new_proof_item'
    }
  };
  const w22TypeConfirmPacket = JSON.parse(JSON.stringify(validPacket));
  w22TypeConfirmPacket.idbReviewedPacket.typeToConfirmPhrase = 'CREATE GEORGETOWN FOODS FOOD_BEVERAGE';
  const w40ProductsCpgPacket = reviewedProductsCpgPacket();

  const scenarios = [
    runScenario('reject non-POST', context('GET', validPacket), 'blocked', 'method'),
    runScenario('reject missing consultant confirmation', context('POST', noConfirmPacket), 'blocked', 'consultantConfirmed'),
    runScenario('reject unauthorized lane', context('POST', wrongLanePacket), 'blocked', 'selectedLaneId'),
    runScenario('reject reviewed packet without Creation Packet Contract V2', context('POST', missingContractPacket), 'blocked', 'creationPacketContract'),
    runScenario('reject duplicate idempotency key', context('POST', duplicateIdempotencyPacket), 'blocked', 'idempotencyKey'),
    runScenario('reject duplicate lookup target', context('POST', duplicateLookupPacket), 'blocked', 'existingRecordLookup'),
    runScenario('validate lookup-first write plan while create remains disabled', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      Array.isArray(actual.writePlan) &&
      actual.writePlan.every((item) => item.lookupStatus === 'lookup_required_before_write' && item.idempotencyStatus === 'idempotency_key_ready') &&
      actual.smallWriteSmokePlan &&
      actual.smallWriteSmokePlan.status === 'blocked_create_disabled' &&
      actual.smallWriteSmokePlan.pilotRecords.length === 2 &&
      actual.smallWriteSmokePlan.skippedRecords.some((item) => item.role === 'transaction')
    )),
    runScenario('validate partial failure and rollback evidence while create remains disabled', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.partialFailurePolicy &&
      actual.partialFailurePolicy.status === 'partial_failed' &&
      actual.partialFailurePolicy.noSilentRetry === true &&
      actual.partialFailurePolicy.noSilentDeletion === true &&
      actual.partialFailureSimulation &&
      actual.partialFailureSimulation.statusIfDependentFailsAfterParentSuccess === 'partial_failed' &&
      actual.partialFailureSimulation.completedBeforeFailure.length === 2 &&
      actual.partialFailureSimulation.blockedDependentWrites.length >= 1 &&
      actual.writePlan.every((item) => item.rollbackEvidence && item.rollbackEvidence.silentRetryAllowed === false && item.rollbackEvidence.silentDeletionAllowed === false)
    )),
    runScenario('validate transaction context pilot stays blocked without customer and proof results', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.schema === 'idb.transaction-context-pilot.v1' &&
      actual.transactionContextPilotPlan.status === 'blocked_missing_customer_or_proof_result' &&
      actual.transactionContextPilotPlan.requiredParentResults.length === 2 &&
      actual.transactionContextPilotPlan.requiredParentResults.every((item) => item.status === 'missing_parent_result') &&
      actual.transactionContextPilotPlan.transactionRecord &&
      actual.transactionContextPilotPlan.transactionRecord.operation === 'lookup_then_create_or_update_sales_order_context' &&
      actual.transactionContextPilotPlan.nonRegression.noTransactionWriteWithoutCustomerAndProofResult === true
    )),
    runScenario('validate W14 runtime flags and W15 customer pilot plan while create remains disabled', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.runtimeFlagStrategy &&
      actual.runtimeFlagStrategy.schema === 'idb.runtime-flag-strategy.v1' &&
      actual.runtimeFlagStrategy.flags.enablePilotWritesParameter === 'custscript_idb_enable_pilot_writes' &&
      actual.runtimeFlagStrategy.nonRegression.mainCreateDisabled === true &&
      actual.customerWritePilotPlan &&
      actual.customerWritePilotPlan.schema === 'idb.customer-write-pilot.v1' &&
      actual.customerWritePilotPlan.status === 'blocked_create_disabled' &&
      actual.customerWritePilotPlan.approvedRole === 'customer' &&
      actual.customerWritePilotPlan.lookupFirstRules.byCompanyNameAndWebsite === true &&
      actual.customerWritePilotPlan.nonRegression.noProofItemWriteInW15 === true
    )),
    runScenario('validate W16 proof item pilot blocks without customer result while create remains disabled', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.proofItemWritePilotPlan &&
      actual.proofItemWritePilotPlan.schema === 'idb.proof-item-write-pilot.v1' &&
      actual.proofItemWritePilotPlan.status === 'blocked_missing_customer_result' &&
      actual.proofItemWritePilotPlan.requiredParentResult.status === 'missing_parent_result' &&
      actual.proofItemWritePilotPlan.lookupFirstRules.blockIfCustomerResultMissing === true &&
      actual.proofItemWritePilotPlan.nonRegression.noProofItemWriteWithoutCustomerResult === true &&
      actual.proofItemWritePilotPlan.nonRegression.noTransactionWrite === true
    )),
    runScenario('validate W16 proof item pilot plans proof item after customer result while create remains disabled', context('POST', proofReadyPacket), 'validated', 'createEnabled', (actual) => (
      actual.proofItemWritePilotPlan &&
      actual.proofItemWritePilotPlan.schema === 'idb.proof-item-write-pilot.v1' &&
      actual.proofItemWritePilotPlan.status === 'blocked_create_disabled' &&
      actual.proofItemWritePilotPlan.requiredParentResult.recordId === '123' &&
      actual.proofItemWritePilotPlan.proofItemRecord &&
      actual.proofItemWritePilotPlan.proofItemRecord.operation === 'lookup_then_create_or_update_proof_item' &&
      actual.proofItemWritePilotPlan.traceResultRequired.parentCustomerRecordId === true
    )),
    runScenario('validate W19 governed write pilot branch remains blocked in main package', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.governedWritePilotBranchPlan &&
      actual.governedWritePilotBranchPlan.schema === 'idb.governed-write-pilot-branch.v1' &&
      actual.governedWritePilotBranchPlan.status === 'blocked_main_create_disabled' &&
      actual.governedWritePilotBranchPlan.approvedBranchOnly === true &&
      actual.governedWritePilotBranchPlan.noRegression.noWritesFromMainDrawer === true &&
      actual.governedWritePilotBranchPlan.traceResultContract.event === 'suitescript_write_path_result'
    )),
    runScenario('validate W20 transaction context recognizes ready parent results but stays create-disabled', context('POST', transactionParentsReadyPacket), 'validated', 'createEnabled', (actual) => (
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.schema === 'idb.transaction-context-pilot.v1' &&
      actual.transactionContextPilotPlan.status === 'blocked_create_disabled' &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false &&
      actual.transactionContextPilotPlan.requiredParentResults.some((item) => item.role === 'customer' && item.recordId === '123') &&
      actual.transactionContextPilotPlan.requiredParentResults.some((item) => item.role === 'proof anchor' && item.recordId === '456') &&
      actual.transactionContextPilotPlan.traceResultRequired.parentCustomerRecordId === true &&
      actual.transactionContextPilotPlan.traceResultRequired.parentProofRecordId === true
    )),
    runScenario('validate W21 five-consultant executable pilot pack is returned create-disabled', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.fiveConsultantExecutablePilotPack &&
      actual.fiveConsultantExecutablePilotPack.schema === 'idb.five-consultant-executable-pilot-pack.v1' &&
      actual.fiveConsultantExecutablePilotPack.status === 'pilot_pack_ready_create_disabled' &&
      actual.fiveConsultantExecutablePilotPack.audience === 'five_consultants' &&
      actual.fiveConsultantExecutablePilotPack.goNoGo.writePathStillBlockedInMain === true &&
      actual.fiveConsultantExecutablePilotPack.pilotBranchOnly.some((item) => /transaction context/.test(item))
    )),
    runScenario('validate W22 main package exposes blocked pilot runtime toggle', context('POST', validPacket), 'validated', 'createEnabled', (actual) => (
      actual.governedWritePilotBranchPlan &&
      actual.governedWritePilotBranchPlan.runtimeToggle &&
      actual.governedWritePilotBranchPlan.runtimeToggle.schema === 'idb.w22-governed-pilot-runtime-toggle.v1' &&
      actual.governedWritePilotBranchPlan.runtimeToggle.status === 'blocked_main_create_disabled' &&
      actual.governedWritePilotBranchPlan.runtimeToggle.allowed === false &&
      actual.governedWritePilotBranchPlan.runtimeToggle.expectedPhrase === 'CREATE GEORGETOWN FOODS FOOD_BEVERAGE'
    )),
    runScenario('validate W22 forced pilot branch blocks without runtime flags before writes', context('POST', validPacket), 'blocked', 'governedPilotRuntimeToggle', (actual) => (
      actual.createEnabled === true &&
      actual.governedPilotRuntimeToggle &&
      actual.governedPilotRuntimeToggle.schema === 'idb.w22-governed-pilot-runtime-toggle.v1' &&
      actual.governedPilotRuntimeToggle.status === 'blocked_runtime_toggle' &&
      actual.createdRecords.length === 0 &&
      actual.governedPilotRuntimeToggle.gates.some((gate) => gate.key === 'custscript_idb_enable_pilot_writes' && gate.status === 'blocked')
    ), { forceCreateEnabled: true, envType: 'SANDBOX' }),
    runScenario('validate W22 forced pilot branch blocks in unapproved production even with flags', context('POST', w22TypeConfirmPacket), 'blocked', 'governedPilotRuntimeToggle', (actual) => (
      actual.createEnabled === true &&
      actual.governedPilotRuntimeToggle &&
      actual.governedPilotRuntimeToggle.status === 'blocked_runtime_toggle' &&
      actual.governedPilotRuntimeToggle.gates.some((gate) => gate.key === 'custscript_idb_sandbox_account_only' && gate.status === 'blocked') &&
      actual.governedPilotRuntimeToggle.pilotEnvironment &&
      actual.governedPilotRuntimeToggle.pilotEnvironment.mode === 'blocked_unapproved_environment' &&
      actual.createdRecords.length === 0
    ), {
      suiteletPath: w24PilotSuiteletPath,
      forceCreateEnabled: true,
      envType: 'PRODUCTION',
      accountId: 'UNAPPROVED',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true
      }
    }),
    runScenario('validate W24 pilot branch creates customer then proof item only in sandbox', context('POST', w22TypeConfirmPacket), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords[0].role === 'customer' &&
      actual.createdRecords[0].recordId &&
      actual.createdRecords[0].url &&
      actual.createdRecords[1].role === 'proof anchor' &&
      actual.createdRecords[1].parentCustomerRecordId === actual.createdRecords[0].recordId &&
      actual.createdRecords.every((item) => item.role !== 'transaction') &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.status === 'blocked_transaction_context_disabled' &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false &&
      actual.smallWriteSmokePlan.skippedRecords.some((item) => item.role === 'transaction')
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'SANDBOX',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_currency: '1',
        custscript_idb_default_terms: '2',
        custscript_idb_default_department: '3',
        custscript_idb_default_class: '4'
      }
    }),
    runScenario('validate W39 account context blocks before writes when subsidiary is missing', context('POST', w22TypeConfirmPacket), 'blocked_missing_account_context', 'accountContext', (actual) => (
      actual.createEnabled === true &&
      actual.accountContext &&
      actual.accountContext.schema === 'idb.account-context-resolver.v2' &&
      actual.accountContext.status === 'blocked_missing_account_context' &&
      actual.accountContext.missingRuntimeParameters.includes('custscript_idb_default_subsidiary') &&
      actual.createdRecords.length === 0 &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'SANDBOX',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true
      }
    }),
    runScenario('validate W40 account context blocks before proof item write when tax schedule is missing', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'blocked_missing_account_context', 'accountContext', (actual) => (
      actual.createEnabled === true &&
      actual.accountContext &&
      actual.accountContext.status === 'blocked_missing_account_context' &&
      actual.accountContext.missingRuntimeParameters.includes('custscript_idb_default_taxschedule') &&
      actual.createdRecords.length === 0 &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2'
      }
    }),
    runScenario('validate W43 account context admin resolver v2 exposes admin defaults without expanding writes', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.accountContext &&
      actual.accountContext.schema === 'idb.account-context-resolver.v2' &&
      actual.accountContext.status === 'account_context_ready' &&
      actual.accountContext.values.currencyId === '1' &&
      actual.accountContext.values.termsId === '2' &&
      actual.accountContext.values.departmentId === '3' &&
      actual.accountContext.values.classId === '4' &&
      actual.accountContext.writeRequirementsByRole.customer.required.includes('custscript_idb_default_subsidiary') &&
      actual.accountContext.writeRequirementsByRole.proofAnchor.required.includes('custscript_idb_default_taxschedule') &&
      actual.customerWritePilotPlan.fieldMapping.currency === 'optional_resolved_from_account_context' &&
      actual.proofItemWritePilotPlan.fieldMapping.taxschedule === 'resolved_from_account_context' &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords.every((item) => item.role !== 'transaction') &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_currency: '1',
        custscript_idb_default_terms: '2',
        custscript_idb_default_department: '3',
        custscript_idb_default_class: '4'
      }
    }),
    runScenario('validate W44 required vendor attach blocks before any write when vendor context is missing', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'blocked_missing_vendor_context', 'vendorContext', (actual) => (
      actual.createEnabled === true &&
      actual.vendorContext &&
      actual.vendorContext.schema === 'idb.vendor-context-resolver.v1' &&
      actual.vendorContext.status === 'blocked_missing_vendor_context' &&
      actual.vendorContext.vendorAttachRequired === true &&
      actual.vendorContext.missingRuntimeParameters.includes('custscript_idb_default_vendor') &&
      actual.createdRecords.length === 0 &&
      actual.vendorAttachPilotPlan &&
      actual.vendorAttachPilotPlan.writeBehavior === 'blocked_until_vendor_context_ready' &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_require_vendor_attach: true
      }
    }),
    runScenario('validate W44 vendor attach uses configured vendor without expanding transaction writes', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.vendorContext &&
      actual.vendorContext.status === 'vendor_context_ready' &&
      actual.vendorContext.values.vendorId === '44' &&
      actual.vendorContext.procurementDefaults.purchasePrice === '12.50' &&
      actual.vendorAttachPilotPlan &&
      actual.vendorAttachPilotPlan.writeBehavior === 'attach_preferred_vendor_to_proof_item' &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords.every((item) => item.role !== 'transaction') &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_vendor: '44',
        custscript_idb_require_vendor_attach: true,
        custscript_idb_default_purchase_price: '12.50'
      }
    }),
    runScenario('validate W45 planning control defaults to visible stable manual planning', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.planningContext &&
      actual.planningContext.schema === 'idb.planning-control-rail.v1' &&
      actual.planningContext.status === 'planning_control_ready' &&
      actual.planningContext.policy === 'stable_manual_planning' &&
      actual.planningContext.values.disableAutoPlanning === true &&
      actual.proofItemWritePilotPlan &&
      actual.proofItemWritePilotPlan.fieldMapping.disableAutoPlanning === true &&
      actual.planningControlPlan &&
      actual.planningControlPlan.writeBehavior === 'apply_stable_manual_planning_defaults' &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords.every((item) => item.role !== 'transaction')
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1'
      }
    }),
    runScenario('validate W45 planning control can preserve automation when explicitly configured', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.planningContext &&
      actual.planningContext.policy === 'review_only_existing_planning' &&
      actual.planningContext.values.disableAutoPlanning === false &&
      actual.planningContext.values.replenishmentMethod === 'TIME_PHASED' &&
      actual.planningControlPlan &&
      actual.planningControlPlan.writeBehavior === 'leave_planning_automation_available' &&
      actual.planningControlPlan.replenishmentMethod === 'TIME_PHASED' &&
      actual.createdRecords.length === 2 &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_planning_policy: 'review_only_existing_planning',
        custscript_idb_disable_auto_planning: false,
        custscript_idb_default_replenishment_method: 'TIME_PHASED'
      }
    }),
    runScenario('validate W38R pilot branch creates customer then proof item in approved production demo account only', context('POST', w22TypeConfirmPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.governedWritePilotBranchPlan &&
      actual.governedWritePilotBranchPlan.runtimeToggle &&
      actual.governedWritePilotBranchPlan.runtimeToggle.pilotEnvironment.mode === 'approved_production_demo_account' &&
      actual.accountContext &&
      actual.accountContext.status === 'account_context_ready' &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords[0].role === 'customer' &&
      actual.createdRecords[1].role === 'proof anchor' &&
      actual.createdRecords.every((item) => item.role !== 'transaction') &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_currency: '1',
        custscript_idb_default_terms: '2'
      }
    }),
    runScenario('validate W40 products cpg pilot branch creates customer then proof item in approved production demo account', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.selectedLaneId === 'products_cpg' &&
      actual.governedWritePilotBranchPlan &&
      actual.governedWritePilotBranchPlan.runtimeToggle &&
      actual.governedWritePilotBranchPlan.runtimeToggle.allowedLaneIds.includes('products_cpg') &&
      actual.accountContext &&
      actual.accountContext.status === 'account_context_ready' &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords[0].role === 'customer' &&
      actual.createdRecords[1].role === 'proof anchor' &&
      actual.createdRecords.every((item) => item.role !== 'transaction') &&
      actual.smallWriteSmokePlan &&
      actual.smallWriteSmokePlan.pilotLaneIds.includes('products_cpg') &&
      actual.smallWriteSmokePlan.skippedRecords.some((item) => item.role === 'transaction') &&
      actual.transactionContextPilotPlan &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_currency: '1',
        custscript_idb_default_terms: '2'
      }
    }),
    runScenario('validate W41 pilot result summary cleans up created Customer and Proof Item outcome', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.pilotResultSummary &&
      actual.pilotResultSummary.schema === 'idb.w41-pilot-result-summary.v1' &&
      actual.pilotResultSummary.status === 'created' &&
      actual.pilotResultSummary.customer.recordId === actual.createdRecords[0].recordId &&
      actual.pilotResultSummary.customer.url === actual.createdRecords[0].url &&
      actual.pilotResultSummary.proofItem.recordId === actual.createdRecords[1].recordId &&
      actual.pilotResultSummary.proofItem.parentCustomerRecordId === actual.createdRecords[0].recordId &&
      actual.pilotResultSummary.transactionContext.status === 'blocked_transaction_context_disabled' &&
      actual.customerWritePilotPlan.status !== 'runtime_flags_required' &&
      actual.proofItemWritePilotPlan.status !== 'runtime_flags_required' &&
      actual.createdRecords.every((item) => item.role !== 'transaction')
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_currency: '1',
        custscript_idb_default_terms: '2'
      }
    }),
    runScenario('validate W46 proof item write v2 summarizes created proof item with account vendor and planning gates', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.createEnabled === true &&
      actual.proofItemWriteV2 &&
      actual.proofItemWriteV2.schema === 'idb.proof-item-write-v2.v1' &&
      actual.proofItemWriteV2.status === 'proof_item_v2_ready' &&
      actual.proofItemWriteV2.proofItemRecord.recordId === actual.createdRecords[1].recordId &&
      actual.proofItemWriteV2.parentCustomerResult.recordId === actual.createdRecords[0].recordId &&
      actual.proofItemWriteV2.readinessGates.some((gate) => gate.key === 'account_context' && gate.status === 'ready') &&
      actual.proofItemWriteV2.readinessGates.some((gate) => gate.key === 'vendor_context' && gate.status === 'ready') &&
      actual.proofItemWriteV2.readinessGates.some((gate) => gate.key === 'planning_context' && gate.status === 'ready') &&
      actual.proofItemWriteV2.governedFieldGroups.procurement.preferredVendor === '44' &&
      actual.proofItemWriteV2.governedFieldGroups.planning.policy === 'stable_manual_planning' &&
      actual.proofItemWriteV2.noRegression.noTransactionWrite === true &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_vendor: '44',
        custscript_idb_default_purchase_price: '12.50'
      }
    }),
    runScenario('validate W46 proof item write v2 blocks before proof item write when required vendor context is missing', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'blocked_missing_vendor_context', 'vendorContext', (actual) => (
      actual.proofItemWriteV2 &&
      actual.proofItemWriteV2.schema === 'idb.proof-item-write-v2.v1' &&
      actual.proofItemWriteV2.status === 'blocked_missing_vendor_context' &&
      actual.vendorContext &&
      actual.vendorContext.status === 'blocked_missing_vendor_context' &&
      actual.createdRecords.length === 0 &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_require_vendor_attach: true
      }
    }),
    runScenario('validate W49 pilot hardening returns success sample contract and blocks transactions', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'created', '', (actual) => (
      actual.w49PilotHardening &&
      actual.w49PilotHardening.schema === 'idb.w49-governed-customer-proof-item-pilot-hardening.v1' &&
      actual.w49PilotHardening.sequenceGate.customerFirst === true &&
      actual.w49PilotHardening.sequenceGate.customerReady === true &&
      actual.w49PilotHardening.sequenceGate.proofItemRequiresCustomerIdAndUrl === true &&
      actual.w49PilotHardening.sequenceGate.proofItemParentMatchesCustomer === true &&
      actual.w49PilotHardening.sequenceGate.transactionBlocked === true &&
      actual.createdRecords.length === 2 &&
      actual.createdRecords[0].role === 'customer' &&
      actual.createdRecords[1].role === 'proof anchor' &&
      actual.createdRecords[1].parentCustomerRecordId === actual.createdRecords[0].recordId &&
      actual.createdRecords.every((item) => item.role !== 'transaction') &&
      actual.blockedDependentWrites.some((item) => item.role === 'transaction') &&
      actual.rollbackRecoveryInstructions.length >= 4 &&
      actual.proofItemWriteV2.status === 'proof_item_v2_ready' &&
      actual.transactionContextPilotPlan.status === 'blocked_transaction_context_disabled'
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_default_vendor: '44',
        custscript_idb_default_purchase_price: '12.50'
      }
    }),
    runScenario('validate W49 pilot hardening returns blocked sample before any write', context('POST', w40ProductsCpgPacket, { host: 'YOUR_ACCOUNT_ID.app.netsuite.com' }), 'blocked_missing_vendor_context', 'vendorContext', (actual) => (
      actual.w49PilotHardening &&
      actual.w49PilotHardening.schema === 'idb.w49-governed-customer-proof-item-pilot-hardening.v1' &&
      actual.w49PilotHardening.status === 'blocked_missing_vendor_context' &&
      actual.w49PilotHardening.sequenceGate.customerReady === false &&
      actual.w49PilotHardening.sequenceGate.proofItemReady === false &&
      actual.createdRecords.length === 0 &&
      actual.blockedDependentWrites.some((item) => item.role === 'transaction') &&
      actual.rollbackRecoveryInstructions.some((item) => /Do not silently retry/.test(item)) &&
      actual.proofItemWriteV2.status === 'blocked_missing_vendor_context' &&
      actual.transactionContextPilotPlan.transactionContextEnabled === false
    ), {
      suiteletPath: w24PilotSuiteletPath,
      envType: 'PRODUCTION',
      accountId: 'TD3021666',
      parameters: {
        custscript_idb_enable_pilot_writes: true,
        custscript_idb_allow_customer_pilot: true,
        custscript_idb_allow_proof_item_pilot: true,
        custscript_idb_sandbox_account_only: true,
        custscript_idb_require_type_confirm: true,
        custscript_idb_default_subsidiary: '1',
        custscript_idb_default_location: '2',
        custscript_idb_default_taxschedule: '1',
        custscript_idb_require_vendor_attach: true
      }
    })
  ];

  const pass = scenarios.every((scenario) => scenario.pass);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
  fs.mkdirSync(path.dirname(w49PostTestPackPath), { recursive: true });
  fs.mkdirSync(path.dirname(w49SuccessSamplePath), { recursive: true });

  const w49SuccessScenario = scenarios.find((scenario) => scenario.name === 'validate W49 pilot hardening returns success sample contract and blocks transactions');
  const w49BlockedScenario = scenarios.find((scenario) => scenario.name === 'validate W49 pilot hardening returns blocked sample before any write');

  const lines = [
    '# G12 SuiteScript Harness Results',
    '',
    'Generated: 2026-05-09',
    '',
    `Decision: ${pass ? 'PASS' : 'FAIL'}`,
    '',
    `Summary: SuiteScript harness ${pass ? 'PASS' : 'FAIL'}: ${scenarios.filter((scenario) => scenario.pass).length}/${scenarios.length}`,
    '',
    '## Scenarios',
    '',
    '| Scenario | Expected | Actual | Create Enabled | Result |',
    '| --- | --- | --- | --- | --- |',
    ...scenarios.map((scenario) => `| ${scenario.name} | ${scenario.expectedStatus} | ${scenario.actualStatus} | ${scenario.createEnabled} | ${scenario.pass ? 'PASS' : 'FAIL'} |`),
    '',
    '## Boundary',
    '',
    '- Suitelet remains create-disabled.',
    '- Harness does not call NetSuite.',
    '- Valid Food / Beverage packet returns `validated` with `createEnabled: false`.',
    '- U12 Creation Packet Contract V2 fields are required before a packet can validate.',
    '- V12 lookup-first and idempotency metadata are required in the write plan.',
    '- V13 small write smoke stays blocked while `CREATE_ENABLED` is false and excludes transaction writes.',
    '- V14 partial failure evidence includes rollback labels, completed-before-failure placeholders, blocked dependents, no silent retry, and no silent deletion.',
    '- V15 transaction context pilot stays blocked until customer and proof result IDs/URLs exist.',
    '- W14 runtime flag strategy is returned with main create disabled.',
    '- W15 customer write pilot plan is lookup-first and blocked while `CREATE_ENABLED` is false.',
    '- W16 proof item write pilot blocks without Customer result and remains create-disabled when Customer result is ready.',
    '- W19 governed write execution pilot branch is returned as approved-branch-only and blocked in the main package.',
    '- W20 transaction context recognizes parent Customer and Proof Item results but remains create-disabled in the main package.',
    '- W21 five-consultant executable pilot pack is returned with exact files, safe surfaces, pilot-only write surfaces, and go/no-go evidence.',
    '- W22 governed pilot runtime toggle is returned in main as blocked and blocks forced pilot branches before any write when runtime flags or approved environment state are missing.',
    '- W24 separate pilot Suitelet creates Customer first and Proof Item second in sandbox harness while transaction context remains disabled.',
    '- W38R approved production demo account allowlist creates the same Customer + Proof Item pilot scope without opening unapproved production environments.',
    '- W40 multi-lane pilot scope includes Products CPG for the same Customer + Proof Item path while transaction context remains disabled.',
    '- W41 result summary turns a successful Customer + Proof Item pilot into a clean created/updated outcome without implying transaction writes.',
    '- W43 account context admin resolver V2 exposes optional currency, terms, department, and class defaults while keeping transaction context disabled.',
    '- W44 vendor attach is lookup/configuration-first, blocks when required context is missing, and never creates a vendor silently.',
    '- W45 planning control is explicit, visible, and defaults proof items to stable manual planning unless configured otherwise.',
    '- W46 proof item write V2 consolidates account context, vendor attach, planning control, parent Customer result, and Proof Item result without opening transaction writes.',
    '- W49 pilot hardening returns POST test pack evidence, success/blocked response samples, rollback/recovery instructions, and explicit blocked transaction dependents.',
    '- Invalid gates return `blocked`.'
  ];
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  fs.writeFileSync(tracePath, `${JSON.stringify({ decision: pass ? 'PASS' : 'FAIL', scenarios }, null, 2)}\n`);
  fs.writeFileSync(w49PostTestPackPath, `${JSON.stringify(w49PostTestPack(w40ProductsCpgPacket, w40ProductsCpgPacket), null, 2)}\n`);
  fs.writeFileSync(w49SuccessSamplePath, `${JSON.stringify(compactResponseSample(w49SuccessScenario), null, 2)}\n`);
  fs.writeFileSync(w49BlockedSamplePath, `${JSON.stringify(compactResponseSample(w49BlockedScenario), null, 2)}\n`);

  if (!pass) {
    console.error(`SuiteScript harness failed. See ${reportPath}`);
    process.exit(1);
  }
  console.log(`SuiteScript harness PASS: ${scenarios.length}/${scenarios.length}`);
}

main();
