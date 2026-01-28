const winston = require('winston');
const path = require('path');

/**
 * Logger profesional usando Winston
 * Configurado para escribir logs en archivos y consola según el ambiente
 */

// Definir formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola (más legible en desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');

// Configuración de transports
const transports = [];

// En desarrollo: solo consola
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// En producción y test: archivos + consola
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  transports.push(
    // Archivo para errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Consola en formato simplificado
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

// Si no hay NODE_ENV definido, usar configuración de desarrollo
if (!process.env.NODE_ENV) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: customFormat,
  defaultMeta: { service: 'estelaris-api' },
  transports,
  // No salir en excepciones no capturadas
  exitOnError: false
});

// Capturar excepciones no manejadas
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    format: customFormat
  })
);

// Capturar rechazos de promesas no manejados
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    format: customFormat
  })
);

/**
 * Wrapper para mantener compatibilidad con console.log existente
 */
logger.console = {
  log: (message, ...args) => logger.info(message, ...args),
  error: (message, ...args) => logger.error(message, ...args),
  warn: (message, ...args) => logger.warn(message, ...args),
  info: (message, ...args) => logger.info(message, ...args),
  debug: (message, ...args) => logger.debug(message, ...args)
};

module.exports = logger;
