const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const swaggerUI = require('swagger-ui-express');
const openApiConfiguration = require('../docs/swagger');

const { sequelize } = require('./models/index');
const logger = require('./utils/logger');

class Server {
  constructor(environment) {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.dbConnect();
    this.middlewares();
    this.routes();
    this.errorHandler();
  }

  start() {
    this.server = this.express.listen(3000);
  }

  stop() {
    this.app.close();
  }

  async dbConnect() {
    try {
      await sequelize.authenticate();
      logger.info(`MySQL is online. Environment: ${process.env.NODE_ENV}`);
    } catch (e) {
      logger.error('MySQL connection error:', { error: e.message, stack: e.stack });
      process.exit(1);
    }
  }

  middlewares() {
    // Seguridad - Helmet para headers HTTP seguros
    this.app.use(helmet({
      contentSecurityPolicy: false, // Desactivar CSP para permitir Swagger UI
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors());

    // Compresión gzip para mejorar performance
    this.app.use(compression());

    // Rate limiting - DESHABILITADO EN TESTS
    if (process.env.NODE_ENV !== 'test') {
      // Rate limiting global - 100 requests por 15 minutos
      const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // Límite de 100 requests por ventana
        message: {
          error: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
        legacyHeaders: false // Deshabilitar headers `X-RateLimit-*`
      });
      this.app.use(globalLimiter);

      // Rate limiting específico para rutas de autenticación - 5 requests por 15 minutos
      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 5, // Límite de 5 intentos de login
        message: {
          error: 'Too many authentication attempts, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Solo aplicar a POST requests (login/register)
        skipSuccessfulRequests: true // No contar requests exitosos
      });
      this.app.use('/api/auth', authLimiter);
    }

    // Body parser - Limitar tamaño del payload a 10kb por seguridad
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Archivos estáticos
    this.app.use(express.static('storage'));

    // Documentación Swagger
    this.app.use('/documentation', swaggerUI.serve, swaggerUI.setup(openApiConfiguration));
  }

  routes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api', require('./routes'));
  }

  errorHandler() {
    // Manejo de rutas no encontradas (404)
    this.app.use((req, res) => {
      logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Middleware global de manejo de errores
    // eslint-disable-next-line no-unused-vars
    this.app.use((err, req, res, next) => {
      // Log del error
      logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      // Determinar código de estado
      const statusCode = err.status || err.statusCode || 500;

      // En producción, no exponer detalles del error
      const errorResponse = {
        error: process.env.NODE_ENV === 'production'
          ? 'Internal Server Error'
          : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      };

      res.status(statusCode).json(errorResponse);
    });
  }

  listen() {
    this.app.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Swagger documentation available at: http://localhost:${this.port}/documentation`);
    });
  }
}

module.exports = Server;
