jest.mock('../../services/user-privileges');
jest.mock('../../services/systemSettings');

const { getOneUserPrivilege } = require('../../services/user-privileges');
const { getSystemSetting } = require('../../services/systemSettings');
const customDateGuard = require('../../middlewares/customDateGuard');
const { getTodayInSystemTimezone } = require('../../utils/timezone');
const { ROLE } = require('../../constants/roles');

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
    expect(getOneUserPrivilege).toHaveBeenCalledWith(7, PRIVILEGE);
  });

  test('fecha distinta y con privilegio pasa', async() => {
    getOneUserPrivilege.mockResolvedValue(true);
    const { next } = await run(ROLE.ADMIN, '2020-01-01');
    expect(next).toHaveBeenCalled();
  });

  test('update con la fecha ya almacenada pasa sin privilegio', async() => {
    const currentDate = jest.fn().mockResolvedValue('2020-01-01');
    const { next } = await run(ROLE.USER, '2020-01-01', { currentDate });
    expect(next).toHaveBeenCalled();
    expect(getOneUserPrivilege).not.toHaveBeenCalled();
  });

  test('update que cambia la fecha almacenada sin privilegio recibe 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const currentDate = jest.fn().mockResolvedValue('2020-01-01');
    const { res, next } = await run(ROLE.USER, '2020-02-02', { currentDate });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('error al consultar privilegios devuelve 403', async() => {
    getOneUserPrivilege.mockRejectedValue(new Error('db'));
    const { res, next } = await run(ROLE.USER, '2020-01-01');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
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
