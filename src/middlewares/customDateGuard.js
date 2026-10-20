const { getOneUserPrivilege } = require('../services/user-privileges');
const { getTodayInSystemTimezone } = require('../utils/timezone');
const { handleHttpError } = require('../utils/handleErorr');
const logger = require('../utils/logger');

const { ERR_SECURITY } = require('../constants/errors');
const { ROLE } = require('../constants/roles');

const toDay = (value) => (value instanceof Date ? value.toISOString() : String(value)).slice(0, 10);

/**
 * Only users holding `privilege` (or superadmin) may send `field` with a date
 * other than today (system timezone). On updates, `currentDate` returns the
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

    if (toDay(date) === await getTodayInSystemTimezone()) {
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

    handleHttpError(res, ERR_SECURITY.NOT_PRIVILEGE, 403);
  } catch (error) {
    logger.error(`[customDateGuard] ${field}: ${error.message}`);
    handleHttpError(res, ERR_SECURITY.GUARD_FAILURE, 500);
  }
};

module.exports = customDateGuard;
