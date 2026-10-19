const { matchedData } = require('express-validator');

const { ROLE } = require('../constants/roles');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const {
  createNotifications,
  getMyNotifications,
  countMyUnread,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  updateNotification,
  cancelNotification,
  getSentNotifications
} = require('../services/notifications');

/**
 * Maps a service error (carrying `status`) or an unexpected error to an HTTP response.
 * @param {object} res Express response
 * @param {Error} error Thrown error
 * @param {string} prefix Message prefix for unexpected errors
 */
const sendError = (res, error, prefix) => {
  if (error && error.status) {
    handleHttpError(res, error.message, error.status);
    return;
  }
  handleHttpError(res, `${prefix} --> ${error}`, 400);
};

/**
 * POST /notifications - Creates one notification per recipient (user_ids | branch_id).
 */
const addRecord = async(req, res) => {
  try {
    const data = matchedData(req);
    const result = await createNotifications({ ...data, created_by: req.user.id });

    res.status(201).send(result);
  } catch (error) {
    sendError(res, error, 'ERROR_CREATE_NOTIFICATION');
  }
};

/**
 * GET /notifications/sent - Sent notifications with status and batch summary (admins only see their own).
 */
const getSentRecords = async(req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { rows, count, summary } = await getSentNotifications({
      ...data,
      created_by: req.user.role === ROLE.SUPERADMIN ? undefined : req.user.id,
      page,
      limit
    });

    res.send({ ...buildPaginationResponse('notifications', rows, count, page, limit), summary });
  } catch (error) {
    sendError(res, error, 'ERROR_GET_SENT_NOTIFICATIONS');
  }
};

/**
 * PATCH /notifications/:id - Edits a notification while it is still scheduled.
 */
const updateRecord = async(req, res) => {
  try {
    const { id, ...data } = matchedData(req);
    const notification = await updateNotification(id, data);

    res.send({ notification });
  } catch (error) {
    sendError(res, error, 'ERROR_UPDATE_NOTIFICATION');
  }
};

/**
 * PATCH /notifications/:id/cancel - Cancels a scheduled notification.
 */
const cancelRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const notification = await cancelNotification(id);

    res.send({ notification });
  } catch (error) {
    sendError(res, error, 'ERROR_CANCEL_NOTIFICATION');
  }
};

/**
 * GET /notifications/me - Visible notifications of the authenticated user.
 */
const getMyRecords = async(req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { rows, count } = await getMyNotifications(req.user.id, { unread: data.unread === true, page, limit });

    res.send(buildPaginationResponse('notifications', rows, count, page, limit));
  } catch (error) {
    sendError(res, error, 'ERROR_GET_MY_NOTIFICATIONS');
  }
};

/**
 * GET /notifications/me/count - Unread count of the authenticated user.
 */
const getMyUnreadCount = async(req, res) => {
  try {
    const unread = await countMyUnread(req.user.id);

    res.send({ unread });
  } catch (error) {
    sendError(res, error, 'ERROR_COUNT_NOTIFICATIONS');
  }
};

/**
 * PATCH /notifications/:id/read - Marks one of my notifications as read.
 */
const readRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const notification = await markAsRead(id, req.user.id);

    res.send({ notification });
  } catch (error) {
    sendError(res, error, 'ERROR_READ_NOTIFICATION');
  }
};

/**
 * PATCH /notifications/read-all - Marks all my visible notifications as read.
 */
const readAllRecords = async(req, res) => {
  try {
    const updated = await markAllAsRead(req.user.id);

    res.send({ updated });
  } catch (error) {
    sendError(res, error, 'ERROR_READ_ALL_NOTIFICATIONS');
  }
};

/**
 * PATCH /notifications/:id/archive - Archives one of my notifications.
 */
const archiveRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const notification = await archiveNotification(id, req.user.id);

    res.send({ notification });
  } catch (error) {
    sendError(res, error, 'ERROR_ARCHIVE_NOTIFICATION');
  }
};

module.exports = {
  addRecord,
  getSentRecords,
  updateRecord,
  cancelRecord,
  getMyRecords,
  getMyUnreadCount,
  readRecord,
  readAllRecords,
  archiveRecord
};
