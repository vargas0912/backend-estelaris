'use strict';

const { accountingPeriods } = require('../../models/index');
const {
  getAllPeriods,
  getCurrentPeriod,
  getPeriod,
  createPeriod,
  closePeriod,
  reopenPeriod,
  lockPeriod
} = require('../../services/accountingPeriods');

jest.mock('../../models/index', () => ({
  accountingPeriods: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  users: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

const mockPeriod = (overrides = {}) => ({
  id: 1,
  name: 'Enero 2026',
  year: 2026,
  month: 1,
  status: 'abierto',
  balance_snapshot: null,
  closed_at: null,
  closed_by_user_id: null,
  save: jest.fn().mockResolvedValue({}),
  ...overrides
});

describe('AccountingPeriods Service - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── getAllPeriods ────────────────────────────────────────────────────────────

  describe('getAllPeriods', () => {
    test('debe retornar lista de períodos', async () => {
      const mock = [mockPeriod(), mockPeriod({ id: 2, month: 2 })];
      accountingPeriods.findAll.mockResolvedValue(mock);

      const result = await getAllPeriods();

      expect(accountingPeriods.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    test('debe ordenar por year DESC, month DESC', async () => {
      accountingPeriods.findAll.mockResolvedValue([]);

      await getAllPeriods();

      expect(accountingPeriods.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['year', 'DESC'], ['month', 'DESC']] })
      );
    });

    test('debe incluir closedBy en la consulta', async () => {
      accountingPeriods.findAll.mockResolvedValue([]);

      await getAllPeriods();

      expect(accountingPeriods.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([expect.objectContaining({ as: 'closedBy' })])
        })
      );
    });
  });

  // ─── getCurrentPeriod ────────────────────────────────────────────────────────

  describe('getCurrentPeriod', () => {
    test('debe buscar período con status abierto', async () => {
      accountingPeriods.findOne.mockResolvedValue(mockPeriod());

      await getCurrentPeriod();

      expect(accountingPeriods.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'abierto' } })
      );
    });

    test('debe retornar null si no hay período abierto', async () => {
      accountingPeriods.findOne.mockResolvedValue(null);

      const result = await getCurrentPeriod();
      expect(result).toBeNull();
    });
  });

  // ─── getPeriod ───────────────────────────────────────────────────────────────

  describe('getPeriod', () => {
    test('debe retornar período por id', async () => {
      const mock = mockPeriod();
      accountingPeriods.findOne.mockResolvedValue(mock);

      const result = await getPeriod(1);
      expect(result).toEqual(mock);
    });

    test('debe retornar null si no existe', async () => {
      accountingPeriods.findOne.mockResolvedValue(null);

      const result = await getPeriod(999);
      expect(result).toBeNull();
    });
  });

  // ─── createPeriod ────────────────────────────────────────────────────────────

  describe('createPeriod', () => {
    test('debe crear período si no existe duplicado y no hay anterior abierto', async () => {
      const created = mockPeriod();
      accountingPeriods.findOne
        .mockResolvedValueOnce(null) // no duplicado
        .mockResolvedValueOnce(null) // no período anterior
        .mockResolvedValueOnce(created); // getPeriod final

      accountingPeriods.create.mockResolvedValue(created);

      const result = await createPeriod({ name: 'Enero 2026', year: 2026, month: 1 });
      expect(result).toEqual(created);
    });

    test('debe retornar error si el período ya existe', async () => {
      accountingPeriods.findOne.mockResolvedValueOnce(mockPeriod());

      const result = await createPeriod({ name: 'Enero 2026', year: 2026, month: 1 });
      expect(result).toEqual({ error: 'PERIOD_ALREADY_EXISTS' });
    });

    test('debe retornar error si el período anterior está abierto', async () => {
      accountingPeriods.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockPeriod({ month: 1, status: 'abierto' }));

      const result = await createPeriod({ name: 'Febrero 2026', year: 2026, month: 2 });
      expect(result).toEqual({ error: 'PREVIOUS_PERIOD_STILL_OPEN' });
    });

    test('debe crear período si el anterior está cerrado', async () => {
      const created = mockPeriod({ month: 2 });
      accountingPeriods.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockPeriod({ month: 1, status: 'cerrado' }))
        .mockResolvedValueOnce(created);

      accountingPeriods.create.mockResolvedValue(created);

      const result = await createPeriod({ name: 'Febrero 2026', year: 2026, month: 2 });
      expect(result).toEqual(created);
    });

    test('debe calcular período anterior correctamente para enero (mes 12 año anterior)', async () => {
      accountingPeriods.findOne
        .mockResolvedValueOnce(null) // no duplicado para Ene 2026
        .mockResolvedValueOnce(null) // no período dic 2025
        .mockResolvedValueOnce(mockPeriod());

      accountingPeriods.create.mockResolvedValue(mockPeriod());

      await createPeriod({ name: 'Enero 2026', year: 2026, month: 1 });

      // Segunda llamada de findOne debe buscar dic 2025
      const secondCall = accountingPeriods.findOne.mock.calls[1][0];
      expect(secondCall.where).toEqual({ year: 2025, month: 12 });
    });
  });

  // ─── closePeriod ─────────────────────────────────────────────────────────────

  describe('closePeriod', () => {
    test('debe cerrar período abierto y guardar snapshot vacío', async () => {
      const mock = mockPeriod();
      accountingPeriods.findByPk.mockResolvedValue(mock);
      accountingPeriods.findOne.mockResolvedValue({ ...mock, status: 'cerrado' });

      await closePeriod(1, 99);

      expect(mock.save).toHaveBeenCalled();
      expect(mock.status).toBe('cerrado');
      expect(mock.closed_by_user_id).toBe(99);
      expect(mock.closed_at).toBeInstanceOf(Date);
      expect(mock.balance_snapshot).toEqual({});
    });

    test('debe retornar error NOT_FOUND si no existe', async () => {
      accountingPeriods.findByPk.mockResolvedValue(null);

      await closePeriod(999, 1);
      expect(accountingPeriods.findByPk).toHaveBeenCalledWith(999);
    });

    test('debe retornar error PERIOD_NOT_OPEN si ya está cerrado', async () => {
      accountingPeriods.findByPk.mockResolvedValue(mockPeriod({ status: 'cerrado' }));

      const result = await closePeriod(1, 1);
      expect(result).toEqual({ error: 'PERIOD_NOT_OPEN' });
    });

    test('debe retornar error PERIOD_NOT_OPEN si está bloqueado', async () => {
      accountingPeriods.findByPk.mockResolvedValue(mockPeriod({ status: 'bloqueado' }));

      const result = await closePeriod(1, 1);
      expect(result).toEqual({ error: 'PERIOD_NOT_OPEN' });
    });
  });

  // ─── reopenPeriod ────────────────────────────────────────────────────────────

  describe('reopenPeriod', () => {
    test('debe reabrir período cerrado', async () => {
      const mock = mockPeriod({ status: 'cerrado', closed_at: new Date(), closed_by_user_id: 1 });
      accountingPeriods.findByPk.mockResolvedValue(mock);
      accountingPeriods.findOne.mockResolvedValue({ ...mock, status: 'abierto' });

      await reopenPeriod(1);

      expect(mock.status).toBe('abierto');
      expect(mock.closed_at).toBeNull();
      expect(mock.closed_by_user_id).toBeNull();
      expect(mock.balance_snapshot).toBeNull();
      expect(mock.save).toHaveBeenCalled();
    });

    test('debe retornar error NOT_FOUND si no existe', async () => {
      accountingPeriods.findByPk.mockResolvedValue(null);

      const result = await reopenPeriod(999);
      expect(result).toEqual({ error: 'NOT_FOUND' });
    });

    test('debe retornar error PERIOD_LOCKED si está bloqueado', async () => {
      accountingPeriods.findByPk.mockResolvedValue(mockPeriod({ status: 'bloqueado' }));

      const result = await reopenPeriod(1);
      expect(result).toEqual({ error: 'PERIOD_LOCKED' });
    });

    test('debe retornar error PERIOD_NOT_CLOSED si está abierto', async () => {
      accountingPeriods.findByPk.mockResolvedValue(mockPeriod({ status: 'abierto' }));

      const result = await reopenPeriod(1);
      expect(result).toEqual({ error: 'PERIOD_NOT_CLOSED' });
    });
  });

  // ─── lockPeriod ──────────────────────────────────────────────────────────────

  describe('lockPeriod', () => {
    test('debe bloquear período cerrado', async () => {
      const mock = mockPeriod({ status: 'cerrado' });
      accountingPeriods.findByPk.mockResolvedValue(mock);
      accountingPeriods.findOne.mockResolvedValue({ ...mock, status: 'bloqueado' });

      await lockPeriod(1);

      expect(mock.status).toBe('bloqueado');
      expect(mock.save).toHaveBeenCalled();
    });

    test('debe retornar error NOT_FOUND si no existe', async () => {
      accountingPeriods.findByPk.mockResolvedValue(null);

      const result = await lockPeriod(999);
      expect(result).toEqual({ error: 'NOT_FOUND' });
    });

    test('debe retornar error PERIOD_ALREADY_LOCKED si ya está bloqueado', async () => {
      accountingPeriods.findByPk.mockResolvedValue(mockPeriod({ status: 'bloqueado' }));

      const result = await lockPeriod(1);
      expect(result).toEqual({ error: 'PERIOD_ALREADY_LOCKED' });
    });

    test('debe retornar error PERIOD_NOT_CLOSED si está abierto', async () => {
      accountingPeriods.findByPk.mockResolvedValue(mockPeriod({ status: 'abierto' }));

      const result = await lockPeriod(1);
      expect(result).toEqual({ error: 'PERIOD_NOT_CLOSED' });
    });
  });

  // ─── Manejo de errores ───────────────────────────────────────────────────────

  describe('Manejo de errores', () => {
    test('getAllPeriods debe propagar error de BD', async () => {
      accountingPeriods.findAll.mockRejectedValue(new Error('DB error'));

      await expect(getAllPeriods()).rejects.toThrow('DB error');
    });

    test('closePeriod debe propagar error de save', async () => {
      const mock = mockPeriod({ save: jest.fn().mockRejectedValue(new Error('Save failed')) });
      accountingPeriods.findByPk.mockResolvedValue(mock);

      await expect(closePeriod(1, 1)).rejects.toThrow('Save failed');
    });

    test('createPeriod debe propagar error de BD al crear', async () => {
      accountingPeriods.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      accountingPeriods.create.mockRejectedValue(new Error('Insert failed'));

      await expect(createPeriod({ name: 'X', year: 2026, month: 5 }))
        .rejects.toThrow('Insert failed');
    });
  });
});
