const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateCreate,
  validateUpdate,
  validateGetByBranch,
  validateGetByMunicipality,
  validateActivatePortal
} = require('../validators/customers');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const {
  getRecord,
  getRecords,
  getRecordsByBranch,
  getRecordsByMunicipality,
  addRecord,
  updateRecord,
  deleteRecord,
  activatePortalCtrl
} = require('../controllers/customers');

const { CUSTOMER } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * Get all customers
 * @openapi
 * /customers:
 *    get:
 *      tags:
 *        - customers
 *      summary: Lista de clientes
 *      description: Obtener toda la lista de clientes activos
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los clientes.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/customers'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.VIEW_ALL)
], getRecords);

/**
 * Get detail from customers
 * @openapi
 * /customers/{id}:
 *    get:
 *      tags:
 *        - customers
 *      summary: Cliente por identificador
 *      description: Consulta de cliente mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del cliente
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del cliente consultado
 *          content:
 *             application/json:
 *               schema:
 *                   $ref: '#/components/schemas/customers'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.VIEW)
], getRecord);

/**
 * Get customers by branch
 * @openapi
 * /customers/branch/{branchId}:
 *    get:
 *      tags:
 *        - customers
 *      summary: Clientes por sucursal
 *      description: Obtener clientes de una sucursal específica
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: branchId
 *        in: path
 *        description: Identificador de la sucursal
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de clientes de la sucursal
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/customers'
 */
router.get('/branch/:branchId', [
  readLimiter,
  authMidleware,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.VIEW_BY_BRANCH)
], getRecordsByBranch);

/**
 * Get customers by municipality
 * @openapi
 * /customers/municipality/{municipalityId}:
 *    get:
 *      tags:
 *        - customers
 *      summary: Clientes por municipio
 *      description: Obtener clientes de un municipio específico
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: municipalityId
 *        in: path
 *        description: Identificador del municipio
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de clientes del municipio
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/customers'
 */
router.get('/municipality/:municipalityId', [
  readLimiter,
  authMidleware,
  validateGetByMunicipality,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.VIEW_BY_MUNICIPALITY)
], getRecordsByMunicipality);

/**
 * Register new customer
 * @openapi
 * /customers:
 *      post:
 *          tags:
 *              - customers
 *          summary: Crear nuevo cliente
 *          description: Crear nuevo cliente previo inicio de sesión
 *          security:
 *              - bearerAuth: []
 *          operationId: "createCustomer"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/customers"
 *          responses:
 *              default:
 *                  description: Registro de nuevo cliente
 *              '201':
 *                  description: Cliente creado correctamente
 *              '403':
 *                  description: Error al crear el nuevo cliente
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  validateCreate,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.ADD)
], addRecord);

/**
 * Activate customer portal
 * @openapi
 * /customers/{id}/activate-portal:
 *      post:
 *          tags:
 *              - customers
 *          summary: Activar portal de cliente
 *          description: Crear usuario y activar acceso al portal para el cliente
 *          security:
 *              - bearerAuth: []
 *          operationId: "activateCustomerPortal"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del cliente
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                            password:
 *                              type: string
 *                              description: Contraseña opcional (se genera automáticamente si no se proporciona)
 *          responses:
 *              '200':
 *                  description: Portal activado correctamente
 *              '400':
 *                  description: Error al activar el portal
 */
router.post('/:id/activate-portal', [
  writeLimiter,
  authMidleware,
  validateActivatePortal,
  checkRol([ROLE.ADMIN], CUSTOMER.ACTIVATE_PORTAL)
], activatePortalCtrl);

/**
 * Update customer
 * @openapi
 * /customers/{id}:
 *      put:
 *          tags:
 *              - customers
 *          summary: Actualizar cliente
 *          description: Actualizar datos de cliente previo inicio de sesión
 *          security:
 *              - bearerAuth: []
 *          operationId: "updateCustomer"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/customers"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del cliente
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              default:
 *                  description: Datos de cliente modificado
 *              '201':
 *                  description: Cliente modificado correctamente
 *              '403':
 *                  description: Error al actualizar el cliente
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  validateUpdate,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.UPDATE)
], updateRecord);

/**
 * @openapi
 * /customers/{id}:
 *      delete:
 *          tags:
 *              - customers
 *          summary: Eliminación de cliente
 *          description: Eliminación lógica de un cliente
 *          security:
 *              - bearerAuth: []
 *          operationId: deleteCustomer
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del cliente
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El cliente se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de cliente inválido
 *              '404':
 *                  description: Cliente no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], CUSTOMER.DELETE)
], deleteRecord);

module.exports = router;
