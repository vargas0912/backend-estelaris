const { payrollPeriods, payrollLines, employeeLoans, loanPayments, employees, branches, users } = require('../models/index');
const { sequelize } = require('../models/index');
const { Op } = require('sequelize');
const accountingEngine = require('./accountingEngine.service');

// ---------------------------------------------------------------------------
// Atributos y configuración de includes
// ---------------------------------------------------------------------------

const periodAttributes = ['id', 'branch_id', 'name', 'start_date', 'end_date', 'payment_date', 'frequency', 'status', 'total_gross', 'total_deductions', 'total_net', 'user_id', 'created_at', 'updated_at'];
const lineAttributes = ['id', 'payroll_period_id', 'employee_id', 'base_salary', 'worked_days', 'gross_pay', 'loan_deduction', 'other_deductions', 'net_pay', 'payment_method', 'reference_number', 'status', 'notes'];
const employeeAttributes = ['id', 'name', 'email', 'base_salary'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];

// ---------------------------------------------------------------------------
// getAllPeriods
// ---------------------------------------------------------------------------

const getAllPeriods = async (branchId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await payrollPeriods.findAndCountAll({
    attributes: periodAttributes,
    where: { branch_id: branchId },
    include: [
      { model: branches, as: 'branch', attributes: branchAttributes },
      { model: users, as: 'createdBy', attributes: userAttributes }
    ],
    order: [['payment_date', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { periods: rows, total: count };
};

// ---------------------------------------------------------------------------
// getPeriod
// ---------------------------------------------------------------------------

const getPeriod = async (id) => {
  const result = await payrollPeriods.findOne({
    attributes: periodAttributes,
    where: { id },
    include: [
      { model: branches, as: 'branch', attributes: branchAttributes },
      { model: users, as: 'createdBy', attributes: userAttributes },
      {
        model: payrollLines,
        as: 'lines',
        attributes: lineAttributes,
        include: [
          { model: employees, as: 'employee', attributes: employeeAttributes }
        ]
      }
    ]
  });

  return result;
};

// ---------------------------------------------------------------------------
// generatePeriod
// ---------------------------------------------------------------------------

const generatePeriod = async (body, branchId, userId) => {
  const { name, start_date: startDate, end_date: endDate, payment_date: paymentDate, frequency } = body;

  // 1. Obtener empleados activos de la sucursal
  const activeEmployees = await employees.findAll({
    where: { branch_id: branchId, active: true }
  });

  if (!activeEmployees.length) {
    return { error: 'NO_ACTIVE_EMPLOYEES' };
  }

  const transaction = await sequelize.transaction();

  try {
    // 2. Crear el período en estado Borrador con totales en 0
    const period = await payrollPeriods.create({
      branch_id: branchId,
      user_id: userId,
      name,
      start_date: startDate,
      end_date: endDate,
      payment_date: paymentDate,
      frequency,
      status: 'Borrador',
      total_gross: 0,
      total_deductions: 0,
      total_net: 0
    }, { transaction });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    // 3. Batch: un query para todos los préstamos activos de la sucursal
    const allEmployeeIds = activeEmployees.map(e => e.id);
    const allActiveLoans = await employeeLoans.findAll({
      where: { employee_id: { [Op.in]: allEmployeeIds }, status: 'Activo' },
      transaction
    });
    const loansByEmployee = allActiveLoans.reduce((acc, loan) => {
      (acc[loan.employee_id] = acc[loan.employee_id] || []).push(loan);
      return acc;
    }, {});

    // 4. Crear una línea de nómina por cada empleado activo
    for (const employee of activeEmployees) {
      const grossPay = parseFloat(employee.base_salary);
      const activeLoans = loansByEmployee[employee.id] || [];

      // Calcular descuento por préstamos, capado al salario bruto
      let remaining = grossPay;
      let loanDeduction = 0;

      for (const loan of activeLoans) {
        const take = Math.min(remaining, parseFloat(loan.installment_amount));
        loanDeduction = parseFloat((loanDeduction + take).toFixed(2));
        remaining = parseFloat((remaining - take).toFixed(2));
        if (remaining <= 0) break;
      }

      const netPay = parseFloat((grossPay - loanDeduction).toFixed(2));

      await payrollLines.create({
        payroll_period_id: period.id,
        employee_id: employee.id,
        base_salary: employee.base_salary,
        worked_days: 0,
        gross_pay: grossPay,
        loan_deduction: loanDeduction,
        other_deductions: 0,
        net_pay: netPay,
        status: 'Pendiente'
      }, { transaction });

      totalGross = parseFloat((totalGross + grossPay).toFixed(2));
      totalDeductions = parseFloat((totalDeductions + loanDeduction).toFixed(2));
      totalNet = parseFloat((totalNet + netPay).toFixed(2));
    }

    // 4. Actualizar totales del período
    period.total_gross = totalGross;
    period.total_deductions = totalDeductions;
    period.total_net = totalNet;
    await period.save({ transaction });

    await transaction.commit();

    // Devolver el período completo con sus líneas
    return getPeriod(period.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ---------------------------------------------------------------------------
// updatePeriod
// ---------------------------------------------------------------------------

const updatePeriod = async (id, body) => {
  const { name, payment_date: paymentDate, frequency } = body;

  const period = await payrollPeriods.findByPk(id);

  if (!period) {
    return { error: 'NOT_FOUND' };
  }

  if (period.status !== 'Borrador') {
    return { error: 'PERIOD_NOT_EDITABLE' };
  }

  if (name !== undefined) period.name = name;
  if (paymentDate !== undefined) period.payment_date = paymentDate;
  if (frequency !== undefined) period.frequency = frequency;

  const result = await period.save();
  return result;
};

// ---------------------------------------------------------------------------
// approvePeriod
// ---------------------------------------------------------------------------

const approvePeriod = async (id, userId) => {
  const period = await payrollPeriods.findByPk(id);

  if (!period) {
    return { error: 'NOT_FOUND' };
  }

  if (period.status !== 'Borrador') {
    return { error: 'PERIOD_NOT_IN_DRAFT' };
  }

  const transaction = await sequelize.transaction();

  try {
    // Obtener todas las líneas del período con bloqueo
    const lines = await payrollLines.findAll({
      where: { payroll_period_id: period.id },
      lock: true,
      transaction
    });

    // Bulk update: marcar todas las líneas como Pagado en un solo query
    await payrollLines.update(
      { status: 'Pagado' },
      { where: { payroll_period_id: period.id }, transaction }
    );

    // Batch: un query para los préstamos activos de empleados con descuento
    const linesWithDeductions = lines.filter(l => parseFloat(l.loan_deduction) > 0);
    const employeeIdsWithDeductions = [...new Set(linesWithDeductions.map(l => l.employee_id))];

    if (employeeIdsWithDeductions.length > 0) {
      const activeLoansAll = await employeeLoans.findAll({
        where: { employee_id: { [Op.in]: employeeIdsWithDeductions }, status: 'Activo' },
        order: [['id', 'ASC']],
        lock: true,
        transaction
      });
      const loansByEmployee = activeLoansAll.reduce((acc, loan) => {
        (acc[loan.employee_id] = acc[loan.employee_id] || []).push(loan);
        return acc;
      }, {});

      for (const line of linesWithDeductions) {
        const loansForEmployee = loansByEmployee[line.employee_id] || [];
        let remaining = parseFloat(line.loan_deduction);

        for (const loan of loansForEmployee) {
          if (remaining <= 0) break;

          const loanBalance = parseFloat(loan.balance);
          const applied = parseFloat(Math.min(remaining, loanBalance).toFixed(2));

          if (applied <= 0) continue;

          await loanPayments.create({
            loan_id: loan.id,
            payroll_line_id: line.id,
            amount: applied,
            payment_date: period.payment_date
          }, { transaction });

          const newBalance = parseFloat((loanBalance - applied).toFixed(2));
          loan.balance = newBalance;
          if (newBalance <= 0) loan.status = 'Liquidado';
          await loan.save({ transaction });

          remaining = parseFloat((remaining - applied).toFixed(2));
        }
      }
    }

    // Marcar el período como Pagado
    period.status = 'Pagado';
    await period.save({ transaction });

    await transaction.commit();

    // Fire-and-forget: generar póliza contable
    accountingEngine.generateFromPayroll(period.id).catch(err =>
      console.error('[AccountingEngine] Error generando póliza:', err.message)
    );

    return getPeriod(period.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ---------------------------------------------------------------------------
// deletePeriod
// ---------------------------------------------------------------------------

const deletePeriod = async (id) => {
  const period = await payrollPeriods.findByPk(id);

  if (!period) {
    return { error: 'NOT_FOUND' };
  }

  if (period.status !== 'Borrador') {
    return { error: 'PERIOD_NOT_DELETABLE' };
  }

  const transaction = await sequelize.transaction();

  try {
    await payrollLines.destroy({ where: { payroll_period_id: id }, transaction });
    const result = await payrollPeriods.destroy({ where: { id }, transaction });

    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ---------------------------------------------------------------------------

module.exports = { getAllPeriods, getPeriod, generatePeriod, updatePeriod, approvePeriod, deletePeriod };
