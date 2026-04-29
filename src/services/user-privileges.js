const { privileges, userprivileges } = require('../models/index');
// const { getAllUserPrivileges } = require(' ./services/user-privileges');

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
        attributes: ['name', 'codename'],
        required: true // INNER JOIN - solo trae privilegios NO eliminados
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
        as: 'privileges',
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

const copyPrivilegesFromTemplate = async(templateUserId, targetUserId) => {
  const templatePrivileges = await userprivileges.findAll({
    attributes: ['privilege_id'],
    where: { user_id: templateUserId },
    include: [
      {
        model: privileges,
        as: 'privileges',
        attributes: [],
        required: true
      }
    ]
  });

  if (templatePrivileges.length === 0) {
    return 0;
  }

  // eslint-disable-next-line camelcase
  const records = templatePrivileges.map(({ privilege_id }) => ({
    user_id: targetUserId,
    // eslint-disable-next-line camelcase
    privilege_id
  }));

  const created = await userprivileges.bulkCreate(records, { ignoreDuplicates: true });

  return created.length;
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
  deleteUserPrivilege,
  copyPrivilegesFromTemplate
};
