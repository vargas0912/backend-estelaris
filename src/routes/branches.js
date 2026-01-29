const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/branches');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/branches');
const { BRANCH } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * Get all states
 * @openapi
 * /branches:
 *    get:
 *      tags:
 *        - branches
 *      summary: Lista de sucursales
 *      description: Obtener toda la lista de sucursales activas
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todas las sucursales.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/branches'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], BRANCH.VIEW_ALL)
], getRecords);

/**
 * Get detail from branches
 * @openapi
 * /branches/{id}:
 *    get:
 *      tags:
 *        - branches
 *      summary: Sucursal por identificador
 *      description: Consulta de sucursal mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador de la sucursal
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto de la sucursal consultada
 *          content:
 *             application/json:
 *               schema:
 *                   $ref: '#/components/schemas/branches'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], BRANCH.VIEW)],
getRecord);

/**
 * Register new user
 * @openapi
 * /branches:
 *      post:
 *          tags:
 *              - branches
 *          summary: Crear nueva sucursal
 *          description: Crear nueva sucursal previo inicio de sesión
 *          security:
 *              - bearerAuth: []
 *          operationId: "createBranch"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/branches"
 *          responses:
 *              default:
 *                  description: Registro de nueva sucursal
 *              '201':
 *                  description: Sucursale creada correctamente
 *              '403':
 *                  description: Error al crear la nueva sucursal
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], BRANCH.ADD)], addRecord);

/**
 * Register new user
 * @openapi
 * /branches/{id}:
 *      put:
 *          tags:
 *              - branches
 *          summary: Actualizar sucursal
 *          description: Actualizar deatos de sucursal previo inicio de sesión
 *          security:
 *              - bearerAuth: []
 *          operationId: "updateBranch"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/branches"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la sucursal
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              default:
 *                  description: Datos de sucursal modificada
 *              '201':
 *                  description: Sucursal modificada correctamente
 *              '403':
 *                  description: Error al actualizar la sucursal
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], BRANCH.UPDATE)
], updateRecord);

/**
 * @openapi
 * /branches/{id}:
 *      delete:
 *          tags:
 *              - branches
 *          summary: Eliminación de sucursal
 *          description: Eliminación lógica de una sucursal
 *          security:
 *              - bearerAuth: []
 *          operationId: deleteBranch
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la sucursal
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              description: Elimina la sucursal seleccionada
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/branches'
 *                  application/xml:
 *                      schema:
 *                          $ref: '#/components/schemas/branches'
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          $ref: '#/components/schemas/branches'
 *              required: true
 *          responses:
 *              '200':
 *                  description: La sucursal se ha marcado como eliminada satisfactoriamente
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/branches'
 *                      application/xml:
 *                          schema:
 *                              $ref: '#/components/schemas/branches'
 *              '400':
 *                  description: Id de sucursal inválido
 *              '404':
 *                  description: Sucursal no encontrada
 *              '405':
 *                  description: Error al eliminar la sucursal
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], BRANCH.DELETE)],
deleteRecord);

module.exports = router;
