const { customers, customerAddresses, municipalities, branches, users, sequelize } = require('../models/index');
const { Op } = require('sequelize');
const { encrypt } = require('../utils/handlePassword');
const { ROLE } = require('../constants/roles');
const { SORT_WHITELIST } = require('../constants/customers');

const sanitizeFulltext = (str) => str.replace(/[+\-><()~*"@]/g, ' ').trim();

const buildNameSearch = (search) =>
  sequelize.where(
    sequelize.literal('MATCH(customers.name) AGAINST(:ftq IN BOOLEAN MODE)'),
    { [Op.gt]: 0 }
  );

const sanitizeSort = (sortBy, sortOrder) => ({
  safeSortBy: SORT_WHITELIST.includes(sortBy) ? sortBy : 'id',
  safeSortOrder: sortOrder === 'ASC' ? 'ASC' : 'DESC'
});

const attributes = [
  'id', 'name', 'email', 'phone', 'mobile', 'tax_id', 'is_international',
  'country', 'billing_address', 'municipality_id', 'branch_id', 'user_id',
  'notes', 'is_active', 'created_at', 'updated_at'
];

const municipalityAttributes = ['id', 'name'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'email', 'role'];

const getAllCustomers = async(page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'DESC') => {
  const offset = (page - 1) * limit;
  const { safeSortBy, safeSortOrder } = sanitizeSort(sortBy, sortOrder);
  const where = search ? buildNameSearch(search) : {};
  const queryOptions = {
    attributes,
    where,
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      },
      {
        model: users,
        as: 'user',
        attributes: userAttributes
      }
    ],
    order: [[safeSortBy, safeSortOrder]],
    limit,
    offset,
    distinct: true
  };
  if (search) queryOptions.replacements = { ftq: sanitizeFulltext(search) + '*' };
  const { count, rows } = await customers.findAndCountAll(queryOptions);

  return { customers: rows, total: count };
};

const getCustomer = async(id) => {
  const result = await customers.findOne({
    attributes,
    where: { id },
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      },
      {
        model: users,
        as: 'user',
        attributes: userAttributes
      },
      {
        model: customerAddresses,
        as: 'addresses',
        attributes: [
          'id', 'address_type', 'street', 'neighborhood', 'postal_code',
          'country', 'municipality_id', 'is_default', 'notes'
        ]
      }
    ]
  });

  return result;
};

const getCustomersByBranch = async(branchId, page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'DESC') => {
  const offset = (page - 1) * limit;
  const { safeSortBy, safeSortOrder } = sanitizeSort(sortBy, sortOrder);
  const where = { branch_id: branchId };
  if (search) where[Op.and] = [buildNameSearch(search)];
  const queryOptions = {
    attributes,
    where,
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes,
        required: true
      }
    ],
    order: [[safeSortBy, safeSortOrder]],
    limit,
    offset,
    distinct: true
  };
  if (search) queryOptions.replacements = { ftq: sanitizeFulltext(search) + '*' };
  const { count, rows } = await customers.findAndCountAll(queryOptions);

  return { customers: rows, total: count };
};

const getCustomersByMunicipality = async(municipalityId, page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'DESC') => {
  const offset = (page - 1) * limit;
  const { safeSortBy, safeSortOrder } = sanitizeSort(sortBy, sortOrder);
  const where = { municipality_id: municipalityId };
  if (search) where[Op.and] = [buildNameSearch(search)];
  const queryOptions = {
    attributes,
    where,
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes,
        required: true
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ],
    order: [[safeSortBy, safeSortOrder]],
    limit,
    offset,
    distinct: true
  };
  if (search) queryOptions.replacements = { ftq: sanitizeFulltext(search) + '*' };
  const { count, rows } = await customers.findAndCountAll(queryOptions);

  return { customers: rows, total: count };
};

const addNewCustomer = async(body) => {
  // Validar que el email no exista
  const existingCustomer = await customers.findOne({
    where: { email: body.email }
  });

  if (existingCustomer) {
    return {
      error: true,
      message: 'EMAIL_EXISTS'
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

  // Validar que branch_id exista si se proporciona
  if (body.branch_id) {
    const branch = await branches.findByPk(body.branch_id);
    if (!branch) {
      return {
        error: true,
        message: 'BRANCH_NOT_EXISTS'
      };
    }
  }

  const result = await customers.create(body);
  return result;
};

const updateCustomer = async(customerId, req) => {
  const data = await customers.findByPk(customerId);

  if (!data) {
    return {
      error: true,
      message: 'CUSTOMER_NOT_FOUND'
    };
  }

  // Validar email único si se está actualizando
  if (req.email && req.email !== data.email) {
    const existingCustomer = await customers.findOne({
      where: { email: req.email }
    });

    if (existingCustomer) {
      return {
        error: true,
        message: 'EMAIL_EXISTS'
      };
    }
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

  // Validar que branch_id exista si se proporciona
  if (req.branch_id && req.branch_id !== data.branch_id) {
    const branch = await branches.findByPk(req.branch_id);
    if (!branch) {
      return {
        error: true,
        message: 'BRANCH_NOT_EXISTS'
      };
    }
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

const deleteCustomer = async(id) => {
  const data = await customers.findByPk(id);

  if (!data) {
    return {
      error: true,
      message: 'CUSTOMER_NOT_FOUND'
    };
  }

  await data.destroy();
  return data;
};

const activatePortal = async(customerId, password = null) => {
  const customer = await customers.findByPk(customerId);

  if (!customer) {
    return {
      error: true,
      message: 'CUSTOMER_NOT_FOUND'
    };
  }

  // Verificar que no tenga ya un user_id asignado
  if (customer.user_id) {
    return {
      error: true,
      message: 'USER_ID_ALREADY_EXISTS'
    };
  }

  // Verificar que el email no esté ya registrado como usuario
  const existingUser = await users.findOne({
    where: { email: customer.email }
  });

  if (existingUser) {
    return {
      error: true,
      message: 'EMAIL_EXISTS'
    };
  }

  // Generar contraseña temporal si no se proporciona
  const tempPassword = password || Math.random().toString(36).slice(-8);
  const hashedPassword = await encrypt(tempPassword);

  // Crear usuario con rol customer
  const newUser = await users.create({
    name: customer.name,
    email: customer.email,
    password: hashedPassword,
    role: ROLE.CUSTOMER
  });

  // Vincular user al customer
  customer.user_id = newUser.id;
  await customer.save();

  return {
    customer,
    user: newUser,
    tempPassword
  };
};

module.exports = {
  getAllCustomers,
  getCustomer,
  getCustomersByBranch,
  getCustomersByMunicipality,
  addNewCustomer,
  updateCustomer,
  deleteCustomer,
  activatePortal
};
