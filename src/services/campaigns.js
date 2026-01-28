const { campaigns: Campaigns, campaignProducts: CampaignProducts, campaignBranches: CampaignBranches, products: Products, branches: Branches } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtiene todas las campañas con filtros opcionales
 * @param {Object} filters - Filtros opcionales (status: active/upcoming/finished/inactive)
 * @returns {Promise<Array>}
 */
const getAllCampaigns = async(filters = {}) => {
  const where = {};
  const now = new Date();

  // Filtro por estado
  if (filters.status) {
    switch (filters.status) {
      case 'active':
        where.is_active = true;
        where.start_date = { [Op.lte]: now };
        where.end_date = { [Op.gte]: now };
        break;
      case 'upcoming':
        where.is_active = true;
        where.start_date = { [Op.gt]: now };
        break;
      case 'finished':
        where.end_date = { [Op.lt]: now };
        break;
      case 'inactive':
        where.is_active = false;
        break;
    }
  }

  const campaigns = await Campaigns.findAll({
    where,
    include: [
      {
        model: CampaignProducts,
        as: 'campaignProducts',
        include: [
          {
            model: Products,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'base_price']
          }
        ]
      },
      {
        model: Branches,
        as: 'branches',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }
    ],
    order: [['priority', 'DESC'], ['start_date', 'DESC']]
  });

  return campaigns;
};

/**
 * Obtiene solo las campañas activas y vigentes
 * @returns {Promise<Array>}
 */
const getActiveCampaigns = async() => {
  const now = new Date();

  const campaigns = await Campaigns.findAll({
    where: {
      is_active: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now }
    },
    include: [
      {
        model: CampaignProducts,
        as: 'campaignProducts',
        include: [
          {
            model: Products,
            as: 'product'
          }
        ]
      },
      {
        model: Branches,
        as: 'branches',
        through: { attributes: [] }
      }
    ],
    order: [['priority', 'DESC']]
  });

  return campaigns;
};

/**
 * Obtiene una campaña por ID
 * @param {number} id - ID de la campaña
 * @returns {Promise<Object|null>}
 */
const getCampaign = async(id) => {
  const campaign = await Campaigns.findByPk(id, {
    include: [
      {
        model: CampaignProducts,
        as: 'campaignProducts',
        include: [
          {
            model: Products,
            as: 'product'
          }
        ]
      },
      {
        model: Branches,
        as: 'branches',
        through: { attributes: [] }
      }
    ]
  });

  return campaign;
};

/**
 * Crea una nueva campaña
 * @param {Object} body - Datos de la campaña
 * @returns {Promise<Object>}
 */
const addNewCampaign = async(body) => {
  const campaign = await Campaigns.create(body);
  return campaign;
};

/**
 * Actualiza una campaña existente
 * @param {number} id - ID de la campaña
 * @param {Object} body - Datos a actualizar
 * @returns {Promise<Object>}
 */
const updateCampaign = async(id, body) => {
  const campaign = await Campaigns.findByPk(id);

  if (!campaign) {
    return null;
  }

  await campaign.update(body);
  return campaign;
};

/**
 * Activa una campaña manualmente
 * @param {number} id - ID de la campaña
 * @returns {Promise<Object>}
 */
const activateCampaign = async(id) => {
  const campaign = await Campaigns.findByPk(id);

  if (!campaign) {
    return null;
  }

  await campaign.update({ is_active: true });
  return campaign;
};

/**
 * Desactiva una campaña manualmente
 * @param {number} id - ID de la campaña
 * @returns {Promise<Object>}
 */
const deactivateCampaign = async(id) => {
  const campaign = await Campaigns.findByPk(id);

  if (!campaign) {
    return null;
  }

  await campaign.update({ is_active: false });
  return campaign;
};

/**
 * Elimina una campaña (soft delete)
 * @param {number} id - ID de la campaña
 * @returns {Promise<boolean>}
 */
const deleteCampaign = async(id) => {
  const campaign = await Campaigns.findByPk(id);

  if (!campaign) {
    return false;
  }

  await campaign.destroy();
  return true;
};

/**
 * Obtiene las sucursales asignadas a una campaña
 * @param {number} campaignId - ID de la campaña
 * @returns {Promise<Array>}
 */
const getCampaignBranches = async(campaignId) => {
  const campaign = await Campaigns.findByPk(campaignId, {
    include: [
      {
        model: Branches,
        as: 'branches',
        through: { attributes: ['created_at'] }
      }
    ]
  });

  if (!campaign) {
    return null;
  }

  return campaign.branches;
};

/**
 * Agrega sucursales a una campaña
 * @param {number} campaignId - ID de la campaña
 * @param {Array<number>} branchIds - Array de IDs de sucursales
 * @returns {Promise<Array>}
 */
const addCampaignBranches = async(campaignId, branchIds) => {
  const campaign = await Campaigns.findByPk(campaignId);

  if (!campaign) {
    return null;
  }

  // Verificar que las sucursales existen
  const branches = await Branches.findAll({
    where: {
      id: { [Op.in]: branchIds }
    }
  });

  if (branches.length !== branchIds.length) {
    throw new Error('Una o más sucursales no existen');
  }

  // Agregar sucursales (evita duplicados automáticamente)
  const records = [];
  for (const branchId of branchIds) {
    const [record] = await CampaignBranches.findOrCreate({
      where: {
        campaign_id: campaignId,
        branch_id: branchId
      },
      defaults: {
        campaign_id: campaignId,
        branch_id: branchId
      }
    });
    records.push(record);
  }

  return records;
};

/**
 * Remueve una sucursal de una campaña
 * @param {number} campaignId - ID de la campaña
 * @param {number} branchId - ID de la sucursal
 * @returns {Promise<boolean>}
 */
const removeCampaignBranch = async(campaignId, branchId) => {
  const record = await CampaignBranches.findOne({
    where: {
      campaign_id: campaignId,
      branch_id: branchId
    }
  });

  if (!record) {
    return false;
  }

  await record.destroy();
  return true;
};

module.exports = {
  getAllCampaigns,
  getActiveCampaigns,
  getCampaign,
  addNewCampaign,
  updateCampaign,
  activateCampaign,
  deactivateCampaign,
  deleteCampaign,
  getCampaignBranches,
  addCampaignBranches,
  removeCampaignBranch
};
