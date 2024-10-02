const { privileges, userprivileges } = require('../models/index');

const getAllUserPrivileges = async(userId) => {
  const allPrivileges = await userprivileges.findAll({
    attributes: ['id', 'userId', 'privilegeId'],
    where: {
      userId
    },
    include: [
      {
        model: privileges,
        attributes: ['name', 'codeName']
      }
    ]
  });

  return allPrivileges;
};

const getOneUserPrivilege = async(userId, codeName) => {
  const datePrivileges = await userprivileges.count({
    where: {
      userId
    },
    include: [
      {
        model: privileges,
        where: {
          codeName
        }
      }
    ]
  });

  return datePrivileges > 0;
};

const addNewUserPrivilege = async(body) => {
  const privilege = await userprivileges.create(body);

  return privilege;
};

const deleteUserPrivilege = async(userId, privilegeId) => {
  const userPrivilege = await userprivileges.destroy({
    where: {
      userId,
      privilegeId
    }
  });

  if (!userPrivilege) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  return userPrivilege;
};

module.exports = {
  getOneUserPrivilege,
  getAllUserPrivileges,
  addNewUserPrivilege,
  deleteUserPrivilege
};
