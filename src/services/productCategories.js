const { productCategories } = require('../models/index');

const attributes = ['id', 'name', 'description', 'created_at', 'updated_at'];

const getAllProductCategories = async() => {
  const result = await productCategories.findAll({
    attributes
  });

  return result;
};

const getProductCategory = async(id) => {
  const result = await productCategories.findOne(
    {
      attributes,
      where: {
        id
      }
    });

  return result;
};

const addNewProductCategory = async(body) => {
  const result = await productCategories.create(body);

  return result;
};

const updateProductCategory = async(id, req) => {
  const { name, description } = req;

  const data = await productCategories.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.description = description !== undefined ? description : data.description;

  const result = await data.save();
  return result;
};

const deleteProductCategory = async(id) => {
  const result = await productCategories.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = {
  getAllProductCategories,
  getProductCategory,
  addNewProductCategory,
  updateProductCategory,
  deleteProductCategory
};
