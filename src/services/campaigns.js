const { sequelize, campaigns: Campaigns, campaignProducts: CampaignProducts, campaignBranches: CampaignBranches, products: Products, branches: Branches, campaignProductBranches: ProductBranches } = require('../models');
const { Op } = require('sequelize');

/**
 * Obtiene todas las campañas con filtros opcionales
 * @param {Object} filters - Filtros opcionales (status: active/upcoming/finished/inactive)
 * @returns {Promise<Array>}
 */
const getAllCampaigns = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const where = {};
  const now = new Date();

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

  const { count, rows } = await Campaigns.findAndCountAll({
    where,
    include: [
      {
        model: CampaignProducts,
        as: 'campaignProducts',
        separate: true,
        include: [
          {
            model: Products,
            as: 'product',
            attributes: ['id', 'name', 'base_price']
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
    order: [['priority', 'DESC'], ['start_date', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { campaigns: rows, total: count };
};

/**
 * Obtiene solo las campañas activas y vigentes
 * @returns {Promise<Array>}
 */
const getActiveCampaigns = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const now = new Date();

  const { count, rows } = await Campaigns.findAndCountAll({
    where: {
      is_active: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now }
    },
    include: [
      {
        model: CampaignProducts,
        as: 'campaignProducts',
        separate: true,
        include: [
          {
            model: Products,
            as: 'product',
            attributes: ['id', 'name', 'base_price', 'credit_price', 'bar_code']
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
    order: [['priority', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { campaigns: rows, total: count };
};

/**
 * Obtiene una campaña por ID
 * @param {number} id - ID de la campaña
 * @returns {Promise<Object|null>}
 */
const getCampaign = async (id) => {
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
const addNewCampaign = async (body) => {
  const campaign = await Campaigns.create(body);
  return campaign;
};

/**
 * Actualiza una campaña existente
 * @param {number} id - ID de la campaña
 * @param {Object} body - Datos a actualizar
 * @returns {Promise<Object>}
 */
const updateCampaign = async (id, body) => {
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
const activateCampaign = async (id) => {
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
const deactivateCampaign = async (id) => {
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
const deleteCampaign = async (id) => {
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
const getCampaignBranches = async (campaignId) => {
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
const addCampaignBranches = async (campaignId, branchIds) => {
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
    const existing = await CampaignBranches.findOne({
      where: {
        campaign_id: campaignId,
        branch_id: branchId
      },
      paranoid: false
    });

    if (existing) {
      if (!existing.deleted_at) {
        // Ya existe y no está eliminada — evitar duplicado
        records.push(existing);
        continue;
      }
      // Fue eliminada antes — restaurar
      await existing.restore();
      records.push(existing);
    } else {
      // Crear nuevo registro
      const record = await CampaignBranches.create({
        campaign_id: campaignId,
        branch_id: branchId
      });
      records.push(record);
    }
  }

  return records;
};

/**
 * Remueve una sucursal de una campaña
 * @param {number} campaignId - ID de la campaña
 * @param {number} branchId - ID de la sucursal
 * @returns {Promise<boolean>}
 */
const removeCampaignBranch = async (campaignId, branchId) => {
  const t = await sequelize.transaction();
  try {
    const record = await CampaignBranches.findOne({
      where: { campaign_id: campaignId, branch_id: branchId },
      transaction: t
    });

    if (!record) {
      await t.rollback();
      return false;
    }

    // Cascade: limpiar overrides de esta sucursal en todos los productos de la campaña
    const campaignProducts = await CampaignProducts.findAll({
      attributes: ['id'],
      where: { campaign_id: campaignId },
      transaction: t
    });
    await ProductBranches.destroy({
      where: {
        campaign_product_id: { [Op.in]: campaignProducts.map((p) => p.id) },
        branch_id: branchId
      },
      transaction: t,
      force: true
    });

    await record.destroy({ transaction: t, force: true });
    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    console.error('❌ removeCampaignBranch error:', error); // temporal
    throw error;
  }
};

const getCampaignStats = async (campaignId) => {
  const [campaignRows] = await sequelize.query(
    `SELECT id, name, start_date, end_date, is_active
     FROM campaigns
     WHERE id = :campaignId AND deleted_at IS NULL
     LIMIT 1`,
    { replacements: { campaignId } }
  );

  if (!campaignRows.length) {
    return null;
  }

  const campaign = campaignRows[0];

  const [[productRows], [branchRows]] = await Promise.all([
    sequelize.query(
      `SELECT
         cp.id              AS campaign_product_id,
         cp.product_id,
         p.name             AS product_name,
         cp.discount_type,
         cp.discount_value,
         cp.max_quantity,
         cp.sold_quantity,
         CASE
           WHEN cp.max_quantity IS NOT NULL AND cp.max_quantity > 0
           THEN ROUND(cp.sold_quantity * 100.0 / cp.max_quantity, 1)
           ELSE NULL
         END AS progress_pct
       FROM campaign_products cp
       JOIN products p ON p.id = cp.product_id AND p.deleted_at IS NULL
       WHERE cp.campaign_id = :campaignId
         AND cp.deleted_at IS NULL
       ORDER BY cp.sold_quantity DESC`,
      { replacements: { campaignId } }
    ),
    sequelize.query(
      `SELECT
         s.branch_id,
         b.name                                                        AS branch_name,
         COUNT(DISTINCT s.id)                                          AS sales_count,
         COALESCE(SUM(sd.qty), 0)                                      AS total_units_sold,
         COALESCE(SUM(sd.subtotal), 0)                                 AS total_revenue,
         COALESCE(SUM(sd.qty * sd.unit_price * sd.discount / 100), 0) AS total_discount_applied
       FROM sales s
       JOIN branches b     ON b.id = s.branch_id AND b.deleted_at IS NULL
       JOIN sale_details sd ON sd.sale_id = s.id
       WHERE s.status != 'Cancelado'
         AND s.deleted_at IS NULL
         AND s.sales_date BETWEEN DATE(:startDate) AND DATE(:endDate)
         AND sd.product_id IN (
           SELECT product_id FROM campaign_products
           WHERE campaign_id = :campaignId AND deleted_at IS NULL
         )
       GROUP BY s.branch_id, b.name
       ORDER BY total_revenue DESC`,
      { replacements: { campaignId, startDate: campaign.start_date, endDate: campaign.end_date } }
    )
  ]);

  const rawTotals = branchRows.reduce(
    (acc, row) => ({
      total_units_sold: acc.total_units_sold + Number(row.total_units_sold),
      total_revenue: acc.total_revenue + parseFloat(row.total_revenue),
      total_discount_applied: acc.total_discount_applied + parseFloat(row.total_discount_applied),
      sales_count: acc.sales_count + Number(row.sales_count)
    }),
    { total_units_sold: 0, total_revenue: 0, total_discount_applied: 0, sales_count: 0 }
  );

  const summary = {
    ...rawTotals,
    total_revenue: rawTotals.total_revenue.toFixed(2),
    total_discount_applied: rawTotals.total_discount_applied.toFixed(2)
  };

  return { campaign, summary, products: productRows, by_branch: branchRows };
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
  removeCampaignBranch,
  getCampaignStats
};
