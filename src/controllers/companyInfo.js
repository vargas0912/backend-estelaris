const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getCompanyInfo, updateCompanyInfo } = require('../services/companyInfo');

const getRecord = async (req, res) => {
  try {
    const companyInfo = await getCompanyInfo();

    if (!companyInfo) {
      handleHttpError(res, 'COMPANY_INFO_NOT_FOUND', 404);
      return;
    }

    res.send({ companyInfo });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_COMPANY_INFO -> ${error}`, 500);
  }
};

const updateRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const result = await updateCompanyInfo(data);

    if (result && result.data && result.data.msg === 'NOT_FOUND') {
      handleHttpError(res, 'COMPANY_INFO_NOT_FOUND', 404);
      return;
    }

    res.send({ companyInfo: result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_COMPANY_INFO -> ${error}`, 400);
  }
};

module.exports = { getRecord, updateRecord };
