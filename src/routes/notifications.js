const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter } = require('../middlewares/rateLimiters');

const {
  addRecord,
  getSentRecords,
  updateRecord,
  cancelRecord,
  getMyRecords,
  getMyUnreadCount,
  readRecord,
  readAllRecords,
  archiveRecord
} = require('../controllers/notifications');

const {
  validateAddRecord,
  validateUpdateRecord,
  validateIdParam,
  validateGetSent,
  validateGetMine,
  validateNoInput
} = require('../validators/notifications');

const { ROLE } = require('../constants/roles');
const { NOTIFICATIONS: N } = require('../constants/privileges');

// Las rutas fijas (/me, /me/count, /read-all, /sent) se declaran antes de las parametrizadas (/:id)

/**
 * @openapi
 * /notifications/me:
 *    get:
 *      tags:
 *        - notifications
 *      summary: Mis notificaciones
 *      description: Notificaciones visibles (no canceladas y ya vencidas) del usuario autenticado; las archivadas se ocultan
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: unread
 *        in: query
 *        description: true para solo no leidas
 *        schema:
 *          type: boolean
 *      - name: page
 *        in: query
 *        schema:
 *          type: integer
 *      - name: limit
 *        in: query
 *        schema:
 *          type: integer
 *      responses:
 *        '200':
 *          description: Lista paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  notifications:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/notification'
 *                  pagination:
 *                    type: object
 *        '400':
 *          description: Error de validacion
 */

router.get('/me', [readLimiter, authMidleware, validateGetMine], getMyRecords);

/**
 * @openapi
 * /notifications/me/count:
 *    get:
 *      tags:
 *        - notifications
 *      summary: Conteo de no leidas
 *      description: Cantidad de notificaciones visibles, no leidas y no archivadas
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Conteo
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  unread:
 *                    type: integer
 */

router.get('/me/count', [readLimiter, authMidleware, validateNoInput], getMyUnreadCount);

/**
 * @openapi
 * /notifications/read-all:
 *    patch:
 *      tags:
 *        - notifications
 *      summary: Marcar todas como leidas
 *      description: Marca como leidas todas las notificaciones visibles y no leidas del usuario
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Cantidad actualizada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  updated:
 *                    type: integer
 */

router.patch('/read-all', [writeLimiter, authMidleware, validateNoInput], readAllRecords);

/**
 * @openapi
 * /notifications/sent:
 *    get:
 *      tags:
 *        - notifications
 *      summary: Notificaciones enviadas
 *      description: Lista por destinatario con status (scheduled, delivered, read, cancelled). Con batch_id incluye resumen del lote. Un admin solo ve lo que creo (resumen incluido); superadmin ve todo. Requiere create_notification
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: batch_id
 *        in: query
 *        schema:
 *          type: string
 *          format: uuid
 *      - name: user_id
 *        in: query
 *        schema:
 *          type: integer
 *      - name: page
 *        in: query
 *        schema:
 *          type: integer
 *      - name: limit
 *        in: query
 *        schema:
 *          type: integer
 *      responses:
 *        '200':
 *          description: Lista paginada con resumen
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  notifications:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/notification'
 *                  pagination:
 *                    type: object
 *                  summary:
 *                    nullable: true
 *                    $ref: '#/components/schemas/notificationBatchSummary'
 *        '400':
 *          description: Error de validacion
 *        '403':
 *          description: Sin permisos
 */

router.get('/sent', [
  readLimiter,
  authMidleware,
  validateGetSent,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], N.CREATE)
], getSentRecords);

/**
 * @openapi
 * /notifications:
 *    post:
 *      tags:
 *        - notifications
 *      summary: Crear notificaciones
 *      description: Crea una notificacion por destinatario (user_ids o branch_id como selector de destinatarios) con un batch_id compartido. Requiere create_notification
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/notificationCreateRequest'
 *      responses:
 *        '201':
 *          description: Notificaciones creadas
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  batch_id:
 *                    type: string
 *                    format: uuid
 *                  total:
 *                    type: integer
 *                  notifications:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/notification'
 *        '400':
 *          description: Error de validacion o sin destinatarios
 *        '403':
 *          description: Sin permisos
 */

router.post('/', [
  writeLimiter,
  authMidleware,
  validateAddRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], N.CREATE)
], addRecord);

/**
 * @openapi
 * /notifications/{id}/read:
 *    patch:
 *      tags:
 *        - notifications
 *      summary: Marcar como leida
 *      description: Fija read_at en el servidor; idempotente, conserva la primera lectura. Solo notificaciones propias
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: ID de la notificacion
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Notificacion
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  notification:
 *                    $ref: '#/components/schemas/notification'
 *        '404':
 *          description: No existe o no es del usuario
 */

router.patch('/:id/read', [writeLimiter, authMidleware, validateIdParam], readRecord);

/**
 * @openapi
 * /notifications/{id}/archive:
 *    patch:
 *      tags:
 *        - notifications
 *      summary: Archivar
 *      description: Oculta la notificacion de /me. Solo notificaciones propias
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: ID de la notificacion
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Notificacion archivada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  notification:
 *                    $ref: '#/components/schemas/notification'
 *        '404':
 *          description: No existe o no es del usuario
 */

router.patch('/:id/archive', [writeLimiter, authMidleware, validateIdParam], archiveRecord);

/**
 * @openapi
 * /notifications/{id}/cancel:
 *    patch:
 *      tags:
 *        - notifications
 *      summary: Cancelar
 *      description: Cancela una notificacion mientras scheduled_at sea futuro. Requiere create_notification
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: ID de la notificacion
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Notificacion cancelada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  notification:
 *                    $ref: '#/components/schemas/notification'
 *        '400':
 *          description: Error de validacion
 *        '403':
 *          description: Sin permisos
 *        '404':
 *          description: Notificacion no encontrada
 *        '409':
 *          description: Ya fue entregada o cancelada
 */

router.patch('/:id/cancel', [
  writeLimiter,
  authMidleware,
  validateIdParam,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], N.CREATE)
], cancelRecord);

/**
 * @openapi
 * /notifications/{id}:
 *    patch:
 *      tags:
 *        - notifications
 *      summary: Editar
 *      description: Edita title, body, scheduled_at o due_at mientras scheduled_at sea futuro. Requiere create_notification
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: ID de la notificacion
 *        schema:
 *          type: number
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/notificationUpdateRequest'
 *      responses:
 *        '200':
 *          description: Notificacion actualizada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  notification:
 *                    $ref: '#/components/schemas/notification'
 *        '400':
 *          description: Error de validacion
 *        '403':
 *          description: Sin permisos
 *        '404':
 *          description: Notificacion no encontrada
 *        '409':
 *          description: Ya fue entregada o cancelada
 */

router.patch('/:id', [
  writeLimiter,
  authMidleware,
  validateUpdateRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], N.CREATE)
], updateRecord);

module.exports = router;
