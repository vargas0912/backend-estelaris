const { products, productCategories, Campaigns, CampaignProducts, CampaignProductBranches, Branches } = require('../models/index');
const { Op } = require('sequelize');

const attributes = [
  'id',
  'sku',
  'barcode',
  'name',
  'description',
  'short_description',
  'category_id',
  'unit_of_measure',
  'cost_price',
  'base_price',
  'weight',
  'dimensions',
  'images',
  'is_active',
  'is_featured',
  'seo_title',
  'seo_description',
  'seo_keywords',
  'created_at',
  'updated_at'
];

const categoryAttributes = ['id', 'name'];

const getAllProducts = async() => {
  const result = await products.findAll({
    attributes,
    include: [
      {
        model: productCategories,
        as: 'category',
        attributes: categoryAttributes
      }
    ]
  });

  return result;
};

const getProduct = async(id) => {
  const result = await products.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: productCategories,
        as: 'category',
        attributes: categoryAttributes
      }
    ]
  });

  return result;
};

const addNewProduct = async(body) => {
  const result = await products.create(body);

  return result;
};

const updateProduct = async(id, req) => {
  const {
    sku,
    barcode,
    name,
    description,
    short_description: shortDescription,
    category_id: categoryId,
    unit_of_measure: unitOfMeasure,
    cost_price: costPrice,
    base_price: basePrice,
    weight,
    dimensions,
    images,
    is_active: isActive,
    is_featured: isFeatured,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: seoKeywords
  } = req;

  const data = await products.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.sku = sku || data.sku;
  data.barcode = barcode !== undefined ? barcode : data.barcode;
  data.name = name || data.name;
  data.description = description !== undefined ? description : data.description;
  data.short_description = shortDescription !== undefined ? shortDescription : data.short_description;
  data.category_id = categoryId !== undefined ? categoryId : data.category_id;
  data.unit_of_measure = unitOfMeasure || data.unit_of_measure;
  data.cost_price = costPrice !== undefined ? costPrice : data.cost_price;
  data.base_price = basePrice !== undefined ? basePrice : data.base_price;
  data.weight = weight !== undefined ? weight : data.weight;
  data.dimensions = dimensions !== undefined ? dimensions : data.dimensions;
  data.images = images !== undefined ? images : data.images;
  data.is_active = isActive !== undefined ? isActive : data.is_active;
  data.is_featured = isFeatured !== undefined ? isFeatured : data.is_featured;
  data.seo_title = seoTitle !== undefined ? seoTitle : data.seo_title;
  data.seo_description = seoDescription !== undefined ? seoDescription : data.seo_description;
  data.seo_keywords = seoKeywords !== undefined ? seoKeywords : data.seo_keywords;

  const result = await data.save();
  return result;
};

const deleteProduct = async(id) => {
  const result = await products.destroy({
    where: {
      id
    }
  });

  return result;
};

/**
 * Obtiene un producto con información de campaña activa si aplica
 * @param {number} id - ID del producto
 * @param {number|null} branchId - ID de la sucursal (opcional)
 * @returns {Promise<Object|null>}
 */
const getProductWithActiveOffer = async(id, branchId = null) => {
  // 1. Obtener el producto
  const product = await products.findByPk(id, {
    attributes,
    include: [
      {
        model: productCategories,
        as: 'category',
        attributes: categoryAttributes
      }
    ]
  });

  if (!product) {
    return null;
  }

  const now = new Date();
  const basePrice = parseFloat(product.base_price);

  // 2. Buscar campañas activas para este producto
  const activeCampaigns = await Campaigns.findAll({
    where: {
      is_active: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now }
    },
    include: [
      {
        model: CampaignProducts,
        as: 'campaignProducts',
        where: { product_id: id },
        required: true,
        include: [
          {
            model: CampaignProductBranches,
            as: 'branchOverrides',
            required: false
          }
        ]
      },
      {
        model: Branches,
        as: 'branches',
        through: { attributes: [] },
        required: false
      }
    ],
    order: [['priority', 'DESC']]
  });

  // 3. Si no hay campañas activas, retornar producto sin oferta
  if (!activeCampaigns || activeCampaigns.length === 0) {
    return {
      ...product.toJSON(),
      has_active_campaign: false,
      campaign: null,
      original_price: basePrice,
      offer_price: null,
      discount_amount: null,
      discount_percentage: null,
      final_price: basePrice
    };
  }

  // 4. Filtrar campañas que aplican a la sucursal (si se proporciona)
  let applicableCampaign = null;
  let applicableCampaignProduct = null;
  let discountValue = null;
  let branchInfo = null;

  for (const campaign of activeCampaigns) {
    // Verificar si la campaña aplica a la sucursal
    const campaignBranches = campaign.branches || [];

    // Si no hay sucursales asignadas, aplica a todas
    let appliesToBranch = true;

    if (branchId && campaignBranches.length > 0) {
      // Si hay sucursales asignadas, verificar que la sucursal esté en la lista
      appliesToBranch = campaignBranches.some(b => b.id === branchId);
    }

    if (!appliesToBranch) {
      continue; // Esta campaña no aplica a esta sucursal
    }

    // Obtener el producto de campaña
    const campaignProduct = campaign.campaignProducts[0];

    // Verificar stock disponible
    if (!campaignProduct.hasAvailableStock(1)) {
      continue; // No hay stock disponible
    }

    // Obtener el descuento (con override si existe)
    let effectiveDiscount = parseFloat(campaignProduct.discount_value);

    // Buscar override para esta sucursal
    if (branchId && campaignProduct.branchOverrides) {
      const override = campaignProduct.branchOverrides.find(
        o => o.branch_id === branchId
      );

      if (override) {
        effectiveDiscount = parseFloat(override.discount_value_override);
        const branch = campaignBranches.find(b => b.id === branchId);
        branchInfo = branch ? { id: branch.id, name: branch.name } : null;
      }
    }

    // Esta es la campaña con mayor prioridad que aplica
    applicableCampaign = campaign;
    applicableCampaignProduct = campaignProduct;
    discountValue = effectiveDiscount;
    break;
  }

  // 5. Si no hay campaña aplicable, retornar sin oferta
  if (!applicableCampaign) {
    return {
      ...product.toJSON(),
      has_active_campaign: false,
      campaign: null,
      original_price: basePrice,
      offer_price: null,
      discount_amount: null,
      discount_percentage: null,
      final_price: basePrice
    };
  }

  // 6. Calcular precio con descuento
  let offerPrice = basePrice;

  if (applicableCampaignProduct.discount_type === 'percentage') {
    const discountAmount = (basePrice * discountValue) / 100;
    offerPrice = basePrice - discountAmount;
  } else if (applicableCampaignProduct.discount_type === 'fixed_price') {
    offerPrice = discountValue;
  }

  offerPrice = parseFloat(offerPrice.toFixed(2));
  const discountAmount = parseFloat((basePrice - offerPrice).toFixed(2));
  const discountPercentage = ((discountAmount / basePrice) * 100).toFixed(2);

  // 7. Retornar producto con información de oferta
  return {
    ...product.toJSON(),
    has_active_campaign: true,
    campaign: {
      id: applicableCampaign.id,
      name: applicableCampaign.name,
      description: applicableCampaign.description,
      start_date: applicableCampaign.start_date,
      end_date: applicableCampaign.end_date,
      priority: applicableCampaign.priority,
      branch_id: branchInfo ? branchInfo.id : null,
      branch_name: branchInfo ? branchInfo.name : null,
      discount_type: applicableCampaignProduct.discount_type,
      discount_value: discountValue
    },
    original_price: basePrice,
    offer_price: offerPrice,
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
    stock_available: applicableCampaignProduct.hasAvailableStock(1),
    remaining_stock: applicableCampaignProduct.getRemainingStock(),
    final_price: offerPrice
  };
};

module.exports = { getAllProducts, getProduct, addNewProduct, updateProduct, deleteProduct, getProductWithActiveOffer };
