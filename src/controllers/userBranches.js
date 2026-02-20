const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getBranchesByUser,
  getUsersByBranch,
  getUserBranch,
  assignBranch,
  removeBranch
} = require('../services/userBranches');

const getRecordsByUser = async(req, res) => {
  try {
    const { user_id: userId } = matchedData(req);
    const assignments = await getBranchesByUser(userId);
    res.send({ assignments });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_USER_BRANCHES -> ${error}`);
  }
};

const getRecordsByBranch = async(req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const assignments = await getUsersByBranch(branchId);
    res.send({ assignments });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_BRANCH_USERS -> ${error}`);
  }
};

const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const assignment = await getUserBranch(id);

    if (!assignment) {
      handleHttpError(res, 'ASSIGNMENT_NOT_FOUND', 404);
      return;
    }

    res.send({ assignment });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_USER_BRANCH -> ${error}`, 400);
  }
};

const addRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const result = await assignBranch(body);

    if (result?.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ assignment: result });
  } catch (error) {
    handleHttpError(res, `ERROR_ASSIGN_BRANCH -> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await removeBranch(id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_REMOVE_BRANCH -> ${error}`, 400);
  }
};

module.exports = {
  getRecordsByUser,
  getRecordsByBranch,
  getRecord,
  addRecord,
  deleteRecord
};
