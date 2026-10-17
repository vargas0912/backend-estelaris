const {
  sequelize,
  privilegeTemplates,
  privilegeTemplateItems,
  userprivileges,
  users,
  privileges
} = require('../models/index');
const { PRIVILEGE_TEMPLATE_ERRORS: ERR } = require('../constants/privileges');

/**
 * Builds an Error carrying an HTTP status so controllers can map it.
 * @param {string} message Error key
 * @param {number} status HTTP status code
 * @returns {Error}
 */
const fail = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const unique = (list) => [...new Set(list.map(Number))];

/**
 * Returns the privilege ids that belong to a template (soft-deleted privileges excluded).
 * @param {number} templateId Template id
 * @param {object} [transaction] Sequelize transaction
 * @returns {Promise<number[]>}
 */
const getTemplatePrivilegeIds = async(templateId, transaction) => {
  const rows = await privilegeTemplateItems.findAll({
    attributes: ['privilege_id'],
    where: { template_id: templateId },
    include: [{ model: privileges, as: 'privilege', attributes: [], required: true }],
    transaction
  });

  return unique(rows.map(r => r.privilege_id));
};

/**
 * Verifies that every privilege id exists.
 * @param {number[]} ids Unique privilege ids
 * @throws {Error} 400 INVALID_PRIVILEGE_IDS
 */
const assertPrivilegesExist = async(ids) => {
  if (!ids.length) return;
  const found = await privileges.count({ where: { id: ids } });
  if (found !== ids.length) {
    throw fail(ERR.INVALID_PRIVILEGES, 400);
  }
};

const formatTemplate = (instance) => {
  const { items, ...rest } = instance.toJSON();
  return { ...rest, privileges: (items || []).map(i => i.privilege).filter(Boolean) };
};

/**
 * Lists all templates with privilege and assigned-user counts.
 * @returns {Promise<object[]>}
 */
const getAllTemplates = async() => {
  const templates = await privilegeTemplates.findAll({
    include: [{ model: privilegeTemplateItems, as: 'items', attributes: ['privilege_id'], required: false }],
    order: [['id', 'ASC']]
  });

  const plain = templates.map(t => t.toJSON());
  const assigned = plain.length
    ? await users.findAll({ attributes: ['template_id'], where: { template_id: plain.map(t => t.id) } })
    : [];

  return plain.map(({ items, ...rest }) => ({
    ...rest,
    privileges_count: (items || []).length,
    users_count: assigned.filter(u => u.template_id === rest.id).length
  }));
};

/**
 * Gets one template with its privileges.
 * @param {number} id Template id
 * @returns {Promise<object|null>} Template or null when it does not exist
 */
const getTemplateById = async(id) => {
  const template = await privilegeTemplates.findByPk(id, {
    include: [{
      model: privilegeTemplateItems,
      as: 'items',
      required: false,
      include: [{ model: privileges, as: 'privilege', attributes: ['id', 'name', 'codename', 'module'], required: true }]
    }]
  });

  return template ? formatTemplate(template) : null;
};

/**
 * Creates a template (version 1) with its privileges.
 * @param {{name: string, description?: string, privileges?: number[]}} body Template data
 * @returns {Promise<object>} Created template
 */
const createTemplate = async(body) => {
  const ids = unique(body.privileges || []);
  await assertPrivilegesExist(ids);

  const id = await sequelize.transaction(async(t) => {
    const template = await privilegeTemplates.create(
      { name: body.name, description: body.description, version: 1 },
      { transaction: t }
    );

    if (ids.length) {
      await privilegeTemplateItems.bulkCreate(
        ids.map(privilegeId => ({ template_id: template.id, privilege_id: privilegeId })),
        { transaction: t }
      );
    }

    return template.id;
  });

  return getTemplateById(id);
};

/**
 * Updates a template. The version is bumped only when the privilege set changes.
 * Never propagates changes to users (see syncTemplate).
 * @param {number} id Template id
 * @param {{name?: string, description?: string, privileges?: number[]}} body Fields to update
 * @returns {Promise<object>} Updated template
 */
const updateTemplate = async(id, body) => {
  const template = await privilegeTemplates.findByPk(id);
  if (!template) throw fail(ERR.NOT_FOUND, 404);

  const newIds = body.privileges ? unique(body.privileges) : null;
  if (newIds) await assertPrivilegesExist(newIds);

  await sequelize.transaction(async(t) => {
    const fields = {};
    if (body.name !== undefined) fields.name = body.name;
    if (body.description !== undefined) fields.description = body.description;

    if (newIds) {
      const currentIds = await getTemplatePrivilegeIds(id, t);
      const removed = currentIds.filter(x => !newIds.includes(x));
      const added = newIds.filter(x => !currentIds.includes(x));

      if (removed.length) {
        await privilegeTemplateItems.destroy({ where: { template_id: id, privilege_id: removed }, transaction: t });
      }
      if (added.length) {
        await privilegeTemplateItems.bulkCreate(
          added.map(privilegeId => ({ template_id: id, privilege_id: privilegeId })),
          { transaction: t }
        );
      }
      if (removed.length || added.length) fields.version = template.version + 1;
    }

    if (Object.keys(fields).length) await template.update(fields, { transaction: t });
  });

  return getTemplateById(id);
};

/**
 * Soft-deletes a template. Blocked while users are assigned to it.
 * @param {number} id Template id
 * @returns {Promise<{id: number}>}
 */
const deleteTemplate = async(id) => {
  const template = await privilegeTemplates.findByPk(id);
  if (!template) throw fail(ERR.NOT_FOUND, 404);

  const assigned = await users.count({ where: { template_id: id } });
  if (assigned > 0) throw fail(ERR.HAS_USERS, 409);

  await sequelize.transaction(async(t) => {
    await privilegeTemplateItems.destroy({ where: { template_id: id }, transaction: t });
    await template.destroy({ transaction: t });
  });

  return { id };
};

/**
 * Applies a template to a user.
 * - replace: removes ALL the user's privileges, then copies the template.
 * - merge: adds only the missing privileges; existing ones stay manual.
 * Rows from the user's previous template are always removed first.
 * @param {number} templateId Template id
 * @param {object} user users model instance (target)
 * @param {'replace'|'merge'} mode Apply mode
 * @returns {Promise<{user_id: number, template_id: number, version: number, mode: string, added: number}>}
 */
const applyTemplate = async(templateId, user, mode) => {
  const template = await privilegeTemplates.findByPk(templateId);
  if (!template) throw fail(ERR.NOT_FOUND, 404);

  return sequelize.transaction(async(t) => {
    const ids = await getTemplatePrivilegeIds(template.id, t);

    let existing = [];
    if (mode === 'replace') {
      await userprivileges.destroy({ where: { user_id: user.id }, transaction: t });
    } else {
      if (user.template_id && user.template_id !== template.id) {
        await userprivileges.destroy({ where: { user_id: user.id, source_template_id: user.template_id }, transaction: t });
      } else if (user.template_id === template.id) {
        const sourceRows = await userprivileges.findAll({ where: { user_id: user.id, source_template_id: template.id }, transaction: t });
        const stale = sourceRows.filter(r => !ids.includes(r.privilege_id)).map(r => r.id);
        if (stale.length) await userprivileges.destroy({ where: { id: stale }, transaction: t });
      }
      existing = await userprivileges.findAll({ where: { user_id: user.id }, attributes: ['privilege_id'], transaction: t });
    }

    const existingIds = existing.map(r => r.privilege_id);
    const toAdd = ids.filter(x => !existingIds.includes(x));

    if (toAdd.length) {
      await userprivileges.bulkCreate(
        toAdd.map(privilegeId => ({ user_id: user.id, privilege_id: privilegeId, source_template_id: template.id })),
        { transaction: t }
      );
    }

    await user.update({ template_id: template.id, template_applied_version: template.version }, { transaction: t });

    return { user_id: user.id, template_id: template.id, version: template.version, mode, added: toAdd.length };
  });
};

const diffUser = (templateIds, rows) => {
  const source = unique(rows.filter(r => r.source_template_id).map(r => r.privilege_id));
  const manual = unique(rows.filter(r => !r.source_template_id).map(r => r.privilege_id));
  return {
    added: templateIds.filter(x => !source.includes(x) && !manual.includes(x)),
    removed: source.filter(x => !templateIds.includes(x)),
    kept_manual: templateIds.filter(x => manual.includes(x))
  };
};

/**
 * Previews what a sync would change for every user assigned to the template.
 * @param {number} templateId Template id
 * @returns {Promise<object|null>} Preview or null when the template does not exist
 */
const getSyncPreview = async(templateId) => {
  const template = await privilegeTemplates.findByPk(templateId);
  if (!template) return null;

  const templateIds = await getTemplatePrivilegeIds(template.id);
  const assigned = await users.findAll({
    attributes: ['id', 'name', 'email', 'role', 'template_applied_version'],
    where: { template_id: template.id }
  });

  const rows = assigned.length
    ? await userprivileges.findAll({
      attributes: ['user_id', 'privilege_id', 'source_template_id'],
      where: { user_id: assigned.map(u => u.id) }
    })
    : [];

  const list = assigned.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    applied_version: u.template_applied_version,
    out_of_date: (u.template_applied_version || 0) < template.version,
    ...diffUser(templateIds, rows.filter(r => r.user_id === u.id))
  }));

  return {
    template: { id: template.id, name: template.name, version: template.version },
    privilege_ids: templateIds,
    users: list,
    outdated_count: list.filter(u => u.out_of_date).length
  };
};

/**
 * Propagates the template's current privileges to assigned users, in one transaction.
 * Only rows whose source_template_id is this template are touched; manual rows are never changed.
 * Defaults to users whose applied version is lower than the template version.
 * @param {number} templateId Template id
 * @param {{userIds?: number[], skipSuperadmin?: boolean}} options Sync options
 * @returns {Promise<object|null>} Result or null when the template does not exist
 */
const syncTemplate = async(templateId, { userIds, skipSuperadmin = false } = {}) => {
  const template = await privilegeTemplates.findByPk(templateId);
  if (!template) return null;

  const requested = userIds ? unique(userIds) : null;

  return sequelize.transaction(async(t) => {
    const templateIds = await getTemplatePrivilegeIds(template.id, t);
    const where = { template_id: template.id };
    if (requested) where.id = requested;
    const assigned = await users.findAll({ where, transaction: t });

    const skipped = [];
    if (requested) {
      const assignedIds = assigned.map(u => u.id);
      requested.filter(id => !assignedIds.includes(id))
        .forEach(id => skipped.push({ user_id: id, reason: 'USER_NOT_ASSIGNED_TO_TEMPLATE' }));
    }

    const targets = requested
      ? assigned
      : assigned.filter(u => (u.template_applied_version || 0) < template.version);

    const synced = [];
    for (const user of targets) {
      if (skipSuperadmin && user.role === 'superadmin') {
        skipped.push({ user_id: user.id, reason: 'SUPERADMIN_PROTECTED' });
        continue;
      }

      const rows = await userprivileges.findAll({ where: { user_id: user.id }, transaction: t });
      const manual = unique(rows.filter(r => !r.source_template_id).map(r => r.privilege_id));
      const sourceRows = rows.filter(r => r.source_template_id === template.id);

      // Keep one source row per privilege that is still in the template and not manual.
      const kept = new Set();
      const toDestroy = [];
      for (const row of sourceRows) {
        const keep = templateIds.includes(row.privilege_id) && !manual.includes(row.privilege_id) && !kept.has(row.privilege_id);
        if (keep) kept.add(row.privilege_id);
        else toDestroy.push(row);
      }

      const removed = unique(toDestroy.map(r => r.privilege_id)).filter(x => !kept.has(x));
      const toAdd = templateIds.filter(x => !manual.includes(x) && !kept.has(x));

      if (toDestroy.length) {
        await userprivileges.destroy({ where: { id: toDestroy.map(r => r.id) }, transaction: t });
      }
      if (toAdd.length) {
        await userprivileges.bulkCreate(
          toAdd.map(privilegeId => ({ user_id: user.id, privilege_id: privilegeId, source_template_id: template.id })),
          { transaction: t }
        );
      }
      await user.update({ template_applied_version: template.version }, { transaction: t });

      synced.push({ user_id: user.id, added: toAdd, removed });
    }

    return { template_id: template.id, version: template.version, synced, skipped };
  });
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
  getSyncPreview,
  syncTemplate
};
