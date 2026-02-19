const { userBranches } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { ROLE } = require('../constants/roles');
const { BRANCH_SCOPE } = require('../constants/errors');

const branchScope = async(req, res, next) => {
  if (req.user.role === ROLE.SUPERADMIN) {
    req.branchId = null;
    return next();
  }

  const branchId = parseInt(req.headers['x-branch-id'], 10);

  if (!branchId || isNaN(branchId)) {
    return handleHttpError(res, BRANCH_SCOPE.BRANCH_ID_REQUIRED, 400);
  }

  const assignment = await userBranches.findOne({
    where: {
      user_id: req.user.id,
      branch_id: branchId
    }
  });

  if (!assignment) {
    return handleHttpError(res, BRANCH_SCOPE.BRANCH_ACCESS_DENIED, 403);
  }

  req.branchId = branchId;
  next();
};

module.exports = branchScope;
