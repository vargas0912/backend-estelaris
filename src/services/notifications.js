const { randomUUID } = require('crypto');
const { Op } = require('sequelize');
const { sequelize, notifications, users, userBranches } = require('../models/index');
const { NOTIFICATION_ERRORS: ERR } = require('../constants/privileges');
const { ROLE } = require('../constants/roles');

// Remitente expuesto al usuario: solo estos campos, incluso si el admin fue dado de baja
const creatorInclude = () => ({ model: users, as: 'creator', attributes: ['id', 'name', 'email'], paranoid: false });

const EDITABLE_FIELDS = ['title', 'body', 'scheduled_at', 'due_at'];

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
 * Condition for a notification to be visible to its recipient:
 * not cancelled and already due (no scheduler, resolved at query time).
 * @param {Date} now Reference instant
 * @returns {object}
 */
const visibleWhere = (now) => ({
  cancelled_at: null,
  [Op.or]: [{ scheduled_at: null }, { scheduled_at: { [Op.lte]: now } }]
});

/**
 * Delivery status of a notification for the sender view.
 * @param {object} row Notification (plain)
 * @param {Date} [now] Reference instant
 * @returns {'scheduled'|'delivered'|'read'|'cancelled'}
 */
const computeStatus = (row, now = new Date()) => {
  if (row.cancelled_at) return 'cancelled';
  if (row.scheduled_at && new Date(row.scheduled_at) > now) return 'scheduled';
  if (row.read_at) return 'read';
  return 'delivered';
};

/**
 * Resolves the unique recipient ids from an explicit list or a branch.
 * @param {{ user_ids?: number[], branch_id?: number }} input Recipient selector
 * @returns {Promise<number[]>}
 * @throws {Error} 400 NO_RECIPIENTS | INVALID_RECIPIENTS
 */
const resolveRecipients = async({ user_ids: userIds, branch_id: branchId }) => {
  let ids;

  if (userIds && userIds.length) {
    ids = unique(userIds);
  } else if (branchId) {
    const assignments = await userBranches.findAll({
      attributes: ['user_id'],
      where: { branch_id: branchId }
    });
    ids = unique(assignments.map(a => a.user_id));
  } else {
    ids = [];
  }

  if (!ids.length) {
    throw fail(ERR.NO_RECIPIENTS, 400);
  }

  const found = await users.findAll({ attributes: ['id'], where: { id: ids } });
  const foundIds = new Set(found.map(u => u.id));

  // Con branch_id se omiten usuarios dados de baja; con user_ids explicitos se exige que existan todos
  if (userIds && userIds.length && foundIds.size !== ids.length) {
    throw fail(ERR.INVALID_RECIPIENTS, 400);
  }

  const valid = ids.filter(id => foundIds.has(id));

  if (!valid.length) {
    throw fail(ERR.NO_RECIPIENTS, 400);
  }

  return valid;
};

/**
 * Creates one notification per recipient sharing a batch_id.
 * @param {object} data title, body, created_by, scheduled_at, due_at, ref_type, ref_id and user_ids | branch_id
 * @returns {Promise<{ batch_id: string, total: number, notifications: object[] }>}
 */
const createNotifications = async(data) => {
  const recipients = await resolveRecipients(data);
  const batchId = randomUUID();

  const rows = recipients.map(userId => ({
    user_id: userId,
    created_by: data.created_by,
    title: data.title,
    body: data.body,
    scheduled_at: data.scheduled_at ?? null,
    due_at: data.due_at ?? null,
    ref_type: data.ref_type ?? null,
    ref_id: data.ref_id ?? null,
    batch_id: batchId
  }));

  const created = await sequelize.transaction(
    (transaction) => notifications.bulkCreate(rows, { transaction })
  );

  return { batch_id: batchId, total: created.length, notifications: created };
};

/**
 * Notifies the superadmins and the involved user that a date different from
 * the system date was rejected. The involved user is the sender (created_by).
 * @param {{ user: object, field: string, sentDate: string, systemDate: string }} data
 * @returns {Promise<object>}
 */
const notifyDateConflict = async({ user, field, sentDate, systemDate }) => {
  const superadmins = await users.findAll({ attributes: ['id'], where: { role: ROLE.SUPERADMIN } });
  const userIds = unique([user.id, ...superadmins.map(u => u.id)]);
  const who = user.name || user.email || `#${user.id}`;

  return createNotifications({
    user_ids: userIds,
    created_by: user.id,
    title: 'Conflicto de fechas detectado',
    body: `Se rechazó una operación de ${who} (usuario #${user.id}): el campo ${field} llegó con la fecha ${sentDate} y la fecha del sistema es ${systemDate}. Revisa la fecha y hora del equipo.`,
    ref_type: 'date_conflict',
    ref_id: user.id
  });
};

/**
 * Lists the visible notifications of a user (archived hidden).
 * @param {number} userId Recipient
 * @param {{ unread?: boolean, page?: number, limit?: number }} [options]
 * @returns {Promise<{ rows: object[], count: number }>}
 */
const getMyNotifications = async(userId, { unread = false, page = 1, limit = 20 } = {}) => {
  const where = { user_id: userId, archived_at: null, ...visibleWhere(new Date()) };

  if (unread) {
    where.read_at = null;
  }

  const { count, rows } = await notifications.findAndCountAll({
    where,
    include: [creatorInclude()],
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  return { rows, count };
};

/**
 * Counts visible, unread and non archived notifications of a user.
 * @param {number} userId Recipient
 * @returns {Promise<number>}
 */
const countMyUnread = async(userId) => notifications.count({
  where: { user_id: userId, read_at: null, archived_at: null, ...visibleWhere(new Date()) }
});

/**
 * Finds a visible notification owned by the user.
 * @throws {Error} 404 NOT_FOUND
 */
const findOwnVisible = async(id, userId) => {
  const row = await notifications.findOne({
    where: { id, user_id: userId, ...visibleWhere(new Date()) },
    include: [creatorInclude()]
  });

  if (!row) {
    throw fail(ERR.NOT_FOUND, 404);
  }

  return row;
};

/**
 * Marks a notification as read. Idempotent: the first read_at is kept.
 * @param {number} id Notification id
 * @param {number} userId Authenticated user
 * @returns {Promise<object>}
 */
const markAsRead = async(id, userId) => {
  const row = await findOwnVisible(id, userId);

  if (!row.read_at) {
    await row.update({ read_at: new Date() });
  }

  return row;
};

/**
 * Marks all the unread visible notifications of a user as read.
 * @param {number} userId Authenticated user
 * @returns {Promise<number>} Updated rows
 */
const markAllAsRead = async(userId) => {
  const [updated] = await notifications.update(
    { read_at: new Date() },
    { where: { user_id: userId, read_at: null, ...visibleWhere(new Date()) } }
  );

  return updated;
};

/**
 * Archives a notification (hidden from /me). Idempotent.
 * @param {number} id Notification id
 * @param {number} userId Authenticated user
 * @returns {Promise<object>}
 */
const archiveNotification = async(id, userId) => {
  const row = await findOwnVisible(id, userId);

  if (!row.archived_at) {
    await row.update({ archived_at: new Date() });
  }

  return row;
};

/**
 * Loads a notification that can still be modified by its creator.
 * @param {number} id Notification id
 * @param {number|null} [createdBy] Owner filter; null/undefined skips it (superadmin)
 * @throws {Error} 404 NOT_FOUND (also for non owners) | 409 ALREADY_CANCELLED | 409 ALREADY_DELIVERED
 */
const findModifiable = async(id, createdBy) => {
  const row = await notifications.findByPk(id);

  if (!row || (createdBy && row.created_by !== createdBy)) {
    throw fail(ERR.NOT_FOUND, 404);
  }
  if (row.cancelled_at) {
    throw fail(ERR.ALREADY_CANCELLED, 409);
  }
  if (!row.scheduled_at || new Date(row.scheduled_at) <= new Date()) {
    throw fail(ERR.ALREADY_DELIVERED, 409);
  }

  return row;
};

/**
 * Edits title, body, scheduled_at or due_at while the notification is still scheduled.
 * @param {number} id Notification id
 * @param {object} data Candidate fields (non editable ones are ignored)
 * @param {number|null} [createdBy] Owner filter (null/undefined for superadmin)
 * @returns {Promise<object>}
 */
const updateNotification = async(id, data, createdBy) => {
  const row = await findModifiable(id, createdBy);

  const changes = {};
  EDITABLE_FIELDS.forEach(field => {
    if (data[field] !== undefined) changes[field] = data[field];
  });

  if (!Object.keys(changes).length) {
    throw fail(ERR.NOTHING_TO_UPDATE, 400);
  }
  if (changes.scheduled_at !== undefined && (!changes.scheduled_at || new Date(changes.scheduled_at) <= new Date())) {
    throw fail(ERR.SCHEDULED_AT_INVALID, 400);
  }

  await row.update(changes);

  return row;
};

/**
 * Cancels a notification while it is still scheduled.
 * @param {number} id Notification id
 * @param {number|null} [createdBy] Owner filter (null/undefined for superadmin)
 * @returns {Promise<object>}
 */
const cancelNotification = async(id, createdBy) => {
  const row = await findModifiable(id, createdBy);

  await row.update({ cancelled_at: new Date() });

  return row;
};

/**
 * Lists sent notifications with per-recipient status, the recipient as `user` ({ id, name, email }, soft-deleted included) and, when filtering by batch, a summary.
 * @param {{ batch_id?: string, user_id?: number, created_by?: number, page?: number, limit?: number }} [filters]
 * @returns {Promise<{ rows: object[], count: number, summary: object|null }>}
 */
const getSentNotifications = async({ batch_id: batchId, user_id: userId, created_by: createdBy, page = 1, limit = 20 } = {}) => {
  const where = {};
  if (createdBy) where.created_by = createdBy;
  if (batchId) where.batch_id = batchId;
  if (userId) where.user_id = userId;

  const { count, rows } = await notifications.findAndCountAll({
    where,
    include: [{ model: users, as: 'recipient', attributes: ['id', 'name', 'email'], paranoid: false }],
    order: [['id', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const now = new Date();
  const items = rows.map(row => {
    const { recipient, ...plain } = row.toJSON();
    return { ...plain, user: recipient || null, status: computeStatus(plain, now) };
  });

  let summary = null;
  if (batchId) {
    const scope = createdBy ? { batch_id: batchId, created_by: createdBy } : { batch_id: batchId };
    const [total, read, pending] = await Promise.all([
      notifications.count({ where: scope }),
      notifications.count({ where: { ...scope, read_at: { [Op.ne]: null } } }),
      notifications.count({ where: { ...scope, read_at: null, cancelled_at: null } })
    ]);
    summary = { total, read, pending };
  }

  return { rows: items, count, summary };
};

module.exports = {
  computeStatus,
  createNotifications,
  notifyDateConflict,
  getMyNotifications,
  countMyUnread,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  updateNotification,
  cancelNotification,
  getSentNotifications
};
