const request = require('supertest');
const server = require('../../app');
const { notifications, privileges } = require('../models/index');

const {
  superadminLogin,
  buildUser,
  inFuture,
  inPast,
  notificationNoTitle,
  notificationNoBody,
  notificationNoRecipients,
  notificationBothRecipients,
  notificationUserIdsNotArray,
  notificationBadScheduledAt
} = require('./helper/notificationsData');

const api = request(server.app);

let superToken = '';
const sender = { token: '', id: null };
const sender2 = { token: '', id: null };
const adminNoPriv = { token: '', id: null };
const userA = { token: '', id: null };
const userB = { token: '', id: null };
const userC = { token: '', id: null };
const BRANCH_ID = 3;

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

const setup = async(suffix, role, target) => {
  target.id = await register(buildUser(suffix, role));
  target.token = (await login({ email: buildUser(suffix).email, password: 'Test1234' })).token;
};

const as = (who) => ({ auth: (req) => req.auth(who.token, { type: 'bearer' }) });
const get = (who, url) => as(who).auth(api.get(url));
const patch = (who, url, body) => as(who).auth(api.patch(url)).send(body);
const post = (who, url, body) => as(who).auth(api.post(url)).send(body);

const create = async(body, who = sender) => {
  const response = await post(who, '/api/notifications', body);
  expect(response.status).toBe(201);
  return response.body;
};

/**
 * Tests de notificaciones /api/notifications
 */
describe('[NOTIFICATIONS] Test api /api/notifications', () => {
  beforeAll(async() => {
    const sesion = await login(superadminLogin);
    superToken = sesion.token;

    await setup('sender', 'admin', sender);
    await setup('sender2', 'admin', sender2);
    await setup('adminNoPriv', 'admin', adminNoPriv);
    await setup('userA', 'user', userA);
    await setup('userB', 'user', userB);
    await setup('userC', 'user', userC);

    const priv = await privileges.findOne({ where: { codename: 'create_notification' }, raw: true });
    expect(priv).not.toBeNull();
    for (const admin of [sender, sender2]) {
      const grant = await post({ token: superToken }, '/api/privileges/user', { user_id: admin.id, privilege_id: priv.id });
      expect(grant.status).toBe(200);
    }

    for (const user of [userA, userB]) {
      const assigned = await post({ token: superToken }, '/api/userBranches', { user_id: user.id, branch_id: BRANCH_ID });
      expect(assigned.status).toBe(200);
    }
  });

  describe('Permisos', () => {
    test('sin token. Expect 401/403', async() => {
      const response = await api.get('/api/notifications/me');
      expect([401, 403]).toContain(response.status);
    });

    test('rol user no puede crear. Expect 403', async() => {
      await post(userA, '/api/notifications', { title: 'x', body: 'x', user_ids: [userB.id] }).expect(403);
    });

    test('admin sin privilegio create_notification. Expect 403 NOT_PRIVILEGE', async() => {
      const response = await post(adminNoPriv, '/api/notifications', { title: 'x', body: 'x', user_ids: [userB.id] });
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('NOT_PRIVILEGE');
    });

    test('admin sin privilegio no ve enviadas, edita ni cancela. Expect 403', async() => {
      await get(adminNoPriv, '/api/notifications/sent').expect(403);
      await patch(adminNoPriv, '/api/notifications/1', { title: 'x' }).expect(403);
      await patch(adminNoPriv, '/api/notifications/1/cancel', {}).expect(403);
    });

    test('rol user no accede a /sent. Expect 403', async() => {
      await get(userA, '/api/notifications/sent').expect(403);
    });

    test('no existe DELETE. Expect 404', async() => {
      await as(sender).auth(api.delete('/api/notifications/1')).expect(404);
    });
  });

  describe('Validaciones al crear', () => {
    test.each([
      ['sin title', notificationNoTitle],
      ['sin body', notificationNoBody],
      ['sin destinatarios', notificationNoRecipients],
      ['user_ids y branch_id a la vez', notificationBothRecipients],
      ['user_ids no es arreglo', notificationUserIdsNotArray],
      ['scheduled_at invalido', notificationBadScheduledAt]
    ])('%s. Expect 400', async(_name, body) => {
      await post(sender, '/api/notifications', body).expect(400);
    });

    test('user_ids inexistentes. Expect 400 NOTIFICATION_INVALID_RECIPIENTS', async() => {
      const response = await post(sender, '/api/notifications', { title: 'x', body: 'x', user_ids: [userA.id, 999999] });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('NOTIFICATION_INVALID_RECIPIENTS');
    });
  });

  describe('Creacion', () => {
    test('por user_ids deduplica y comparte batch_id. Expect 201', async() => {
      const result = await create({
        title: 'Cobrar factura',
        body: 'Llamar al cliente',
        user_ids: [userA.id, userB.id, userA.id],
        ref_type: 'sale',
        ref_id: 10
      });

      expect(result.total).toBe(2);
      expect(result.batch_id).toEqual(expect.any(String));
      const rows = await notifications.findAll({ where: { batch_id: result.batch_id }, raw: true });
      expect(rows).toHaveLength(2);
      expect(rows.every(r => r.created_by === sender.id && r.ref_type === 'sale' && r.ref_id === 10)).toBe(true);
      expect(rows.every(r => r.read_at === null)).toBe(true);
    });

    test('por branch_id expande a los usuarios de la sucursal', async() => {
      const members = await get({ token: superToken }, `/api/userBranches/branch/${BRANCH_ID}`);
      const memberIds = members.body.assignments.map(a => a.user_id);
      expect(memberIds).toEqual(expect.arrayContaining([userA.id, userB.id]));

      const result = await create({ title: 'Sucursal', body: 'Aviso general', branch_id: BRANCH_ID });

      const rows = await notifications.findAll({ where: { batch_id: result.batch_id }, raw: true });
      expect(rows.map(r => r.user_id).sort()).toEqual([...new Set(memberIds)].sort());
      expect(rows.map(r => r.user_id)).not.toContain(userC.id);
    });

    test('read_at del body es ignorado', async() => {
      const result = await create({ title: 'Forzado', body: 'x', user_ids: [userC.id], read_at: new Date().toISOString() });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id }, raw: true });
      expect(row.read_at).toBeNull();
    });
  });

  describe('Bandeja del usuario', () => {
    let batch;

    beforeAll(async() => {
      batch = await create({ title: 'Para B', body: 'Mensaje', user_ids: [userB.id] });
    });

    test('/me retorna solo las propias con paginacion', async() => {
      const response = await get(userB, '/api/notifications/me');
      expect(response.status).toBe(200);
      expect(response.body.notifications.length).toBeGreaterThan(0);
      expect(response.body.notifications.every(n => n.user_id === userB.id)).toBe(true);
      expect(response.body.pagination).toMatchObject({ page: 1, limit: 20 });
    });

    test('/me/count coincide con las no leidas', async() => {
      const list = await get(userB, '/api/notifications/me?unread=true');
      const count = await get(userB, '/api/notifications/me/count');
      expect(count.status).toBe(200);
      expect(count.body.unread).toBe(list.body.pagination.total);
    });

    test('programada en el futuro no es visible hasta vencer', async() => {
      const result = await create({ title: 'Futura', body: 'x', user_ids: [userC.id], scheduled_at: inFuture(2) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });

      let list = await get(userC, '/api/notifications/me');
      expect(list.body.notifications.map(n => n.id)).not.toContain(row.id);
      await patch(userC, `/api/notifications/${row.id}/read`, {}).expect(404);

      await row.update({ scheduled_at: inPast(1) });

      list = await get(userC, '/api/notifications/me');
      expect(list.body.notifications.map(n => n.id)).toContain(row.id);
    });

    test('cancelada no es visible', async() => {
      const result = await create({ title: 'Cancelable', body: 'x', user_ids: [userC.id], scheduled_at: inFuture(3) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });

      await patch(sender, `/api/notifications/${row.id}/cancel`, {}).expect(200);
      await row.update({ scheduled_at: inPast(1) });

      const list = await get(userC, '/api/notifications/me');
      expect(list.body.notifications.map(n => n.id)).not.toContain(row.id);
    });

    test('marcar leida es idempotente y conserva el primer read_at', async() => {
      const row = await notifications.findOne({ where: { batch_id: batch.batch_id } });

      const first = await patch(userB, `/api/notifications/${row.id}/read`, { read_at: '2000-01-01T00:00:00.000Z' });
      expect(first.status).toBe(200);
      const firstReadAt = (await notifications.findByPk(row.id)).read_at;
      expect(firstReadAt).not.toBeNull();
      expect(firstReadAt.getFullYear()).not.toBe(2000);

      await new Promise(resolve => setTimeout(resolve, 1100));
      await patch(userB, `/api/notifications/${row.id}/read`, {}).expect(200);

      expect((await notifications.findByPk(row.id)).read_at.getTime()).toBe(firstReadAt.getTime());
    });

    test('un usuario no puede leer ni archivar notificaciones ajenas. Expect 404', async() => {
      const row = await notifications.findOne({ where: { batch_id: batch.batch_id } });

      await patch(userA, `/api/notifications/${row.id}/read`, {}).expect(404);
      await patch(userA, `/api/notifications/${row.id}/archive`, {}).expect(404);
      expect((await notifications.findByPk(row.id)).archived_at).toBeNull();
    });

    test('id inexistente. Expect 404', async() => {
      await patch(userA, '/api/notifications/999999/read', {}).expect(404);
    });

    test('id invalido. Expect 400', async() => {
      await patch(userA, '/api/notifications/abc/read', {}).expect(400);
    });

    test('archivar la oculta de /me', async() => {
      const result = await create({ title: 'Archivable', body: 'x', user_ids: [userA.id] });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });

      await patch(userA, `/api/notifications/${row.id}/archive`, {}).expect(200);

      const list = await get(userA, '/api/notifications/me');
      expect(list.body.notifications.map(n => n.id)).not.toContain(row.id);
      expect((await notifications.findByPk(row.id)).archived_at).not.toBeNull();
    });

    test('/read-all marca todas las visibles propias y /me/count queda en 0', async() => {
      await create({ title: 'R1', body: 'x', user_ids: [userC.id] });
      await create({ title: 'R2', body: 'x', user_ids: [userC.id] });
      const scheduled = await create({ title: 'R3', body: 'x', user_ids: [userC.id], scheduled_at: inFuture(5) });

      const response = await patch(userC, '/api/notifications/read-all', {});
      expect(response.status).toBe(200);
      expect(response.body.updated).toBeGreaterThanOrEqual(2);

      expect((await get(userC, '/api/notifications/me/count')).body.unread).toBe(0);
      const future = await notifications.findOne({ where: { batch_id: scheduled.batch_id }, raw: true });
      expect(future.read_at).toBeNull();
    });

    test('unread invalido. Expect 400', async() => {
      await get(userA, '/api/notifications/me?unread=quizas').expect(400);
    });
  });

  describe('Edicion y cancelacion (admin)', () => {
    test('edita mientras esta programada. Expect 200', async() => {
      const result = await create({ title: 'Original', body: 'x', user_ids: [userA.id], scheduled_at: inFuture(4) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });
      const newDate = inFuture(6);

      const response = await patch(sender, `/api/notifications/${row.id}`, {
        title: 'Editada',
        scheduled_at: newDate,
        user_id: userB.id
      });

      expect(response.status).toBe(200);
      const updated = await notifications.findByPk(row.id);
      expect(updated.title).toBe('Editada');
      expect(updated.user_id).toBe(userA.id);
      expect(Math.floor(updated.scheduled_at.getTime() / 1000)).toBe(Math.floor(new Date(newDate).getTime() / 1000));
    });

    test('reprogramar al pasado. Expect 400', async() => {
      const result = await create({ title: 'Reprog', body: 'x', user_ids: [userA.id], scheduled_at: inFuture(4) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });

      const response = await patch(sender, `/api/notifications/${row.id}`, { scheduled_at: inPast(1) });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('SCHEDULED_AT_INVALID');
    });

    test('editar o cancelar tras la entrega. Expect 409', async() => {
      const result = await create({ title: 'Entregada', body: 'x', user_ids: [userA.id], scheduled_at: inFuture(1) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });
      await row.update({ scheduled_at: inPast(1) });

      const edit = await patch(sender, `/api/notifications/${row.id}`, { title: 'Tarde' });
      expect(edit.status).toBe(409);
      expect(edit.body.error).toBe('NOTIFICATION_ALREADY_DELIVERED');

      const cancel = await patch(sender, `/api/notifications/${row.id}/cancel`, {});
      expect(cancel.status).toBe(409);
      expect(cancel.body.error).toBe('NOTIFICATION_ALREADY_DELIVERED');
    });

    test('sin scheduled_at (inmediata) tampoco se edita. Expect 409', async() => {
      const result = await create({ title: 'Inmediata', body: 'x', user_ids: [userA.id] });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });
      await patch(sender, `/api/notifications/${row.id}`, { title: 'Tarde' }).expect(409);
    });

    test('cancelar dos veces. Expect 409 NOTIFICATION_ALREADY_CANCELLED', async() => {
      const result = await create({ title: 'Doble', body: 'x', user_ids: [userA.id], scheduled_at: inFuture(2) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });

      await patch(sender, `/api/notifications/${row.id}/cancel`, {}).expect(200);
      expect((await notifications.findByPk(row.id)).cancelled_at).not.toBeNull();

      const again = await patch(sender, `/api/notifications/${row.id}/cancel`, {});
      expect(again.status).toBe(409);
      expect(again.body.error).toBe('NOTIFICATION_ALREADY_CANCELLED');
    });

    test('notificacion inexistente. Expect 404', async() => {
      await patch(sender, '/api/notifications/999999', { title: 'x' }).expect(404);
      await patch(sender, '/api/notifications/999999/cancel', {}).expect(404);
    });

    test('edicion sin campos validos. Expect 400', async() => {
      const result = await create({ title: 'Vacia', body: 'x', user_ids: [userA.id], scheduled_at: inFuture(2) });
      const row = await notifications.findOne({ where: { batch_id: result.batch_id } });
      await patch(sender, `/api/notifications/${row.id}`, {}).expect(400);
    });
  });

  describe('Enviadas (admin)', () => {
    test('status por destinatario y resumen del batch', async() => {
      const result = await create({ title: 'Resumen', body: 'x', user_ids: [userA.id, userB.id, userC.id] });
      const rows = await notifications.findAll({ where: { batch_id: result.batch_id }, order: [['id', 'ASC']] });

      await rows[0].update({ read_at: new Date() });
      await rows[1].update({ scheduled_at: inFuture(2) });
      await rows[2].update({ scheduled_at: inFuture(2), cancelled_at: new Date() });

      const response = await get(sender, `/api/notifications/sent?batch_id=${result.batch_id}`);

      expect(response.status).toBe(200);
      const statusById = Object.fromEntries(response.body.notifications.map(n => [n.id, n.status]));
      expect(statusById).toEqual({
        [rows[0].id]: 'read',
        [rows[1].id]: 'scheduled',
        [rows[2].id]: 'cancelled'
      });
      expect(response.body.summary).toEqual({ total: 3, read: 1, pending: 1 });
      expect(response.body.notifications[0].recipient).toHaveProperty('email');
      expect(response.body.notifications[0].recipient).not.toHaveProperty('password');
    });

    test('un recibido sin leer figura como delivered', async() => {
      const result = await create({ title: 'Entregada', body: 'x', user_ids: [userA.id] });
      const response = await get(sender, `/api/notifications/sent?batch_id=${result.batch_id}`);
      expect(response.body.notifications[0].status).toBe('delivered');
      expect(response.body.summary).toEqual({ total: 1, read: 0, pending: 1 });
    });

    test('filtra por user_id', async() => {
      const response = await get(sender, `/api/notifications/sent?user_id=${userA.id}`);
      expect(response.status).toBe(200);
      expect(response.body.notifications.length).toBeGreaterThan(0);
      expect(response.body.notifications.every(n => n.user_id === userA.id)).toBe(true);
      expect(response.body.summary).toBeNull();
    });

    test('cada admin solo ve lo que creo; superadmin ve todo', async() => {
      const own = await create({ title: 'De A', body: 'x', user_ids: [userA.id, userB.id] });
      const foreign = await create({ title: 'De B', body: 'x', user_ids: [userA.id] }, sender2);

      const listB = await get(sender2, '/api/notifications/sent?limit=100');
      expect(listB.body.notifications.every(n => n.created_by === sender2.id)).toBe(true);
      expect(listB.body.notifications.map(n => n.batch_id)).toContain(foreign.batch_id);
      expect(listB.body.notifications.map(n => n.batch_id)).not.toContain(own.batch_id);

      const foreignBatch = await get(sender2, `/api/notifications/sent?batch_id=${own.batch_id}`);
      expect(foreignBatch.status).toBe(200);
      expect(foreignBatch.body.notifications).toHaveLength(0);
      expect(foreignBatch.body.summary).toEqual({ total: 0, read: 0, pending: 0 });

      const ownBatch = await get(sender2, `/api/notifications/sent?batch_id=${foreign.batch_id}`);
      expect(ownBatch.body.summary).toEqual({ total: 1, read: 0, pending: 1 });

      const superOwn = await get({ token: superToken }, `/api/notifications/sent?batch_id=${own.batch_id}`);
      expect(superOwn.body.summary).toEqual({ total: 2, read: 0, pending: 2 });
      const superForeign = await get({ token: superToken }, `/api/notifications/sent?batch_id=${foreign.batch_id}`);
      expect(superForeign.body.summary.total).toBe(1);
    });

    test('batch_id invalido. Expect 400', async() => {
      await get(sender, '/api/notifications/sent?batch_id=abc').expect(400);
    });
  });
});
