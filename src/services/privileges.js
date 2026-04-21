const { request } = require('express');
const { privileges } = require('../models/index');

const getOnePrivilege = async(id) => {
  const result = await privileges.findByPk(id);

  return result;
};

const getPrivilegeByModule = async(module, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await privileges.findAndCountAll({
    where: { module },
    limit,
    offset
  });

  return { privileges: rows, total: count };
};

const getAllPrivileges = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await privileges.findAndCountAll({
    limit,
    offset
  });

  return { privileges: rows, total: count };
};

const addPrivilege = async(body) => {
  const result = await privileges.create(body);

  return result;
};

const updatePrivilege = async(id, req = request) => {
  const { name, codename, module } = req;

  const data = await privileges.findByPk(id);

  if (!data) {
    return {
      result: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.codename = codename || data.codename;
  data.module = module || data.module;

  const result = await data.save();

  return result;
};

const deletePrivilege = async(id) => {
  const result = await privileges.destroy({
    where: {
      id
    }
  });

  if (!result) {
    return {
      result: {
        msg: 'NOT_FOUND'
      }
    };
  }

  return result;
};

module.exports = {
  getOnePrivilege,
  getAllPrivileges,
  getPrivilegeByModule,
  updatePrivilege,
  addPrivilege,
  deletePrivilege
};
