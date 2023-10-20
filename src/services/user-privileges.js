const { privileges, userPrivileges } = require('../models/index');

const getAllUserPrivileges = async (userId) => {
  const allPprivileges = await userPrivileges.findAll({
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

  return allPprivileges;
};

const getOneUserPrivilege = async (userId, codeName) => {
  const datePrivileges = await userPrivileges.count({
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

const addNewUserPrivilege = async (body) => {
  const privilege = await userPrivileges.create(body);

  return privilege;
};

const deleteUserPrivilege = async (userId, privilegeId) => {
  const userPrivilege = await userPrivileges.destroy({
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
