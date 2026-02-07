const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/positions');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/positions');
const { POSITION } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /positions:
 *    get:
 *      tags:
 *        - positions
 *      summary: Lista de puestos
 *      description: Obtener toda la lista de puestos activos
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los puestos.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], POSITION.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /positions/{id}:
 *    get:
 *      tags:
 *        - positions
 *      summary: Puesto por identificador
 *      description: Consulta de puesto mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del puesto
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del puesto consultado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], POSITION.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /positions:
 *      post:
 *          tags:
 *              - positions
 *          summary: Crear nuevo puesto
 *          description: Crear nuevo puesto previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: Puesto creado correctamente
 *              '403':
 *                  description: Error al crear el nuevo puesto
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], POSITION.ADD)
], addRecord);

/**
 * @openapi
 * /positions/{id}:
 *      put:
 *          tags:
 *              - positions
 *          summary: Actualizar puesto
 *          description: Actualizar datos de puesto previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del puesto
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
 *          responses:
 *              '201':
 *                  description: Puesto modificado correctamente
 *              '403':
 *                  description: Error al actualizar el puesto
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], POSITION.UPDATE)
], updateRecord);

/**
 * @openapi
 * /positions/{id}:
 *      delete:
 *          tags:
 *              - positions
 *          summary: Eliminacion de puesto
 *          description: Eliminacion logica de un puesto
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del puesto
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El puesto se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de puesto invalido
 *              '404':
 *                  description: Puesto no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], POSITION.DELETE)
], deleteRecord);

module.exports = router;
