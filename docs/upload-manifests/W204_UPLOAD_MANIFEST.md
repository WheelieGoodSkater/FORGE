# W204 Current Upload Package

Use this package for the current IDB real-runner test.

## Upload / Update These

1. Tampermonkey
   - File: `idb-drawer.user.js`
   - Where: Tampermonkey script editor
   - Purpose: Current IDB drawer UI, W144 submit, Check runner result, W151 import, and five-link authority.

2. NetSuite W144 Suitelet adapter
   - File: `idb_governed_runner_adapter_w144_suitelet_v2_json_errors.js`
   - Where: NetSuite File Cabinet, then point the W144 Suitelet script record to this file.
   - Script/deployment currently expected by IDB: `script=SCRIPT_ID&deploy=DEPLOY_ID`
   - Purpose: Approved server adapter, queue submit, result polling, W203 completed result promotion.

3. Active v4 scheduled runner
   - File: `scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
   - Where: NetSuite File Cabinet, then point the active scheduled runner script record to this file.
   - Expected script id: `customscript_ss_demo_commcenter_runner`
   - Expected deployment id: `customdeploy_deploy_commcenter_runner`
   - Purpose: Restored stable DCC/v4 runner path with sidecar result capture. This avoids direct drawer or result-writer Sales Order creation.

## Do Not Upload For NetSuite Execution

- W204 harness/report files are evidence only.
- Do not replace the runner with older DCC package copies unless intentionally rolling back.

## Required W144 Deployment Parameters

- Enable Writes: checked
- Enable Customer: checked
- Enable Items: checked
- Enable Sandbox: checked
- Confirm Type: checked
- Enable Create: `T`
- Enable Write Sandbox: `T`
- Queue Submit: `T`
- Sandbox Allow List: `TD3021666`
- Runner Script ID: `customscript_ss_demo_commcenter_runner`
- Runner Deployment ID: `customdeploy_deploy_commcenter_runner`
- Result Capture Folder ID: use your current result folder, likely `678`

## Test Flow

1. Open NetSuite with Tampermonkey enabled.
2. In IDB, enter the consultant inputs and confirm the build path.
3. Build tab: submit W144 once.
4. When runnerTaskId appears, click Check runner result.
5. When completed result is ready, click Import completed runner result.
6. Verify exactly five Open links appear.
7. Click only the five Open links and capture screenshots of actual record pages.

Fail if any link opens a Notice, Error, invalid number, placeholder, or record-does-not-exist page.
