const express = require('express');
const router = express.Router();

const { validatePeriodId } = require('../../validators/satAccounting');
const authMiddleware = require('../../middlewares/session');
const checkRol = require('../../middlewares/rol');
const { writeLimiter } = require('../../middlewares/rateLimiters');
const { postCatalog, postVouchers } = require('../../controllers/satAccounting');
const { ACCOUNTING_PERIOD } = require('../../constants/modules');
const { ROLE } = require('../../constants/roles');

/**
 * @openapi
 * /accounting/sat/catalog/{periodId}:
 *   post:
 *     tags:
 *       - accounting-sat
 *     summary: Generar XML Catálogo de Cuentas SAT
 *     description: |
 *       Genera el XML del Catálogo de Cuentas según el Anexo 24 del SAT (versión 1.3).
 *       Incluye todas las cuentas activas con NumCta, Desc, CodAgrup, Nivel y Natur.
 *       Persiste el XML en el campo sat_catalog_xml del período.
 *       Retorna el XML como archivo descargable.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: periodId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: XML del Catálogo de Cuentas generado correctamente
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       '404':
 *         description: Período no encontrado
 */
router.post('/catalog/:periodId', [
  writeLimiter,
  authMiddleware,
  validatePeriodId,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.VIEW_ALL)
], postCatalog);

/**
 * @openapi
 * /accounting/sat/vouchers/{periodId}:
 *   post:
 *     tags:
 *       - accounting-sat
 *     summary: Generar XML Pólizas del Período SAT
 *     description: |
 *       Genera el XML de Pólizas del Período según el Anexo 24 del SAT (versión 1.3).
 *       Solo incluye pólizas en estado 'aplicada'.
 *       Persiste el XML en sat_vouchers_xml y cambia el período a status='bloqueado'.
 *       El período debe estar en estado 'cerrado' o 'bloqueado'.
 *       Retorna el XML como archivo descargable.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: periodId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: XML de Pólizas generado correctamente
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       '404':
 *         description: Período no encontrado
 *       '409':
 *         description: El período debe estar cerrado o bloqueado
 */
router.post('/vouchers/:periodId', [
  writeLimiter,
  authMiddleware,
  validatePeriodId,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.VIEW_ALL)
], postVouchers);

module.exports = router;
