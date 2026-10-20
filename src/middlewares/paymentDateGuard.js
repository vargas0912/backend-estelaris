const { getOneUserPrivilege } = require('../services/user-privileges');
const { getSystemSetting } = require('../services/systemSettings');
const { handleHttpError } = require('../utils/handleErorr');

const { ERR_SECURITY } = require('../constants/errors');
const { ROLE } = require('../constants/roles');
const { SALE_PAYMENT } = require('../constants/modules');

const DEFAULT_TIMEZONE = 'America/Mexico_City';

/**
 * Only users with the set_custom_payment_date privilege (or superadmin) may
 * send a payment_date other than today. Must run after the route validator.
 */
const paymentDateGuard = async(req, res, next) => {
  try {
    const { user } = req;
    const paymentDate = req.body && req.body.payment_date;

    if (!paymentDate || user.role === ROLE.SUPERADMIN) {
      return next();
    }

    const setting = await getSystemSetting('timezone');
    const tz = (setting && setting.value) || DEFAULT_TIMEZONE;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: tz });

    if (String(paymentDate).slice(0, 10) === today) {
      return next();
    }

    const allowed = await getOneUserPrivilege(user.id, SALE_PAYMENT.CUSTOM_DATE);

    if (!allowed) {
      return handleHttpError(res, ERR_SECURITY.NOT_PRIVILEGE, 403);
    }

    next();
  } catch (error) {
    handleHttpError(res, ERR_SECURITY.NOT_PERMISION, 403);
  }
};

module.exports = paymentDateGuard;
