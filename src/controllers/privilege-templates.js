const { matchedData } = require('express-validator');

const { handleHttpError } = require('../utils/handleErorr');
const { ERR_SECURITY } = require('../constants/errors');
const { PRIVILEGE_TEMPLATE_ERRORS: ERR } = require('../constants/privileges');
const { ROLE } = require('../constants/roles');
const { users } = require('../models/index');

const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
  getSyncPreview,
  syncTemplate
} = require('../services/privilege-templates');

/**
 * Maps a service error (carrying `status`) or an unexpected error to an HTTP response.
 * @param {object} res Express response
 * @param {Error} error Thrown error
 * @param {string} prefix Message prefix for unexpected errors
 */
const sendError = (res, error, prefix) => {
  if (error && error.status) {
    handleHttpError(res, error.message, error.status);
    return;
  }
  handleHttpError(res, `${prefix} --> ${error}`, 400);
};

/**
 * GET /privilege-templates - Lists all templates.
 */
const getAllTemplatesRecords = async(req, res) => {
  try {
    const templates = await getAllTemplates();

    res.send({ templates });
  } catch (error) {
    sendError(res, error, 'ERROR_GET_RECORDS');
  }
};

/**
 * GET /privilege-templates/:id - Gets one template with its privileges.
 */
const getOneTemplateRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const template = await getTemplateById(id);

    if (!template) {
      handleHttpError(res, ERR.NOT_FOUND, 404);
      return;
    }

    res.send({ template });
  } catch (error) {
    sendError(res, error, 'ERROR_GET_RECORDS');
  }
};

/**
 * POST /privilege-templates - Creates a template.
 */
const addTemplateRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const template = await createTemplate(body);

    res.status(201).send({ template });
  } catch (error) {
    sendError(res, error, 'ERROR_ADDING_RECORD');
  }
};

/**
 * PUT /privilege-templates/:id - Updates a template (bumps version only if the privilege set changes).
 */
const updateTemplateRecord = async(req, res) => {
  try {
    const { id, ...body } = matchedData(req);
    const template = await updateTemplate(id, body);

    res.send({ template });
  } catch (error) {
    sendError(res, error, 'ERROR_UPDATE_RECORD');
  }
};

/**
 * DELETE /privilege-templates/:id - Deletes a template that has no assigned users.
 */
const deleteTemplateRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteTemplate(id);

    res.send({ result });
  } catch (error) {
    sendError(res, error, 'ERROR_DELETE_RECORD');
  }
};

/**
 * POST /privilege-templates/:id/apply - Applies a template to a user (replace | merge).
 * A non-superadmin cannot modify the privileges of a superadmin user.
 */
const applyTemplateRecord = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, user_id, mode } = matchedData(req);

    // eslint-disable-next-line camelcase
    const targetUser = await users.findByPk(user_id);

    if (!targetUser) {
      handleHttpError(res, ERR.USER_NOT_FOUND, 404);
      return;
    }

    if (targetUser.role === ROLE.SUPERADMIN && req.user.role !== ROLE.SUPERADMIN) {
      handleHttpError(res, ERR_SECURITY.FORBIDDEN_CANNOT_MODIFY_SUPERADMIN_PRIVILEGES, 403);
      return;
    }

    const result = await applyTemplate(id, targetUser, mode);

    res.send({ result });
  } catch (error) {
    sendError(res, error, 'ERROR_APPLYING_TEMPLATE');
  }
};

/**
 * GET /privilege-templates/:id/sync-preview - Diff of what a sync would change per assigned user.
 */
const getSyncPreviewRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const preview = await getSyncPreview(id);

    if (!preview) {
      handleHttpError(res, ERR.NOT_FOUND, 404);
      return;
    }

    res.send({ preview });
  } catch (error) {
    sendError(res, error, 'ERROR_GET_RECORDS');
  }
};

/**
 * POST /privilege-templates/:id/sync - Propagates the template to assigned users (requires confirm: true).
 * Superadmin users are skipped when the requester is not a superadmin.
 */
const syncTemplateRecord = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { id, user_ids } = matchedData(req);

    const result = await syncTemplate(id, {
      // eslint-disable-next-line camelcase
      userIds: user_ids,
      skipSuperadmin: req.user.role !== ROLE.SUPERADMIN
    });

    if (!result) {
      handleHttpError(res, ERR.NOT_FOUND, 404);
      return;
    }

    res.send({ result });
  } catch (error) {
    sendError(res, error, 'ERROR_SYNC_TEMPLATE');
  }
};

module.exports = {
  getAllTemplatesRecords,
  getOneTemplateRecord,
  addTemplateRecord,
  updateTemplateRecord,
  deleteTemplateRecord,
  applyTemplateRecord,
  getSyncPreviewRecord,
  syncTemplateRecord
};
