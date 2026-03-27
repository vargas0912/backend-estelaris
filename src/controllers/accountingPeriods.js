const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllPeriods,
  getCurrentPeriod,
  getPeriod,
  createPeriod,
  closePeriod,
  reopenPeriod,
  lockPeriod
} = require('../services/accountingPeriods');

const getRecords = async (req, res) => {
  try {
    const periods = await getAllPeriods();
    res.send({ periods });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getCurrent = async (req, res) => {
  try {
    const period = await getCurrentPeriod();

    if (!period) {
      handleHttpError(res, 'NO_OPEN_PERIOD', 404);
      return;
    }

    res.send({ period });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_CURRENT -> ${error}`, 400);
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const period = await getPeriod(id);

    if (!period) {
      handleHttpError(res, `ACCOUNTING_PERIOD ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ period });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const addRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const result = await createPeriod(data);

    if (result && result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const closeRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const userId = req.user.id;
    const result = await closePeriod(id, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `ACCOUNTING_PERIOD ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_CLOSE_RECORD --> ${error}`, 400);
  }
};

const reopenRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await reopenPeriod(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `ACCOUNTING_PERIOD ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_REOPEN_RECORD --> ${error}`, 400);
  }
};

const lockRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await lockPeriod(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `ACCOUNTING_PERIOD ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_LOCK_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecords, getCurrent, getRecord, addRecord, closeRecord, reopenRecord, lockRecord };
