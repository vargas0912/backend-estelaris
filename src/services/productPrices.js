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

const getAllProductPrices = async() => {
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

const getProductPrice = async(id) => {
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

const getPricesByProduct = async(productId) => {
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

const getPricesByPriceList = async(priceListId) => {
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

const addNewProductPrice = async(body) => {
  const result = await productPrices.create(body);

  return result;
};

const updateProductPrice = async(id, req) => {
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

const deleteProductPrice = async(id) => {
  const result = await productPrices.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = {
  getAllProductPrices,
  getProductPrice,
  getPricesByProduct,
  getPricesByPriceList,
  addNewProductPrice,
  updateProductPrice,
  deleteProductPrice
};
