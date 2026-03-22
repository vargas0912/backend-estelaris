const express = require('express');
const router = express.Router();

const { valiUpdateRecord } = require('../validators/companyInfo');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter } = require('../middlewares/rateLimiters');

const { getRecord, updateRecord } = require('../controllers/companyInfo');

const { COMPANY_INFO } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /company-info:
 *    get:
 *      tags:
 *        - company-info
 *      summary: Información fiscal de la empresa
 *      description: Obtiene el registro singleton con los datos fiscales de la empresa
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Objeto con la información fiscal
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/companyInfo'
 *        '404':
 *          description: Registro no encontrado
 */
router.get('/', [
  readLimiter,
  authMidleware
], getRecord);

/**
 * @openapi
 * /company-info:
 *    put:
 *      tags:
 *        - company-info
 *      summary: Actualizar información fiscal de la empresa
 *      description: |
 *        Actualización parcial del registro de información fiscal.
 *        Solo se modifican los campos enviados en el body.
 *        Requiere rol superadmin o privilegio update_company_info.
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                company_name:
 *                  type: string
 *                  maxLength: 150
 *                trade_name:
 *                  type: string
 *                  maxLength: 150
 *                rfc:
 *                  type: string
 *                  minLength: 12
 *                  maxLength: 13
 *                fiscal_regime:
 *                  type: string
 *                fiscal_address:
 *                  type: string
 *                zip_code:
 *                  type: string
 *                  maxLength: 10
 *                fiscal_email:
 *                  type: string
 *                  format: email
 *                phone:
 *                  type: string
 *                  maxLength: 20
 *                logo_url:
 *                  type: string
 *                  format: uri
 *                website:
 *                  type: string
 *                  format: uri
 *      responses:
 *        '200':
 *          description: Registro actualizado
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/companyInfo'
 *        '400':
 *          description: Error de validación
 *        '404':
 *          description: Registro no encontrado
 */
router.put('/', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.SUPERADMIN], COMPANY_INFO.UPDATE)
], updateRecord);

module.exports = router;
