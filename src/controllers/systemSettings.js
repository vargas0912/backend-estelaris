const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');
const { getSystemSettings, getSystemSetting, updateSystemSetting } = require('../services/systemSettings');

const getRecords = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const category = data.category || undefined;
    const { settings, total } = await getSystemSettings(category, page, limit);
    res.send(buildPaginationResponse('settings', settings, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_SETTINGS -> ${error}`, 500);
  }
};

const getRecord = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await getSystemSetting(key);

    if (!setting) {
      handleHttpError(res, `SETTING ${key} NOT_FOUND`, 404);
      return;
    }

    res.send({ setting });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_SETTING -> ${error}`, 400);
  }
};

const updateRecord = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = matchedData(req);

    const result = await updateSystemSetting(key, value);

    if (result && result.data && result.data.msg === 'NOT_FOUND') {
      handleHttpError(res, `SETTING ${key} NOT_FOUND`, 404);
      return;
    }

    res.send({ setting: result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_SETTING -> ${error}`, 400);
  }
};

module.exports = { getRecords, getRecord, updateRecord };
