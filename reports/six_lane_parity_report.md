# Authorized-Lane Drawer Parity Report

Generated: 2026-05-24T20:47:21.195Z

Decision: PASS

| Lane | Proof anchor | Moves | Guardrails | Modules |
| --- | --- | --- | --- | --- |
| Products CPG | Sales Order View | Customer Record -> Sales Order View -> Finished Good | 1 | Order Management, Inventory, Manufacturing |
| Food / Beverage CPG Manufacturing | Finished Good | Customer Record -> Sales Order View -> Finished Good | 1 | Order Management, Inventory, Manufacturing, Quality |
| Industrial Equipment Manufacturing | Assembly | Customer Record -> Sales Order View -> Assembly | 1 | Order Management, Inventory, Manufacturing |
| Life Sciences | Lot / Release | Customer Record -> Sales Order View -> Lot / Release | 1 | Order Management, Inventory, Manufacturing, Quality |
| Industrial Distribution & Branch Fulfillment | Inventory / Fulfillment | Customer Record -> Sales Order View -> Inventory / Fulfillment | 1 | Order Management, Inventory |
| Dealer Hardgoods & Channel Fulfillment | Product / SKU | Customer Record -> Sales Order View -> Product / SKU | 1 | Order Management, Inventory |
| Apparel & Accessories | Style / SKU Matrix | Customer Record -> Sales Order View -> Style / SKU Matrix | 1 | Order Management, Inventory |

## Mismatches

- None.

## Boundary Confirmation

- Seven authorized lanes only, including Apparel & Accessories.
- No proof-anchor changes.
- No fixture append.
- Unsupported functional assets remain hidden.
