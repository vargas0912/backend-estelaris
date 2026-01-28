const { privileges, userprivileges } = require('../models/index');

const getAllUserPrivileges = async(userId) => {
  const allPrivileges = await userprivileges.findAll({
    attributes: ['id', 'user_id', 'privilege_id'],
    where: {
      user_id: userId
    },
    include: [
      {
        model: privileges,
        as: 'privileges',
        attributes: ['name', 'codename']
      }
    ]
  });

  return allPrivileges;
};

const getOneUserPrivilege = async(userId, codeName) => {
  const datePrivileges = await userprivileges.count({
    where: {
      user_id: userId
    },
    include: [
      {
        model: privileges,
        where: {
          codename: codeName
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
      user_id: userId,
      privilege_id: privilegeId
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
