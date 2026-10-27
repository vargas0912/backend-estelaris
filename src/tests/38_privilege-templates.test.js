const request = require('supertest');
const server = require('../../app');
const { userprivileges, users, privileges } = require('../models/index');
const { FORBIDDEN } = require('../constants/forbidden');

const {
  superadminLogin,
  buildUser,
  templateCreateNoName,
  templateCreateNoPrivileges,
  templateCreatePrivilegesNotArray,
  templateCreateUnknownPrivilege
} = require('./helper/privilegeTemplatesData');

const api = request(server.app);

let superToken = '';
let superId = null;
let p = []; // privilegios base para las plantillas
let templateId = null;
let template2Id = null;
let userA = null;
let userB = null;
const adminNoPriv = { token: '', id: null };
const adminWithPriv = { token: '', id: null };
const plainUser = { token: '', id: null };

const login = async(data) => {
  const response = await api.post('/api/auth/login').send(data);
  return response.body.sesion;
};

const register = async(data) => {
  const response = await api
    .post('/api/auth/register')
    .auth(superToken, { type: 'bearer' })
    .send(data);
  expect(response.status).toBe(200);
  return response.body.user.user.id;
};

const grant = async(userId, privilegeId) => {
  const response = await api
    .post('/api/privileges/user')
    .auth(superToken, { type: 'bearer' })
    .send({ user_id: userId, privilege_id: privilegeId });
  expect(response.status).toBe(200);
};

const rowsOf = async(userId) => {
  const rows = await userprivileges.findAll({ where: { user_id: userId }, raw: true });
  return rows.map(r => ({ privilege_id: r.privilege_id, source: r.source_template_id }))
    .sort((a, b) => a.privilege_id - b.privilege_id);
};

const codenameId = async(codename) => {
  const row = await privileges.findOne({ where: { codename }, raw: true });
  return row.id;
};

/**
 * Tests de plantillas de privilegios //api/privilege-templates
 */
describe('[PRIVILEGE-TEMPLATES] Test api //api/privilege-templates', () => {
  beforeAll(async() => {
    const sesion = await login(superadminLogin);
    superToken = sesion.token;
    superId = sesion.user.id;

    const all = await api.get('/api/privileges').auth(superToken, { type: 'bearer' });
    p = all.body.privileges.slice(0, 6).map(x => x.id);

    userA = await register(buildUser('userA'));
    userB = await register(buildUser('userB'));
    adminNoPriv.id = await register(buildUser('adminNoPriv', 'admin'));
    adminWithPriv.id = await register(buildUser('adminWithPriv', 'admin'));
    plainUser.id = await register(buildUser('plain', 'user'));

    adminNoPriv.token = (await login({ email: buildUser('adminNoPriv').email, password: 'Test1234' })).token;
    adminWithPriv.token = (await login({ email: buildUser('adminWithPriv').email, password: 'Test1234' })).token;
    plainUser.token = (await login({ email: buildUser('plain').email, password: 'Test1234' })).token;

    for (const codename of ['view_privilege_template', 'apply_privilege_template']) {
      await grant(adminWithPriv.id, await codenameId(codename));
    }
  });

  describe('Permisos', () => {
    test('sin token. Expect 401/403', async() => {
      const response = await api.get('/api/privilege-templates');
      expect([401, 403]).toContain(response.status);
    });

    test('rol user. Expect 403', async() => {
      await api.get('/api/privilege-templates').auth(plainUser.token, { type: 'bearer' }).expect(403);
    });

    test('admin sin privilegio view_privilege_template. Expect 403', async() => {
      const response = await api.get('/api/privilege-templates').auth(adminNoPriv.token, { type: 'bearer' });
      expect(response.status).toBe(403);
      expect(response.body.code).toBe('NOT_PRIVILEGE');
      expect(response.body.error).toBe(FORBIDDEN.NOT_PRIVILEGE);
    });

    test('admin con privilegio view puede listar. Expect 200', async() => {
      await api.get('/api/privilege-templates').auth(adminWithPriv.token, { type: 'bearer' }).expect(200);
    });

    test('admin sin privilegio create no puede crear. Expect 403', async() => {
      await api.post('/api/privilege-templates')
        .auth(adminWithPriv.token, { type: 'bearer' })
        .send({ name: 'No', privileges: [p[0]] })
        .expect(403);
    });
  });

  describe('Validaciones al crear', () => {
    const post = (body) => api.post('/api/privilege-templates').auth(superToken, { type: 'bearer' }).send(body);

    test('sin nombre. Expect 400', async() => {
      await post(templateCreateNoName).expect(400);
    });

    test('sin privileges. Expect 400', async() => {
      await post(templateCreateNoPrivileges).expect(400);
    });

    test('privileges no es arreglo. Expect 400', async() => {
      await post(templateCreatePrivilegesNotArray).expect(400);
    });

    test('privilegio inexistente. Expect 400 INVALID_PRIVILEGE_IDS', async() => {
      const response = await post(templateCreateUnknownPrivilege);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('INVALID_PRIVILEGE_IDS');
    });
  });

  describe('CRUD', () => {
    test('crear plantilla. Expect 201, version 1', async() => {
      const response = await api.post('/api/privilege-templates')
        .auth(superToken, { type: 'bearer' })
        .send({ name: 'Vendedor', description: 'Base vendedor', privileges: [p[0], p[1], p[2], p[2]] })
        .expect(201);

      templateId = response.body.template.id;
      expect(response.body.template.version).toBe(1);
      expect(response.body.template.privileges).toHaveLength(3);
    });

    test('detalle con privilegios. Expect 200', async() => {
      const response = await api.get(`/api/privilege-templates/${templateId}`)
        .auth(superToken, { type: 'bearer' })
        .expect(200);

      expect(response.body.template.name).toBe('Vendedor');
      expect(response.body.template.privileges.map(x => x.id).sort()).toEqual([p[0], p[1], p[2]].sort());
    });

    test('detalle inexistente. Expect 404', async() => {
      await api.get('/api/privilege-templates/999999').auth(superToken, { type: 'bearer' }).expect(404);
    });

    test('id no numerico. Expect 400', async() => {
      await api.get('/api/privilege-templates/abc').auth(superToken, { type: 'bearer' }).expect(400);
    });

    test('listado incluye conteos. Expect 200', async() => {
      const response = await api.get('/api/privilege-templates')
        .auth(superToken, { type: 'bearer' })
        .expect(200);

      const found = response.body.templates.find(t => t.id === templateId);
      expect(found.privileges_count).toBe(3);
      expect(found.users_count).toBe(0);
    });

    test('actualizar inexistente. Expect 404', async() => {
      await api.put('/api/privilege-templates/999999')
        .auth(superToken, { type: 'bearer' })
        .send({ name: 'x' })
        .expect(404);
    });
  });

  describe('Aplicar plantilla', () => {
    test('validaciones: sin user_id, modo invalido. Expect 400', async() => {
      const url = `/api/privilege-templates/${templateId}/apply`;
      await api.post(url).auth(superToken, { type: 'bearer' }).send({ mode: 'merge' }).expect(400);
      await api.post(url).auth(superToken, { type: 'bearer' }).send({ user_id: userA, mode: 'otro' }).expect(400);
      await api.post(url).auth(superToken, { type: 'bearer' }).send({ user_id: userA }).expect(400);
    });

    test('usuario inexistente. Expect 404', async() => {
      await api.post(`/api/privilege-templates/${templateId}/apply`)
        .auth(superToken, { type: 'bearer' })
        .send({ user_id: 999999, mode: 'merge' })
        .expect(404);
    });

    test('plantilla inexistente. Expect 404', async() => {
      const response = await api.post('/api/privilege-templates/999999/apply')
        .auth(superToken, { type: 'bearer' })
        .send({ user_id: userA, mode: 'merge' });
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('TEMPLATE_NOT_FOUND');
    });

    test('merge: agrega faltantes y deja los existentes como manuales. Expect 200', async() => {
      await grant(userA, p[0]); // manual y tambien en la plantilla
      await grant(userA, p[3]); // manual fuera de la plantilla

      const response = await api.post(`/api/privilege-templates/${templateId}/apply`)
        .auth(superToken, { type: 'bearer' })
        .send({ user_id: userA, mode: 'merge' })
        .expect(200);

      expect(response.body.result.added).toBe(2);
      expect(await rowsOf(userA)).toEqual([
        { privilege_id: p[0], source: null },
        { privilege_id: p[1], source: templateId },
        { privilege_id: p[2], source: templateId },
        { privilege_id: p[3], source: null }
      ].sort((a, b) => a.privilege_id - b.privilege_id));

      const user = await users.findByPk(userA);
      expect(user.template_id).toBe(templateId);
      expect(user.template_applied_version).toBe(1);
    });

    test('replace: elimina todo lo previo y copia la plantilla. Expect 200', async() => {
      await grant(userB, p[4]); // manual que debe desaparecer

      await api.post(`/api/privilege-templates/${templateId}/apply`)
        .auth(superToken, { type: 'bearer' })
        .send({ user_id: userB, mode: 'replace' })
        .expect(200);

      const rows = await rowsOf(userB);
      expect(rows.map(r => r.privilege_id).sort()).toEqual([p[0], p[1], p[2]].sort());
      expect(rows.every(r => r.source === templateId)).toBe(true);
    });

    test('cambiar de plantilla elimina las filas de la plantilla anterior. Expect 200', async() => {
      const created = await api.post('/api/privilege-templates')
        .auth(superToken, { type: 'bearer' })
        .send({ name: 'Cajero', privileges: [p[4]] })
        .expect(201);
      template2Id = created.body.template.id;

      await api.post(`/api/privilege-templates/${template2Id}/apply`)
        .auth(superToken, { type: 'bearer' })
        .send({ user_id: userB, mode: 'merge' })
        .expect(200);

      expect(await rowsOf(userB)).toEqual([{ privilege_id: p[4], source: template2Id }]);
      const user = await users.findByPk(userB);
      expect(user.template_id).toBe(template2Id);
    });

    test('admin con privilegio apply no puede modificar a un superadmin. Expect 403', async() => {
      const response = await api.post(`/api/privilege-templates/${templateId}/apply`)
        .auth(adminWithPriv.token, { type: 'bearer' })
        .send({ user_id: superId, mode: 'merge' });

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/superadmin/i);
    });

    test('admin con privilegio apply puede aplicar a un usuario. Expect 200', async() => {
      await api.post(`/api/privilege-templates/${template2Id}/apply`)
        .auth(adminWithPriv.token, { type: 'bearer' })
        .send({ user_id: plainUser.id, mode: 'merge' })
        .expect(200);
    });

    test('admin sin privilegio sync no puede ver la vista previa. Expect 403', async() => {
      await api.get(`/api/privilege-templates/${templateId}/sync-preview`)
        .auth(adminWithPriv.token, { type: 'bearer' })
        .expect(403);
    });
  });

  describe('Edicion y versionado', () => {
    const put = (body) => api.put(`/api/privilege-templates/${templateId}`)
      .auth(superToken, { type: 'bearer' })
      .send(body);

    test('cambiar solo el nombre no sube la version. Expect 200', async() => {
      const response = await put({ name: 'Vendedor v2' }).expect(200);
      expect(response.body.template.name).toBe('Vendedor v2');
      expect(response.body.template.version).toBe(1);
    });

    test('mismo conjunto de privilegios (otro orden) no sube la version. Expect 200', async() => {
      const response = await put({ privileges: [p[2], p[1], p[0]] }).expect(200);
      expect(response.body.template.version).toBe(1);
    });

    test('privilegio inexistente. Expect 400', async() => {
      await put({ privileges: [999999] }).expect(400);
    });

    test('cambiar el conjunto sube la version y no propaga a usuarios. Expect 200', async() => {
      const response = await put({ privileges: [p[0], p[1], p[3]] }).expect(200);
      expect(response.body.template.version).toBe(2);
      expect(response.body.template.privileges.map(x => x.id).sort()).toEqual([p[0], p[1], p[3]].sort());

      // Sin propagacion automatica: userA conserva el estado previo
      const rows = await rowsOf(userA);
      expect(rows.find(r => r.privilege_id === p[2])).toEqual({ privilege_id: p[2], source: templateId });
      const user = await users.findByPk(userA);
      expect(user.template_applied_version).toBe(1);
    });
  });

  describe('Sync', () => {
    test('vista previa: diff por usuario. Expect 200', async() => {
      const response = await api.get(`/api/privilege-templates/${templateId}/sync-preview`)
        .auth(superToken, { type: 'bearer' })
        .expect(200);

      const { preview } = response.body;
      expect(preview.template.version).toBe(2);
      expect(preview.outdated_count).toBe(1);
      expect(preview.users).toHaveLength(1);
      expect(preview.users[0]).toMatchObject({
        id: userA,
        out_of_date: true,
        applied_version: 1,
        added: [],
        removed: [p[2]],
        kept_manual: [p[0], p[3]].sort((a, b) => a - b)
      });
    });

    test('vista previa de plantilla inexistente. Expect 404', async() => {
      await api.get('/api/privilege-templates/999999/sync-preview')
        .auth(superToken, { type: 'bearer' })
        .expect(404);
    });

    test('sync sin confirm. Expect 400', async() => {
      const url = `/api/privilege-templates/${templateId}/sync`;
      await api.post(url).auth(superToken, { type: 'bearer' }).send({}).expect(400);
      await api.post(url).auth(superToken, { type: 'bearer' }).send({ confirm: false }).expect(400);
      await api.post(url).auth(superToken, { type: 'bearer' }).send({ confirm: 'true' }).expect(400);
    });

    test('sync con confirm no cambia nada si fue rechazado. Expect estado intacto', async() => {
      const rows = await rowsOf(userA);
      expect(rows.find(r => r.privilege_id === p[2])).toBeDefined();
    });

    test('sync conserva privilegios manuales y actualiza version. Expect 200', async() => {
      const response = await api.post(`/api/privilege-templates/${templateId}/sync`)
        .auth(superToken, { type: 'bearer' })
        .send({ confirm: true })
        .expect(200);

      expect(response.body.result.synced).toEqual([{ user_id: userA, added: [], removed: [p[2]] }]);

      const rows = await rowsOf(userA);
      expect(rows).toEqual([
        { privilege_id: p[0], source: null },
        { privilege_id: p[1], source: templateId },
        { privilege_id: p[3], source: null }
      ].sort((a, b) => a.privilege_id - b.privilege_id));

      const user = await users.findByPk(userA);
      expect(user.template_applied_version).toBe(2);
    });

    test('sync no toca usuarios de otra plantilla. Expect filas de userB intactas', async() => {
      expect(await rowsOf(userB)).toEqual([{ privilege_id: p[4], source: template2Id }]);
    });

    test('user_ids no asignado a la plantilla se reporta como omitido. Expect 200', async() => {
      const response = await api.post(`/api/privilege-templates/${templateId}/sync`)
        .auth(superToken, { type: 'bearer' })
        .send({ confirm: true, user_ids: [userB] })
        .expect(200);

      expect(response.body.result.synced).toEqual([]);
      expect(response.body.result.skipped).toEqual([{ user_id: userB, reason: 'USER_NOT_ASSIGNED_TO_TEMPLATE' }]);
    });

    test('sync de plantilla inexistente. Expect 404', async() => {
      await api.post('/api/privilege-templates/999999/sync')
        .auth(superToken, { type: 'bearer' })
        .send({ confirm: true })
        .expect(404);
    });
  });

  describe('Eliminacion', () => {
    test('plantilla con usuarios asignados. Expect 409', async() => {
      const response = await api.delete(`/api/privilege-templates/${templateId}`)
        .auth(superToken, { type: 'bearer' })
        .expect(409);

      expect(response.body.error).toBe('TEMPLATE_HAS_ASSIGNED_USERS');
    });

    test('plantilla sin usuarios. Expect 200 y luego 404', async() => {
      const created = await api.post('/api/privilege-templates')
        .auth(superToken, { type: 'bearer' })
        .send({ name: 'Temporal', privileges: [p[5]] })
        .expect(201);
      const tempId = created.body.template.id;

      await api.delete(`/api/privilege-templates/${tempId}`).auth(superToken, { type: 'bearer' }).expect(200);
      await api.get(`/api/privilege-templates/${tempId}`).auth(superToken, { type: 'bearer' }).expect(404);
    });

    test('plantilla inexistente. Expect 404', async() => {
      await api.delete('/api/privilege-templates/999999').auth(superToken, { type: 'bearer' }).expect(404);
    });
  });
});
