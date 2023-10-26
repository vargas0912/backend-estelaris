// const { request } = require('express');

const { privileges, userPrivileges } = require('../models/index');

const getAllUserPrivileges = async (userId) => {
  const result = await userPrivileges.findAll({
    attributes: ['id', 'user_id', 'privilege_id'],
    where: {
      user_id: userId
    },
    include: [
      {
        model: privileges,
        attributes: ['name', 'codeName']
      }
    ]
  });

  return result;
};

const getOneUserPrivilege = async (userId, codename) => {
  const result = await userPrivileges.count({
    where: {
      user_id: userId
    },
    include: [
      {
        model: privileges,
        where: {
          codename
        }
      }
    ]
  });

  return result > 0;
};

const addNewUserPrivilege = async (body) => {
  const result = await userPrivileges.create(body);

  return result;
};

const deleteUserPrivilege = async (userId, privilegeId) => {
  const result = await userPrivileges.destroy({
    where: {
      user_id: userId,
      privilege_id: privilegeId
    }
  });

  if (!result) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  return result;
};

module.exports = {
  getOneUserPrivilege,
  getAllUserPrivileges,
  addNewUserPrivilege,
  deleteUserPrivilege
};
