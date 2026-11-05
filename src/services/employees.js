const { employees, positions, branches, users, privileges, userprivileges, privilegeTemplates, userAuditLogs } = require('../models/index');
const { sequelize } = require('../models/index');
const { encrypt } = require('../utils/handlePassword');
const { generateSecurePassword } = require('./users');
const { applyTemplate } = require('./privilege-templates');
const { PRIVILEGE_TEMPLATE_ERRORS } = require('../constants/privileges');
const { Op } = require('sequelize');

const attributes = ['id', 'name', 'email', 'phone', 'hire_date', 'base_salary', 'active', 'user_id', 'branch_id', 'created_at', 'updated_at'];
const positionAttributes = ['id', 'name'];
const branchAttributes = ['id', 'name'];

const getAllEmployees = async (branchId = null, page = 1, limit = 20, search = '', active = null) => {
  const offset = (page - 1) * limit;
  const where = branchId !== null ? { branch_id: branchId } : {};
  if (search) where.name = { [Op.like]: `%${search}%` };
  if (active !== null) where.active = active;

  const { count, rows } = await employees.findAndCountAll({
    attributes,
    where,
    include: [
      {
        model: positions,
        as: 'position',
        attributes: positionAttributes,
        required: true
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes,
        required: true
      }
    ],
    limit,
    offset,
    distinct: true
  });
  return { employees: rows, total: count };
};

const getEmployee = async (id) => {
  const result = await employees.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: positions,
        as: 'position',
        attributes: positionAttributes,
        required: true
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes,
        required: true
      }
    ]
  });

  return result;
};

const getEmployeesByBranch = async (branchId, page = 1, limit = 20, search = '', active = null) => {
  const offset = (page - 1) * limit;
  const where = { branch_id: branchId };
  if (search) where.name = { [Op.like]: `%${search}%` };
  if (active !== null) where.active = active;

  const { count, rows } = await employees.findAndCountAll({
    attributes,
    where,
    include: [
      {
        model: positions,
        as: 'position',
        attributes: positionAttributes,
        required: true
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes,
        required: true
      }
    ],
    limit,
    offset,
    distinct: true
  });
  return { employees: rows, total: count };
};

const addNewEmployee = async (body) => {
  const result = await employees.create(body);

  return result;
};

const updateEmployee = async (id, req) => {
  const { name, email, phone, hire_date: hireDate, position_id: positionId, branch_id: branchId, active, base_salary: baseSalary } = req;

  const data = await employees.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;
  data.email = email || data.email;
  data.phone = phone !== undefined ? phone : data.phone;
  data.hire_date = hireDate || data.hire_date;
  data.position_id = positionId || data.position_id;
  data.branch_id = branchId || data.branch_id;
  data.active = active !== undefined ? active : data.active;
  if (baseSalary !== undefined) data.base_salary = baseSalary;

  const result = await data.save();
  return result;
};

const deleteEmployee = async (id) => {
  const result = await employees.destroy({
    where: {
      id
    }
  });

  return result;
};

const grantEmployeeAccess = async (id, email, templateId, callerId) => {
  const employee = await employees.findByPk(id);
  if (!employee) return { error: 'EMPLOYEE_NOT_FOUND' };
  if (employee.user_id) return { error: 'EMPLOYEE_ALREADY_HAS_ACCESS' };

  const existingUser = await users.findOne({ where: { email } });
  if (existingUser) return { error: 'EMAIL_ALREADY_IN_USE' };

  if (templateId !== undefined && templateId !== null) {
    const template = await privilegeTemplates.findByPk(templateId);
    if (!template) return { error: PRIVILEGE_TEMPLATE_ERRORS.NOT_FOUND };
  }

  const temporaryPassword = generateSecurePassword();
  const hashedPassword = await encrypt(temporaryPassword);

  const transaction = await sequelize.transaction();

  try {
    const user = await users.create(
      { name: employee.name, email, password: hashedPassword, role: 'user', must_change_password: true },
      { transaction }
    );

    if (templateId !== undefined && templateId !== null) {
      await applyTemplate(templateId, user, 'replace', transaction);
    }

    await employee.update({ user_id: user.id }, { transaction });

    await userAuditLogs.create(
      { action: 'grant_access', caller_id: callerId, target_user_id: user.id },
      { transaction }
    );

    const granted = await userprivileges.findAll({
      where: { user_id: user.id },
      include: [{ model: privileges, as: 'privileges', attributes: ['codename'], required: true }],
      transaction
    });

    await transaction.commit();

    return {
      employee: { id: employee.id, name: employee.name, user_id: user.id },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      privileges: granted.map(g => g.privileges.codename),
      temporaryPassword
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const assignEmployeeAccess = async (id, userId, privilegeCodenames, callerId) => {
  const employee = await employees.findByPk(id);
  if (!employee) return { error: 'EMPLOYEE_NOT_FOUND' };
  if (employee.user_id) return { error: 'EMPLOYEE_ALREADY_HAS_ACCESS' };

  const user = await users.findByPk(userId);
  if (!user) return { error: 'USER_NOT_FOUND' };

  const linkedEmployee = await employees.findOne({ where: { user_id: userId }, attributes: ['id'] });
  if (linkedEmployee) return { error: 'USER_ALREADY_LINKED_TO_EMPLOYEE' };

  const matchedPrivileges = await privileges.findAll({
    where: { codename: { [Op.in]: privilegeCodenames } },
    attributes: ['id', 'codename']
  });

  if (matchedPrivileges.length !== privilegeCodenames.length) {
    return { error: 'INVALID_PRIVILEGES' };
  }

  const transaction = await sequelize.transaction();

  try {
    const existingPrivileges = await userprivileges.findAll({
      where: { user_id: userId, privilege_id: { [Op.in]: matchedPrivileges.map(p => p.id) } },
      attributes: ['privilege_id'],
      transaction
    });
    const existingIds = new Set(existingPrivileges.map(p => p.privilege_id));
    const newPrivileges = matchedPrivileges.filter(p => !existingIds.has(p.id));

    if (newPrivileges.length) {
      await userprivileges.bulkCreate(
        newPrivileges.map(p => ({ user_id: user.id, privilege_id: p.id })),
        { transaction }
      );
    }

    await employee.update({ user_id: user.id }, { transaction });

    await userAuditLogs.create(
      { action: 'assign_access', caller_id: callerId, target_user_id: user.id },
      { transaction }
    );

    await transaction.commit();

    return {
      employee: { id: employee.id, name: employee.name, user_id: user.id },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      privileges: matchedPrivileges.map(p => p.codename)
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const revokeEmployeeAccess = async (id, callerId) => {
  const employee = await employees.findByPk(id);
  if (!employee) return { error: 'EMPLOYEE_NOT_FOUND' };
  if (!employee.user_id) return { error: 'EMPLOYEE_HAS_NO_ACCESS' };

  const transaction = await sequelize.transaction();

  const userId = employee.user_id;

  try {
    await userprivileges.destroy({ where: { user_id: userId }, transaction });
    await users.destroy({ where: { id: userId }, transaction });
    await employee.update({ user_id: null }, { transaction });

    await userAuditLogs.create(
      { action: 'revoke_access', caller_id: callerId, target_user_id: userId },
      { transaction }
    );

    await transaction.commit();
    return { revoked: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = { getAllEmployees, getEmployee, getEmployeesByBranch, addNewEmployee, updateEmployee, deleteEmployee, grantEmployeeAccess, assignEmployeeAccess, revokeEmployeeAccess };
