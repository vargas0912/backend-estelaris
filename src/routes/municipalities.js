const express = require('express');
const router = express.Router();

const { validateGetRecord, validateGetRecordByState } = require('../validators/municipalities');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter } = require('../middlewares/rateLimiters');

const { getById, getByStateId } = require('../controllers/municipalities');

const { MUNICIPALITIES: MUN } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

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
*      responses:
*        '200':
*          description: Retorna el objecto de todos los municpios del estado especificado
*          content:
*             application/json:
*               schema:
*                   $ref: '#/components/schemas/municipalities'
*        '422':
*          description: Error de validacion.
*/
router.get('/state/:stateId', [
  readLimiter,
  authMidleware,
  validateGetRecordByState,
  checkRol([ROLE.USER, ROLE.ADMIN], MUN.VIEW_ALL)], getByStateId);

module.exports = router;
