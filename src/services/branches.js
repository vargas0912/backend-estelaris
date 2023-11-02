const { branches } = require('../models/index');

const getAllBranches = async () => {
  const result = await branches.findAll({
    include: 'municipality'
  });

  return result;
};

const getBranch = async (id) => {
  const result = await branches.findOne(
    {
      where: {
        id
      },
      include: 'municipality'
    });

  return result;
};

const addNewBranch = async (body) => {
  const result = await branches.create(body);

  return result;
};

const updateBranch = async (branchId, req) => {
  const { description, address, municipality, phone } = req.body;

  const data = await branches.findByPk(branchId);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.description = description || data.description;
  data.address = address || data.address;
  data.municipality = municipality || data.municipality;
  data.phone = phone || data.phone;

  const result = await data.save();
  return result;
};

const deleteBranch = async (id) => {
  const result = await branches.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = { getAllBranches, getBranch, addNewBranch, updateBranch, deleteBranch };
