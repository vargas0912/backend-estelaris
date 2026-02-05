const { branches, municipalities } = require('../models/index');

const attributes = [
  'id',
  'name',
  'address',
  'phone',
  'opening_date',
  'created_at',
  'updated_at'
];

const municipalityAttributes = ['id', 'name'];

const getAllBranches = async() => {
  const result = await branches.findAll({
    attributes,
    include: [
      {
        model: municipalities,
        as: 'municipio',
        attributes: municipalityAttributes
      }
    ]
  });

  return result;
};

const getBranch = async(id) => {
  const result = await branches.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: municipalities,
        as: 'municipio',
        attributes: municipalityAttributes
      }
    ]
  });

  return result;
};

const addNewBranch = async(body) => {
  const result = await branches.create(body);

  return result;
};

const updateBranch = async(branchId, req) => {
  const {
    name,
    address,
    municipality_id: municipalityId,
    phone,
    opening_date: openingDate
  } = req;

  const data = await branches.findByPk(branchId);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.address = address || data.address;
  data.municipality_id = municipalityId || data.municipality_id;
  data.phone = phone || data.phone;
  data.opening_date = openingDate || data.opening_date;

  const result = await data.save();
  return result;
};

const deleteBranch = async(id) => {
  const data = await branches.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  await data.destroy();
  return data;
};

module.exports = {
  getAllBranches,
  getBranch,
  addNewBranch,
  updateBranch,
  deleteBranch
};
