const { employees, positions, branches } = require('../models/index');

const attributes = ['id', 'name', 'email', 'phone', 'hire_date', 'active', 'created_at', 'updated_at'];
const positionAttributes = ['id', 'name'];
const branchAttributes = ['id', 'name'];

const getAllEmployees = async() => {
  const result = await employees.findAll({
    attributes,
    include: [
      {
        model: positions,
        as: 'position',
        attributes: positionAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ]
  });

  return result;
};

const getEmployee = async(id) => {
  const result = await employees.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: positions,
        as: 'position',
        attributes: positionAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ]
  });

  return result;
};

const addNewEmployee = async(body) => {
  const result = await employees.create(body);

  return result;
};

const updateEmployee = async(id, req) => {
  const { name, email, phone, hire_date: hireDate, position_id: positionId, branch_id: branchId, active } = req;

  const data = await employees.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.email = email || data.email;
  data.phone = phone !== undefined ? phone : data.phone;
  data.hire_date = hireDate || data.hire_date;
  data.position_id = positionId || data.position_id;
  data.branch_id = branchId || data.branch_id;
  data.active = active !== undefined ? active : data.active;

  const result = await data.save();
  return result;
};

const deleteEmployee = async(id) => {
  const result = await employees.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = { getAllEmployees, getEmployee, addNewEmployee, updateEmployee, deleteEmployee };
