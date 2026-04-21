const { accountingAccounts } = require('../models/index');

const attributes = ['id', 'code', 'name', 'type', 'nature', 'level', 'parent_id', 'allows_movements', 'is_system', 'active', 'created_at', 'updated_at'];

const parentInclude = {
  model: accountingAccounts,
  as: 'parent',
  attributes: ['id', 'code', 'name']
};

const getAllAccounts = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await accountingAccounts.findAndCountAll({
    attributes,
    include: [parentInclude],
    order: [['code', 'ASC']],
    limit,
    offset,
    distinct: true
  });

  return { accounts: rows, total: count };
};

const getAccountsTree = async () => {
  const all = await accountingAccounts.findAll({
    attributes,
    where: { active: true },
    order: [['code', 'ASC']]
  });

  const buildTree = (items, parentId = null) => {
    return items
      .filter(a => a.parent_id === parentId)
      .map(a => ({
        ...a.toJSON(),
        children: buildTree(items, a.id)
      }));
  };

  return buildTree(all);
};

const getAccount = async (id) => {
  return accountingAccounts.findOne({
    attributes,
    include: [parentInclude],
    where: { id }
  });
};

const getAccountByCode = async (code) => {
  return accountingAccounts.findOne({ where: { code } });
};

const addAccount = async (body) => {
  const existing = await getAccountByCode(body.code);
  if (existing) {
    const error = new Error('CODE_DUPLICATE');
    error.status = 422;
    throw error;
  }

  if (body.parent_id) {
    const parent = await accountingAccounts.findByPk(body.parent_id);
    if (!parent) {
      const error = new Error('PARENT_NOT_FOUND');
      error.status = 404;
      throw error;
    }
    if (body.level !== parent.level + 1) {
      const error = new Error('PARENT_LEVEL_MISMATCH');
      error.status = 422;
      throw error;
    }
  }

  return accountingAccounts.create(body);
};

const updateAccount = async (id, body) => {
  const account = await accountingAccounts.findByPk(id);
  if (!account) return null;

  if (body.code && body.code !== account.code) {
    const existing = await getAccountByCode(body.code);
    if (existing) {
      const error = new Error('CODE_DUPLICATE');
      error.status = 422;
      throw error;
    }
  }

  // When journal_entries is implemented: block type change if account has movements
  // const hasMovements = await journalEntryLines.count({ where: { account_id: id } }) > 0;
  // if (body.type && body.type !== account.type && hasMovements) {
  //   const error = new Error('TYPE_CHANGE_NOT_ALLOWED_WITH_MOVEMENTS');
  //   error.status = 422;
  //   throw error;
  // }

  const updatable = ['code', 'name', 'type', 'nature', 'level', 'parent_id', 'allows_movements', 'active'];
  for (const field of updatable) {
    if (body[field] !== undefined) account[field] = body[field];
  }

  return account.save();
};

const deleteAccount = async (id) => {
  const account = await accountingAccounts.findByPk(id);
  if (!account) return null;

  if (account.is_system) {
    const error = new Error('SYSTEM_ACCOUNT_CANNOT_BE_DELETED');
    error.status = 422;
    throw error;
  }

  // When journal_entries is implemented: block delete if account has movements
  // const hasMovements = await journalEntryLines.count({ where: { account_id: id } }) > 0;
  // if (hasMovements) {
  //   const error = new Error('ACCOUNT_HAS_MOVEMENTS');
  //   error.status = 422;
  //   throw error;
  // }

  const hasChildren = await accountingAccounts.count({ where: { parent_id: id, active: true } });
  if (hasChildren) {
    const error = new Error('ACCOUNT_HAS_CHILDREN');
    error.status = 422;
    throw error;
  }

  return account.update({ active: false });
};

module.exports = { getAllAccounts, getAccountsTree, getAccount, addAccount, updateAccount, deleteAccount };
