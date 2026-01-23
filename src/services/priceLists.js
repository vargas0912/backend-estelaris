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

const getAllPriceLists = async() => {
  const result = await priceLists.findAll({
    attributes,
    order: [['priority', 'DESC'], ['name', 'ASC']]
  });

  return result;
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
