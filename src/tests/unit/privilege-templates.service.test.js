const {
  privilegeTemplates,
  privilegeTemplateItems,
  userprivileges,
  users,
  privileges
} = require('../../models/index');
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
  getSyncPreview,
  syncTemplate
} = require('../../services/privilege-templates');

jest.mock('../../models/index', () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn('TX'))
  },
  privilegeTemplates: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  privilegeTemplateItems: {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn()
  },
  userprivileges: {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn()
  },
  users: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn()
  },
  privileges: {
    count: jest.fn()
  }
}));

const items = (...ids) => ids.map(id => ({ privilege_id: id }));
const rows = (...ids) => ids.map(id => ({ id: id * 10, privilege_id: id, destroy: jest.fn() }));

const makeTemplate = (overrides = {}) => ({
  id: 1,
  name: 'Vendedor',
  version: 1,
  update: jest.fn().mockResolvedValue(true),
  destroy: jest.fn().mockResolvedValue(true),
  toJSON() { return { id: this.id, name: this.name, version: this.version, items: [] }; },
  ...overrides
});

const makeUser = (overrides = {}) => ({
  id: 5,
  role: 'user',
  template_id: null,
  template_applied_version: null,
  update: jest.fn().mockResolvedValue(true),
  ...overrides
});

describe('Privilege Templates Service - Unit Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const { sequelize } = require('../../models/index');
    sequelize.transaction.mockImplementation((fn) => fn('TX'));
  });

  describe('getAllTemplates', () => {
    test('retorna plantillas con conteo de privilegios y usuarios', async() => {
      privilegeTemplates.findAll.mockResolvedValue([
        { toJSON: () => ({ id: 1, name: 'A', items: [{ privilege_id: 1 }, { privilege_id: 2 }] }) }
      ]);
      users.findAll.mockResolvedValue([{ template_id: 1 }, { template_id: 1 }]);

      const result = await getAllTemplates();

      expect(result).toEqual([{ id: 1, name: 'A', privileges_count: 2, users_count: 2 }]);
    });
  });

  describe('getTemplateById', () => {
    test('retorna null si no existe', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(null);
      expect(await getTemplateById(99)).toBeNull();
    });

    test('aplana items a privileges', async() => {
      privilegeTemplates.findByPk.mockResolvedValue({
        toJSON: () => ({ id: 1, name: 'A', items: [{ privilege: { id: 3 } }, { privilege: null }] })
      });
      const result = await getTemplateById(1);
      expect(result).toEqual({ id: 1, name: 'A', privileges: [{ id: 3 }] });
    });
  });

  describe('createTemplate', () => {
    test('rechaza privilegios inexistentes con 400', async() => {
      privileges.count.mockResolvedValue(1);
      await expect(createTemplate({ name: 'X', privileges: [1, 2] }))
        .rejects.toMatchObject({ status: 400, message: 'INVALID_PRIVILEGE_IDS' });
      expect(privilegeTemplates.create).not.toHaveBeenCalled();
    });

    test('crea plantilla y items deduplicados', async() => {
      privileges.count.mockResolvedValue(2);
      privilegeTemplates.create.mockResolvedValue({ id: 7 });
      privilegeTemplates.findByPk.mockResolvedValue({ toJSON: () => ({ id: 7, items: [] }) });

      const result = await createTemplate({ name: 'X', description: 'd', privileges: [1, 2, 2] });

      expect(privilegeTemplates.create).toHaveBeenCalledWith({ name: 'X', description: 'd', version: 1 }, { transaction: 'TX' });
      expect(privilegeTemplateItems.bulkCreate).toHaveBeenCalledWith(
        [{ template_id: 7, privilege_id: 1 }, { template_id: 7, privilege_id: 2 }],
        { transaction: 'TX' }
      );
      expect(result).toEqual({ id: 7, privileges: [] });
    });
  });

  describe('updateTemplate', () => {
    test('404 si la plantilla no existe', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(null);
      await expect(updateTemplate(9, { name: 'n' })).rejects.toMatchObject({ status: 404 });
    });

    test('no sube la version si el conjunto de privilegios no cambia', async() => {
      const tpl = makeTemplate();
      privilegeTemplates.findByPk.mockResolvedValue(tpl);
      privileges.count.mockResolvedValue(2);
      privilegeTemplateItems.findAll.mockResolvedValue(items(1, 2));

      await updateTemplate(1, { name: 'Nuevo', privileges: [2, 1] });

      expect(tpl.update).toHaveBeenCalledWith({ name: 'Nuevo' }, { transaction: 'TX' });
      expect(privilegeTemplateItems.destroy).not.toHaveBeenCalled();
      expect(privilegeTemplateItems.bulkCreate).not.toHaveBeenCalled();
    });

    test('sube la version cuando cambia el conjunto de privilegios', async() => {
      const tpl = makeTemplate({ version: 3 });
      privilegeTemplates.findByPk.mockResolvedValue(tpl);
      privileges.count.mockResolvedValue(2);
      privilegeTemplateItems.findAll.mockResolvedValue(items(1, 2));

      await updateTemplate(1, { privileges: [2, 3] });

      expect(privilegeTemplateItems.destroy).toHaveBeenCalledWith({
        where: { template_id: 1, privilege_id: [1] },
        transaction: 'TX'
      });
      expect(privilegeTemplateItems.bulkCreate).toHaveBeenCalledWith(
        [{ template_id: 1, privilege_id: 3 }],
        { transaction: 'TX' }
      );
      expect(tpl.update).toHaveBeenCalledWith({ version: 4 }, { transaction: 'TX' });
    });

    test('actualizar solo nombre no consulta items', async() => {
      const tpl = makeTemplate();
      privilegeTemplates.findByPk.mockResolvedValue(tpl);

      await updateTemplate(1, { name: 'Solo nombre' });

      expect(privilegeTemplateItems.findAll).not.toHaveBeenCalled();
      expect(tpl.update).toHaveBeenCalledWith({ name: 'Solo nombre' }, { transaction: 'TX' });
    });
  });

  describe('deleteTemplate', () => {
    test('404 si no existe', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(null);
      await expect(deleteTemplate(1)).rejects.toMatchObject({ status: 404 });
    });

    test('409 si hay usuarios asignados', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate());
      users.count.mockResolvedValue(2);
      await expect(deleteTemplate(1)).rejects.toMatchObject({ status: 409, message: 'TEMPLATE_HAS_ASSIGNED_USERS' });
    });

    test('elimina plantilla e items si nadie la usa', async() => {
      const tpl = makeTemplate();
      privilegeTemplates.findByPk.mockResolvedValue(tpl);
      users.count.mockResolvedValue(0);

      const result = await deleteTemplate(1);

      expect(privilegeTemplateItems.destroy).toHaveBeenCalledWith({ where: { template_id: 1 }, transaction: 'TX' });
      expect(tpl.destroy).toHaveBeenCalledWith({ transaction: 'TX' });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('applyTemplate', () => {
    test('404 si la plantilla no existe', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(null);
      await expect(applyTemplate(1, makeUser(), 'merge')).rejects.toMatchObject({ status: 404 });
    });

    test('replace borra todos los privilegios del usuario y copia la plantilla', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate({ version: 2 }));
      privilegeTemplateItems.findAll.mockResolvedValue(items(1, 2));
      const user = makeUser();

      const result = await applyTemplate(1, user, 'replace');

      expect(userprivileges.destroy).toHaveBeenCalledWith({ where: { user_id: 5 }, transaction: 'TX' });
      expect(userprivileges.bulkCreate).toHaveBeenCalledWith(
        [
          { user_id: 5, privilege_id: 1, source_template_id: 1 },
          { user_id: 5, privilege_id: 2, source_template_id: 1 }
        ],
        { transaction: 'TX' }
      );
      expect(user.update).toHaveBeenCalledWith({ template_id: 1, template_applied_version: 2 }, { transaction: 'TX' });
      expect(result).toMatchObject({ added: 2, mode: 'replace', version: 2 });
    });

    test('merge solo agrega los privilegios faltantes y deja los existentes como manuales', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate());
      privilegeTemplateItems.findAll.mockResolvedValue(items(1, 2, 3));
      userprivileges.findAll.mockResolvedValue(rows(2));

      const result = await applyTemplate(1, makeUser(), 'merge');

      expect(userprivileges.bulkCreate).toHaveBeenCalledWith(
        [
          { user_id: 5, privilege_id: 1, source_template_id: 1 },
          { user_id: 5, privilege_id: 3, source_template_id: 1 }
        ],
        { transaction: 'TX' }
      );
      expect(result.added).toBe(2);
    });

    test('al cambiar de plantilla elimina las filas de la plantilla anterior', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate({ id: 2 }));
      privilegeTemplateItems.findAll.mockResolvedValue(items(1));
      userprivileges.findAll.mockResolvedValue([]);

      await applyTemplate(2, makeUser({ template_id: 1 }), 'merge');

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: { user_id: 5, source_template_id: 1 },
        transaction: 'TX'
      });
    });

    test('con la misma plantilla elimina filas obsoletas de esa plantilla', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate());
      privilegeTemplateItems.findAll.mockResolvedValue(items(1));
      const stale = { id: 90, privilege_id: 9, source_template_id: 1 };
      userprivileges.findAll
        .mockResolvedValueOnce([stale])
        .mockResolvedValueOnce([]);

      await applyTemplate(1, makeUser({ template_id: 1 }), 'merge');

      expect(userprivileges.destroy).toHaveBeenCalledWith({ where: { id: [90] }, transaction: 'TX' });
    });
  });

  describe('getSyncPreview', () => {
    test('null si no existe la plantilla', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(null);
      expect(await getSyncPreview(1)).toBeNull();
    });

    test('calcula diff por usuario y marca desactualizados', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate({ version: 2 }));
      privilegeTemplateItems.findAll.mockResolvedValue(items(1, 2, 3));
      users.findAll.mockResolvedValue([
        { id: 5, name: 'A', email: 'a@t.com', role: 'user', template_applied_version: 1 },
        { id: 6, name: 'B', email: 'b@t.com', role: 'user', template_applied_version: 2 }
      ]);
      userprivileges.findAll.mockResolvedValue([
        { user_id: 5, privilege_id: 1, source_template_id: 1 },
        { user_id: 5, privilege_id: 9, source_template_id: 1 },
        { user_id: 5, privilege_id: 3, source_template_id: null },
        { user_id: 6, privilege_id: 1, source_template_id: 1 },
        { user_id: 6, privilege_id: 2, source_template_id: 1 },
        { user_id: 6, privilege_id: 3, source_template_id: 1 }
      ]);

      const result = await getSyncPreview(1);

      expect(result.template).toMatchObject({ id: 1, version: 2 });
      expect(result.outdated_count).toBe(1);
      const u5 = result.users.find(u => u.id === 5);
      expect(u5).toMatchObject({ out_of_date: true, added: [2], removed: [9], kept_manual: [3] });
      const u6 = result.users.find(u => u.id === 6);
      expect(u6).toMatchObject({ out_of_date: false, added: [], removed: [] });
    });
  });

  describe('syncTemplate', () => {
    test('null si no existe la plantilla', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(null);
      expect(await syncTemplate(1, {})).toBeNull();
    });

    test('por defecto sincroniza usuarios desactualizados, conserva manuales y actualiza version', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate({ version: 2 }));
      privilegeTemplateItems.findAll.mockResolvedValue(items(1, 2));
      const u5 = makeUser({ template_id: 1, template_applied_version: 1 });
      const u6 = makeUser({ id: 6, template_id: 1, template_applied_version: 2 });
      users.findAll.mockResolvedValue([u5, u6]);
      userprivileges.findAll.mockResolvedValue([
        { id: 11, privilege_id: 9, source_template_id: 1 },
        { id: 12, privilege_id: 2, source_template_id: null }
      ]);

      const result = await syncTemplate(1, {});

      expect(userprivileges.destroy).toHaveBeenCalledWith({ where: { id: [11] }, transaction: 'TX' });
      expect(userprivileges.bulkCreate).toHaveBeenCalledWith(
        [{ user_id: 5, privilege_id: 1, source_template_id: 1 }],
        { transaction: 'TX' }
      );
      expect(u5.update).toHaveBeenCalledWith({ template_applied_version: 2 }, { transaction: 'TX' });
      expect(u6.update).not.toHaveBeenCalled();
      expect(result.synced).toEqual([{ user_id: 5, added: [1], removed: [9] }]);
    });

    test('omite superadmins cuando quien ejecuta no es superadmin', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate({ version: 2 }));
      privilegeTemplateItems.findAll.mockResolvedValue(items(1));
      const sa = makeUser({ id: 8, role: 'superadmin', template_id: 1, template_applied_version: 1 });
      users.findAll.mockResolvedValue([sa]);

      const result = await syncTemplate(1, { skipSuperadmin: true });

      expect(sa.update).not.toHaveBeenCalled();
      expect(result.skipped).toEqual([{ user_id: 8, reason: 'SUPERADMIN_PROTECTED' }]);
      expect(result.synced).toEqual([]);
    });

    test('con user_ids reporta como omitidos los que no tienen la plantilla', async() => {
      privilegeTemplates.findByPk.mockResolvedValue(makeTemplate());
      privilegeTemplateItems.findAll.mockResolvedValue(items(1));
      users.findAll.mockResolvedValue([makeUser({ template_id: 1, template_applied_version: 1 })]);
      userprivileges.findAll.mockResolvedValue([]);

      const result = await syncTemplate(1, { userIds: [5, 77] });

      expect(result.skipped).toEqual([{ user_id: 77, reason: 'USER_NOT_ASSIGNED_TO_TEMPLATE' }]);
      expect(result.synced).toHaveLength(1);
    });
  });
});
