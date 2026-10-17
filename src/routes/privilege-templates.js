const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');

const {
  getAllTemplatesRecords,
  getOneTemplateRecord,
  addTemplateRecord,
  updateTemplateRecord,
  deleteTemplateRecord,
  applyTemplateRecord,
  getSyncPreviewRecord,
  syncTemplateRecord
} = require('../controllers/privilege-templates');

const {
  validateGetAll,
  validateGetRecord,
  validateAddRecord,
  validateUpdateRecord,
  validateApply,
  validateSync
} = require('../validators/privilege-templates');

const { ROLE } = require('../constants/roles');
const { PRIVILEGE_TEMPLATES: PT } = require('../constants/privileges');

/**
 * Privilege template routes
 */

/**
 * Listar plantillas de privilegios
 * @openapi
 * /privilege-templates:
 *    get:
 *      tags:
 *        - privilege-templates
 *      summary: Todas las plantillas de privilegios
 *      description: Devuelve las plantillas con el conteo de privilegios y de usuarios asignados
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Lista de plantillas
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  templates:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/privilegeTemplate'
 *        '403':
 *          description: Sin permisos
 */
router.get('/', [
  authMidleware,
  validateGetAll,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.VIEW)
], getAllTemplatesRecords);

/**
 * Detalle de plantilla
 * @openapi
 * /privilege-templates/{id}:
 *    get:
 *      tags:
 *        - privilege-templates
 *      summary: Detalle de una plantilla
 *      description: Devuelve una plantilla con sus privilegios
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de la plantilla
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Plantilla con privilegios
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  template:
 *                    $ref: '#/components/schemas/privilegeTemplate'
 *        '400':
 *          description: Error de validacion
 *        '404':
 *          description: Plantilla no encontrada
 */
router.get('/:id', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.VIEW)
], getOneTemplateRecord);

/**
 * Crear plantilla
 * @openapi
 * /privilege-templates:
 *    post:
 *      tags:
 *        - privilege-templates
 *      summary: Crear plantilla de privilegios
 *      description: Crea una plantilla (version 1) con un conjunto de privilegios
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/privilegeTemplateRequest'
 *      responses:
 *        '201':
 *          description: Plantilla creada
 *        '400':
 *          description: Error de validacion o privilegios inexistentes
 *        '403':
 *          description: Sin permisos
 */
router.post('/', [
  authMidleware,
  validateAddRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.CREATE)
], addTemplateRecord);

/**
 * Actualizar plantilla
 * @openapi
 * /privilege-templates/{id}:
 *    put:
 *      tags:
 *        - privilege-templates
 *      summary: Actualizar plantilla de privilegios
 *      description: Actualiza nombre, descripcion y/o privilegios. La version solo aumenta cuando cambia el conjunto de privilegios. No propaga cambios a los usuarios (usar sync).
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de la plantilla
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/privilegeTemplateRequest'
 *      responses:
 *        '200':
 *          description: Plantilla actualizada
 *        '400':
 *          description: Error de validacion
 *        '404':
 *          description: Plantilla no encontrada
 */
router.put('/:id', [
  authMidleware,
  validateUpdateRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.UPDATE)
], updateTemplateRecord);

/**
 * Eliminar plantilla
 * @openapi
 * /privilege-templates/{id}:
 *    delete:
 *      tags:
 *        - privilege-templates
 *      summary: Eliminar plantilla de privilegios
 *      description: Elimina (soft delete) una plantilla. Se rechaza si hay usuarios asignados.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de la plantilla
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Plantilla eliminada
 *        '404':
 *          description: Plantilla no encontrada
 *        '409':
 *          description: La plantilla tiene usuarios asignados
 */
router.delete('/:id', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.DELETE)
], deleteTemplateRecord);

/**
 * Aplicar plantilla a un usuario
 * @openapi
 * /privilege-templates/{id}/apply:
 *    post:
 *      tags:
 *        - privilege-templates
 *      summary: Aplicar plantilla a un usuario
 *      description: "mode=replace elimina todos los privilegios del usuario y copia la plantilla; mode=merge agrega solo los faltantes (los existentes quedan como manuales). Los privilegios de la plantilla anterior del usuario se eliminan."
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de la plantilla
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/privilegeTemplateApplyRequest'
 *      responses:
 *        '200':
 *          description: Plantilla aplicada
 *        '400':
 *          description: Error de validacion
 *        '403':
 *          description: Solo un superadmin puede modificar privilegios de un superadmin
 *        '404':
 *          description: Usuario o plantilla no encontrado
 */
router.post('/:id/apply', [
  authMidleware,
  validateApply,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.APPLY)
], applyTemplateRecord);

/**
 * Vista previa de sincronizacion
 * @openapi
 * /privilege-templates/{id}/sync-preview:
 *    get:
 *      tags:
 *        - privilege-templates
 *      summary: Vista previa de sincronizacion
 *      description: Devuelve, por cada usuario asignado, los privilegios que se agregarian y quitarian, y cuales usuarios estan desactualizados (version aplicada menor a la de la plantilla)
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de la plantilla
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Diferencias por usuario
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  preview:
 *                    $ref: '#/components/schemas/privilegeTemplateSyncPreview'
 *        '404':
 *          description: Plantilla no encontrada
 */
router.get('/:id/sync-preview', [
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.SYNC)
], getSyncPreviewRecord);

/**
 * Sincronizar plantilla con usuarios
 * @openapi
 * /privilege-templates/{id}/sync:
 *    post:
 *      tags:
 *        - privilege-templates
 *      summary: Sincronizar plantilla con usuarios asignados
 *      description: Requiere confirm=true. En una transaccion reemplaza los privilegios de origen de la plantilla en cada usuario; nunca toca privilegios manuales. Sin user_ids sincroniza los usuarios desactualizados.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: ID de la plantilla
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/privilegeTemplateSyncRequest'
 *      responses:
 *        '200':
 *          description: Resultado de la sincronizacion
 *        '400':
 *          description: Falta confirm=true o error de validacion
 *        '404':
 *          description: Plantilla no encontrada
 */
router.post('/:id/sync', [
  authMidleware,
  validateSync,
  checkRol([ROLE.SUPERADMIN, ROLE.ADMIN], PT.SYNC)
], syncTemplateRecord);

module.exports = router;
