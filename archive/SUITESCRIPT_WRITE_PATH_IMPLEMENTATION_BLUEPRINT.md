# SuiteScript Write Path Implementation Blueprint

Generated: 2026-05-09

## Objective

Turn the G6 create-disabled skeleton into an implementation-ready blueprint for the NetSuite-side SuiteScript path that will eventually create or update reviewed IDB records.

This does not enable live writes in the drawer. It defines the SuiteScript implementation shape so the next engineering block can build it deliberately.

## Entry Point Shape

Preferred entry point:

- Script type: Suitelet or SuiteScript module hosted inside NetSuite.
- Handler: `onRequest(context)`.
- Method: `POST`.
- Body key: `idbReviewedPacket`.
- Write path type: `suitescript_direct_write`.

The entry point must reject requests when:

- `mode` is not `create`.
- `consultantConfirmed` is not `true`.
- `packetMode` is not `reviewed_create_request`.
- `writePathType` is not `suitescript_direct_write`.
- selected lane is not authorized.
- proof anchor does not match the lane contract.
- packet order differs from the reviewed IDB packet.

## Record Type Mapping

| Lane | Customer | Transaction | Proof Anchor | Supporting Proof |
| --- | --- | --- | --- | --- |
| Products CPG | `customer` | `salesorder` | `inventoryitem` | `customrecord_idb_cpg_readiness` |
| Food / Beverage CPG Manufacturing | `customer` | `salesorder` | `inventoryitem` | `customrecord_idb_food_readiness` |
| Industrial Equipment Manufacturing | `customer` | `salesorder` | `assemblyitem` | `customrecord_idb_assembly_readiness` |
| Life Sciences | `customer` | `salesorder` | `lotnumberedinventoryitem` | `customrecord_idb_lot_release` |
| Industrial Distribution & Branch Fulfillment | `customer` | `salesorder` | `inventoryitem` | `customrecord_idb_branch_availability` |
| Dealer Hardgoods & Channel Fulfillment | `customer` | `salesorder` | `inventoryitem` | `customrecord_idb_dealer_readiness` |
| Apparel & Accessories | `customer` | `salesorder` | `matrixitem` | `customrecord_idb_style_availability` |

## Field Mapping

### Customer Record

- `entityid`: customer name from packet.
- `companyname`: customer name from packet.
- `url`: website from packet.
- `comments`: conversation notes.
- `custentity_idb_lane`: selected lane id.
- `custentity_idb_proof_anchor`: proof anchor.

### Sales Order Context

- `entity`: created or matched customer internal id.
- `memo`: DCC scenario, selected lane, and proof anchor.
- `otherrefnum`: transaction preview proposed name.
- `custbody_idb_lane`: selected lane id.
- `custbody_idb_proof_anchor`: proof anchor.
- `custbody_idb_source_packet`: trace packet id.

### Proof Anchor

- `itemid`: proof anchor preview proposed name.
- `displayname`: proof anchor preview proposed name.
- `salesdescription`: proof anchor intended update.
- `custitem_idb_lane`: selected lane id.
- `custitem_idb_proof_anchor`: proof anchor.

### Supporting Proof Records

- `name`: supporting proof preview proposed name.
- `custrecord_idb_customer`: created or matched customer id.
- `custrecord_idb_proof_item`: created or matched proof anchor id.
- `custrecord_idb_lane`: selected lane id.
- `custrecord_idb_packet_id`: trace packet id.
- `custrecord_idb_notes`: supporting proof intended update.

## Create / Update Rules

- Customer may be create-or-update by company name and website.
- Sales order context should be created for the demo packet unless an explicit reviewed transaction id is supplied.
- Proof anchor should create a new item only when `createNewHeroItem` is true.
- If `createNewHeroItem` is false, the SuiteScript path must link to reviewed existing item context instead of inventing a new proof item.
- Manufacturing/supporting records should only be created when the lane supports them and `enableManufacturing` is true.
- WIP records should only be created when the lane supports them and `enableWip` is true.
- Unsupported records must return blocked or skipped with a recoverable message.

## Error And Partial-Failure Handling

The SuiteScript path must return:

- `blocked` when gates are missing before any write.
- `validated` when the packet passes validation but execution is not requested.
- `created` when all requested writes succeed.
- `partial_failed` when at least one record is created and a later dependent write fails.
- `failed` when no writes succeed.

For `partial_failed`, response must include:

- created records completed before failure.
- failing record sequence.
- recoverable error message.
- recommended consultant next action.

It must not:

- silently delete records.
- silently retry writes.
- continue dependent writes after a required parent failed.

## Trace Result Contract

The response must include:

- `traceEvent: suitescript_write_path_result`
- status
- created record labels
- record types
- record IDs
- URLs
- recoverable errors
- packet id
- selected lane id
- proof anchor
- consultant confirmation timestamp

## No-Regression Closure

G7 remains implementation blueprint only. It does not enable live writes in `idb-drawer.user.js`, does not add automatic creation, does not change lanes, proof anchors, DCC toggles, or packet order, and keeps LLM advisory only.
