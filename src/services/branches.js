const { branches, municipalities } = require('../models/index');

const attributes = ['id', 'name', 'address', 'phone', 'created_at', 'updated_at'];
const municipalityAttributes = ['id', 'name'];

const getAllBranches = async() => {
  const result = await branches.findAll({
    attributes,
    include: [
      {
        model: municipalities,
        as: 'municipio',
        attributes: municipalityAttributes
      }]
  });

  return result;
};

const getBranch = async(id) => {
  const result = await branches.findOne(
    {
      attributes,
      where: {
        id
      },
      include: [
        {
          model: municipalities,
          as: 'municipio',
          attributes: municipalityAttributes
        }]
    });

  return result;
};

const addNewBranch = async(body) => {
  const result = await branches.create(body);

  return result;
};

const updateBranch = async(branchId, req) => {
  const { name, address, municipality_id: municipalityId, phone } = req;

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

  const result = await data.save();
  return result;
};

const deleteBranch = async(id) => {
  const result = await branches.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = { getAllBranches, getBranch, addNewBranch, updateBranch, deleteBranch };
