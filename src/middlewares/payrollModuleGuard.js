const { handleHttpError } = require('../utils/handleErorr');
const { getSystemSetting } = require('../services/systemSettings');

const CACHE_TTL_MS = 60_000;
let _cachedValue;
let _cacheExpiry = 0;

const payrollModuleGuard = async (req, res, next) => {
  try {
    const now = Date.now();
    if (_cachedValue === undefined || now > _cacheExpiry) {
      const setting = await getSystemSetting('payroll_module_enabled');
      _cachedValue = setting ? setting.value : null;
      _cacheExpiry = now + CACHE_TTL_MS;
    }
    if (_cachedValue !== 'true') {
      return handleHttpError(res, 'PAYROLL_MODULE_DISABLED', 503);
    }
    next();
  } catch (error) {
    return handleHttpError(res, 'PAYROLL_MODULE_GUARD_ERROR', 500);
  }
};

module.exports = payrollModuleGuard;
