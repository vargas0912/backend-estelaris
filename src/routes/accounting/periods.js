const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord } = require('../../validators/accountingPeriods');

const authMiddleware = require('../../middlewares/session');
const checkRol = require('../../middlewares/rol');
const { readLimiter, writeLimiter } = require('../../middlewares/rateLimiters');

const {
  getRecords,
  getCurrent,
  getRecord,
  addRecord,
  closeRecord,
  reopenRecord,
  lockRecord
} = require('../../controllers/accountingPeriods');
const { ACCOUNTING_PERIOD } = require('../../constants/modules');
const { ROLE } = require('../../constants/roles');

/**
 * @openapi
 * /accounting/periods/current:
 *   get:
 *     tags:
 *       - accounting-periods
 *     summary: Período contable activo
 *     description: Retorna el período con status 'abierto'. Solo puede existir uno a la vez.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Período activo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingPeriods'
 *       '404':
 *         description: No hay período abierto actualmente
 */
router.get('/current', [
  readLimiter,
  authMiddleware,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.VIEW_ALL)
], getCurrent);

/**
 * @openapi
 * /accounting/periods:
 *   get:
 *     tags:
 *       - accounting-periods
 *     summary: Lista de períodos contables
 *     description: Retorna todos los períodos ordenados por año/mes descendente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Arreglo de períodos contables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/accountingPeriods'
 */
router.get('/', [
  readLimiter,
  authMiddleware,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /accounting/periods/{id}:
 *   get:
 *     tags:
 *       - accounting-periods
 *     summary: Período contable por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Objeto del período contable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingPeriods'
 *       '404':
 *         description: Período no encontrado
 *       '422':
 *         description: Error de validación
 */
router.get('/:id', [
  readLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /accounting/periods:
 *   post:
 *     tags:
 *       - accounting-periods
 *     summary: Crear período contable
 *     description: |
 *       Crea un nuevo período en estado 'abierto'.
 *       Reglas: el par año-mes debe ser único; el período anterior (mes-1) no puede estar abierto.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *               - month
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Enero 2026"
 *               year:
 *                 type: integer
 *                 minimum: 2000
 *                 maximum: 2100
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *     responses:
 *       '200':
 *         description: Período creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingPeriods'
 *       '422':
 *         description: El período ya existe o el período anterior aún está abierto
 */
router.post('/', [
  writeLimiter,
  authMiddleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.ADD)
], addRecord);

/**
 * @openapi
 * /accounting/periods/{id}/close:
 *   put:
 *     tags:
 *       - accounting-periods
 *     summary: Cerrar período contable
 *     description: |
 *       Cierra el período (status → 'cerrado'). Guarda closed_at, usuario que cerró
 *       y snapshot del balance en ese momento. Solo aplica a períodos 'abierto'.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Período cerrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingPeriods'
 *       '404':
 *         description: Período no encontrado
 *       '409':
 *         description: El período no está en estado abierto
 */
router.put('/:id/close', [
  writeLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.CLOSE)
], closeRecord);

/**
 * @openapi
 * /accounting/periods/{id}/reopen:
 *   put:
 *     tags:
 *       - accounting-periods
 *     summary: Reabrir período contable
 *     description: |
 *       Revierte el período a 'abierto'. Solo aplica a períodos 'cerrado'.
 *       Los períodos 'bloqueado' no pueden reabrirse.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Período reabierto correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingPeriods'
 *       '404':
 *         description: Período no encontrado
 *       '409':
 *         description: El período está bloqueado o no está cerrado
 */
router.put('/:id/reopen', [
  writeLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.REOPEN)
], reopenRecord);

/**
 * @openapi
 * /accounting/periods/{id}/lock:
 *   put:
 *     tags:
 *       - accounting-periods
 *     summary: Bloquear período contable
 *     description: |
 *       Bloquea definitivamente el período (status → 'bloqueado'). Operación irreversible.
 *       Solo aplica a períodos 'cerrado'. Requiere privilegio especial.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Período bloqueado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingPeriods'
 *       '404':
 *         description: Período no encontrado
 *       '409':
 *         description: El período ya está bloqueado o no está cerrado
 */
router.put('/:id/lock', [
  writeLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_PERIOD.LOCK)
], lockRecord);

module.exports = router;
