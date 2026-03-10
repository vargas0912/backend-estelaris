const express = require('express');
const router = express.Router();

const { valiUpdateRecord } = require('../validators/systemSettings');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const { getRecords, getRecord, updateRecord } = require('../controllers/systemSettings');

const { SYSTEM_SETTINGS } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /system-settings:
 *    get:
 *      tags:
 *        - system-settings
 *      summary: Lista de configuraciones del sistema
 *      description: Obtiene todas las configuraciones. Acepta ?category= para filtrar por categoría.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: category
 *          in: query
 *          required: false
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Arreglo de configuraciones
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], SYSTEM_SETTINGS.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /system-settings/{key}:
 *    get:
 *      tags:
 *        - system-settings
 *      summary: Configuración por clave
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: key
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Objeto de la configuración
 *        '404':
 *          description: Configuración no encontrada
 */
router.get('/:key', [
  searchLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], SYSTEM_SETTINGS.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /system-settings/{key}:
 *    put:
 *      tags:
 *        - system-settings
 *      summary: Actualizar valor de configuración
 *      description: |
 *        Actualiza el valor de una configuración identificada por su clave.
 *        Requiere rol superadmin o privilegio update_system_setting.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: key
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - value
 *              properties:
 *                value:
 *                  type: string
 *      responses:
 *        '200':
 *          description: Configuración actualizada
 *        '400':
 *          description: Error de validación
 *        '404':
 *          description: Configuración no encontrada
 */
router.put('/:key', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.SUPERADMIN], SYSTEM_SETTINGS.UPDATE)
], updateRecord);

module.exports = router;
