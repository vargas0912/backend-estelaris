const express = require('express');
const router = express.Router();

const { registerAdminCtrl, registerCtrl, loginCtrl, refreshCtrl, logoutCtrl, verifyPasswordCtrl } = require('../controllers/auth');
const { validateLogin, validateRegister, validateVerifyPassword } = require('../validators/auth');

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

/**
 * @openapi
 * /auth/refresh:
 *    post:
 *      tags:
 *        - auth
 *      summary: Renovar token de sesión
 *      description: Emite un nuevo token JWT con ventana de 2 horas a partir de ahora. Requiere un token válido (no expirado). El frontend debe llamar este endpoint antes de que el token expire para mantener la sesión activa.
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Token renovado exitosamente
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/tokenRefresh'
 *        '401':
 *          description: Token inválido o expirado — debe iniciar sesión nuevamente
 */
router.post('/refresh', [authMidleware], refreshCtrl);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - auth
 *     summary: Cerrar sesión
 *     description: Invalida la cookie HttpOnly del token. El cliente debe descartar el token JWT almacenado localmente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sesión cerrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada
 *       '401':
 *         description: Token inválido o ausente
 */
router.post('/logout', authMidleware, logoutCtrl);

/**
 * @openapi
 * /auth/verify-password:
 *   post:
 *     tags:
 *       - auth
 *     summary: Verificar contraseña del usuario activo
 *     description: Confirma que la contraseña enviada corresponde al usuario autenticado. Usado para autorizar acciones sensibles sin cerrar sesión.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Contraseña válida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       '401':
 *         description: Contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: client
 *                       name:
 *                         type: string
 *                         example: password
 *                       message:
 *                         type: string
 *                         example: Contraseña incorrecta
 */
router.post('/verify-password', [authMidleware, validateVerifyPassword], verifyPasswordCtrl);

module.exports = router;
