/**
 * Configuración de seguridad de la sesión (cookie, Bearer y CSRF).
 *
 * Todo se lee de variables de entorno EN CADA LLAMADA (no al cargar el módulo)
 * para que los tests puedan cambiar el modo sin reiniciar el servidor.
 *
 * Valores por defecto: compatibles con el front actual, para que este cambio se
 * pueda desplegar antes que el front de la V2. Cuando el front V2 esté en
 * producción (mismo dominio vía Nginx), poner en el .env del VPS:
 *   AUTH_ALLOW_BEARER=false
 *   CSRF_MODE=enforce
 *   COOKIE_SAMESITE=lax
 */

const SAMESITE_VALUES = ['strict', 'lax', 'none'];
const CSRF_MODES = ['off', 'report', 'enforce'];

const readBool = (name, fallback) => {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
};

const readEnum = (name, allowed, fallback) => {
  const value = String(process.env[name] || '').toLowerCase();
  return allowed.includes(value) ? value : fallback;
};

/**
 * ¿Se acepta el JWT en `Authorization: Bearer`?
 * Útil para tests, Swagger y scripts. En el navegador la sesión viaja solo en la
 * cookie HttpOnly; con `false` el token tampoco se devuelve en el cuerpo.
 */
const allowBearer = () => readBool('AUTH_ALLOW_BEARER', true);

/** off: sin revisar · report: solo registra · enforce: responde 403 */
const csrfMode = () => readEnum('CSRF_MODE', CSRF_MODES, 'report');

const baseCookieOptions = () => {
  const sameSite = readEnum('COOKIE_SAMESITE', SAMESITE_VALUES, 'none');
  // SameSite=None exige Secure: si alguien lo desactiva por error, se vuelve a activar.
  const secure = sameSite === 'none' ? true : readBool('COOKIE_SECURE', true);
  const options = { sameSite, secure, path: '/' };
  if (process.env.COOKIE_DOMAIN) options.domain = process.env.COOKIE_DOMAIN;
  return options;
};

const SESSION_COOKIE_NAME = 'token';
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-xsrf-token';

/** Cookie del JWT: HttpOnly, nunca legible desde JavaScript */
const sessionCookieOptions = (maxAge) => ({
  ...baseCookieOptions(),
  httpOnly: true,
  ...(maxAge ? { maxAge } : {})
});

/** Cookie CSRF: legible por el front para copiarla en el header X-XSRF-TOKEN */
const csrfCookieOptions = () => ({
  ...baseCookieOptions(),
  httpOnly: false
});

/** Orígenes permitidos para CORS (FRONTEND_URL, separados por coma) */
const corsOrigins = () => (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

/** Advertencias de configuración insegura para producción */
const productionWarnings = () => {
  const warnings = [];
  if (allowBearer()) warnings.push('AUTH_ALLOW_BEARER está activo: el JWT se acepta en Authorization y se devuelve en el cuerpo del login.');
  if (csrfMode() !== 'enforce') warnings.push(`CSRF_MODE=${csrfMode()}: las peticiones sin token CSRF no se bloquean.`);
  return warnings;
};

module.exports = {
  allowBearer,
  csrfMode,
  sessionCookieOptions,
  csrfCookieOptions,
  corsOrigins,
  productionWarnings,
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
};
