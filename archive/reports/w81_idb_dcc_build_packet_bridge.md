# W81 IDB To Demo Command Center Build Packet Bridge

Decision: PASS / BUILD PACKET BRIDGE READY / REVIEW ONLY / DCC OWNS OBJECT GENERATION

## Objective

Pivot IDB from website-only intelligence toward a consultant-facing intake and governance layer that feeds the proven Demo Command Center build engine.

## Build Packet V1

`buildPacketV1` maps prospect, website evidence, consultant notes, lane, scenario pack, proof anchor, manufacturing flag, WIP flag, naming hints, location/planning intent, and write mode into a DCC-ready handoff packet.

## Authority Model

| Owner | Responsibility |
| --- | --- |
| idbOwns | consultant intake, website evidence summary, lane recommendation, scenario pack recommendation, confirmation gate, review-only build packet handoff |
| websiteOwns | identity evidence recommendation, source citations, confidence and uncertainty state |
| notesOwn | pain, ROI framing, competitive framing, objections, talk track |
| dccOwns | item names, assembly names, BOM and BOM revision names, component structure, inventory location setup, planning controls, manufacturing routing/WIP where enabled, CSV/Sales Order context mechanics |

## IDB-To-DCC Field Mapping

| IDB Field | DCC Input | Owner |
| --- | --- | --- |
| identity.prospect | prospect | IDB prepares / DCC consumes |
| identity.website | website | IDB prepares / DCC consumes |
| scenarioPackSelection.selectedScenarioPack | familyKey | consultant confirms / DCC executes |
| scenarioPackSelection.selectedScenario | scenario | consultant confirms / DCC executes |
| dccRunnerInputs.createNewHeroItem | createNewHeroItem | DCC runner |
| dccRunnerInputs.enableManufacturing | enableManufacturing | DCC runner |
| dccRunnerInputs.enableWip | enableWip | DCC runner |
| dccRunnerInputs.signalText | signalText | IDB summarizes / DCC interprets |
| identity.namingHints | names or signalText hints | advisory only |
| writeMode | review-only until governed execution | governance gate |

## Consultant Confirmation Gate

The packet remains `blocked_until_consultant_confirmation` until the consultant confirms lane, scenario pack, product naming, and build mode. Website evidence recommends; it does not over-own the build.

## Review UX

- Review now includes a DCC build packet detail summary.
- It shows selected pack, build mode, confirmation status, blocked write paths, and audit field mapping.
- It states that DCC owns item, assembly, BOM, location, planning, routing/WIP, and CSV/Sales Order mechanics.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w81_build_packet_function_present | idbBuildPacketV1 |
| PASS | w81_scenario_selection_rules_present | scenarioPackSelectionRules |
| PASS | w81_review_ux_bridge_present | renderDccBuildPacketBridge |
| PASS | w81_trace_export_includes_build_packet | exportTrace buildPacketV1 |
| PASS | w81_dcc_ownership_preserved_in_runtime | dcc ownership text |
| PASS | w81_no_regression_runtime_boundaries | no regression flags |
| PASS | w81_contract_mapping_complete | [{"idbField":"identity.prospect","dccInput":"prospect","owner":"IDB prepares / DCC consumes"},{"idbField":"identity.website","dccInput":"website","owner":"IDB prepares / DCC consumes"},{"idbField":"scenarioPackSelection.selectedScenarioPack","dccInput":"familyKey","owner":"consultant confirms / DCC executes"},{"idbField":"scenarioPackSelection.selectedScenario","dccInput":"scenario","owner":"consultant confirms / DCC executes"},{"idbField":"dccRunnerInputs.createNewHeroItem","dccInput":"createNewHeroItem","owner":"DCC runner"},{"idbField":"dccRunnerInputs.enableManufacturing","dccInput":"enableManufacturing","owner":"DCC runner"},{"idbField":"dccRunnerInputs.enableWip","dccInput":"enableWip","owner":"DCC runner"},{"idbField":"dccRunnerInputs.signalText","dccInput":"signalText","owner":"IDB summarizes / DCC interprets"},{"idbField":"identity.namingHints","dccInput":"names or signalText hints","owner":"advisory only"},{"idbField":"writeMode","dccInput":"review-only until governed execution","owner":"governance gate"}] |
| PASS | w81_sample_preserves_dcc_object_generation_ownership | {"schema":"idb.build-packet.v1","status":"blocked_until_consultant_confirmation","writeMode":"review_only_dcc_owned_generation","identity":{"prospect":"Ariat International","website":"https://www.ariat.com/","selectedLaneId":"apparel_accessories","selectedLane":"Apparel & Accessories","proofAnchor":"Style / SKU Matrix","productSeed":"Core Boot and Apparel Style Matrix","productFamily":"Apparel and Footwear Style","demandMoment":"style, size, and channel availability"},"scenarioPackSelection":{"selectedScenarioPack":"apparelAccessories","selectedScenario":"Style-to-Availability Readiness","selectionAuthority":"website_recommends_consultant_confirms_dcc_builds","confirmationRequired":true},"dccRunnerInputs":{"familyKey":"apparelAccessories","scenario":"Style-to-Availability Readiness","mode":"Balanced","createNewHeroItem":true,"enableManufacturing":false,"enableWip":false,"locationPlanningIntent":"DCC owns location, inventory positioning, replenishment, and Sales Order CSV context decisions.","writeMode":"review_only_until_governed_dcc_runner_execution"},"dccObjectGenerationOwnership":["item names","assembly names","BOM and BOM revision names","component structure","inventory location setup","planning controls","manufacturing routing/WIP where enabled","CSV/Sales Order context mechanics"],"blockedWritePaths":["IDB transaction write","IDB direct object generation"],"noRegression":{"websiteCannotInventUnsupportedClaims":true,"notesCannotSilentlyOverrideConfirmedIdentity":true,"dccRunnerMechanicsNotRewritten":true,"noTransactionWritesFromIdb":true,"hostedResolverOptionalUntilRemoteSmokeExecuted":true,"governedWriteExplicitAndBlockedUnlessConfirmed":true,"nllmAdvisoryOnly":true}} |

## No Regression

- Website evidence cannot invent unsupported claims.
- Notes cannot silently override confirmed website/category identity.
- DCC runner mechanics are not rewritten.
- No transaction writes from IDB.
- Hosted resolver remains optional until `remoteSmokeExecuted=true`.
- Governed write path remains explicit and blocked unless confirmed.

## Best Next Codex Prompt

```text
Move through W82: DCC Runner Handoff Packet And Suitelet Parameter Map. Take buildPacketV1 and map it to the exact Demo Command Center Suitelet/runner parameters, including prospect, website, notes/signalText, family key, scenario, createNewHeroItem, enableManufacturing, enableWip, location/planning intent, and review-only write mode. Preserve DCC ownership of item names, assemblies, BOMs, locations, planning controls, routing/WIP, and CSV/Sales Order mechanics. Do not rewrite DCC runner mechanics, do not enable IDB transaction writes, keep hosted resolver optional until remoteSmokeExecuted=true, and keep consultant confirmation required before handoff. Output parameter map, handoff packet sample, blocked/confirmed examples, W82 report, validator gates, and best next Codex prompt.
```
