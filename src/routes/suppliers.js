'use strict';

const express = require('express');
const router = express.Router();

const { validateGetSupplier, valiAddSupplier, valiUpdateSupplier } = require('../validators/suppliers');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/suppliers');
const { SUPPLIER } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /suppliers:
 *    get:
 *      tags:
 *        - suppliers
 *      summary: Lista de proveedores
 *      description: Obtener toda la lista de proveedores activos
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los proveedores.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], SUPPLIER.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /suppliers/{id}:
 *    get:
 *      tags:
 *        - suppliers
 *      summary: Proveedor por identificador
 *      description: Consulta de proveedor mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del proveedor
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objeto del proveedor consultado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetSupplier,
  checkRol([ROLE.USER, ROLE.ADMIN], SUPPLIER.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /suppliers:
 *      post:
 *          tags:
 *              - suppliers
 *          summary: Crear nuevo proveedor
 *          description: Crear nuevo proveedor previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                              - email
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Razon social del proveedor
 *                              trade_name:
 *                                  type: string
 *                                  description: Nombre comercial (opcional)
 *                              tax_id:
 *                                  type: string
 *                                  description: RFC del proveedor (opcional)
 *                              contact_name:
 *                                  type: string
 *                                  description: Nombre de la persona de contacto
 *                              email:
 *                                  type: string
 *                                  format: email
 *                                  description: Correo electronico
 *                              phone:
 *                                  type: string
 *                                  description: Telefono fijo
 *                              mobile:
 *                                  type: string
 *                                  description: Telefono movil
 *                              address:
 *                                  type: string
 *                                  description: Direccion del proveedor
 *                              municipality_id:
 *                                  type: number
 *                                  description: ID del municipio
 *                              postal_code:
 *                                  type: string
 *                                  description: Codigo postal
 *                              website:
 *                                  type: string
 *                                  description: Sitio web
 *                              payment_terms:
 *                                  type: string
 *                                  description: Condiciones de pago
 *                              credit_limit:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Limite de credito
 *                              notes:
 *                                  type: string
 *                                  description: Notas adicionales
 *                              is_active:
 *                                  type: boolean
 *                                  description: Estado activo/inactivo
 *          responses:
 *              '201':
 *                  description: Proveedor creado correctamente
 *              '403':
 *                  description: Error al crear el nuevo proveedor
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddSupplier,
  checkRol([ROLE.USER, ROLE.ADMIN], SUPPLIER.ADD)
], addRecord);

/**
 * @openapi
 * /suppliers/{id}:
 *      put:
 *          tags:
 *              - suppliers
 *          summary: Actualizar proveedor
 *          description: Actualizar datos de proveedor previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del proveedor
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *                              trade_name:
 *                                  type: string
 *                              tax_id:
 *                                  type: string
 *                              contact_name:
 *                                  type: string
 *                              email:
 *                                  type: string
 *                                  format: email
 *                              phone:
 *                                  type: string
 *                              mobile:
 *                                  type: string
 *                              address:
 *                                  type: string
 *                              municipality_id:
 *                                  type: number
 *                              postal_code:
 *                                  type: string
 *                              website:
 *                                  type: string
 *                              payment_terms:
 *                                  type: string
 *                              credit_limit:
 *                                  type: number
 *                                  format: decimal
 *                              notes:
 *                                  type: string
 *                              is_active:
 *                                  type: boolean
 *          responses:
 *              '201':
 *                  description: Proveedor modificado correctamente
 *              '403':
 *                  description: Error al actualizar el proveedor
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateSupplier,
  checkRol([ROLE.USER, ROLE.ADMIN], SUPPLIER.UPDATE)
], updateRecord);

/**
 * @openapi
 * /suppliers/{id}:
 *      delete:
 *          tags:
 *              - suppliers
 *          summary: Eliminacion de proveedor
 *          description: Eliminacion logica de un proveedor
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del proveedor
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El proveedor se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de proveedor invalido
 *              '404':
 *                  description: Proveedor no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetSupplier,
  checkRol([ROLE.USER, ROLE.ADMIN], SUPPLIER.DELETE)
], deleteRecord);

module.exports = router;
