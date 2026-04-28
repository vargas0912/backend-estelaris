const express = require('express');
const router = express.Router();

const { validateGetAll, validateGetRecord, validateGetByBranch, valiAddRecord, valiUpdateRecord } = require('../validators/expenses');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const branchScope = require('../middlewares/branchScope');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecords, getRecord, getRecordsByBranch, addRecord, updateRecord, deleteRecord } = require('../controllers/expenses');
const { EXPENSE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /expenses/branch/{branch_id}:
 *    get:
 *      tags:
 *        - expenses
 *      summary: Gastos por sucursal
 *      description: Obtener todos los gastos filtrados por sucursal
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: branch_id
 *        in: path
 *        description: Identificador de la sucursal
 *        required: true
 *        schema:
 *          type: number
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *        description: Número de página
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 20
 *        description: Registros por página
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: Texto para filtrar resultados
 *      responses:
 *        '200':
 *          description: Lista de gastos de la sucursal paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  expenses:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/expenses'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '400':
 *          description: Error de validacion.
 */
router.get('/branch/:branch_id', [
  readLimiter,
  authMidleware,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE.VIEW_BY_BRANCH)
], getRecordsByBranch);

/**
 * @openapi
 * /expenses:
 *    get:
 *      tags:
 *        - expenses
 *      summary: Lista de todos los gastos
 *      description: Obtener todos los gastos registrados en el sistema
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
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *          description: Texto para filtrar resultados
 *      responses:
 *        '200':
 *          description: Lista de gastos paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  expenses:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/expenses'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /expenses/{id}:
 *    get:
 *      tags:
 *        - expenses
 *      summary: Gasto por identificador
 *      description: Consulta de gasto mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del gasto
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objeto del gasto consultado
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/expenses'
 *        '404':
 *          description: Gasto no encontrado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /expenses:
 *      post:
 *          tags:
 *              - expenses
 *          summary: Registrar nuevo gasto
 *          description: Registrar un nuevo gasto. Requiere header X-Branch-ID con el id de la sucursal.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: X-Branch-ID
 *            in: header
 *            description: Identificador de la sucursal
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                            - expense_type_id
 *                            - trans_date
 *                            - expense_amount
 *                          properties:
 *                              expense_type_id:
 *                                  type: integer
 *                              trans_date:
 *                                  type: string
 *                                  format: date
 *                              expense_amount:
 *                                  type: number
 *                              notes:
 *                                  type: string
 *          responses:
 *              '200':
 *                  description: Gasto registrado correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/expenses'
 *              '400':
 *                  description: Error al registrar el gasto
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  branchScope,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE.ADD)
], addRecord);

/**
 * @openapi
 * /expenses/{id}:
 *      put:
 *          tags:
 *              - expenses
 *          summary: Actualizar gasto
 *          description: Actualizar datos de un gasto existente
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del gasto
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              expense_type_id:
 *                                  type: integer
 *                              trans_date:
 *                                  type: string
 *                                  format: date
 *                              expense_amount:
 *                                  type: number
 *                              notes:
 *                                  type: string
 *          responses:
 *              '200':
 *                  description: Gasto modificado correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/expenses'
 *              '400':
 *                  description: Error al actualizar el gasto
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE.UPDATE)
], updateRecord);

/**
 * @openapi
 * /expenses/{id}:
 *      delete:
 *          tags:
 *              - expenses
 *          summary: Eliminacion de gasto
 *          description: Eliminacion logica (soft delete) de un gasto
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del gasto
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El gasto se ha eliminado satisfactoriamente
 *              '400':
 *                  description: Id de gasto invalido
 *              '404':
 *                  description: Gasto no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EXPENSE.DELETE)
], deleteRecord);

module.exports = router;
