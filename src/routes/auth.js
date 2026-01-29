const express = require('express');
const router = express.Router();

const { registerAdminCtrl, registerCtrl, loginCtrl } = require('../controllers/auth');
const { validateLogin, validateRegister } = require('../validators/auth');

const authMidleware = require('../middlewares/session');
const conditionalAuthForSuperAdmin = require('../middlewares/conditionalAuth');
const checkRol = require('../middlewares/rol');
const conditionalCheckRol = require('../middlewares/conditionalCheckRol');

const { USERS } = require('../constants/privileges');
const { ROLE } = require('../constants/roles');

/**
 * Register new user
 * @openapi
 * /auth/registerSuperUser:
 *      post:
 *          tags:
 *              - auth
 *          summary: Registrar super usuario
 *          description: Alta de usuarios nuevos. Público solo si no existe ningún superadmin (bootstrap), luego requiere autenticación de superadmin
 *          security:
 *              - bearerAuth: []
 *          operationId: "createSuperUser"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/authRegister"
 *          responses:
 *              default:
 *                  description: Registro de super usuario
 *              '201':
 *                  description: Super usuario registrado correctamente
 *              '401':
 *                  description: No autenticado (cuando ya existe al menos un superadmin)
 *              '403':
 *                  description: Error al registrar nuevo usuario o sin permisos
 */
router.post('/registerSuperUser', [
  conditionalAuthForSuperAdmin,
  conditionalCheckRol([ROLE.SUPERADMIN], USERS.CREATE_SUPERADMIN),
  validateRegister
], registerAdminCtrl);

/**
 * Register new user
 * @openapi
 * /auth/register:
 *      post:
 *          tags:
 *              - auth
 *          summary: Registrar nuevo usuario
 *          description: Alta de usuarios nuevos
 *          security:
 *              - bearerAuth: []
 *          operationId: "createUser"
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/schemas/authRegister"
 *          responses:
 *              default:
 *                  description: Registro de nuevo usuario
 *              '201':
 *                  description: Usuario registrado correctamente
 *              '403':
 *                  description: Error al registrar nuevo usuario
 */
router.post('/register', [
  authMidleware,
  validateRegister,
  checkRol([ROLE.ADMIN, ROLE.SUPERADMIN], USERS.REGISTER)],
registerCtrl
);

/**
 * Login user
 * @openapi
 * /auth/login:
 *    post:
 *      tags:
 *        - auth
 *      summary: Iniciar sesión
 *      description: Iniciar session de usuario y obtener el token de sesión
 *      responses:
 *        '200':
 *          description: Retorna el objeto insertado en la coleccion.
 *        '402':
 *          description: Error de validacion.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: "#/components/schemas/authLogin"
 *    responses:
 *      '201':
 *        description: Retorna el objeto del inicio de sesión'
 *      '403':
 *        description: Error al iniciar sesión '403'
 */
router.post('/login', validateLogin, loginCtrl);

module.exports = router;
