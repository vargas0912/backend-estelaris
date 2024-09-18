const express = require('express');
const router = express.Router();

const { validateGetRecord, validateGetRecordByState } = require('../validators/municipalities');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');

const { getAll, getById, getByStateId } = require('../controllers/municipalities');

const { MUNICIPALITY } = require('../constants/municipalities');
const { ROLE } = require('../constants/roles');

/**
 * Get all municipalities
 * @openapi
 * /municipalities:
 *    get:
 *      tags:
 *        - municipalities
 *      summary: Lista de municipios
 *      description: Obtener toda la lista de municipios
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los municipios.
 *          content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/municipalities'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], MUNICIPALITY.VIEW_ALL)], getAll);

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
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], MUNICIPALITY.VIEW)], getById);

/**
* Get detail from municipalities
* @openapi
* /municipalities/state/{id}:
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
router.get('state/:state_id', [
  authMidleware,
  validateGetRecordByState,
  checkRol([ROLE.USER, ROLE.ADMIN], MUNICIPALITY.VIEW_ALL)], getByStateId);

module.exports = router;
