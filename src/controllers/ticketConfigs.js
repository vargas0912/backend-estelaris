const { matchedData } = require('express-validator');
const { handleHttpError, handleServerError } = require('../utils/handleErorr');
const { getTicketConfigs, resolveTicketConfig, updateTicketConfig } = require('../services/ticketConfigs');
const { TICKET_CONFIG_VALIDATORS } = require('../constants/ticketConfigs');

const getRecords = async (req, res) => {
  try {
    const configs = await getTicketConfigs();
    res.send({ configs });
  } catch (error) {
    handleServerError(res, 'ERROR_GET_TICKET_CONFIGS', error);
  }
};

const resolveRecord = async (req, res) => {
  try {
    const { type } = matchedData(req);
    const resolved = await resolveTicketConfig(type, req.branchId);
    res.send(resolved);
  } catch (error) {
    handleServerError(res, 'ERROR_RESOLVE_TICKET_CONFIG', error);
  }
};

const updateRecord = async (req, res) => {
  try {
    const { type, ...fields } = matchedData(req);

    if (Object.keys(fields).length === 0) {
      handleHttpError(res, TICKET_CONFIG_VALIDATORS.NOTHING_TO_UPDATE, 400);
      return;
    }

    const result = await updateTicketConfig(type, fields);

    if (result && result.data && result.data.msg === 'NOT_FOUND') {
      handleHttpError(res, `TICKET_CONFIG ${type} NOT_FOUND`, 404);
      return;
    }

    res.send({ config: result });
  } catch (error) {
    handleServerError(res, 'ERROR_UPDATE_TICKET_CONFIG', error);
  }
};

module.exports = { getRecords, resolveRecord, updateRecord };
