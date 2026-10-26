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

const DATE_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Days (YYYY-MM-DD) accepted as "today" in the system timezone: the current
 * day plus the day at now ± 5 min, so a client clock slightly off around
 * midnight does not raise a false conflict.
 */
const getAcceptedDaysInSystemTimezone = async() => {
  const tz = await getSystemTimezone();
  const now = Date.now();
  return new Set([-DATE_TOLERANCE_MS, 0, DATE_TOLERANCE_MS].map(
    (offset) => new Date(now + offset).toLocaleDateString('en-CA', { timeZone: tz })
  ));
};

module.exports = {
  DEFAULT_TIMEZONE,
  getSystemTimezone,
  getTodayInSystemTimezone,
  getAcceptedDaysInSystemTimezone
};
