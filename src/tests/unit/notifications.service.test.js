const { notifications, users, userBranches } = require('../../models/index');
const {
  createNotifications,
  getMyNotifications,
  countMyUnread,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getSentNotifications,
  updateNotification,
  cancelNotification,
  computeStatus
} = require('../../services/notifications');

jest.mock('../../models/index', () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn('TX'))
  },
  notifications: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    update: jest.fn()
  },
  users: {
    findAll: jest.fn()
  },
  userBranches: {
    findAll: jest.fn()
  }
}));

const HOUR = 60 * 60 * 1000;
const future = () => new Date(Date.now() + HOUR);
const past = () => new Date(Date.now() - HOUR);

const makeRow = (overrides = {}) => ({
  id: 1,
  user_id: 5,
  scheduled_at: null,
  cancelled_at: null,
  read_at: null,
  archived_at: null,
  update: jest.fn().mockResolvedValue(true),
  ...overrides
});

describe('Notifications Service - Unit Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const { sequelize } = require('../../models/index');
    sequelize.transaction.mockImplementation((fn) => fn('TX'));
  });

  describe('computeStatus', () => {
    const now = new Date();

    test('cancelled tiene prioridad', () => {
      expect(computeStatus({ cancelled_at: now, read_at: now, scheduled_at: future() }, now)).toBe('cancelled');
    });

    test('scheduled si scheduled_at es futuro', () => {
      expect(computeStatus({ scheduled_at: future() }, now)).toBe('scheduled');
    });

    test('read si tiene read_at', () => {
      expect(computeStatus({ scheduled_at: past(), read_at: now }, now)).toBe('read');
    });

    test('delivered en otro caso', () => {
      expect(computeStatus({ scheduled_at: null }, now)).toBe('delivered');
    });
  });

  describe('createNotifications', () => {
    const base = { created_by: 1, title: 'Cobrar', body: 'Llamar al cliente' };

    test('por user_ids deduplica y comparte batch_id', async() => {
      users.findAll.mockResolvedValue([{ id: 2 }, { id: 3 }]);
      notifications.bulkCreate.mockImplementation(async(rows) => rows);

      const result = await createNotifications({ ...base, user_ids: [2, 3, 2, '3'] });

      expect(users.findAll).toHaveBeenCalledWith(expect.objectContaining({ attributes: ['id'] }));
      const rows = notifications.bulkCreate.mock.calls[0][0];
      expect(rows).toHaveLength(2);
      expect(rows.map(r => r.user_id)).toEqual([2, 3]);
      expect(new Set(rows.map(r => r.batch_id)).size).toBe(1);
      expect(result.batch_id).toBe(rows[0].batch_id);
      expect(result.total).toBe(2);
      expect(rows[0]).toMatchObject({ created_by: 1, title: 'Cobrar', scheduled_at: null, due_at: null });
    });

    test('por branch_id expande usuarios de la sucursal', async() => {
      userBranches.findAll.mockResolvedValue([{ user_id: 7 }, { user_id: 8 }, { user_id: 7 }]);
      users.findAll.mockResolvedValue([{ id: 7 }, { id: 8 }]);
      notifications.bulkCreate.mockImplementation(async(rows) => rows);

      const result = await createNotifications({ ...base, branch_id: 4 });

      expect(userBranches.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { branch_id: 4 } }));
      expect(result.total).toBe(2);
    });

    test('branch_id sin usuarios -> 400 NO_RECIPIENTS', async() => {
      userBranches.findAll.mockResolvedValue([]);

      await expect(createNotifications({ ...base, branch_id: 4 }))
        .rejects.toMatchObject({ status: 400, message: 'NOTIFICATION_NO_RECIPIENTS' });
      expect(notifications.bulkCreate).not.toHaveBeenCalled();
    });

    test('user_ids inexistentes -> 400 INVALID_RECIPIENTS', async() => {
      users.findAll.mockResolvedValue([{ id: 2 }]);

      await expect(createNotifications({ ...base, user_ids: [2, 999] }))
        .rejects.toMatchObject({ status: 400, message: 'NOTIFICATION_INVALID_RECIPIENTS' });
      expect(notifications.bulkCreate).not.toHaveBeenCalled();
    });

    test('guarda scheduled_at, due_at y referencia', async() => {
      users.findAll.mockResolvedValue([{ id: 2 }]);
      notifications.bulkCreate.mockImplementation(async(rows) => rows);
      const when = future();

      await createNotifications({ ...base, user_ids: [2], scheduled_at: when, due_at: when, ref_type: 'sale', ref_id: 9 });

      expect(notifications.bulkCreate.mock.calls[0][0][0]).toMatchObject({
        scheduled_at: when, due_at: when, ref_type: 'sale', ref_id: 9
      });
    });
  });

  describe('visibilidad del usuario', () => {
    test('getMyNotifications filtra por destinatario, cancelada y programacion', async() => {
      notifications.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });

      const result = await getMyNotifications(5, { unread: true, page: 2, limit: 10 });

      const args = notifications.findAndCountAll.mock.calls[0][0];
      expect(args.where.user_id).toBe(5);
      expect(args.where.cancelled_at).toBeNull();
      expect(args.where.archived_at).toBeNull();
      expect(args.where.read_at).toBeNull();
      expect(args.where[Object.getOwnPropertySymbols(args.where)[0]]).toHaveLength(2);
      expect(args.limit).toBe(10);
      expect(args.offset).toBe(10);
      expect(result).toEqual({ rows: [{ id: 1 }], count: 1 });
    });

    test('sin unread no filtra read_at', async() => {
      notifications.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      await getMyNotifications(5);
      expect(notifications.findAndCountAll.mock.calls[0][0].where).not.toHaveProperty('read_at');
    });

    test('countMyUnread cuenta solo visibles, no leidas y no archivadas', async() => {
      notifications.count.mockResolvedValue(3);

      expect(await countMyUnread(5)).toBe(3);
      const where = notifications.count.mock.calls[0][0].where;
      expect(where).toMatchObject({ user_id: 5, read_at: null, archived_at: null, cancelled_at: null });
    });
  });

  describe('markAsRead', () => {
    test('404 si no existe o no es del usuario', async() => {
      notifications.findOne.mockResolvedValue(null);

      await expect(markAsRead(1, 5)).rejects.toMatchObject({ status: 404, message: 'NOTIFICATION_NOT_FOUND' });
      expect(notifications.findOne.mock.calls[0][0].where).toMatchObject({ id: 1, user_id: 5, cancelled_at: null });
    });

    test('fija read_at la primera vez', async() => {
      const row = makeRow();
      notifications.findOne.mockResolvedValue(row);

      await markAsRead(1, 5);

      expect(row.update).toHaveBeenCalledWith({ read_at: expect.any(Date) });
    });

    test('es idempotente: conserva el primer read_at', async() => {
      const first = new Date('2026-01-01T00:00:00Z');
      const row = makeRow({ read_at: first });
      notifications.findOne.mockResolvedValue(row);

      const result = await markAsRead(1, 5);

      expect(row.update).not.toHaveBeenCalled();
      expect(result.read_at).toBe(first);
    });
  });

  describe('markAllAsRead', () => {
    test('actualiza solo visibles propias sin leer y retorna el conteo', async() => {
      notifications.update.mockResolvedValue([4]);

      expect(await markAllAsRead(5)).toBe(4);
      const [values, options] = notifications.update.mock.calls[0];
      expect(values).toEqual({ read_at: expect.any(Date) });
      expect(options.where).toMatchObject({ user_id: 5, read_at: null, cancelled_at: null });
    });
  });

  describe('archiveNotification', () => {
    test('404 si no es propia', async() => {
      notifications.findOne.mockResolvedValue(null);
      await expect(archiveNotification(1, 5)).rejects.toMatchObject({ status: 404 });
    });

    test('fija archived_at una sola vez', async() => {
      const row = makeRow();
      notifications.findOne.mockResolvedValue(row);
      await archiveNotification(1, 5);
      expect(row.update).toHaveBeenCalledWith({ archived_at: expect.any(Date) });

      const archived = makeRow({ archived_at: new Date() });
      notifications.findOne.mockResolvedValue(archived);
      await archiveNotification(1, 5);
      expect(archived.update).not.toHaveBeenCalled();
    });
  });

  describe('updateNotification / cancelNotification', () => {
    test('404 si no existe', async() => {
      notifications.findByPk.mockResolvedValue(null);
      await expect(updateNotification(1, { title: 'x' })).rejects.toMatchObject({ status: 404 });
      await expect(cancelNotification(1)).rejects.toMatchObject({ status: 404 });
    });

    test('edita mientras scheduled_at es futuro', async() => {
      const row = makeRow({ scheduled_at: future() });
      notifications.findByPk.mockResolvedValue(row);
      const when = new Date(Date.now() + 2 * HOUR);

      await updateNotification(1, { title: 'Nuevo', scheduled_at: when, user_id: 99, read_at: new Date() });

      expect(row.update).toHaveBeenCalledWith({ title: 'Nuevo', scheduled_at: when });
    });

    test('rechaza editar si ya fue entregada (409)', async() => {
      notifications.findByPk.mockResolvedValue(makeRow({ scheduled_at: past() }));
      await expect(updateNotification(1, { title: 'x' }))
        .rejects.toMatchObject({ status: 409, message: 'NOTIFICATION_ALREADY_DELIVERED' });
    });

    test('rechaza editar si no tiene scheduled_at (entrega inmediata)', async() => {
      notifications.findByPk.mockResolvedValue(makeRow({ scheduled_at: null }));
      await expect(updateNotification(1, { title: 'x' }))
        .rejects.toMatchObject({ status: 409, message: 'NOTIFICATION_ALREADY_DELIVERED' });
    });

    test('rechaza reprogramar al pasado (400)', async() => {
      notifications.findByPk.mockResolvedValue(makeRow({ scheduled_at: future() }));
      await expect(updateNotification(1, { scheduled_at: past() }))
        .rejects.toMatchObject({ status: 400, message: 'SCHEDULED_AT_INVALID' });
    });

    test('rechaza editar sin campos validos (400)', async() => {
      notifications.findByPk.mockResolvedValue(makeRow({ scheduled_at: future() }));
      await expect(updateNotification(1, { user_id: 3 }))
        .rejects.toMatchObject({ status: 400, message: 'NOTIFICATION_NOTHING_TO_UPDATE' });
    });

    test('cancela mientras esta programada', async() => {
      const row = makeRow({ scheduled_at: future() });
      notifications.findByPk.mockResolvedValue(row);

      await cancelNotification(1);

      expect(row.update).toHaveBeenCalledWith({ cancelled_at: expect.any(Date) });
    });

    test('no cancela si ya fue entregada (409)', async() => {
      notifications.findByPk.mockResolvedValue(makeRow({ scheduled_at: past() }));
      await expect(cancelNotification(1))
        .rejects.toMatchObject({ status: 409, message: 'NOTIFICATION_ALREADY_DELIVERED' });
    });

    test('no cancela dos veces (409)', async() => {
      notifications.findByPk.mockResolvedValue(makeRow({ scheduled_at: future(), cancelled_at: new Date() }));
      await expect(cancelNotification(1))
        .rejects.toMatchObject({ status: 409, message: 'NOTIFICATION_ALREADY_CANCELLED' });
    });
  });

  describe('getSentNotifications', () => {
    const rowOf = (data) => ({ toJSON: () => data });

    test('agrega status por destinatario y resumen del batch', async() => {
      notifications.findAndCountAll.mockResolvedValue({
        count: 4,
        rows: [
          rowOf({ id: 1, scheduled_at: future(), read_at: null, cancelled_at: null }),
          rowOf({ id: 2, scheduled_at: null, read_at: null, cancelled_at: null }),
          rowOf({ id: 3, scheduled_at: null, read_at: new Date(), cancelled_at: null }),
          rowOf({ id: 4, scheduled_at: future(), read_at: null, cancelled_at: new Date() })
        ]
      });
      notifications.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const result = await getSentNotifications({ batch_id: 'b-1', user_id: 5 });

      expect(result.rows.map(r => r.status)).toEqual(['scheduled', 'delivered', 'read', 'cancelled']);
      expect(result.count).toBe(4);
      expect(result.summary).toEqual({ total: 4, read: 1, pending: 2 });
      expect(notifications.findAndCountAll.mock.calls[0][0].where).toEqual({ batch_id: 'b-1', user_id: 5 });
    });

    test('sin batch_id no calcula resumen', async() => {
      notifications.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const result = await getSentNotifications({});

      expect(result.summary).toBeNull();
      expect(notifications.count).not.toHaveBeenCalled();
    });
  });
});
