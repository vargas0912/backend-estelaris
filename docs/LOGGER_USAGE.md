# Guía de Uso del Logger (Winston)

## Introducción

Este proyecto ahora usa **Winston** como sistema de logging profesional, reemplazando el uso directo de `console.log` y `console.error`.

---

## Importar el Logger

```javascript
const logger = require('../utils/logger');
```

---

## Niveles de Log

Winston soporta los siguientes niveles (de mayor a menor severidad):

1. **error** - Errores que requieren atención inmediata
2. **warn** - Advertencias, situaciones anormales pero no críticas
3. **info** - Información general del flujo de la aplicación
4. **debug** - Información detallada para debugging

---

## Uso Básico

### 1. Logs de Información
```javascript
// ✅ Correcto
logger.info('Server started successfully');
logger.info('User registered', { userId: user.id, email: user.email });

// ❌ Evitar
console.log('Server started');
```

### 2. Logs de Advertencia
```javascript
// ✅ Correcto
logger.warn('Password reset attempted for non-existent email', { email });
logger.warn('High memory usage detected', { usage: process.memoryUsage() });

// ❌ Evitar
console.warn('Warning message');
```

### 3. Logs de Error
```javascript
// ✅ Correcto
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack
});

logger.error('Payment processing failed', {
  orderId: order.id,
  error: error.message
});

// ❌ Evitar
console.error('Error:', error);
```

### 4. Logs de Debug
```javascript
// ✅ Correcto (solo en desarrollo)
logger.debug('Request received', {
  method: req.method,
  path: req.path,
  query: req.query
});

logger.debug('Cache hit', { key: cacheKey });

// ❌ Evitar
console.log('Debug info');
```

---

## Ejemplos por Contexto

### En Controllers

```javascript
const logger = require('../utils/logger');

const getUsers = async (req, res) => {
  try {
    logger.info('Fetching all users', {
      requestedBy: req.user.id,
      filters: req.query
    });

    const users = await userService.getAllUsers(req.query);

    logger.info('Users fetched successfully', {
      count: users.length
    });

    res.json({ data: users });
  } catch (error) {
    logger.error('Error fetching users', {
      error: error.message,
      stack: error.stack,
      requestedBy: req.user.id
    });

    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### En Services

```javascript
const logger = require('../utils/logger');

class UserService {
  async createUser(userData) {
    try {
      logger.info('Creating new user', { email: userData.email });

      const user = await User.create(userData);

      logger.info('User created successfully', {
        userId: user.id,
        email: user.email
      });

      return user;
    } catch (error) {
      logger.error('Error creating user', {
        error: error.message,
        userData: { email: userData.email } // No loguear password!
      });

      throw error;
    }
  }

  async deleteUser(userId) {
    logger.warn('User deletion requested', {
      userId,
      deletedBy: req.user.id
    });

    // ... lógica de eliminación

    logger.info('User deleted successfully', { userId });
  }
}
```

### En Middlewares

```javascript
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      logger.warn('Request without authorization header', {
        path: req.path,
        ip: req.ip
      });
      return res.status(401).json({ error: 'No token provided' });
    }

    // ... validación del token

    logger.debug('User authenticated successfully', {
      userId: user.id,
      path: req.path
    });

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      path: req.path,
      ip: req.ip
    });

    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

### En Conexiones de Base de Datos

```javascript
const logger = require('../utils/logger');

const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully', {
      database: config.database,
      host: config.host,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    logger.error('Database connection failed', {
      error: error.message,
      stack: error.stack,
      config: {
        host: config.host,
        database: config.database
        // NO loguear password!
      }
    });
    process.exit(1);
  }
};
```

---

## Mejores Prácticas

### ✅ HACER

1. **Usar metadata estructurada**
   ```javascript
   logger.info('Order created', {
     orderId: order.id,
     userId: user.id,
     total: order.total
   });
   ```

2. **Incluir contexto relevante**
   ```javascript
   logger.error('Payment failed', {
     orderId: order.id,
     amount: order.total,
     provider: 'stripe',
     error: error.message
   });
   ```

3. **Loguear eventos importantes del negocio**
   ```javascript
   logger.info('User logged in', { userId: user.id });
   logger.info('Product purchased', { productId, userId, price });
   logger.warn('Failed login attempt', { email, ip: req.ip });
   ```

4. **Usar el nivel apropiado**
   - `error` - Errores que afectan la funcionalidad
   - `warn` - Situaciones anormales que no rompen el flujo
   - `info` - Eventos normales del negocio
   - `debug` - Información detallada para desarrollo

### ❌ NO HACER

1. **No loguear información sensible**
   ```javascript
   // ❌ MAL
   logger.info('User login', {
     email: user.email,
     password: user.password  // NUNCA!
   });

   // ✅ BIEN
   logger.info('User login', {
     userId: user.id,
     email: user.email
   });
   ```

2. **No loguear datos personales innecesarios**
   ```javascript
   // ❌ MAL
   logger.info('Profile updated', {
     ssn: user.ssn,
     creditCard: user.creditCard
   });

   // ✅ BIEN
   logger.info('Profile updated', {
     userId: user.id,
     fieldsUpdated: ['name', 'email']
   });
   ```

3. **No usar console.log directamente**
   ```javascript
   // ❌ MAL
   console.log('Something happened');
   console.error(error);

   // ✅ BIEN
   logger.info('Something happened');
   logger.error('Error occurred', { error: error.message });
   ```

4. **No hacer logging excesivo en loops**
   ```javascript
   // ❌ MAL
   users.forEach(user => {
     logger.debug('Processing user', { userId: user.id });
     // Procesamiento...
   });

   // ✅ BIEN
   logger.info('Processing users batch', { count: users.length });
   users.forEach(user => {
     // Procesamiento...
   });
   logger.info('Users batch processed successfully');
   ```

---

## Configuración por Ambiente

### Development
- Logs en **consola** con formato colorizado
- Nivel: **debug** (todos los logs)
- No se guardan en archivos

### Production
- Logs en **archivos** (combined.log, error.log)
- Nivel: **info** (sin debug)
- Rotación automática (5MB por archivo, máximo 5 archivos)
- También en consola (formato simple)

### Test
- Logs en **archivos** (para auditoría de tests)
- Nivel: **error** (solo errores)
- Logs mínimos para no contaminar output de tests

---

## Archivos de Log Generados

### logs/combined.log
Todos los logs del sistema (info, warn, error)

### logs/error.log
Solo errores (nivel error)

### logs/exceptions.log
Excepciones no capturadas del proceso

### logs/rejections.log
Promesas rechazadas no manejadas

---

## Variables de Entorno

```bash
# Nivel de logging (opcional)
LOG_LEVEL=info  # debug | info | warn | error

# Ambiente (afecta qué logs se guardan)
NODE_ENV=development  # development | production | test
```

---

## Reemplazar console.log Existente

### Migración gradual

1. **Buscar todos los console.log**
   ```bash
   grep -r "console\." src/
   ```

2. **Reemplazar según el contexto**
   ```javascript
   // Antes
   console.log('Server started on port', port);

   // Después
   logger.info('Server started', { port });
   ```

3. **Para errores**
   ```javascript
   // Antes
   console.error('Database error:', error);

   // Después
   logger.error('Database error', {
     error: error.message,
     stack: error.stack
   });
   ```

---

## Debugging en Producción

### Ver logs en tiempo real
```bash
tail -f logs/combined.log
```

### Ver solo errores
```bash
tail -f logs/error.log
```

### Buscar logs específicos
```bash
grep "User login" logs/combined.log
grep "error" logs/combined.log | tail -20
```

### Analizar logs con jq (logs en JSON)
```bash
# Ver últimos 10 errores
tail -20 logs/error.log | jq '.message'

# Filtrar por userId
cat logs/combined.log | jq 'select(.userId == "123")'
```

---

## Wrapper de Compatibilidad

El logger incluye un wrapper para compatibilidad con `console`:

```javascript
logger.console.log('Message');    // Equivalente a logger.info
logger.console.error('Error');    // Equivalente a logger.error
logger.console.warn('Warning');   // Equivalente a logger.warn
logger.console.info('Info');      // Equivalente a logger.info
logger.console.debug('Debug');    // Equivalente a logger.debug
```

**Nota:** Preferir usar directamente `logger.info()`, `logger.error()`, etc.

---

## Ejemplos Completos

### Controller con Logging Completo
```javascript
const logger = require('../utils/logger');
const { matchedData } = require('express-validator');

const createProduct = async (req, res) => {
  const requestId = req.id; // Si usas request ID middleware

  try {
    const data = matchedData(req);

    logger.info('Creating product', {
      requestId,
      userId: req.user.id,
      productName: data.name
    });

    const product = await productService.create(data);

    logger.info('Product created successfully', {
      requestId,
      productId: product.id,
      userId: req.user.id
    });

    res.status(201).json({ data: product });
  } catch (error) {
    logger.error('Error creating product', {
      requestId,
      userId: req.user.id,
      error: error.message,
      stack: error.stack,
      productData: data
    });

    res.status(500).json({ error: 'Failed to create product' });
  }
};
```

---

## Preguntas Frecuentes

### ¿Cuándo usar logger.debug vs logger.info?
- **debug**: Información muy detallada para desarrollo/debugging (ej: valores de variables, flujo de ejecución)
- **info**: Eventos normales del negocio (ej: usuario creado, orden procesada)

### ¿Puedo usar logger en producción?
Sí, está optimizado para producción. Los logs se rotan automáticamente y se filtran por nivel.

### ¿Afecta el performance?
El impacto es mínimo (<1ms por log). En producción, evita logging excesivo en loops.

### ¿Cómo desactivo los logs en tests?
Configura `LOG_LEVEL=error` o `LOG_LEVEL=silent` en tu ambiente de test.

---

**Documentación actualizada:** 27 de Enero de 2026
