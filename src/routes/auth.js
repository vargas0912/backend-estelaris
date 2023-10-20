const express = require('express');
const router = express.Router();

const { registerAdminCtrl, registerCtrl, loginCtrl } = require('../controllers/auth');
const { validateLogin, validateRegister } = require('../validators/auth');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');

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
 *          description: Alta de usuarios nuevos*
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
 *              '403':
 *                  description: Error al registrar nuevo usuario
 */
router.post('/registerSuperUser', validateRegister, registerAdminCtrl);

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
