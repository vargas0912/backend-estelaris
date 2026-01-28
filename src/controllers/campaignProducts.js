const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const campaignProductsService = require('../services/campaignProducts');
const {
  ERROR_GET_CAMPAIGN_PRODUCTS,
  ERROR_GET_CAMPAIGN_PRODUCT,
  ERROR_CREATE_CAMPAIGN_PRODUCT,
  ERROR_UPDATE_CAMPAIGN_PRODUCT,
  ERROR_DELETE_CAMPAIGN_PRODUCT,
  ERROR_CAMPAIGN_PRODUCT_NOT_FOUND,
  ERROR_PRODUCT_ALREADY_IN_CAMPAIGN,
  ERROR_GET_BRANCH_OVERRIDES,
  ERROR_CREATE_BRANCH_OVERRIDE,
  ERROR_UPDATE_BRANCH_OVERRIDE,
  ERROR_DELETE_BRANCH_OVERRIDE,
  ERROR_BRANCH_OVERRIDE_NOT_FOUND,
  ERROR_BRANCH_OVERRIDE_ALREADY_EXISTS
} = require('../constants/campaignProducts');

/**
 * Obtiene todos los productos de una campaña
 */
const getProductsByCampaign = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { campaign_id } = matchedData(req);
    const products = await campaignProductsService.getProductsByCampaign(campaign_id);

    res.status(200).json({
      ok: true,
      data: products
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_CAMPAIGN_PRODUCTS, 500);
  }
};

/**
 * Obtiene un producto de campaña por ID
 */
const getCampaignProduct = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const product = await campaignProductsService.getCampaignProduct(id);

    if (!product) {
      return handleHttpError(res, ERROR_CAMPAIGN_PRODUCT_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: product
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_CAMPAIGN_PRODUCT, 500);
  }
};

/**
 * Agrega un producto a una campaña
 */
const createCampaignProduct = async(req, res) => {
  try {
    const data = matchedData(req);
    const product = await campaignProductsService.addProductToCampaign(data);

    res.status(201).json({
      ok: true,
      data: product
    });
  } catch (error) {
    if (error.message === 'El producto ya está en esta campaña') {
      return handleHttpError(res, ERROR_PRODUCT_ALREADY_IN_CAMPAIGN, 400);
    }
    if (error.name === 'SequelizeValidationError') {
      return handleHttpError(res, error.errors[0].message, 400);
    }
    handleHttpError(res, ERROR_CREATE_CAMPAIGN_PRODUCT, 500);
  }
};

/**
 * Actualiza un producto de campaña
 */
const updateCampaignProduct = async(req, res) => {
  try {
    const { id, ...data } = matchedData(req);
    const product = await campaignProductsService.updateCampaignProduct(id, data);

    if (!product) {
      return handleHttpError(res, ERROR_CAMPAIGN_PRODUCT_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return handleHttpError(res, error.errors[0].message, 400);
    }
    handleHttpError(res, ERROR_UPDATE_CAMPAIGN_PRODUCT, 500);
  }
};

/**
 * Elimina un producto de una campaña
 */
const deleteCampaignProduct = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const deleted = await campaignProductsService.removeProductFromCampaign(id);

    if (!deleted) {
      return handleHttpError(res, ERROR_CAMPAIGN_PRODUCT_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      message: 'Producto eliminado de la campaña correctamente'
    });
  } catch (error) {
    handleHttpError(res, ERROR_DELETE_CAMPAIGN_PRODUCT, 500);
  }
};

/**
 * Obtiene los overrides de sucursal para un producto de campaña
 */
const getBranchOverrides = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const overrides = await campaignProductsService.getBranchOverrides(id);

    res.status(200).json({
      ok: true,
      data: overrides
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_BRANCH_OVERRIDES, 500);
  }
};

/**
 * Crea un override de descuento para una sucursal
 */
const createBranchOverride = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, branch_id, discount_value_override } = matchedData(req);
    const override = await campaignProductsService.createBranchOverride(
      id,
      branch_id,
      discount_value_override
    );

    res.status(201).json({
      ok: true,
      data: override
    });
  } catch (error) {
    if (error.message === 'Ya existe un override para esta sucursal') {
      return handleHttpError(res, ERROR_BRANCH_OVERRIDE_ALREADY_EXISTS, 400);
    }
    handleHttpError(res, ERROR_CREATE_BRANCH_OVERRIDE, 500);
  }
};

/**
 * Actualiza un override de sucursal
 */
const updateBranchOverride = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, branch_id, discount_value_override } = matchedData(req);
    const override = await campaignProductsService.updateBranchOverride(
      id,
      branch_id,
      discount_value_override
    );

    if (!override) {
      return handleHttpError(res, ERROR_BRANCH_OVERRIDE_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: override
    });
  } catch (error) {
    handleHttpError(res, ERROR_UPDATE_BRANCH_OVERRIDE, 500);
  }
};

/**
 * Elimina un override de sucursal
 */
const deleteBranchOverride = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, branch_id } = matchedData(req);
    const deleted = await campaignProductsService.deleteBranchOverride(id, branch_id);

    if (!deleted) {
      return handleHttpError(res, ERROR_BRANCH_OVERRIDE_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      message: 'Override de sucursal eliminado correctamente'
    });
  } catch (error) {
    handleHttpError(res, ERROR_DELETE_BRANCH_OVERRIDE, 500);
  }
};

module.exports = {
  getProductsByCampaign,
  getCampaignProduct,
  createCampaignProduct,
  updateCampaignProduct,
  deleteCampaignProduct,
  getBranchOverrides,
  createBranchOverride,
  updateBranchOverride,
  deleteBranchOverride
};
