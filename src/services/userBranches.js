const { userBranches, branches, users } = require('../models/index');

const branchAttributes = ['id', 'name', 'address', 'phone'];
const userAttributes = ['id', 'name', 'email', 'role'];

const getBranchesByUser = async(userId) => {
  const result = await userBranches.findAll({
    where: { user_id: userId },
    include: [
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ]
  });

  return result;
};

const getUsersByBranch = async(branchId) => {
  const result = await userBranches.findAll({
    where: { branch_id: branchId },
    include: [
      {
        model: users,
        as: 'user',
        attributes: userAttributes
      }
    ]
  });

  return result;
};

const getUserBranch = async(id) => {
  const result = await userBranches.findOne({
    where: { id },
    include: [
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
    ]
  });

  return result;
};

const assignBranch = async(body) => {
  const { user_id: userId, branch_id: branchId } = body;

  const existing = await userBranches.findOne({
    where: { user_id: userId, branch_id: branchId }
  });

  if (existing) {
    return { error: 'ASSIGNMENT_ALREADY_EXISTS' };
  }

  const result = await userBranches.create(body);
  return result;
};

const removeBranch = async(id) => {
  const result = await userBranches.destroy({ where: { id } });
  return result;
};

module.exports = {
  getBranchesByUser,
  getUsersByBranch,
  getUserBranch,
  assignBranch,
  removeBranch
};
