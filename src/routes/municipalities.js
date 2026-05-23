const express = require('express');
const router = express.Router();

const { validateGetRecord, validateGetRecordByState, validateGetAll, valiAddRecord, valiUpdateRecord, validateDeleteRecord } = require('../validators/municipalities');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getById, getByStateId, getAll, addRecord, updateRecord, deleteRecord } = require('../controllers/municipalities');

const { MUNICIPALITIES: MUN } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * Get municipalities autocomplete search
 * @openapi
 * /municipalities:
 *    get:
 *      tags:
 *        - municipalities
 *      summary: Autocomplete de municipios por nombre
 *      description: Busqueda por nombre (Op.like) con estado embebido, limitada por limit
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - in: query
 *        name: search
 *        required: true
 *        schema:
 *          type: string
 *        description: Texto a buscar en el nombre del municipio
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 15
 *        description: Maximo de resultados
 *      responses:
 *        '200':
 *          description: Lista de municipios coincidentes
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/MunicipalitiesAutocompleteResponse'
 *        '401':
 *          description: No autenticado
 *        '403':
 *          description: Sin permiso
 *        '400':
 *          description: Error de validacion
 */
router.get('/', [
  readLimiter,
  authMidleware,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.VIEW_ALL)], getAll);

/**
 * Get detail from municipality id
 * @openapi
 * /municipalities/{id}:
 *    get:
 *      tags:
 *        - municipalities
 *      summary: Municipio por identificador
 *      description: Consulta de municipio mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del municipio
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del municipio consultado
 *          content:
 *             application/json:
 *               schema:
 *                   $ref: '#/components/schemas/municipalities'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.VIEW_ALL)], getById);

/**
* Get detail from municipalities
* @openapi
* /municipalities/state/{stateId}:
*    get:
*      tags:
*        - municipalities
*      summary: Municipios por estado
*      description: Consulta de municipios por estado de la republica
*      security:
*        - bearerAuth: []
*      parameters:
*      - name: stateId
*        in: path
*        description: Identificador del estado
*        required: true
*        schema:
*          type: number
*      - in: query
*        name: page
*        schema:
*          type: integer
*          minimum: 1
*          default: 1
*        description: Número de página
*      - in: query
*        name: limit
*        schema:
*          type: integer
*          minimum: 1
*          maximum: 100
*          default: 20
*        description: Registros por página
*      - in: query
*        name: search
*        schema:
*          type: string
*        description: Filtra municipios cuyo nombre contenga el texto (opcional)
*      responses:
*        '200':
*          description: Lista de municipios del estado paginada
*          content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   municipalities:
*                     type: array
*                     items:
*                       $ref: '#/components/schemas/municipalities'
*                   pagination:
*                     $ref: '#/components/schemas/pagination'
*        '422':
*          description: Error de validacion.
*/
router.get('/state/:stateId', [
  readLimiter,
  authMidleware,
  validateGetRecordByState,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.VIEW_ALL)], getByStateId);

/**
 * @openapi
 * /municipalities:
 *      post:
 *          tags:
 *              - municipalities
 *          summary: Crear nuevo municipio
 *          description: Crear nuevo municipio previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                              - state_id
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Nombre del municipio
 *                              state_id:
 *                                  type: integer
 *                                  description: Identificador del estado al que pertenece
 *          responses:
 *              '201':
 *                  description: Municipio creado correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/municipalities'
 *              '400':
 *                  description: Error de validacion
 *              '401':
 *                  description: No autenticado
 *              '403':
 *                  description: Sin permiso
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.ADD)
], addRecord);

/**
 * @openapi
 * /municipalities/{id}:
 *      put:
 *          tags:
 *              - municipalities
 *          summary: Actualizar municipio
 *          description: Actualizar datos de un municipio previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del municipio
 *            required: true
 *            schema:
 *              type: integer
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                              - state_id
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Nuevo nombre del municipio
 *                              state_id:
 *                                  type: integer
 *                                  description: Identificador del estado al que pertenece
 *          responses:
 *              '200':
 *                  description: Municipio actualizado correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/municipalities'
 *              '400':
 *                  description: Error de validacion
 *              '401':
 *                  description: No autenticado
 *              '403':
 *                  description: Sin permiso
 *              '404':
 *                  description: Municipio no encontrado
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.UPDATE)
], updateRecord);

/**
 * @openapi
 * /municipalities/{id}:
 *      delete:
 *          tags:
 *              - municipalities
 *          summary: Eliminacion de municipio
 *          description: Eliminacion logica de un municipio
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del municipio
 *            required: true
 *            schema:
 *              type: integer
 *          responses:
 *              '200':
 *                  description: El municipio se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de municipio invalido
 *              '401':
 *                  description: No autenticado
 *              '403':
 *                  description: Sin permiso
 *              '404':
 *                  description: Municipio no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateDeleteRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.DELETE)
], deleteRecord);

module.exports = router;
