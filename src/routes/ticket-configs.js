const express = require('express');
const router = express.Router();

const { validateResolve, valiUpdateRecord } = require('../validators/ticketConfigs');

const authMidleware = require('../middlewares/session');
const branchScope = require('../middlewares/branchScope');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter } = require('../middlewares/rateLimiters');

const { getRecords, resolveRecord, updateRecord } = require('../controllers/ticketConfigs');

const { TICKET_CONFIGS } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /ticket-configs:
 *    get:
 *      tags:
 *        - ticket-configs
 *      summary: Configuraciones globales de ticket
 *      description: Lista la configuración global (una por tipo de ticket) para administrarla.
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Configuraciones globales de ticket
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  configs:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/ticketConfigs'
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], TICKET_CONFIGS.VIEW)
], getRecords);

/**
 * @openapi
 * /ticket-configs/resolve:
 *    get:
 *      tags:
 *        - ticket-configs
 *      summary: Configuración efectiva de un ticket
 *      description: |
 *        Devuelve la configuración que debe usar el frontend para imprimir, junto con los datos de la empresa (logo, razón social).
 *        Prioridad: configuración de la sucursal (header X-Branch-ID), global, valores por defecto.
 *        Hoy solo existe configuración global; la resolución por sucursal queda lista para uso futuro.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: type
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *            enum: [sale, payment]
 *      responses:
 *        '200':
 *          description: Configuración resuelta y datos de la empresa
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  config:
 *                    $ref: '#/components/schemas/ticketConfigs'
 *                  company:
 *                    $ref: '#/components/schemas/companyInfo'
 *        '400':
 *          description: Tipo de ticket inválido
 */
router.get('/resolve', [
  readLimiter,
  authMidleware,
  branchScope,
  validateResolve,
  checkRol([ROLE.USER, ROLE.ADMIN], TICKET_CONFIGS.VIEW)
], resolveRecord);

/**
 * @openapi
 * /ticket-configs/{type}:
 *    put:
 *      tags:
 *        - ticket-configs
 *      summary: Actualizar configuración global de ticket
 *      description: Actualiza parcialmente la configuración global del tipo indicado. Requiere privilegio update_ticket_config.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: type
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [sale, payment]
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  maxLength: 100
 *                  nullable: true
 *                header_text:
 *                  type: string
 *                  maxLength: 255
 *                  nullable: true
 *                footer_text:
 *                  type: string
 *                  maxLength: 255
 *                  nullable: true
 *                show_logo:
 *                  type: boolean
 *                show_iva:
 *                  type: boolean
 *                show_barcode:
 *                  type: boolean
 *                show_folio:
 *                  type: boolean
 *                show_cashier:
 *                  type: boolean
 *                show_branch_address:
 *                  type: boolean
 *                paper_width:
 *                  type: string
 *                  enum: ['58mm', '80mm']
 *      responses:
 *        '200':
 *          description: Configuración actualizada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  config:
 *                    $ref: '#/components/schemas/ticketConfigs'
 *        '400':
 *          description: Error de validación o body vacío
 *        '404':
 *          description: Configuración no encontrada
 */
router.put('/:type', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.ADMIN], TICKET_CONFIGS.UPDATE)
], updateRecord);

module.exports = router;
