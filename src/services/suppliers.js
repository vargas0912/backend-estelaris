'use strict';

const { suppliers, municipalities } = require('../models/index');

const attributes = [
  'id',
  'name',
  'trade_name',
  'tax_id',
  'contact_name',
  'email',
  'phone',
  'mobile',
  'address',
  'municipality_id',
  'postal_code',
  'website',
  'payment_terms',
  'credit_limit',
  'notes',
  'is_active',
  'created_at',
  'updated_at'
];

const municipalityAttributes = ['id', 'name'];

const getAllSuppliers = async() => {
  const result = await suppliers.findAll({
    attributes,
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes
      }
    ]
  });

  return result;
};

const getSupplier = async(id) => {
  const result = await suppliers.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: municipalities,
        as: 'municipality',
        attributes: municipalityAttributes
      }
    ]
  });

  return result;
};

const addNewSupplier = async(body) => {
  const result = await suppliers.create(body);

  return result;
};

const updateSupplier = async(id, req) => {
  const {
    name,
    trade_name: tradeName,
    tax_id: taxId,
    contact_name: contactName,
    email,
    phone,
    mobile,
    address,
    municipality_id: municipalityId,
    postal_code: postalCode,
    website,
    payment_terms: paymentTerms,
    credit_limit: creditLimit,
    notes,
    is_active: isActive
  } = req;

  const data = await suppliers.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.trade_name = tradeName !== undefined ? tradeName : data.trade_name;
  data.tax_id = taxId !== undefined ? taxId : data.tax_id;
  data.contact_name = contactName !== undefined ? contactName : data.contact_name;
  data.email = email || data.email;
  data.phone = phone !== undefined ? phone : data.phone;
  data.mobile = mobile !== undefined ? mobile : data.mobile;
  data.address = address !== undefined ? address : data.address;
  data.municipality_id = municipalityId !== undefined ? municipalityId : data.municipality_id;
  data.postal_code = postalCode !== undefined ? postalCode : data.postal_code;
  data.website = website !== undefined ? website : data.website;
  data.payment_terms = paymentTerms !== undefined ? paymentTerms : data.payment_terms;
  data.credit_limit = creditLimit !== undefined ? creditLimit : data.credit_limit;
  data.notes = notes !== undefined ? notes : data.notes;
  data.is_active = isActive !== undefined ? isActive : data.is_active;

  const result = await data.save();
  return result;
};

const deleteSupplier = async(id) => {
  const result = await suppliers.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = {
  getAllSuppliers,
  getSupplier,
  addNewSupplier,
  updateSupplier,
  deleteSupplier
};
