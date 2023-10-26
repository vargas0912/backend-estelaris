const { request } = require('express');
const { privileges } = require('../models/index');

const getOnePrivilege = async (id) => {
  const result = await privileges.findByPk(id);

  if (!result) {
    return {
      result: {
        msg: 'NOT_FOUND'
      }
    };
  }

  return result;
};

const getPrivilegeByModule = async (module) => {
  const result = await privileges.findAll(
    {
      where: {
        module
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

const getAllPrivileges = async () => {
  const result = await privileges.findAll();

  if (!result) {
    return {
      result: {
        msg: 'NOT_FOUND'
      }
    };
  }

  return result;
};

const addPrivilege = async (body) => {
  const result = await privileges.create(body);

  return result;
};

const updatePrivilege = async (id, req = request) => {
  const { name, codeName, module } = req;

  const data = await privileges.findByPk(id);

  if (!data) {
    return {
      result: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.codeName = codeName || data.codeName;
  data.module = module || data.module;

  const result = await data.save();

  return result;
};

const deletePrivilege = async (id) => {
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
