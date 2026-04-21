const { priceLists } = require('../models/index');

const attributes = [
  'id',
  'name',
  'description',
  'discount_percent',
  'is_active',
  'priority',
  'created_at',
  'updated_at'
];

const getAllPriceLists = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await priceLists.findAndCountAll({
    attributes,
    order: [['priority', 'DESC'], ['name', 'ASC']],
    limit,
    offset
  });

  return { priceLists: rows, total: count };
};

const getPriceList = async(id) => {
  const result = await priceLists.findOne({
    attributes,
    where: {
      id
    }
  });

  return result;
};

const addNewPriceList = async(body) => {
  const result = await priceLists.create(body);

  return result;
};

const updatePriceList = async(id, req) => {
  const {
    name,
    description,
    discount_percent: discountPercent,
    is_active: isActive,
    priority
  } = req;

  const data = await priceLists.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.description = description !== undefined ? description : data.description;
  data.discount_percent = discountPercent !== undefined ? discountPercent : data.discount_percent;
  data.is_active = isActive !== undefined ? isActive : data.is_active;
  data.priority = priority !== undefined ? priority : data.priority;

  const result = await data.save();
  return result;
};

const deletePriceList = async(id) => {
  const result = await priceLists.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = {
  getAllPriceLists,
  getPriceList,
  addNewPriceList,
  updatePriceList,
  deletePriceList
};
