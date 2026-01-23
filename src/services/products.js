const { products, productCategories } = require('../models/index');

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

module.exports = { getAllProducts, getProduct, addNewProduct, updateProduct, deleteProduct };
