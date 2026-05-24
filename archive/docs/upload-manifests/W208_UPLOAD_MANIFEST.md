# W208 Upload Manifest: One-Click Production Build Automation

## Upload

Update Tampermonkey with:

- `idb-drawer.user.js`

No NetSuite SuiteScript upload is required for W208. Keep the existing W144 server adapter and active runner files as-is.

## What Changed

Normal consultant flow is now simplified:

- Enter Customer / Prospect Name.
- Enter Website.
- Enter Conversation Notes.
- Choose simple build toggles.
- Click Build demo records.
- IDB uses saved admin config, submits the governed runner, polls result capture, imports verified results, and shows Open links only after real records exist.

This refresh also fixes the fresh-session problem from the latest trace:

- Normal Build bootstraps the saved TD3021666 W144 admin config behind the scenes.
- The consultant does not need to paste endpoint, flags, account, operator phrase, or idempotency details.
- `Create new item`, `Manufacturing`, and `WIP` are visible in the normal Build card.
- `Check status` appears only after the runner task is captured.
- `Finish build` appears only after completed runner results are ready for guarded import.

Admin/debug details remain available only in admin/debug mode:

- W144 endpoint
- server flags
- sandbox allowlist
- operator phrases
- idempotency token
- runnerTaskId
- raw result import fallback
- debug handoff export

## Consultant Test Data

Customer / Prospect Name:

```text
Ariat International
```

Website:

```text
https://www.ariat.com/
```

Conversation Notes:

```text
Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches. Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.
```

Suggested toggles for this smoke:

- Create new item: on
- Manufacturing: off
- WIP: off

## Expected Normal Flow

1. Build tab shows consultant-safe production Build state.
2. Click `Build demo records`.
3. Status changes to `Building records` or `Still building`.
4. If fallback appears, click `Check status`.
5. If completion is available, click `Finish build`.
6. Build and Run show final generated names.
7. Open links appear only after numeric ids and supported NetSuite URLs exist.

If the Build card says `Build needs admin setup` after this upload, reload the NetSuite page once and confirm Tampermonkey is running this updated `idb-drawer.user.js`.

## Guardrails

- The drawer does not create records.
- The drawer does not create transactions.
- The drawer does not directly invoke SuiteScript outside the approved server adapter path.
- W144/server adapter owns runner invocation.
- The runner owns generated records.
- W151 import validation remains internal.
- Handoff JSON remains rejected as a completed result import.
