const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateCreate,
  validateUpdate,
  validateGetByCustomer
} = require('../validators/customerAddresses');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const {
  getRecord,
  getRecords,
  getRecordsByCustomer,
  addRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/customerAddresses');

const { CUSTOMER_ADDRESS } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * Get all customer addresses
 * @openapi
 * /customer-addresses:
 *    get:
 *      tags:
 *        - customer-addresses
 *      summary: Lista de direcciones de clientes
 *      description: Obtener toda la lista de direcciones de clientes
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todas las direcciones.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/customerAddresses'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER_ADDRESS.VIEW_ALL)
], getRecords);

/**
 * Get detail from customer address
 * @openapi
 * /customer-addresses/{id}:
 *    get:
 *      tags:
 *        - customer-addresses
 *      summary: Dirección por identificador
 *      description: Consulta de dirección mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador de la dirección
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto de la dirección consultada
 *          content:
 *             application/json:
 *               schema:
 *                   $ref: '#/components/schemas/customerAddresses'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER_ADDRESS.VIEW_ALL)
], getRecord);

/**
 * Get addresses by customer
 * @openapi
 * /customer-addresses/customer/{customerId}:
 *    get:
 *      tags:
 *        - customer-addresses
 *      summary: Direcciones por cliente
 *      description: Obtener direcciones de un cliente específico
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: customerId
 *        in: path
 *        description: Identificador del cliente
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de direcciones del cliente
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/customerAddresses'
 */
router.get('/customer/:customerId', [
  readLimiter,
  authMidleware,
  validateGetByCustomer,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER_ADDRESS.VIEW_ALL)
], getRecordsByCustomer);

/**
 * Register new customer address
 * @openapi
 * /customer-addresses:
 *      post:
 *          tags:
 *              - customer-addresses
 *          summary: Crear nueva dirección de cliente
 *          description: Crear nueva dirección de cliente previo inicio de sesión
 *          security:
 *              - bearerAuth: []
 *          operationId: "createCustomerAddress"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/customerAddresses"
 *          responses:
 *              default:
 *                  description: Registro de nueva dirección
 *              '201':
 *                  description: Dirección creada correctamente
 *              '403':
 *                  description: Error al crear la nueva dirección
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  validateCreate,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER_ADDRESS.ADD)
], addRecord);

/**
 * Update customer address
 * @openapi
 * /customer-addresses/{id}:
 *      put:
 *          tags:
 *              - customer-addresses
 *          summary: Actualizar dirección de cliente
 *          description: Actualizar datos de dirección de cliente previo inicio de sesión
 *          security:
 *              - bearerAuth: []
 *          operationId: "updateCustomerAddress"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/customerAddresses"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la dirección
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              default:
 *                  description: Datos de dirección modificada
 *              '201':
 *                  description: Dirección modificada correctamente
 *              '403':
 *                  description: Error al actualizar la dirección
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  validateUpdate,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER_ADDRESS.UPDATE)
], updateRecord);

/**
 * @openapi
 * /customer-addresses/{id}:
 *      delete:
 *          tags:
 *              - customer-addresses
 *          summary: Eliminación de dirección
 *          description: Eliminación lógica de una dirección de cliente
 *          security:
 *              - bearerAuth: []
 *          operationId: deleteCustomerAddress
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la dirección
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: La dirección se ha marcado como eliminada satisfactoriamente
 *              '400':
 *                  description: Id de dirección inválido
 *              '404':
 *                  description: Dirección no encontrada
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER_ADDRESS.DELETE)
], deleteRecord);

module.exports = router;
