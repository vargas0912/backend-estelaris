const { employees } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');

/**
 * Middleware que verifica que el usuario autenticado tiene un empleado vinculado.
 * Establece req.employee con el registro completo del empleado.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const employeeScope = async (req, res, next) => {
  try {
    const employee = await employees.findOne({ where: { user_id: req.user.id }, attributes: ['id', 'branch_id'] });

    if (!employee) {
      return handleHttpError(res, 'EMPLOYEE_SCOPE_NO_EMPLOYEE', 403);
    }

    req.employee = employee;
    next();
  } catch (error) {
    return handleHttpError(res, 'EMPLOYEE_SCOPE_ERROR', 500);
  }
};

module.exports = employeeScope;
