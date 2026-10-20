jest.mock('../../services/user-privileges');
jest.mock('../../services/systemSettings');

const { getOneUserPrivilege } = require('../../services/user-privileges');
const { getSystemSetting } = require('../../services/systemSettings');
const paymentDateGuard = require('../../middlewares/paymentDateGuard');
const { ROLE } = require('../../constants/roles');

const TZ = 'America/Mexico_City';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });

const run = async(role, paymentDate) => {
  const req = { user: { id: 7, role }, body: { payment_date: paymentDate } };
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  const next = jest.fn();
  await paymentDateGuard(req, res, next);
  return { res, next };
};

describe('[paymentDateGuard]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSystemSetting.mockResolvedValue({ value: TZ });
  });

  test('superadmin con fecha pasada pasa sin consultar privilegios', async() => {
    const { next } = await run(ROLE.SUPERADMIN, '2020-01-01');
    expect(next).toHaveBeenCalled();
    expect(getOneUserPrivilege).not.toHaveBeenCalled();
  });

  test('usuario con fecha de hoy pasa sin consultar privilegios', async() => {
    const { next } = await run(ROLE.USER, today());
    expect(next).toHaveBeenCalled();
    expect(getOneUserPrivilege).not.toHaveBeenCalled();
  });

  test('usuario con fecha distinta y sin privilegio recibe 403', async() => {
    getOneUserPrivilege.mockResolvedValue(false);
    const { res, next } = await run(ROLE.USER, '2020-01-01');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(getOneUserPrivilege).toHaveBeenCalledWith(7, 'set_custom_payment_date');
  });

  test('usuario con fecha distinta y con privilegio pasa', async() => {
    getOneUserPrivilege.mockResolvedValue(true);
    const { next } = await run(ROLE.ADMIN, '2020-01-01');
    expect(next).toHaveBeenCalled();
  });

  test('error al consultar privilegios devuelve 403', async() => {
    getOneUserPrivilege.mockRejectedValue(new Error('db'));
    const { res, next } = await run(ROLE.USER, '2020-01-01');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
