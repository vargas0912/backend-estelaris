jest.mock('../../services/user-privileges');
jest.mock('../../services/systemSettings');
jest.mock('../../utils/logger');
jest.mock('../../services/notifications');

const { getOneUserPrivilege } = require('../../services/user-privileges');
const { getSystemSetting } = require('../../services/systemSettings');
const { notifyDateConflict } = require('../../services/notifications');
const customDateGuard = require('../../middlewares/customDateGuard');
const { getTodayInSystemTimezone } = require('../../utils/timezone');
const { ROLE } = require('../../constants/roles');
const { FORBIDDEN } = require('../../constants/forbidden');

const TZ = 'America/Mexico_City';
const PRIVILEGE = 'set_custom_expense_date';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });

const run = async(role, date, options = {}) => {
  const guard = customDateGuard({ field: 'trans_date', privilege: PRIVILEGE, ...options });
  const req = { user: { id: 7, role }, body: { trans_date: date }, params: { id: '3' } };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  const next = jest.fn();
  await guard(req, res, next);
  return { res, next };
};

describe('[customDateGuard]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSystemSetting.mockResolvedValue({ value: TZ });
  });

  test('superadmin con fecha pasada pasa sin consultar privilegios', async() => {
    const { next } = await run(ROLE.SUPERADMIN, '2020-01-01');
    expect(next).toHaveBeenCalled();
    expect(getOneUserPrivilege).not.toHaveBeenCalled();
  });

  test('sin el campo de fecha pasa (campo opcional en update)', async() => {
    const { next } = await run(ROLE.USER, undefined);
    expect(next).toHaveBeenCalled();
  });

  test('usuario con fecha de hoy pasa sin consultar privilegios', async() => {
    const { next } = await run(ROLE.USER, today());
    expect(next).toHaveBeenCalled();
    expect(getOneUserPrivilege).not.toHaveBeenCalled();
  });

  test('fecha distinta y sin privilegio recibe 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const { res, next } = await run(ROLE.USER, '2020-01-01');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ error: FORBIDDEN.DATE_GUARD_CONFLICT, code: 'DATE_GUARD_CONFLICT' });
    expect(getOneUserPrivilege).toHaveBeenCalledWith(7, PRIVILEGE);
    expect(notifyDateConflict).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ id: 7 }),
      field: 'trans_date',
      sentDate: '2020-01-01',
      systemDate: today()
    }));
  });

  test('si falla la notificacion igual responde 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    notifyDateConflict.mockRejectedValue(new Error('db down'));
    const { res, next } = await run(ROLE.USER, '2020-01-01');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('fecha de ayer a +-5 min de la medianoche pasa; fuera de la tolerancia no', async() => {
    const midnight = new Date('2026-03-10T06:00:00Z'); // 00:00 en America/Mexico_City (UTC-6)
    jest.useFakeTimers().setSystemTime(new Date(midnight.getTime() + 3 * 60 * 1000));
    const near = await run(ROLE.USER, '2026-03-09');
    expect(near.next).toHaveBeenCalled();
    expect(notifyDateConflict).not.toHaveBeenCalled();

    jest.setSystemTime(new Date(midnight.getTime() + 10 * 60 * 1000));
    getOneUserPrivilege.mockResolvedValue(false);
    const far = await run(ROLE.USER, '2026-03-09');
    expect(far.next).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('fecha distinta y con privilegio pasa', async() => {
    getOneUserPrivilege.mockResolvedValue(true);
    const { next } = await run(ROLE.ADMIN, '2020-01-01');
    expect(next).toHaveBeenCalled();
  });

  test('con privilegio no consulta la fecha almacenada', async() => {
    getOneUserPrivilege.mockResolvedValue(true);
    const currentDate = jest.fn();
    const { next } = await run(ROLE.USER, '2020-01-01', { currentDate });
    expect(next).toHaveBeenCalled();
    expect(currentDate).not.toHaveBeenCalled();
  });

  test('update con la fecha ya almacenada pasa sin privilegio', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const currentDate = jest.fn().mockResolvedValue('2020-01-01');
    const { next } = await run(ROLE.USER, '2020-01-01', { currentDate });
    expect(next).toHaveBeenCalled();
  });

  test('fecha almacenada como Date se compara por dia', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const currentDate = jest.fn().mockResolvedValue(new Date('2020-01-01T00:00:00.000Z'));
    const { next } = await run(ROLE.USER, '2020-01-01', { currentDate });
    expect(next).toHaveBeenCalled();
  });

  test('registro inexistente (sin fecha almacenada) y sin privilegio recibe 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const currentDate = jest.fn().mockResolvedValue(undefined);
    const { res, next } = await run(ROLE.USER, '2020-01-01', { currentDate });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('fallo al consultar la fecha almacenada devuelve 500, no 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const currentDate = jest.fn().mockRejectedValue(new Error('db'));
    const { res, next } = await run(ROLE.USER, '2020-01-01', { currentDate });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('update que cambia la fecha almacenada sin privilegio recibe 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const currentDate = jest.fn().mockResolvedValue('2020-01-01');
    const { res, next } = await run(ROLE.USER, '2020-02-02', { currentDate });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('error al consultar privilegios devuelve 500', async() => {
    getOneUserPrivilege.mockRejectedValue(new Error('db'));
    const { res, next } = await run(ROLE.USER, '2020-01-01');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('timezone invalido en settings usa el default y no rompe la fecha de hoy', async() => {
    getSystemSetting.mockResolvedValue({ value: 'No/Existe' });
    const { next } = await run(ROLE.USER, today());
    expect(next).toHaveBeenCalled();
  });

  test('respeta el timezone de settings para calcular hoy', async() => {
    getSystemSetting.mockResolvedValue({ value: 'Pacific/Kiritimati' });
    const expected = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Kiritimati' });
    expect(await getTodayInSystemTimezone()).toBe(expected);
  });

  test('sin setting o con fallo de lectura usa el default', async() => {
    getSystemSetting.mockRejectedValue(new Error('db'));
    expect(await getTodayInSystemTimezone()).toBe(today());
    getSystemSetting.mockResolvedValue(null);
    expect(await getTodayInSystemTimezone()).toBe(today());
  });
});
