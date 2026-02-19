const { customerAddresses, customers, municipalities } = require('../models/index');

const attributes = [
  'id', 'customer_id', 'address_type', 'street', 'neighborhood', 'postal_code',
  'country', 'municipality_id', 'is_default', 'notes', 'created_at', 'updated_at'
];

const municipalityAttributes = ['id', 'name'];
const customerAttributes = ['id', 'name', 'email'];

const getAllAddresses = async() => {
  const result = await customerAddresses.findAll({
    attributes,
    include: [
      {
        model: customers,
        as: 'customer',
        attributes: customerAttributes,
        required: true
      },
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes,
        required: true
      }
    ]
  });

  return result;
};

const getAddress = async(id) => {
  const result = await customerAddresses.findOne({
    attributes,
    where: { id },
    include: [
      {
        model: customers,
        as: 'customer',
        attributes: customerAttributes,
        required: true
      },
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes,
        required: false
      }
    ]
  });

  return result;
};

const getAddressesByCustomer = async(customerId) => {
  const result = await customerAddresses.findAll({
    attributes,
    where: { customer_id: customerId },
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes,
        required: false
      }
    ],
    order: [
      ['is_default', 'DESC'],
      ['created_at', 'DESC']
    ]
  });

  return result;
};

const addNewAddress = async(body) => {
  // Validar que el customer exista
  const customer = await customers.findByPk(body.customer_id);
  if (!customer) {
    return {
      error: true,
      message: 'CUSTOMER_NOT_EXISTS'
    };
  }

  // Validar que municipality_id exista si se proporciona
  if (body.municipality_id) {
    const municipality = await municipalities.findByPk(body.municipality_id);
    if (!municipality) {
      return {
        error: true,
        message: 'MUNICIPALITY_NOT_EXISTS'
      };
    }
  }

  // Si es la primera dirección de este tipo, marcarla como default
  const existingAddresses = await customerAddresses.findAll({
    where: {
      customer_id: body.customer_id,
      address_type: body.address_type
    }
  });

  if (existingAddresses.length === 0) {
    body.is_default = true;
  }

  // Si se marca como default, desmarcar las demás del mismo tipo
  if (body.is_default) {
    await customerAddresses.update(
      { is_default: false },
      {
        where: {
          customer_id: body.customer_id,
          address_type: body.address_type
        }
      }
    );
  }

  const result = await customerAddresses.create(body);
  return result;
};

const updateAddress = async(addressId, req) => {
  const data = await customerAddresses.findByPk(addressId);

  if (!data) {
    return {
      error: true,
      message: 'ADDRESS_NOT_FOUND'
    };
  }

  // Validar que municipality_id exista si se proporciona
  if (req.municipality_id && req.municipality_id !== data.municipality_id) {
    const municipality = await municipalities.findByPk(req.municipality_id);
    if (!municipality) {
      return {
        error: true,
        message: 'MUNICIPALITY_NOT_EXISTS'
      };
    }
  }

  // Si se marca como default, desmarcar las demás del mismo tipo
  if (req.is_default === true) {
    await customerAddresses.update(
      { is_default: false },
      {
        where: {
          customer_id: data.customer_id,
          address_type: data.address_type,
          id: { [require('sequelize').Op.ne]: addressId }
        }
      }
    );
  }

  // Actualizar campos
  Object.keys(req).forEach(key => {
    if (req[key] !== undefined) {
      data[key] = req[key];
    }
  });

  const result = await data.save();
  return result;
};

const deleteAddress = async(id) => {
  const data = await customerAddresses.findByPk(id);

  if (!data) {
    return {
      error: true,
      message: 'ADDRESS_NOT_FOUND'
    };
  }

  await data.destroy();
  return data;
};

module.exports = {
  getAllAddresses,
  getAddress,
  getAddressesByCustomer,
  addNewAddress,
  updateAddress,
  deleteAddress
};
