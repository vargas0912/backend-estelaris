const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/productCategories');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/productCategories');
const { PRODUCT_CATEGORY } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /product-categories:
 *    get:
 *      tags:
 *        - productCategories
 *      summary: Lista de categorías de productos
 *      description: Obtener toda la lista de categorías de productos activas
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todas las categorías.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_CATEGORY.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /product-categories/{id}:
 *    get:
 *      tags:
 *        - productCategories
 *      summary: Categoría por identificador
 *      description: Consulta de categoría mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador de la categoría
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objeto de la categoría consultada
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_CATEGORY.VIEW)
], getRecord);

/**
 * @openapi
 * /product-categories:
 *      post:
 *          tags:
 *              - productCategories
 *          summary: Crear nueva categoría de producto
 *          description: Crear nueva categoría de producto previo inicio de sesion
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
 *                              description:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: Categoría creada correctamente
 *              '403':
 *                  description: Error al crear la nueva categoría
 */
router.post('/', [
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_CATEGORY.ADD)
], addRecord);

/**
 * @openapi
 * /product-categories/{id}:
 *      put:
 *          tags:
 *              - productCategories
 *          summary: Actualizar categoría de producto
 *          description: Actualizar datos de categoría previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la categoría
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
 *                              description:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: Categoría modificada correctamente
 *              '403':
 *                  description: Error al actualizar la categoría
 */
router.put('/:id', [
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_CATEGORY.UPDATE)
], updateRecord);

/**
 * @openapi
 * /product-categories/{id}:
 *      delete:
 *          tags:
 *              - productCategories
 *          summary: Eliminación de categoría de producto
 *          description: Eliminación lógica de una categoría de producto
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la categoría
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: La categoría se ha marcado como eliminada satisfactoriamente
 *              '400':
 *                  description: Id de categoría inválido
 *              '404':
 *                  description: Categoría no encontrada
 */
router.delete('/:id', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_CATEGORY.DELETE)
], deleteRecord);

module.exports = router;
