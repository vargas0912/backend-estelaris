const express = require('express');
const router = express.Router();

const { validateGetAll, validateGetRecord, validateGetByBranch, valiAddRecord, valiUpdateRecord, valiGrantAccess } = require('../validators/employees');

const authMidleware = require('../middlewares/session');
const branchScope = require('../middlewares/branchScope');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, getRecordsByBranch, addRecord, updateRecord, deleteRecord, grantAccess, revokeAccess } = require('../controllers/employees');
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
 *          description: Lista de empleados paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  employees:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/employees'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  branchScope,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /employees/{id}/grant-access:
 *    post:
 *      tags:
 *        - employees
 *      summary: Habilitar acceso de sistema a un empleado
 *      description: Crea un user con role 'user', asigna los privileges indicados y vincula el user_id al employee. Todo en una transacción atómica.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/grantEmployeeAccessRequest'
 *      responses:
 *        '201':
 *          description: Acceso habilitado exitosamente
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/grantEmployeeAccessResponse'
 *        '400':
 *          description: Error de validación (email inválido, password corto, privileges vacío)
 *        '404':
 *          description: Empleado no encontrado
 *        '422':
 *          description: EMPLOYEE_ALREADY_HAS_ACCESS | EMAIL_ALREADY_IN_USE | INVALID_PRIVILEGES
 */
router.post('/:id/grant-access', [
  writeLimiter,
  authMidleware,
  valiGrantAccess,
  checkRol([ROLE.ADMIN], EMPlOYEE.GRANT_ACCESS)
], grantAccess);

/**
 * @openapi
 * /employees/{id}/revoke-access:
 *    delete:
 *      tags:
 *        - employees
 *      summary: Revocar acceso de sistema de un empleado
 *      description: Soft delete del user vinculado, elimina sus privileges y desvincula user_id del employee.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Acceso revocado exitosamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  revoked:
 *                    type: boolean
 *                    example: true
 *        '404':
 *          description: Empleado no encontrado
 *        '422':
 *          description: EMPLOYEE_HAS_NO_ACCESS (el empleado no tiene user vinculado)
 */
router.delete('/:id/revoke-access', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.ADMIN], EMPlOYEE.REVOKE_ACCESS)
], revokeAccess);

/**
 * @openapi
 * /employees/branch/{branch_id}:
 *    get:
 *      tags:
 *        - employees
 *      summary: Empleados por sucursal
 *      description: Retorna todos los empleados activos de una sucursal específica.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: branch_id
 *        in: path
 *        required: true
 *        schema:
 *          type: integer
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
 *      responses:
 *        '200':
 *          description: Lista de empleados de la sucursal paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  employees:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/employees'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '400':
 *          description: branch_id inválido
 */
router.get('/branch/:branch_id', [
  searchLimiter,
  authMidleware,
  branchScope,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.VIEW_BY_BRANCH)
], getRecordsByBranch);

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
  branchScope,
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
  branchScope,
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
  branchScope,
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
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPlOYEE.DELETE)
], deleteRecord);

module.exports = router;
