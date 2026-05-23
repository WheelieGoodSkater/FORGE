/**
 * IDB Integrated Build Runner Return Adapter W153
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/log'], (runtime, log) => {
  const ADAPTER_VERSION = 'w153-integrated-build-runner-return-adapter-skeleton';

  const PARAMS = {
    requestJson: 'custpage_idb_integrated_build_runner_request_json',
    createEnabled: 'custscript_idb_create_enabled',
    governedSandboxWriteEnabled: 'custscript_idb_governed_sandbox_write_enabled',
    queueSubmitEnabled: 'custscript_idb_queue_submit_enabled',
    sandboxAccountAllowlist: 'custscript_idb_sandbox_account_allowlist',
    runnerScriptId: 'custscript_idb_runner_script_id',
    runnerDeployId: 'custscript_idb_runner_deploy_id',
    resultCaptureFolderId: 'custscript_idb_result_capture_folder_id',
    fixtureQueuedResponseEnabled: 'custscript_idb_fixture_queued_enabled'
  };

  function onRequest(context) {
    const parsed = parseJson(readInput(context, PARAMS.requestJson), 'integrated Build runner request JSON');
    const config = resolveAdapterConfig(runtime.getCurrentScript(), runtime.accountId || '');
    const result = buildSkeletonAdapterResult(parsed.value, config, parsed.errors);

    log.audit({
      title: 'IDB integrated Build runner return adapter W153',
      details: JSON.stringify({
        version: ADAPTER_VERSION,
        status: result.status,
        queueSubmitted: result.queueSubmitted,
        runnerTaskId: result.runnerTaskId,
        resultCapture: result.resultCapture.status
      })
    });

    if (context && context.response && typeof context.response.write === 'function') {
      context.response.write(JSON.stringify(result, null, 2));
    }
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

  function splitCsv(value) {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function resolveAdapterConfig(currentScript, accountId) {
    return {
      schema: 'idb.w153-integrated-build-runner-server-config.v1',
      accountId: String(accountId || '').trim(),
      createEnabled: flag(getParam(currentScript, PARAMS.createEnabled)),
      governedSandboxWriteEnabled: flag(getParam(currentScript, PARAMS.governedSandboxWriteEnabled)),
      queueSubmitEnabled: flag(getParam(currentScript, PARAMS.queueSubmitEnabled)),
      sandboxAccountAllowlist: splitCsv(getParam(currentScript, PARAMS.sandboxAccountAllowlist)),
      runnerScriptId: getParam(currentScript, PARAMS.runnerScriptId),
      runnerDeployId: getParam(currentScript, PARAMS.runnerDeployId),
      resultCaptureFolderId: getParam(currentScript, PARAMS.resultCaptureFolderId),
      fixtureQueuedResponseEnabled: flag(getParam(currentScript, PARAMS.fixtureQueuedResponseEnabled))
    };
  }

  function validateIntegratedRequest(envelope) {
    const errors = [];
    if (!envelope || typeof envelope !== 'object') {
      return { valid: false, errors: ['request envelope must be an object.'] };
    }
    if (envelope.schema !== 'idb.integrated-build-runner-request.v1') errors.push('schema must be idb.integrated-build-runner-request.v1.');
    if (envelope.action !== 'submit_or_poll_build_return') errors.push('action must be submit_or_poll_build_return.');
    if (!envelope.idempotencyToken) errors.push('idempotencyToken is required.');
    const request = envelope.confirmedBuildRequestJson || {};
    if (request.schema !== 'idb.confirmed-build-request.v1') errors.push('confirmedBuildRequestJson schema must be idb.confirmed-build-request.v1.');
    if (request.requestStatus !== 'confirmed_ready_for_governed_runner') errors.push('confirmed build request must be ready for governed runner.');
    if (!request.consultantConfirmation || request.consultantConfirmation.confirmed !== true) errors.push('consultant confirmation is required.');
    if (!request.stateAuthority || request.stateAuthority.handoffParityStatus !== 'matched' || request.stateAuthority.noStateMismatch !== true) errors.push('state authority and handoff parity must be preserved.');
    if (!Array.isArray(request.requiredRecords) || !['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].every((role) => request.requiredRecords.indexOf(role) !== -1)) {
      errors.push('requiredRecords must include customer, demoTransaction, heroItem, matrixProofItem, and componentItem.');
    }
    const gate = envelope.operatorGate || {};
    if (gate.schema !== 'idb.operator-queue-gate.v1') errors.push('operatorGate schema must be idb.operator-queue-gate.v1.');
    if (gate.reviewDecision !== 'operator_approved_queue_submit') errors.push('operator gate must approve queue submit.');
    if (gate.typeToConfirm !== 'QUEUE GOVERNED SANDBOX RUNNER') errors.push('typeToConfirm must be QUEUE GOVERNED SANDBOX RUNNER.');
    if (gate.confirmedDrawerNoWrite !== true) errors.push('confirmedDrawerNoWrite must be true.');
    if (gate.drawerInvocationTokenAccepted === true) errors.push('drawer invocation token cannot be accepted.');
    return { valid: errors.length === 0, errors };
  }

  function validateConfig(config) {
    const errors = [];
    if (!config.accountId) errors.push('runtime account id is required.');
    if (!config.sandboxAccountAllowlist.length) errors.push('sandbox account allowlist is required.');
    if (config.accountId && config.sandboxAccountAllowlist.length && config.sandboxAccountAllowlist.indexOf(config.accountId) === -1) {
      errors.push('runtime account id is not in sandbox account allowlist.');
    }
    if (!config.runnerScriptId) errors.push('runnerScriptId runtime config is required.');
    if (!config.runnerDeployId) errors.push('runnerDeployId runtime config is required.');
    if (!config.resultCaptureFolderId) errors.push('resultCaptureFolderId runtime config is required.');
    return { valid: errors.length === 0, errors };
  }

  function buildGate(requestValidation, configValidation, config) {
    const flagsReady = config.createEnabled === true && config.governedSandboxWriteEnabled === true && config.queueSubmitEnabled === true;
    const canReturnQueuedFixture = requestValidation.valid && configValidation.valid && flagsReady && config.fixtureQueuedResponseEnabled === true;
    return {
      schema: 'idb.w153-integrated-build-return-gate.v1',
      status: canReturnQueuedFixture ? 'fixture_queued_pending_allowed' : 'blocked_no_submit',
      canReturnQueuedFixture,
      gates: {
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        createEnabled: config.createEnabled === true,
        governedSandboxWriteEnabled: config.governedSandboxWriteEnabled === true,
        queueSubmitEnabled: config.queueSubmitEnabled === true,
        sandboxAllowlistPassed: configValidation.valid,
        fixtureQueuedResponseEnabled: config.fixtureQueuedResponseEnabled === true
      }
    };
  }

  function buildResultCapture(status, runnerTaskId, idempotencyToken) {
    return {
      schema: 'idb.runner-result-capture.v1',
      status,
      runnerTaskId,
      idempotencyToken,
      finalGeneratedNamesReady: false,
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0,
      importPolicy: 'drawer_must_wait_for_completed_runner_result_json_accepted_by_w151'
    };
  }

  function buildSkeletonAdapterResult(envelope, config, parseErrors) {
    const requestValidation = validateIntegratedRequest(envelope);
    const configValidation = validateConfig(config);
    const gate = buildGate(requestValidation, configValidation, config);
    const idempotencyToken = envelope && envelope.idempotencyToken ? String(envelope.idempotencyToken) : '';
    const runnerTaskId = gate.canReturnQueuedFixture ? `fixture_w153_${idempotencyToken || 'runner'}_001` : null;
    const errors = []
      .concat(parseErrors || [])
      .concat(requestValidation.errors || [])
      .concat(configValidation.errors || []);

    return {
      schema: 'idb.integrated-build-runner-adapter-result.v1',
      adapterVersion: ADAPTER_VERSION,
      status: gate.canReturnQueuedFixture ? 'queued_pending_fixture_only' : 'not_started_no_submit',
      queueSubmitted: gate.canReturnQueuedFixture,
      runnerTaskId,
      resultCapture: buildResultCapture(gate.canReturnQueuedFixture ? 'pending_runner_completion' : 'not_started_no_submit', runnerTaskId, idempotencyToken),
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0,
      createsRecords: false,
      suiteScriptInvocationPerformed: false,
      transactionWritesPerformed: false,
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      serverGate: gate,
      runtimeConfig: redactConfig(config),
      validation: {
        valid: errors.length === 0,
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        errors
      },
      noSubmitRollback: {
        supported: true,
        performed: !gate.canReturnQueuedFixture,
        rollbackByDisablingServerFlags: true
      },
      visualTestingDecision: {
        visualNetSuiteTestingRequiredNow: false,
        visualTestingBlocked: true,
        reason: 'W153 returns skeleton false-flag or queued/pending fixture responses only; no completed runner result JSON exists yet.'
      }
    };
  }

  function redactConfig(config) {
    return {
      schema: config.schema,
      accountIdPresent: !!config.accountId,
      sandboxAccountAllowlistCount: config.sandboxAccountAllowlist.length,
      runnerScriptIdPresent: !!config.runnerScriptId,
      runnerDeployIdPresent: !!config.runnerDeployId,
      resultCaptureFolderIdPresent: !!config.resultCaptureFolderId,
      createEnabled: config.createEnabled,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled,
      queueSubmitEnabled: config.queueSubmitEnabled,
      fixtureQueuedResponseEnabled: config.fixtureQueuedResponseEnabled
    };
  }

  return {
    onRequest,
    _test: {
      resolveAdapterConfig,
      validateIntegratedRequest,
      validateConfig,
      buildGate,
      buildSkeletonAdapterResult
    }
  };
});
