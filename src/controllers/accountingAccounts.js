const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getAllAccounts, getAccountsTree, getAccount, addAccount, updateAccount, deleteAccount } = require('../services/accountingAccounts');

const getRecords = async (req, res) => {
  try {
    const accounts = await getAllAccounts();
    res.send({ accounts });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getTree = async (req, res) => {
  try {
    const tree = await getAccountsTree();
    res.send({ tree });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_TREE -> ${error}`);
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const account = await getAccount(id);

    if (!account) {
      handleHttpError(res, `ACCOUNTING_ACCOUNT ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ account });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const addRecord = async (req, res) => {
  try {
    const body = matchedData(req);
    const account = await addAccount(body);
    res.send({ account });
  } catch (error) {
    const status = error.status || 400;
    handleHttpError(res, `ERROR_ADDING_RECORD -> ${error.message}`, status);
  }
};

const updateRecord = async (req, res) => {
  try {
    const body = matchedData(req);
    const account = await updateAccount(body.id, body);

    if (!account) {
      handleHttpError(res, `ACCOUNTING_ACCOUNT ${body.id} NOT EXISTS`, 404);
      return;
    }

    res.send({ account });
  } catch (error) {
    const status = error.status || 400;
    handleHttpError(res, `ERROR_UPDATE_RECORD -> ${error.message}`, status);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteAccount(id);

    if (!result) {
      handleHttpError(res, `ACCOUNTING_ACCOUNT ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ result });
  } catch (error) {
    const status = error.status || 400;
    handleHttpError(res, `ERROR_DELETE_RECORD -> ${error.message}`, status);
  }
};

module.exports = { getRecords, getTree, getRecord, addRecord, updateRecord, deleteRecord };
