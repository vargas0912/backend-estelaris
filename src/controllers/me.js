const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const { getEmployee } = require('../services/employees');
const { getPayrollLinesByEmployee, getPayrollLineByEmployee } = require('../services/payrollLines');
const { getVacationsByEmployee, requestVacation } = require('../services/employeeVacations');
const { getLoansByEmployee, requestLoan } = require('../services/employeeLoans');

const getProfile = async (req, res) => {
  try {
    const employee = await getEmployee(req.employee.id);
    res.send({ employee });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_PROFILE -> ${error}`, 400);
  }
};

const getPayroll = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams({ page: req.query.page, limit: req.query.limit });
    const { lines, total } = await getPayrollLinesByEmployee(req.employee.id, page, limit);
    res.send(buildPaginationResponse('payrollLines', lines, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_PAYROLL -> ${error}`, 400);
  }
};

const getPayrollLine = async (req, res) => {
  try {
    const lineId = req.params.line_id;
    const line = await getPayrollLineByEmployee(lineId, req.employee.id);

    if (!line) {
      handleHttpError(res, `PAYROLL_LINE ${lineId} NOT EXISTS`, 404);
      return;
    }

    res.send({ line });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_PAYROLL_LINE -> ${error}`, 400);
  }
};

const getVacations = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams({ page: req.query.page, limit: req.query.limit });
    const { vacations, total } = await getVacationsByEmployee(req.employee.id, page, limit);
    res.send(buildPaginationResponse('vacations', vacations, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_VACATIONS -> ${error}`, 400);
  }
};

const createVacationRequest = async (req, res) => {
  try {
    const validatedData = matchedData(req);
    const vacation = await requestVacation(validatedData, req.employee.id);
    res.status(201).send({ vacation });
  } catch (error) {
    handleHttpError(res, `ERROR_REQUEST_VACATION -> ${error}`, 400);
  }
};

const getLoans = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams({ page: req.query.page, limit: req.query.limit });
    const { loans, total } = await getLoansByEmployee(req.employee.id, page, limit);
    res.send(buildPaginationResponse('loans', loans, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_LOANS -> ${error}`, 400);
  }
};

const createLoanRequest = async (req, res) => {
  try {
    const validatedData = matchedData(req);
    const loan = await requestLoan(
      { ...validatedData, employee_id: req.employee.id, branch_id: req.employee.branch_id },
      req.user.id
    );
    res.status(201).send({ loan });
  } catch (error) {
    handleHttpError(res, `ERROR_REQUEST_LOAN -> ${error}`, 400);
  }
};

module.exports = { getProfile, getPayroll, getPayrollLine, getVacations, createVacationRequest, getLoans, createLoanRequest };
