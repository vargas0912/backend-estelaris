const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');
const campaignsService = require('../services/campaigns');
const {
  ERROR_GET_CAMPAIGNS,
  ERROR_GET_CAMPAIGN,
  ERROR_CREATE_CAMPAIGN,
  ERROR_UPDATE_CAMPAIGN,
  ERROR_DELETE_CAMPAIGN,
  ERROR_ACTIVATE_CAMPAIGN,
  ERROR_DEACTIVATE_CAMPAIGN,
  ERROR_CAMPAIGN_NOT_FOUND,
  ERROR_GET_ACTIVE_CAMPAIGNS,
  ERROR_GET_CAMPAIGN_BRANCHES,
  ERROR_ADD_CAMPAIGN_BRANCHES,
  ERROR_REMOVE_CAMPAIGN_BRANCH,
  ERROR_BRANCH_NOT_IN_CAMPAIGN
} = require('../constants/campaigns');

/**
 * Obtiene todas las campañas con filtros opcionales
 */
const getCampaigns = async(req, res) => {
  try {
    const data = matchedData(req);
    const campaigns = await campaignsService.getAllCampaigns(data);

    res.status(200).json({
      ok: true,
      data: campaigns
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_CAMPAIGNS, 500);
  }
};

/**
 * Obtiene solo las campañas activas
 */
const getActiveCampaigns = async(req, res) => {
  try {
    const campaigns = await campaignsService.getActiveCampaigns();

    res.status(200).json({
      ok: true,
      data: campaigns
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_ACTIVE_CAMPAIGNS, 500);
  }
};

/**
 * Obtiene una campaña por ID
 */
const getCampaign = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const campaign = await campaignsService.getCampaign(id);

    if (!campaign) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: campaign
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_CAMPAIGN, 500);
  }
};

/**
 * Crea una nueva campaña
 */
const createCampaign = async(req, res) => {
  try {
    const data = matchedData(req);
    const campaign = await campaignsService.addNewCampaign(data);

    res.status(201).json({
      ok: true,
      data: campaign
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return handleHttpError(res, error.errors[0].message, 400);
    }
    handleHttpError(res, ERROR_CREATE_CAMPAIGN, 500);
  }
};

/**
 * Actualiza una campaña
 */
const updateCampaign = async(req, res) => {
  try {
    const { id, ...data } = matchedData(req);
    const campaign = await campaignsService.updateCampaign(id, data);

    if (!campaign) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: campaign
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return handleHttpError(res, error.errors[0].message, 400);
    }
    handleHttpError(res, ERROR_UPDATE_CAMPAIGN, 500);
  }
};

/**
 * Activa una campaña
 */
const activateCampaign = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const campaign = await campaignsService.activateCampaign(id);

    if (!campaign) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: campaign
    });
  } catch (error) {
    handleHttpError(res, ERROR_ACTIVATE_CAMPAIGN, 500);
  }
};

/**
 * Desactiva una campaña
 */
const deactivateCampaign = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const campaign = await campaignsService.deactivateCampaign(id);

    if (!campaign) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: campaign
    });
  } catch (error) {
    handleHttpError(res, ERROR_DEACTIVATE_CAMPAIGN, 500);
  }
};

/**
 * Elimina una campaña
 */
const deleteCampaign = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const deleted = await campaignsService.deleteCampaign(id);

    if (!deleted) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      message: 'Campaña eliminada correctamente'
    });
  } catch (error) {
    handleHttpError(res, ERROR_DELETE_CAMPAIGN, 500);
  }
};

/**
 * Obtiene las sucursales de una campaña
 */
const getCampaignBranches = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const branches = await campaignsService.getCampaignBranches(id);

    if (branches === null) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(200).json({
      ok: true,
      data: branches
    });
  } catch (error) {
    handleHttpError(res, ERROR_GET_CAMPAIGN_BRANCHES, 500);
  }
};

/**
 * Agrega sucursales a una campaña
 */
const addCampaignBranches = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, branch_ids } = matchedData(req);
    const branches = await campaignsService.addCampaignBranches(id, branch_ids);

    if (branches === null) {
      return handleHttpError(res, ERROR_CAMPAIGN_NOT_FOUND, 404);
    }

    res.status(201).json({
      ok: true,
      data: branches
    });
  } catch (error) {
    if (error.message === 'Una o más sucursales no existen') {
      return handleHttpError(res, error.message, 400);
    }
    handleHttpError(res, ERROR_ADD_CAMPAIGN_BRANCHES, 500);
  }
};

/**
 * Remueve una sucursal de una campaña
 */
const removeCampaignBranch = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, branch_id } = matchedData(req);
    const removed = await campaignsService.removeCampaignBranch(id, branch_id);

    if (!removed) {
      return handleHttpError(res, ERROR_BRANCH_NOT_IN_CAMPAIGN, 404);
    }

    res.status(200).json({
      ok: true,
      message: 'Sucursal removida de la campaña correctamente'
    });
  } catch (error) {
    handleHttpError(res, ERROR_REMOVE_CAMPAIGN_BRANCH, 500);
  }
};

module.exports = {
  getCampaigns,
  getActiveCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  activateCampaign,
  deactivateCampaign,
  deleteCampaign,
  getCampaignBranches,
  addCampaignBranches,
  removeCampaignBranch
};
