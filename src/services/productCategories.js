const { productCategories } = require('../models/index');
const { Op } = require('sequelize');

const attributes = ['id', 'name', 'description', 'created_at', 'updated_at'];

const getAllProductCategories = async(page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  const where = search
    ? { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }] }
    : {};
  const { count, rows } = await productCategories.findAndCountAll({
    attributes,
    where,
    limit,
    offset
  });

  return { productCategories: rows, total: count };
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
