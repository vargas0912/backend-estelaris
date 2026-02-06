const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const checkOwnPrivilegesOrSuperAdmin = require('../middlewares/checkOwnPrivilegesOrSuperAdmin');

const {
  addUserPrivilegeRecord, // UserPrivilege
  getAllUserPrivilegesRecords,
  getOneUserPrivilegeRecord,
  deleteUserPrivilegeRecord,
  getOnePrivilegeRecord, // Privielges
  getAllPrivilegesRecords,
  addPrivilegeRecord,
  updatePrivilegeRecord,
  deletePrivilegeRecord,
  getPrivilegesByModuleRecords
} = require('../controllers/privileges');

const { validateGetRecord, validateAddRecord, validateUpdateRecord, validateGetRecordByModule } = require('../validators/privileges');
const { validateGetUserAllRecord, validateGetUserOneRecord, validateAddUserRecord, validateDeleteRecord } = require('../validators/user-privilege');

const { ROLE } = require('../constants/roles');
const { PRIVILEGES } = require('../constants/privileges');

/**
 * Privilege routes
 */

/**
 * Get privilege
 * @openapi
 * /privileges:
 *    get:
 *      tags:
 *        - privileges
 *      summary: Todos los privilegios
 *      description: Devuelve una lista con todos los privilegios
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Lista de privilegios.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/privileges'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  authMidleware,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.VIEW)
], getAllPrivilegesRecords);

/**
 * Get privilege
 * @openapi
 * /privileges/{id}:
 *    get:
 *      tags:
 *        - privileges
 *      summary: Privilegios
 *      description: Devuelve un privilegio
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de privilegio
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Detalle de un privilegio.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/privileges'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.VIEW)
], getOnePrivilegeRecord);

/**
 * Get privilege
 * @openapi
 * /privileges/module/{module}:
 *    get:
 *      tags:
 *        - privileges
 *      summary: Privilegios por módulo
 *      description: Devuelve todos los privilegios por módulo
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: module
 *        in: path
 *        description: Nombre del módulo
 *        required: true
 *        schema:
 *          type: string
 *      responses:
 *        '200':
 *          description: Lista de privilegios.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/privileges'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/module/:module', [
  authMidleware,
  validateGetRecordByModule,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.VIEW_MODULE)
], getPrivilegesByModuleRecords);

/**
 * Register new privilege
 * @openapi
 * /privileges:
 *      post:
 *          tags:
 *              - privileges
 *          summary: Crear nuevo privilegio
 *          description: Agregar nuevo privilegio al usuario
 *          security:
 *              - bearerAuth: []
 *          operationId: "createPrivilege"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/privileges"
 *          responses:
 *              default:
 *                  description: Creación de nuevo cliente
 *              '201':
 *                  description: Cliente registrado correctamente
 *              '403':
 *                  description: "Error de validacion"
 */
router.post('/', [
  authMidleware,
  validateAddRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.CREATE)
], addPrivilegeRecord);

/**
 * Actualizar privilegio
 * @openapi
 * /privileges/{id}:
 *      put:
 *          tags:
 *              - privileges
 *          summary: Actualización de privilegios
 *          description: Actualiza datos de un privilegio
 *          security:
 *              - bearerAuth: []
 *          operationId: "updatePrivilege"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del privilegio
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/privileges"
 *          responses:
 *              default:
 *                  description: Actualización de datos del privilegio
 *              '201':
 *                  description: Actualización exitosa
 *              '403':
 *                  description: "Error de validacion del usuario"
 */
router.put('/:id', [
  authMidleware,
  validateUpdateRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.UPDATE)
], updatePrivilegeRecord);

/**
 * Eliminar privilegio
 * @openapi
 * /privileges/{id}:
 *      delete:
 *          tags:
 *              - privileges
 *          summary: eliminacion de privilegios
 *          description: Actualiza datos de un privilegio
 *          security:
 *              - bearerAuth: []
 *          operationId: "deletePrivilege"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del privilegio
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/privileges"
 *          responses:
 *              default:
 *                  description: Actualización de datos del privilegio
 *              '201':
 *                  description: Actualización exitosa
 *              '403':
 *                  description: "Error de validacion del usuario"
 */
router.delete('/:id', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.DELETE)
], deletePrivilegeRecord);

/**
 * User privilege routes +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 */

/**
 * Get all user privilege
 * @openapi
 * /privileges/user/{id}:
 *    get:
 *      tags:
 *        - user-privileges
 *      summary: Relacion Usuario - Privilegios
 *      description: Devuelve todas los relaciones de un usuario - privilegios
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de usuario
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Relacion de usuarios y privilegios.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/userPrivileges'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/user/:id', [
  authMidleware,
  validateGetUserAllRecord,
  checkOwnPrivilegesOrSuperAdmin(PRIVILEGES.VIEW_USER)], getAllUserPrivilegesRecords);

/**
 * Get all user privilege
 * @openapi
 * /privileges/user/{userid}/code/{codename}:
 *    get:
 *      tags:
 *        - user-privileges
 *      summary: Relacion de privilegios de un usuario
 *      description: Devuelve todas los relaciones de privilegios de un usuario
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: userid
 *        in: path
 *        description: ID de usuario
 *        required: true
 *        schema:
 *          type: number
 *      - name: codename
 *        in: path
 *        description: Nombre del codigo
 *        required: true
 *        schema:
 *          type: string
 *      responses:
 *        '200':
 *          description: Relacion de usuarios y privilegios.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/userPrivileges'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/user/:userid/code/:codename', [
  authMidleware,
  validateGetUserOneRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.VIEW_USER)], getOneUserPrivilegeRecord);

/**
 * Register new privilege
 * @openapi
 * /privileges/user:
 *      post:
 *          tags:
 *              - user-privileges
 *          summary: Crear nuevo relacion usuario-privilegio
 *          description: Agregar nuevo privilegio al usuario
 *          security:
 *              - bearerAuth: []
 *          operationId: "createPrivilege"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/userPrivileges"
 *          responses:
 *              default:
 *                  description: Creación de nueva relacion
 *              '201':
 *                  description: relacion registrada correctamente
 *              '403':
 *                  description: "Error de validacion"
 */
router.post('/user/', [
  authMidleware,
  validateAddUserRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.CREATE_USER)], addUserPrivilegeRecord);

/**
 * Register new user
 * @openapi
 * /privileges/user/{userid}/privilege/{pid}:
 *      delete:
 *          tags:
 *              - user-privileges
 *          summary: Eliminacion de privilegios
 *          description: Actualiza datos de un privilegio
 *          security:
 *              - bearerAuth: []
 *          operationId: "updatePrivilege"
 *          parameters:
 *          - name: userid
 *            in: path
 *            description: Identificador del usuario
 *            required: true
 *            schema:
 *              type: number
 *          - name: pid
 *            in: path
 *            description: Identificador del privilegio
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              default:
 *                  description: Actualización de datos del privilegio
 *              '201':
 *                  description: Actualización exitosa
 *              '403':
 *                  description: "Error de validacion del usuario"
 */
router.delete('/user/:userid/privilege/:pid', [
  authMidleware,
  validateDeleteRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PRIVILEGES.DELETE_USER)], deleteUserPrivilegeRecord);

module.exports = router;
