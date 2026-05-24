'use strict';

const ROLE_ALIASES = Object.freeze({
  customer: 'customer',
  sales_order: 'sales_order',
  demoTransaction: 'sales_order',
  demo_transaction: 'sales_order',
  salesOrder: 'sales_order',
  heroItem: 'finished_or_assembly_item',
  hero_item: 'finished_or_assembly_item',
  hero_sku: 'hero_sku',
  style_sku: 'style_sku',
  product_sku: 'product_sku',
  branch_or_product_sku: 'branch_or_product_sku',
  finished_good: 'finished_or_assembly_item',
  finished_or_assembly_item: 'finished_or_assembly_item',
  finished_food_or_batch_item: 'finished_food_or_batch_item',
  matrixProofItem: 'formula_or_batch_structure',
  matrix_proof_item: 'formula_or_batch_structure',
  matrix_or_proof_item: 'formula_or_batch_structure',
  style_matrix_or_availability_flow: 'style_matrix_or_availability_flow',
  availability_or_replenishment_flow: 'availability_or_replenishment_flow',
  dealer_availability_or_replenishment_flow: 'dealer_availability_or_replenishment_flow',
  replenishment_or_availability_flow: 'replenishment_or_availability_flow',
  componentItem: 'component_item',
  component_item: 'component_item',
  ingredient_or_component_item: 'ingredient_or_component_item',
  bom_or_assembly_structure: 'bom_or_assembly_structure',
  formula_or_batch_structure: 'formula_or_batch_structure',
  work_order_or_wip_object: 'work_order_or_wip_object',
  routing: 'routing',
  work_center: 'work_center',
  location_or_channel_context: 'location_or_channel_context',
  location_planning_context: 'location_planning_context',
  lot_or_availability_context: 'lot_or_availability_context'
});

const ROLE_LABELS = Object.freeze({
  customer: 'Customer',
  sales_order: 'Sales Order',
  hero_sku: 'Product SKU',
  style_sku: 'Style SKU',
  product_sku: 'Product SKU',
  branch_or_product_sku: 'Product SKU',
  finished_or_assembly_item: 'Finished/Assembly Item',
  finished_food_or_batch_item: 'Finished Food/Batch Item',
  availability_or_replenishment_flow: 'Availability/Replenishment Flow',
  style_matrix_or_availability_flow: 'Style Matrix',
  dealer_availability_or_replenishment_flow: 'Availability/Replenishment Flow',
  replenishment_or_availability_flow: 'Availability/Replenishment Flow',
  component_item: 'Component Item',
  ingredient_or_component_item: 'Ingredient Item',
  bom_or_assembly_structure: 'BOM or Assembly Structure',
  formula_or_batch_structure: 'Formula or Batch Structure',
  work_order_or_wip_object: 'Work Order',
  routing: 'Routing',
  work_center: 'Work Center',
  location_or_channel_context: 'Channel/Location Context',
  location_planning_context: 'Channel/Location Context',
  lot_or_availability_context: 'Lot Context'
});

const LEGACY_SLOT_TO_ROLE = Object.freeze({
  customer: 'customer',
  demoTransaction: 'sales_order',
  salesOrder: 'sales_order',
  heroItem: 'finished_or_assembly_item',
  matrixProofItem: 'formula_or_batch_structure',
  matrixItem: 'formula_or_batch_structure',
  componentItem: 'component_item'
});

const MODE_PRIMARY_ROLE_ALIASES = Object.freeze({
  retail_availability: {
    finished_or_assembly_item: 'hero_sku',
    formula_or_batch_structure: 'availability_or_replenishment_flow',
    component_item: 'supporting_sku'
  },
  apparel_style_matrix: {
    finished_or_assembly_item: 'style_sku',
    formula_or_batch_structure: 'style_matrix_or_availability_flow',
    component_item: 'supporting_style_or_color_sku'
  },
  dealer_hardgoods_replenishment: {
    finished_or_assembly_item: 'product_sku',
    formula_or_batch_structure: 'dealer_availability_or_replenishment_flow',
    component_item: 'allocation_support_sku'
  },
  distribution_replenishment: {
    finished_or_assembly_item: 'branch_or_product_sku',
    formula_or_batch_structure: 'replenishment_or_availability_flow',
    component_item: 'supporting_sku'
  },
  food_batch_manufacturing: {
    finished_or_assembly_item: 'finished_food_or_batch_item',
    component_item: 'ingredient_or_component_item'
  }
});

function canonicalRole(role, operatingMode) {
  const base = ROLE_ALIASES[role] || String(role || '').trim();
  const modeAliases = MODE_PRIMARY_ROLE_ALIASES[operatingMode] || {};
  return modeAliases[base] || base;
}

function labelForRole(role) {
  const normalized = canonicalRole(role);
  return ROLE_LABELS[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

module.exports = {
  ROLE_ALIASES,
  ROLE_LABELS,
  LEGACY_SLOT_TO_ROLE,
  MODE_PRIMARY_ROLE_ALIASES,
  canonicalRole,
  labelForRole
};
