const express = require('express');
const router = express.Router();

const { validateJournal, validateLedger, validatePeriod, validateIncomeStatement } = require('../../validators/accountingReports');
const authMiddleware = require('../../middlewares/session');
const checkRol = require('../../middlewares/rol');
const { readLimiter } = require('../../middlewares/rateLimiters');
const { getJournal, getLedger, getTrialBalance, getBalanceSheet, getIncomeStatement } = require('../../controllers/accountingReports');
const { ACCOUNTING_VOUCHER } = require('../../constants/modules');
const { ROLE } = require('../../constants/roles');

/**
 * @openapi
 * /accounting/reports/journal:
 *   get:
 *     tags:
 *       - accounting-reports
 *     summary: Libro diario
 *     description: |
 *       Retorna todas las pólizas aplicadas con sus líneas contables.
 *       Se puede filtrar por período, sucursal y/o rango de fechas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: branch_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: date_from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: date_to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Lista de pólizas con líneas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vouchers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/accountingVouchers'
 *       '400':
 *         description: Error en los parámetros o error inesperado
 */
router.get('/journal', [
  readLimiter,
  authMiddleware,
  validateJournal,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getJournal);

/**
 * @openapi
 * /accounting/reports/ledger:
 *   get:
 *     tags:
 *       - accounting-reports
 *     summary: Mayor contable
 *     description: |
 *       Movimientos de una cuenta específica con saldo inicial, saldo acumulado por línea
 *       y saldo final. Requiere account_id. Filtros opcionales: period_id o date_from/date_to.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: account_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *       - name: period_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: date_from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: date_to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Mayor de la cuenta con saldos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account:
 *                   type: object
 *                 opening_balance:
 *                   type: number
 *                 movements:
 *                   type: array
 *                 closing_balance:
 *                   type: number
 *       '400':
 *         description: Error en parámetros o error inesperado
 *       '404':
 *         description: Cuenta no encontrada
 */
router.get('/ledger', [
  readLimiter,
  authMiddleware,
  validateLedger,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getLedger);

/**
 * @openapi
 * /accounting/reports/trial-balance:
 *   get:
 *     tags:
 *       - accounting-reports
 *     summary: Balanza de comprobación
 *     description: |
 *       Sumas y saldos deudores/acreedores por cuenta para un período.
 *       Incluye totales generales y verificación de balance (cuadre).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Balanza de comprobación del período
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period_id:
 *                   type: integer
 *                 accounts:
 *                   type: array
 *                 total_debit:
 *                   type: number
 *                 total_credit:
 *                   type: number
 *                 balanced:
 *                   type: boolean
 *       '400':
 *         description: Error en parámetros o error inesperado
 */
router.get('/trial-balance', [
  readLimiter,
  authMiddleware,
  validatePeriod,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getTrialBalance);

/**
 * @openapi
 * /accounting/reports/balance-sheet:
 *   get:
 *     tags:
 *       - accounting-reports
 *     summary: Balance general
 *     description: |
 *       Estado de posición financiera agrupado por activo, pasivo y capital.
 *       Incluye totales y verificación de la ecuación contable.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Balance general del período
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period_id:
 *                   type: integer
 *                 activo:
 *                   type: object
 *                 pasivo:
 *                   type: object
 *                 capital:
 *                   type: object
 *                 total_pasivo_capital:
 *                   type: number
 *                 balanced:
 *                   type: boolean
 *       '400':
 *         description: Error en parámetros o error inesperado
 */
router.get('/balance-sheet', [
  readLimiter,
  authMiddleware,
  validatePeriod,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getBalanceSheet);

/**
 * @openapi
 * /accounting/reports/income-statement:
 *   get:
 *     tags:
 *       - accounting-reports
 *     summary: Estado de resultados
 *     description: |
 *       Ingresos, costos y egresos de un período con cálculo de utilidad bruta y neta.
 *       Se puede filtrar opcionalmente por sucursal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *       - name: branch_id
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Estado de resultados del período
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period_id:
 *                   type: integer
 *                 branch_id:
 *                   type: integer
 *                   nullable: true
 *                 ingresos:
 *                   type: object
 *                 costos:
 *                   type: object
 *                 egresos:
 *                   type: object
 *                 ventas_netas:
 *                   type: number
 *                 costo_ventas:
 *                   type: number
 *                 utilidad_bruta:
 *                   type: number
 *                 gastos_operacion:
 *                   type: number
 *                 utilidad_neta:
 *                   type: number
 *       '400':
 *         description: Error en parámetros o error inesperado
 */
router.get('/income-statement', [
  readLimiter,
  authMiddleware,
  validateIncomeStatement,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getIncomeStatement);

module.exports = router;
