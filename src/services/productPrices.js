const { Op } = require('sequelize');
const { productPrices, products, priceLists } = require('../models/index');

const attributes = [
  'id',
  'product_id',
  'price_list_id',
  'price',
  'min_quantity',
  'created_at',
  'updated_at'
];

const productAttributes = ['id', 'sku', 'name', 'base_price'];
const priceListAttributes = ['id', 'name', 'discount_percent'];

const getAllProductPrices = async () => {
  const result = await productPrices.findAll({
    attributes,
    include: [
      {
        model: products,
        as: 'product',
        attributes: productAttributes
      },
      {
        model: priceLists,
        as: 'priceList',
        attributes: priceListAttributes
      }
    ]
  });

  return result;
};

const getProductPrice = async (id) => {
  const result = await productPrices.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: products,
        as: 'product',
        attributes: productAttributes
      },
      {
        model: priceLists,
        as: 'priceList',
        attributes: priceListAttributes
      }
    ]
  });

  return result;
};

const getPricesByProduct = async (productId) => {
  const result = await productPrices.findAll({
    attributes,
    where: {
      product_id: productId
    },
    include: [
      {
        model: priceLists,
        as: 'priceList',
        attributes: priceListAttributes
      }
    ],
    order: [['min_quantity', 'ASC']]
  });

  return result;
};

const getPricesByPriceList = async (priceListId) => {
  const result = await productPrices.findAll({
    attributes,
    where: {
      price_list_id: priceListId
    },
    include: [
      {
        model: products,
        as: 'product',
        attributes: productAttributes
      }
    ],
    order: [['min_quantity', 'ASC']]
  });

  return result;
};

const addNewProductPrice = async (body) => {
  const result = await productPrices.create(body);

  return result;
};

const updateProductPrice = async (id, req) => {
  const {
    product_id: productId,
    price_list_id: priceListId,
    price,
    min_quantity: minQuantity
  } = req;

  const data = await productPrices.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.product_id = productId || data.product_id;
  data.price_list_id = priceListId || data.price_list_id;
  data.price = price !== undefined ? price : data.price;
  data.min_quantity = minQuantity !== undefined ? minQuantity : data.min_quantity;

  const result = await data.save();
  return result;
};

const deleteProductPrice = async (id) => {
  const result = await productPrices.destroy({
    where: {
      id
    },
    force: true,
    paranoid: false
  });

  return result;
};

const CHUNK_SIZE = 100;

const generatePricesByProduct = async (productId) => {
  const product = await products.findOne({
    where: { id: productId, is_active: true }
  });

  if (!product) {
    return { error: 'PRODUCT_NOT_FOUND_OR_INACTIVE' };
  }

  const activeLists = await priceLists.findAll({
    where: { is_active: true }
  });

  if (!activeLists.length) {
    return { error: 'NO_ACTIVE_PRICE_LISTS' };
  }

  const priceListIds = activeLists.map(pl => pl.id);

  await productPrices.destroy({
    where: {
      product_id: productId,
      price_list_id: { [Op.in]: priceListIds },
      min_quantity: 1
    },
    force: true,
    paranoid: false
  });

  const basePrice = parseFloat(product.base_price);
  const records = activeLists.map(pl => ({
    product_id: productId,
    price_list_id: pl.id,
    price: parseFloat((basePrice * (1 - parseFloat(pl.discount_percent) / 100)).toFixed(2)),
    min_quantity: 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  const result = await productPrices.bulkCreate(records, { ignoreDuplicates: true });

  return {
    product_id: productId,
    created: result.length,
    price_lists_processed: activeLists.length
  };
};

const generatePricesByPriceList = async (priceListId) => {
  const priceList = await priceLists.findOne({
    where: { id: priceListId, is_active: true }
  });

  if (!priceList) {
    return { error: 'PRICE_LIST_NOT_FOUND_OR_INACTIVE' };
  }

  const activeProducts = await products.findAll({
    where: { is_active: true }
  });

  if (!activeProducts.length) {
    return { error: 'NO_ACTIVE_PRODUCTS' };
  }

  const productIds = activeProducts.map(p => p.id);

  await productPrices.destroy({
    where: {
      price_list_id: priceListId,
      product_id: { [Op.in]: productIds },
      min_quantity: 1
    },
    force: true,
    paranoid: false
  });

  const discountPercent = parseFloat(priceList.discount_percent);
  const records = activeProducts.map(p => ({
    product_id: p.id,
    price_list_id: priceListId,
    price: parseFloat((parseFloat(p.base_price) * (1 - discountPercent / 100)).toFixed(2)),
    min_quantity: 1,
    created_at: new Date(),
    updated_at: new Date()
  }));

  let created = 0;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const inserted = await productPrices.bulkCreate(chunk, { ignoreDuplicates: true });
    created += inserted.length;
  }

  return {
    price_list_id: priceListId,
    created,
    products_processed: activeProducts.length
  };
};

const generateAllPrices = async () => {
  const [activeProducts, activeLists] = await Promise.all([
    products.findAll({ where: { is_active: true } }),
    priceLists.findAll({ where: { is_active: true } })
  ]);

  if (!activeProducts.length || !activeLists.length) {
    return { error: 'NO_ACTIVE_PRODUCTS_OR_PRICE_LISTS' };
  }

  const productIds = activeProducts.map(p => p.id);
  const priceListIds = activeLists.map(pl => pl.id);

  await productPrices.destroy({
    where: {
      product_id: { [Op.in]: productIds },
      price_list_id: { [Op.in]: priceListIds },
      min_quantity: 1
    },
    force: true,
    paranoid: false
  });

  const records = [];
  for (const p of activeProducts) {
    const basePrice = parseFloat(p.base_price);
    for (const pl of activeLists) {
      records.push({
        product_id: p.id,
        price_list_id: pl.id,
        price: parseFloat((basePrice * (1 - parseFloat(pl.discount_percent) / 100)).toFixed(2)),
        min_quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  let created = 0;
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const inserted = await productPrices.bulkCreate(chunk, { ignoreDuplicates: true });
    created += inserted.length;
  }

  return {
    created,
    products_processed: activeProducts.length,
    price_lists_processed: activeLists.length
  };
};

const recalculatePricesByProduct = async (productId) => {
  const product = await products.findOne({
    where: { id: productId, is_active: true }
  });

  if (!product) {
    return { error: 'PRODUCT_NOT_FOUND_OR_INACTIVE' };
  }

  const existingPrices = await productPrices.findAll({
    where: { product_id: productId },
    include: [
      {
        model: priceLists,
        as: 'priceList',
        attributes: priceListAttributes
      }
    ]
  });

  if (!existingPrices.length) {
    return { error: 'NO_PRICES_FOUND' };
  }

  const basePrice = parseFloat(product.base_price);

  const recordsToUpdate = existingPrices.filter(record => record.priceList);

  const updated = await Promise.all(
    recordsToUpdate.map(async (record) => {
      const discountPercent = parseFloat(record.priceList.discount_percent);
      record.price = parseFloat((basePrice * (1 - discountPercent / 100)).toFixed(2));
      await record.save();
      return 1;
    })
  );

  return {
    product_id: productId,
    updated: updated.length,
    prices_processed: existingPrices.length
  };
};

module.exports = {
  getAllProductPrices,
  getProductPrice,
  getPricesByProduct,
  getPricesByPriceList,
  addNewProductPrice,
  updateProductPrice,
  deleteProductPrice,
  generatePricesByProduct,
  generatePricesByPriceList,
  generateAllPrices,
  recalculatePricesByProduct
};
