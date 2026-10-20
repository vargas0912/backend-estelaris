const { getSystemSetting } = require('../services/systemSettings');

const DEFAULT_TIMEZONE = 'America/Mexico_City';

const isValidTimezone = (tz) => {
  try {
    return Boolean(new Date().toLocaleDateString('en-CA', { timeZone: tz }));
  } catch (error) {
    return false;
  }
};

/**
 * Timezone from system_settings ('timezone'), falling back to the default
 * when the setting is missing, empty, invalid or cannot be read.
 */
const getSystemTimezone = async() => {
  try {
    const setting = await getSystemSetting('timezone');
    const tz = setting && setting.value;
    return tz && isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE;
  } catch (error) {
    return DEFAULT_TIMEZONE;
  }
};

/** Today as YYYY-MM-DD in the system timezone. */
const getTodayInSystemTimezone = async() => {
  const tz = await getSystemTimezone();
  return new Date().toLocaleDateString('en-CA', { timeZone: tz });
};

module.exports = { DEFAULT_TIMEZONE, getSystemTimezone, getTodayInSystemTimezone };
