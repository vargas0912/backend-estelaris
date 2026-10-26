const { getOneUserPrivilege } = require('../services/user-privileges');
const { getAcceptedDaysInSystemTimezone, getTodayInSystemTimezone } = require('../utils/timezone');
const { notifyDateConflict } = require('../services/notifications');
const { handleHttpError } = require('../utils/handleErorr');
const logger = require('../utils/logger');

const { ERR_SECURITY } = require('../constants/errors');
const { ROLE } = require('../constants/roles');

const toDay = (value) => (value instanceof Date ? value.toISOString() : String(value)).slice(0, 10);

// Best effort: a notification failure must never change the guard's answer
const notifyConflict = async(user, field, sentDate) => {
  try {
    await notifyDateConflict({ user, field, sentDate, systemDate: await getTodayInSystemTimezone() });
  } catch (error) {
    logger.error(`[customDateGuard] ${field}: notification failed: ${error.message}`);
  }
};

/**
 * Only users holding `privilege` (or superadmin) may send `field` with a date
 * other than today (system timezone, ±5 min around midnight). Rejected attempts notify the
 * superadmins and the user. On updates, `currentDate` returns the
 * stored date so an unchanged date is not rejected (only looked up when the user
 * lacks the privilege). Infrastructure failures answer 500, never 403.
 * Must run after the validator.
 * @param {{ field: string, privilege: string, currentDate?: (req) => Promise<string|null> }} options
 */
const customDateGuard = ({ field, privilege, currentDate }) => async(req, res, next) => {
  try {
    const { user } = req;
    const date = req.body && req.body[field];

    if (!date || user.role === ROLE.SUPERADMIN) {
      return next();
    }

    if ((await getAcceptedDaysInSystemTimezone()).has(toDay(date))) {
      return next();
    }

    if (await getOneUserPrivilege(user.id, privilege)) {
      return next();
    }

    if (currentDate) {
      const stored = await currentDate(req);
      if (stored && toDay(stored) === toDay(date)) {
        return next();
      }
    }

    logger.warn(`[customDateGuard] ${field}: user ${user.id} sent ${toDay(date)} without privilege ${privilege}`);
    await notifyConflict(user, field, toDay(date));
    handleHttpError(res, ERR_SECURITY.DATE_CONFLICT, 403);
  } catch (error) {
    logger.error(`[customDateGuard] ${field}: ${error.message}`);
    handleHttpError(res, ERR_SECURITY.GUARD_FAILURE, 500);
  }
};

module.exports = customDateGuard;
