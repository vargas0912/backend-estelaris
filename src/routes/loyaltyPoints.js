const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter } = require('../middlewares/rateLimiters');

const {
  validateGetCustomer,
  validateGetTransactions,
  validateListConfigs,
  validateCreateConfig,
  validateUpdateConfig,
  validateAdjustPoints
} = require('../validators/loyaltyPoints');

const {
  getConfig,
  listAllConfigs,
  createConfig,
  updateConfig,
  getCustomerPoints,
  getCustomerTransactions,
  adjustPoints,
  processExpired
} = require('../controllers/loyaltyPoints');

const { LOYALTY } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * List all loyalty configs
 * @openapi
 * /loyaltyPoints/configs:
 *    get:
 *      tags:
 *        - loyaltyPoints
 *      summary: Listar todas las configuraciones de lealtad
 *      description: >
 *        Devuelve todas las configuraciones del programa de puntos. Si se filtra
 *        por branch_id, incluye la config específica de esa sucursal más la global
 *        (branch_id=null). Sin filtro devuelve todas. La config global aparece
 *        siempre primero en el resultado.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: branch_id
 *          in: query
 *          description: Filtrar por sucursal (incluye también la config global)
 *          required: false
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Lista de configuraciones de lealtad
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  configs:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/loyaltyConfig'
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio view_loyalty_config
 */
router.get('/configs', [
  readLimiter,
  authMidleware,
  validateListConfigs,
  checkRol([ROLE.USER, ROLE.ADMIN], LOYALTY.VIEW_CONFIG)
], listAllConfigs);

/**
 * Get active loyalty config
 * @openapi
 * /loyaltyPoints/config:
 *    get:
 *      tags:
 *        - loyaltyPoints
 *      summary: Obtener configuración de lealtad activa
 *      description: Devuelve la configuración activa para la sucursal del usuario. Si no hay config por sucursal, devuelve la global (branch_id=null).
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Configuración de lealtad activa
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  config:
 *                    $ref: '#/components/schemas/loyaltyConfig'
 *        '404':
 *          description: No hay configuración activa para esta sucursal
 *        '401':
 *          description: No autorizado
 */
router.get('/config', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], LOYALTY.VIEW_CONFIG)
], getConfig);

/**
 * Create loyalty config
 * @openapi
 * /loyaltyPoints/config:
 *    post:
 *      tags:
 *        - loyaltyPoints
 *      summary: Crear configuración de lealtad
 *      description: Crea una nueva configuración del programa de puntos. Todos los campos son opcionales y tienen valores por defecto. Para config global dejar branch_id en null.
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/loyaltyConfig'
 *      responses:
 *        '201':
 *          description: Configuración creada exitosamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  config:
 *                    $ref: '#/components/schemas/loyaltyConfig'
 *        '400':
 *          description: Datos inválidos
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio create_loyalty_config
 */
router.post('/config', [
  writeLimiter,
  authMidleware,
  validateCreateConfig,
  checkRol([ROLE.ADMIN], LOYALTY.CREATE_CONFIG)
], createConfig);

/**
 * Update loyalty config
 * @openapi
 * /loyaltyPoints/config/{id}:
 *    put:
 *      tags:
 *        - loyaltyPoints
 *      summary: Actualizar configuración de lealtad
 *      description: Actualiza uno o más campos de una configuración existente. Solo se modifican los campos enviados.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador de la configuración
 *        required: true
 *        schema:
 *          type: integer
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/loyaltyConfig'
 *      responses:
 *        '200':
 *          description: Configuración actualizada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  config:
 *                    $ref: '#/components/schemas/loyaltyConfig'
 *        '404':
 *          description: Configuración no encontrada
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio edit_loyalty_config
 */
router.put('/config/:id', [
  writeLimiter,
  authMidleware,
  validateUpdateConfig,
  checkRol([ROLE.ADMIN], LOYALTY.EDIT_CONFIG)
], updateConfig);

/**
 * Get customer points summary
 * @openapi
 * /loyaltyPoints/customer/{customerId}:
 *    get:
 *      tags:
 *        - loyaltyPoints
 *      summary: Saldo de puntos de un cliente
 *      description: Devuelve el saldo actual (total_points) y los puntos acumulados históricos (lifetime_points) del cliente.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: customerId
 *        in: path
 *        description: Identificador del cliente
 *        required: true
 *        schema:
 *          type: integer
 *      responses:
 *        '200':
 *          description: Saldo de puntos del cliente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  points:
 *                    $ref: '#/components/schemas/customerPoints'
 *        '404':
 *          description: El cliente no tiene registro de puntos aún
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio view_loyalty_points
 */
router.get('/customer/:customerId', [
  readLimiter,
  authMidleware,
  validateGetCustomer,
  checkRol([ROLE.USER, ROLE.ADMIN], LOYALTY.VIEW_POINTS)
], getCustomerPoints);

/**
 * Get customer point transactions
 * @openapi
 * /loyaltyPoints/customer/{customerId}/transactions:
 *    get:
 *      tags:
 *        - loyaltyPoints
 *      summary: Historial de transacciones de puntos de un cliente
 *      description: Devuelve el historial paginado de movimientos de puntos (earn, redeem, expire, adjust, void) ordenado por fecha descendente.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: customerId
 *        in: path
 *        description: Identificador del cliente
 *        required: true
 *        schema:
 *          type: integer
 *      - name: page
 *        in: query
 *        description: Número de página (por defecto 1)
 *        required: false
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *      - name: limit
 *        in: query
 *        description: Registros por página (por defecto 20, máximo 100)
 *        required: false
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 20
 *      responses:
 *        '200':
 *          description: Lista paginada de transacciones de puntos
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  transactions:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/pointTransactions'
 *                  meta:
 *                    type: object
 *                    properties:
 *                      total:
 *                        type: integer
 *                      page:
 *                        type: integer
 *                      limit:
 *                        type: integer
 *                      pages:
 *                        type: integer
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio view_loyalty_points
 */
router.get('/customer/:customerId/transactions', [
  readLimiter,
  authMidleware,
  validateGetTransactions,
  checkRol([ROLE.USER, ROLE.ADMIN], LOYALTY.VIEW_POINTS)
], getCustomerTransactions);

/**
 * Adjust customer points manually
 * @openapi
 * /loyaltyPoints/customer/{customerId}/adjust:
 *    post:
 *      tags:
 *        - loyaltyPoints
 *      summary: Ajuste manual de puntos de un cliente
 *      description: Permite a un administrador sumar o restar puntos manualmente con una nota de justificación. No puede dejar el saldo en negativo.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: customerId
 *        in: path
 *        description: Identificador del cliente
 *        required: true
 *        schema:
 *          type: integer
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - amount
 *              properties:
 *                amount:
 *                  type: number
 *                  description: Positivo para agregar puntos, negativo para quitar. No puede ser cero.
 *                  example: 50
 *                notes:
 *                  type: string
 *                  maxLength: 500
 *                  description: Justificación del ajuste
 *                  example: Ajuste por error en venta anterior
 *      responses:
 *        '200':
 *          description: Ajuste aplicado correctamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *        '422':
 *          description: Saldo insuficiente o cantidad inválida
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio adjust_loyalty_points
 */
router.post('/customer/:customerId/adjust', [
  writeLimiter,
  authMidleware,
  validateAdjustPoints,
  checkRol([ROLE.ADMIN], LOYALTY.ADJUST_POINTS)
], adjustPoints);

/**
 * Process expired points
 * @openapi
 * /loyaltyPoints/expire:
 *    post:
 *      tags:
 *        - loyaltyPoints
 *      summary: Procesar vencimiento de puntos expirados
 *      description: Vence automáticamente todos los puntos cuya fecha de expiración (expires_at) ya pasó. Operación exclusiva para administradores con privilegio view_loyalty_config.
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Resultado del proceso de vencimiento
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  affectedCustomers:
 *                    type: integer
 *                    description: Número de clientes cuyos puntos fueron vencidos
 *        '401':
 *          description: No autorizado
 *        '403':
 *          description: Sin privilegio view_loyalty_config
 */
router.post('/expire', [
  writeLimiter,
  authMidleware,
  checkRol([ROLE.ADMIN], LOYALTY.VIEW_CONFIG)
], processExpired);

module.exports = router;
