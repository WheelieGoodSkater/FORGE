# W301 Lane Resolution Readiness Bridge

Status: `bridge_ready`

W301 adds `src/contracts/laneResolutionReadinessBridge.js`, a behavior-preserving bridge between drawer-produced lane-resolution readiness facts and the W300 lane-resolution readiness contract.

The bridge validates shape parity for resolved W246 lane pack facts, website evidence and matched signals, consultant lane/toggle confirmation, N/LLM advisory-only limits, W247 story-surface inputs, W250 lane-aware label facts, weak/conflicting evidence gates, and future lane-pack expansion workflow facts.

The bridge is extraction-only in this block. It is not wired into `idb-drawer.user.js`, does not choose lanes, does not change confidence, does not override website evidence or consultant toggles, does not hide uncertainty, does not render UI, does not mutate state, does not import or create records, does not write transactions, does not create Open links, does not invoke the adapter, and does not declare W245/W151/W214 validity.

Drawer-owned runtime surfaces remain unchanged:

- `resolveLanePackFromEvidenceW246`
- `websiteEvidenceBridge`
- `ensureWebsiteEvidenceRuntime`
- `nllmAdvisoryPayloadForLanePackW246`
- `consultantStorySurfaceFromLanePackW247`
- `lanePackAwareRecordLabelW250`

Future runtime migration path: W302 can migrate only drawer-local lane-resolution readiness fact assembly/status shape toward the W300/W301 contract and bridge while preserving visible UI, lane behavior, connected build behavior, returned-record import, endpoint behavior, dataset switching, and runtime authority.

Visual testing decision: not required. W301 is a contract bridge and archived harness/report/trace change only.
