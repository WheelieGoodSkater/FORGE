'use strict';

const OPERATING_MODES = Object.freeze({
  retail_availability: {
    label: 'Retail Availability',
    requiredRecordRoles: ['customer', 'sales_order', 'hero_sku', 'availability_or_replenishment_flow'],
    optionalRecordRoles: ['supporting_sku', 'location_or_channel_context'],
    expectedRecordRoles: [],
    invalidRecordRoles: ['bom', 'assembly_structure', 'work_order', 'routing', 'wip_object']
  },
  apparel_style_matrix: {
    label: 'Apparel Style Matrix',
    requiredRecordRoles: ['customer', 'sales_order', 'style_sku', 'style_matrix_or_availability_flow'],
    optionalRecordRoles: ['supporting_style_or_color_sku'],
    expectedRecordRoles: [],
    invalidRecordRoles: ['finished_good', 'assembly', 'bom', 'work_order', 'routing']
  },
  dealer_hardgoods_replenishment: {
    label: 'Dealer Hardgoods Replenishment',
    requiredRecordRoles: ['customer', 'sales_order', 'product_sku', 'dealer_availability_or_replenishment_flow'],
    optionalRecordRoles: ['allocation_support_sku', 'channel_context'],
    expectedRecordRoles: [],
    invalidRecordRoles: ['ingredient', 'batch', 'bom', 'assembly', 'work_order', 'routing', 'wip']
  },
  distribution_replenishment: {
    label: 'Distribution Replenishment',
    requiredRecordRoles: ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow'],
    optionalRecordRoles: ['supporting_sku', 'location_planning_context'],
    expectedRecordRoles: [],
    invalidRecordRoles: ['finished_good', 'assembly', 'ingredient', 'batch', 'work_order', 'routing', 'wip']
  },
  discrete_manufacturing: {
    label: 'Discrete Manufacturing',
    requiredRecordRoles: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
    optionalRecordRoles: ['bom_or_assembly_structure', 'production_planning_context'],
    expectedRecordRoles: [],
    invalidRecordRoles: ['food_ingredient_batch_terms_without_food_mode']
  },
  wip_manufacturing: {
    label: 'WIP Manufacturing',
    requiredRecordRoles: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
    expectedRecordRoles: ['bom_or_assembly_structure', 'work_order_or_wip_object'],
    optionalRecordRoles: ['routing', 'work_center'],
    invalidRecordRoles: []
  },
  food_batch_manufacturing: {
    label: 'Food Batch Manufacturing',
    requiredRecordRoles: ['customer', 'sales_order', 'finished_food_or_batch_item', 'ingredient_or_component_item'],
    expectedRecordRoles: [],
    optionalRecordRoles: ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object'],
    invalidRecordRoles: ['apparel_style_matrix_without_apparel_evidence']
  }
});

const KNOWN_DOMAIN_MODE_HINTS = Object.freeze({
  'rei.com': 'retail_availability',
  'patagonia.com': 'apparel_style_matrix',
  'ariat.com': 'apparel_style_matrix',
  'grainger.com': 'distribution_replenishment',
  'ariens.com': 'discrete_manufacturing',
  'trekbikes.com': 'dealer_hardgoods_replenishment',
  'mccormick.com': 'food_batch_manufacturing',
  'yerbamadre.com': 'food_batch_manufacturing',
  'guayaki.com': 'food_batch_manufacturing',
  'liquiddeath.com': 'food_batch_manufacturing'
});

function getOperatingModeContract(mode) {
  return OPERATING_MODES[mode] || OPERATING_MODES.distribution_replenishment;
}

function isManufacturingMode(mode) {
  return /manufacturing/.test(String(mode || ''));
}

module.exports = {
  OPERATING_MODES,
  KNOWN_DOMAIN_MODE_HINTS,
  getOperatingModeContract,
  isManufacturingMode
};
