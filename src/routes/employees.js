const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/employees');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/employees');
const { EMPlOYEE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /employees:
 *    get:
 *      tags:
 *        - employees
 *      summary: Lista de empleados
 *      description: Obtener toda la lista de empleados activos
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los empleados.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /employees/{id}:
 *    get:
 *      tags:
 *        - employees
 *      summary: Empleado por identificador
 *      description: Consulta de empleado mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del empleado
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del empleado consultado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /employees:
 *      post:
 *          tags:
 *              - employees
 *          summary: Crear nuevo empleado
 *          description: Crear nuevo empleado previo inicio de sesion
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
 *                              email:
 *                                  type: string
 *                              phone:
 *                                  type: string
 *                              hire_date:
 *                                  type: string
 *                                  format: date
 *                              position_id:
 *                                  type: number
 *                              branch_id:
 *                                  type: number
 *                              active:
 *                                  type: boolean
 *          responses:
 *              '201':
 *                  description: Empleado creado correctamente
 *              '403':
 *                  description: Error al crear el nuevo empleado
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.ADD)
], addRecord);

/**
 * @openapi
 * /employees/{id}:
 *      put:
 *          tags:
 *              - employees
 *          summary: Actualizar empleado
 *          description: Actualizar datos de empleado previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del empleado
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
 *                              email:
 *                                  type: string
 *                              phone:
 *                                  type: string
 *                              hire_date:
 *                                  type: string
 *                                  format: date
 *                              position_id:
 *                                  type: number
 *                              branch_id:
 *                                  type: number
 *                              active:
 *                                  type: boolean
 *          responses:
 *              '201':
 *                  description: Empleado modificado correctamente
 *              '403':
 *                  description: Error al actualizar el empleado
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.UPDATE)
], updateRecord);

/**
 * @openapi
 * /employees/{id}:
 *      delete:
 *          tags:
 *              - employees
 *          summary: Eliminacion de empleado
 *          description: Eliminacion logica de un empleado
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del empleado
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El empleado se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de empleado invalido
 *              '404':
 *                  description: Empleado no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.DELETE)
], deleteRecord);

module.exports = router;
