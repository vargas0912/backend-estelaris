const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');

const { validateGetUser, validateUpdateUser } = require('../validators/auth');

const { getRecords, updateRecord, deleteRecord, getRecord } = require('../controllers/user');

const { ROLE } = require('../constants/roles');
const { USERS } = require('../constants/privileges');

/**
 * @openapi
 * /users:
 *    get:
 *      tags:
 *        - users
 *      summary: Lista de usuarios
 *      description: Devuelve la lista de usuarios activos
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Retorna lista de usuarios
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/users'
 *        '422':
 *          description: Error de validacion
 */
router.get('/', [
  authMidleware,
  checkRol([ROLE.ADMIN, ROLE.SUPERADMIN], USERS.VIEW_ALL)
], getRecords);

/**
 * Get detail from user
 * @openapi
 * /users/{id}:
 *    get:
 *      tags:
 *        - users
 *      summary: Usuario por identificador
 *      description: Devuelve el usuario que coincida con el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del usuario a consultar
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorn el usaurio solicitado
 *          content:
 *             application/json:
 *               schema:
 *                   $ref: '#/components/schemas/users'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  authMidleware,
  validateGetUser,
  checkRol([ROLE.ADMIN, ROLE.SUPERADMIN], USERS.VIEW)
], getRecord);

/**
 * Register new user
 * @openapi
 * /users/{id}:
 *      put:
 *          tags:
 *              - users
 *          summary: Actualiación de uusarios
 *          description: Actualiza los datos del usuario que coincida con el Id proporcionado
 *          security:
 *              - bearerAuth: []
 *          operationId: "updateUser"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del usuario a modificar
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/users"
 *          responses:
 *              default:
 *                  description: Actualización de usuarios
 *              '201':
 *                  description: Usuarios modificado exitosamente
 *              '403':
 *                  description: Error de validacion
 */
router.put('/:id', [
  authMidleware,
  validateUpdateUser,
  checkRol([ROLE.ADMIN, ROLE.SUPERADMIN], USERS.UPDATE)
], updateRecord);

/**
 * Register new user
 * @openapi
 * /users/{id}:
 *      delete:
 *          tags:
 *              - users
 *          summary: Eliminación de usuarios
 *          description: Elimina el usuario que coincida con el Id proporcionado
 *          security:
 *              - bearerAuth: []
 *          operationId: "deleteUser"
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del usuario a eliminar
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              default:
 *                  description: Eliminación logica de usuarios
 *              '201':
 *                  description: Usuario eliminado exitosamente
 *              '403':
 *                  description: Error de validacion
 */
router.delete('/:id', [
  authMidleware,
  validateGetUser,
  checkRol([ROLE.ADMIN, ROLE.SUPERADMIN], USERS.DELETE)
], deleteRecord);

module.exports = router;
