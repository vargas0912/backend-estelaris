const express = require('express');
const router = express.Router();

const { validateGetAll, validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/expense-types');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/expense-types');
const { EXPENSE_TYPE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /expense-types:
 *    get:
 *      tags:
 *        - expense-types
 *      summary: Lista de tipos de gastos
 *      description: Obtener toda la lista de tipos de gastos
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Número de página
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *            default: 20
 *          description: Registros por página
 *      responses:
 *        '200':
 *          description: Lista de tipos de gastos paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  expenseTypes:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/expenseTypes'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE_TYPE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /expense-types/{id}:
 *    get:
 *      tags:
 *        - expense-types
 *      summary: Tipo de gasto por identificador
 *      description: Consulta de tipo de gasto mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del tipo de gasto
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objeto del tipo de gasto consultado
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/expenseTypes'
 *        '404':
 *          description: Tipo de gasto no encontrado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE_TYPE.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /expense-types:
 *      post:
 *          tags:
 *              - expense-types
 *          summary: Crear nuevo tipo de gasto
 *          description: Crear nuevo tipo de gasto previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *          responses:
 *              '200':
 *                  description: Tipo de gasto creado correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/expenseTypes'
 *              '400':
 *                  description: Error al crear el tipo de gasto
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE_TYPE.ADD)
], addRecord);

/**
 * @openapi
 * /expense-types/{id}:
 *      put:
 *          tags:
 *              - expense-types
 *          summary: Actualizar tipo de gasto
 *          description: Actualizar datos de tipo de gasto previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del tipo de gasto
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *          responses:
 *              '200':
 *                  description: Tipo de gasto modificado correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/expenseTypes'
 *              '400':
 *                  description: Error al actualizar el tipo de gasto
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE_TYPE.UPDATE)
], updateRecord);

/**
 * @openapi
 * /expense-types/{id}:
 *      delete:
 *          tags:
 *              - expense-types
 *          summary: Eliminacion de tipo de gasto
 *          description: Eliminacion de un tipo de gasto (hard delete)
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del tipo de gasto
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El tipo de gasto se ha eliminado satisfactoriamente
 *              '400':
 *                  description: Id de tipo de gasto invalido
 *              '404':
 *                  description: Tipo de gasto no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE_TYPE.DELETE)
], deleteRecord);

module.exports = router;
