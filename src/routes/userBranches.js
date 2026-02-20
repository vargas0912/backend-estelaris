const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const { validateGetByUser, validateGetByBranch, validateGetRecord, valiAddRecord } = require('../validators/userBranches');
const { getRecordsByUser, getRecordsByBranch, getRecord, addRecord, deleteRecord } = require('../controllers/userBranches');

const { USER_BRANCH } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /userBranches/user/{user_id}:
 *    get:
 *      tags:
 *        - userBranches
 *      summary: Sucursales asignadas a un usuario
 *      description: Obtener todas las sucursales asignadas a un usuario
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: user_id
 *        in: path
 *        description: Identificador del usuario
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de asignaciones usuario-sucursal
 *        '422':
 *          description: Error de validacion
 */
router.get('/user/:user_id', [
  searchLimiter,
  authMidleware,
  validateGetByUser,
  checkRol([ROLE.ADMIN], USER_BRANCH.VIEW_ALL)
], getRecordsByUser);

/**
 * @openapi
 * /userBranches/branch/{branch_id}:
 *    get:
 *      tags:
 *        - userBranches
 *      summary: Usuarios asignados a una sucursal
 *      description: Obtener todos los usuarios asignados a una sucursal
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: branch_id
 *        in: path
 *        description: Identificador de la sucursal
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de asignaciones sucursal-usuario
 *        '422':
 *          description: Error de validacion
 */
router.get('/branch/:branch_id', [
  searchLimiter,
  authMidleware,
  validateGetByBranch,
  checkRol([ROLE.ADMIN], USER_BRANCH.VIEW_ALL)
], getRecordsByBranch);

/**
 * @openapi
 * /userBranches/{id}:
 *    get:
 *      tags:
 *        - userBranches
 *      summary: Asignación por id
 *      description: Obtener una asignación usuario-sucursal por id
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador de la asignación
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Objeto de asignación
 *        '404':
 *          description: Asignación no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.ADMIN], USER_BRANCH.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /userBranches:
 *      post:
 *          tags:
 *              - userBranches
 *          summary: Asignar sucursal a usuario
 *          description: Crear una nueva asignación de sucursal para un usuario
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - user_id
 *                              - branch_id
 *                          properties:
 *                              user_id:
 *                                  type: number
 *                                  description: ID del usuario
 *                              branch_id:
 *                                  type: number
 *                                  description: ID de la sucursal
 *          responses:
 *              '200':
 *                  description: Asignación creada correctamente
 *              '409':
 *                  description: La asignación ya existe
 *              '403':
 *                  description: Sin permisos
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.ADMIN], USER_BRANCH.ADD)
], addRecord);

/**
 * @openapi
 * /userBranches/{id}:
 *      delete:
 *          tags:
 *              - userBranches
 *          summary: Remover sucursal de usuario
 *          description: Eliminar una asignación usuario-sucursal
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la asignación
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: Asignación eliminada correctamente
 *              '404':
 *                  description: Asignación no encontrada
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.ADMIN], USER_BRANCH.DELETE)
], deleteRecord);

module.exports = router;
