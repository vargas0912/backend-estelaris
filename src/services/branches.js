const { branches, municipalities, states } = require('../models/index');

const attributes = [
  'id',
  'name',
  'address',
  'phone',
  'opening_date',
  'ticket_prefix',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'municipality_id'
];

const publicAttributes = ['id', 'name', 'address', 'phone', 'opening_date'];

const municipalityAttributes = ['id', 'name'];

const getAllBranches = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await branches.findAndCountAll({
    attributes,
    include: [
      {
        model: municipalities,
        as: 'municipio',
        attributes: municipalityAttributes,
        required: true
      }
    ],
    limit,
    offset,
    distinct: true
  });

  return { branches: rows, total: count };
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
        attributes: municipalityAttributes,
        required: true
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
    opening_date: openingDate,
    ticket_prefix: ticketPrefix
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
  data.ticket_prefix = ticketPrefix !== undefined ? ticketPrefix : data.ticket_prefix;

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

const getPublicBranches = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await branches.findAndCountAll({
    attributes: publicAttributes,
    include: [
      {
        model: municipalities,
        as: 'municipio',
        attributes: municipalityAttributes,
        required: true,
        include: [
          {
            model: states,
            as: 'estado',
            attributes: ['id', 'name'],
            required: true
          }
        ]
      }
    ],
    limit,
    offset,
    distinct: true
  });

  return { branches: rows, total: count };
};

module.exports = {
  getAllBranches,
  getBranch,
  addNewBranch,
  updateBranch,
  deleteBranch,
  getPublicBranches
};
