const { campaignProducts: CampaignProducts, campaignProductBranches: CampaignProductBranches, campaigns: Campaigns, products: Products, branches: Branches } = require('../models');

/**
 * Obtiene todos los productos de una campaña
 * @param {number} campaignId - ID de la campaña
 * @returns {Promise<Array>}
 */
const getProductsByCampaign = async(campaignId) => {
  const products = await CampaignProducts.findAll({
    where: { campaign_id: campaignId },
    include: [
      {
        model: Products,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'base_price', 'description']
      },
      {
        model: CampaignProductBranches,
        as: 'branchOverrides',
        include: [
          {
            model: Branches,
            as: 'branch',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  });

  return products;
};

/**
 * Obtiene un producto de campaña por ID
 * @param {number} id - ID del producto de campaña
 * @returns {Promise<Object|null>}
 */
const getCampaignProduct = async(id) => {
  const product = await CampaignProducts.findByPk(id, {
    include: [
      {
        model: Products,
        as: 'product'
      },
      {
        model: Campaigns,
        as: 'campaign'
      },
      {
        model: CampaignProductBranches,
        as: 'branchOverrides',
        include: [
          {
            model: Branches,
            as: 'branch'
          }
        ]
      }
    ]
  });

  return product;
};

/**
 * Agrega un producto a una campaña
 * @param {Object} body - Datos del producto de campaña
 * @returns {Promise<Object>}
 */
const addProductToCampaign = async(body) => {
  // Verificar que el producto no esté ya en la campaña
  const existing = await CampaignProducts.findOne({
    where: {
      campaign_id: body.campaign_id,
      product_id: body.product_id
    }
  });

  if (existing) {
    throw new Error('El producto ya está en esta campaña');
  }

  const product = await CampaignProducts.create(body);
  return product;
};

/**
 * Actualiza un producto de campaña
 * @param {number} id - ID del producto de campaña
 * @param {Object} body - Datos a actualizar
 * @returns {Promise<Object>}
 */
const updateCampaignProduct = async(id, body) => {
  const product = await CampaignProducts.findByPk(id);

  if (!product) {
    return null;
  }

  await product.update(body);
  return product;
};

/**
 * Elimina un producto de una campaña
 * @param {number} id - ID del producto de campaña
 * @returns {Promise<boolean>}
 */
const removeProductFromCampaign = async(id) => {
  const product = await CampaignProducts.findByPk(id);

  if (!product) {
    return false;
  }

  await product.destroy();
  return true;
};

/**
 * Calcula el precio efectivo de un producto de campaña
 * @param {number} campaignProductId - ID del producto de campaña
 * @param {number|null} branchId - ID de la sucursal (opcional)
 * @returns {Promise<Object>}
 */
const calculateEffectivePrice = async(campaignProductId, branchId = null) => {
  const campaignProduct = await CampaignProducts.findByPk(campaignProductId, {
    include: [
      {
        model: Products,
        as: 'product'
      }
    ]
  });

  if (!campaignProduct) {
    return null;
  }

  const basePrice = parseFloat(campaignProduct.product.base_price);
  const effectivePrice = await campaignProduct.calculateEffectivePrice(basePrice, branchId);

  return {
    base_price: basePrice,
    discount_type: campaignProduct.discount_type,
    discount_value: parseFloat(campaignProduct.discount_value),
    effective_price: effectivePrice,
    discount_amount: basePrice - effectivePrice,
    discount_percentage: ((basePrice - effectivePrice) / basePrice * 100).toFixed(2)
  };
};

/**
 * Verifica la disponibilidad de stock
 * @param {number} id - ID del producto de campaña
 * @param {number} quantity - Cantidad solicitada
 * @returns {Promise<Object>}
 */
const checkStockAvailability = async(id, quantity = 1) => {
  const product = await CampaignProducts.findByPk(id);

  if (!product) {
    return null;
  }

  const isAvailable = product.hasAvailableStock(quantity);
  const remaining = product.getRemainingStock();

  return {
    is_available: isAvailable,
    remaining_stock: remaining,
    requested_quantity: quantity,
    max_quantity: product.max_quantity,
    sold_quantity: product.sold_quantity
  };
};

/**
 * Incrementa la cantidad vendida de un producto de campaña
 * @param {number} id - ID del producto de campaña
 * @param {number} quantity - Cantidad a incrementar
 * @returns {Promise<Object>}
 */
const incrementSoldQuantity = async(id, quantity = 1) => {
  const product = await CampaignProducts.findByPk(id);

  if (!product) {
    return null;
  }

  await product.incrementSoldQuantity(quantity);
  return product;
};

/**
 * Obtiene los overrides de sucursal para un producto de campaña
 * @param {number} campaignProductId - ID del producto de campaña
 * @returns {Promise<Array>}
 */
const getBranchOverrides = async(campaignProductId) => {
  const overrides = await CampaignProductBranches.findAll({
    where: { campaign_product_id: campaignProductId },
    include: [
      {
        model: Branches,
        as: 'branch',
        attributes: ['id', 'name']
      }
    ]
  });

  return overrides;
};

/**
 * Crea un override de descuento para una sucursal
 * @param {number} campaignProductId - ID del producto de campaña
 * @param {number} branchId - ID de la sucursal
 * @param {number} discountValueOverride - Valor de descuento override
 * @returns {Promise<Object>}
 */
const createBranchOverride = async(campaignProductId, branchId, discountValueOverride) => {
  // Verificar que no exista ya un override
  const existing = await CampaignProductBranches.findOne({
    where: {
      campaign_product_id: campaignProductId,
      branch_id: branchId
    }
  });

  if (existing) {
    throw new Error('Ya existe un override para esta sucursal');
  }

  const override = await CampaignProductBranches.create({
    campaign_product_id: campaignProductId,
    branch_id: branchId,
    discount_value_override: discountValueOverride
  });

  return override;
};

/**
 * Actualiza un override de sucursal
 * @param {number} campaignProductId - ID del producto de campaña
 * @param {number} branchId - ID de la sucursal
 * @param {number} discountValueOverride - Nuevo valor de descuento
 * @returns {Promise<Object>}
 */
const updateBranchOverride = async(campaignProductId, branchId, discountValueOverride) => {
  const override = await CampaignProductBranches.findOne({
    where: {
      campaign_product_id: campaignProductId,
      branch_id: branchId
    }
  });

  if (!override) {
    return null;
  }

  await override.update({ discount_value_override: discountValueOverride });
  return override;
};

/**
 * Elimina un override de sucursal
 * @param {number} campaignProductId - ID del producto de campaña
 * @param {number} branchId - ID de la sucursal
 * @returns {Promise<boolean>}
 */
const deleteBranchOverride = async(campaignProductId, branchId) => {
  const override = await CampaignProductBranches.findOne({
    where: {
      campaign_product_id: campaignProductId,
      branch_id: branchId
    }
  });

  if (!override) {
    return false;
  }

  await override.destroy();
  return true;
};

module.exports = {
  getProductsByCampaign,
  getCampaignProduct,
  addProductToCampaign,
  updateCampaignProduct,
  removeProductFromCampaign,
  calculateEffectivePrice,
  checkStockAvailability,
  incrementSoldQuantity,
  getBranchOverrides,
  createBranchOverride,
  updateBranchOverride,
  deleteBranchOverride
};
