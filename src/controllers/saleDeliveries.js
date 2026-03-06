const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getDelivery,
  getDeliveriesBySale,
  getDeliveriesAssignedToMe,
  createDelivery,
  transitionDelivery,
  deleteDelivery
} = require('../services/saleDeliveries');

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const delivery = await getDelivery(id);

    if (!delivery) {
      handleHttpError(res, `DELIVERY ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ delivery });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const getRecordsBySale = async (req, res) => {
  try {
    const { sale_id: saleId } = matchedData(req);
    const deliveries = await getDeliveriesBySale(saleId);
    res.send({ deliveries });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_SALE -> ${error}`, 400);
  }
};

const getAssignedToMe = async (req, res) => {
  try {
    const deliveries = await getDeliveriesAssignedToMe(req.user.id);

    if (deliveries === null) {
      handleHttpError(res, 'EMPLOYEE_NOT_LINKED_TO_USER', 404);
      return;
    }

    res.send({ deliveries });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_ASSIGNED_TO_ME -> ${error}`, 400);
  }
};

const addRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const delivery = await createDelivery(data, userId);

    if (delivery && delivery.error) {
      const status = delivery.error === 'SALE_NOT_FOUND' || delivery.error === 'ADDRESS_NOT_FOUND' ? 404 : 422;
      handleHttpError(res, delivery.error, status);
      return;
    }

    res.send({ delivery });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const makeTransition = (targetStatus) => async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const result = await transitionDelivery(data.id, targetStatus, data, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `DELIVERY ${data.id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ delivery: result });
  } catch (error) {
    handleHttpError(res, `ERROR_TRANSITION_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteDelivery(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `DELIVERY ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  getRecord,
  getRecordsBySale,
  getAssignedToMe,
  addRecord,
  pickupRecord: makeTransition('Recolectado'),
  shipRecord: makeTransition('En_Transito'),
  outRecord: makeTransition('En_Ruta_Entrega'),
  deliverRecord: makeTransition('Entregado'),
  returnRecord: makeTransition('Devuelto'),
  deleteRecord
};
