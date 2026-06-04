const { users, userAuditLogs } = require('../../models/index');
const { encrypt } = require('../../utils/handlePassword');
const { resetPassword, generateSecurePassword } = require('../../services/users');

jest.mock('../../models/index', () => ({
  users: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  userAuditLogs: {
    create: jest.fn()
  }
}));

jest.mock('../../utils/handlePassword', () => ({
  encrypt: jest.fn()
}));

jest.mock('../../utils/handleJwt', () => ({
  tokenSign: jest.fn()
}));

describe('Users Service - generateSecurePassword', () => {
  test('generates password of at least 12 characters', () => {
    const pass = generateSecurePassword();
    expect(pass.length).toBeGreaterThanOrEqual(12);
  });

  test('contains uppercase letters', () => {
    expect(/[A-Z]/.test(generateSecurePassword())).toBe(true);
  });

  test('contains lowercase letters', () => {
    expect(/[a-z]/.test(generateSecurePassword())).toBe(true);
  });

  test('contains digits', () => {
    expect(/[0-9]/.test(generateSecurePassword())).toBe(true);
  });

  test('contains symbols', () => {
    expect(/[^a-zA-Z0-9]/.test(generateSecurePassword())).toBe(true);
  });

  test('generates unique passwords across multiple calls', () => {
    const passes = new Set(Array.from({ length: 10 }, () => generateSecurePassword()));
    expect(passes.size).toBeGreaterThan(1);
  });
});

describe('Users Service - resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null when user not found', async() => {
    users.findByPk.mockResolvedValue(null);

    const result = await resetPassword(1, 999);

    expect(result).toBeNull();
    expect(users.update).not.toHaveBeenCalled();
    expect(userAuditLogs.create).not.toHaveBeenCalled();
  });

  test('returns object with temporaryPassword on success', async() => {
    users.findByPk.mockResolvedValue({ id: 2, role: 'user' });
    encrypt.mockResolvedValue('hashedPass');
    users.update.mockResolvedValue([1]);
    userAuditLogs.create.mockResolvedValue({});

    const result = await resetPassword(1, 2);

    expect(result).toHaveProperty('temporaryPassword');
    expect(typeof result.temporaryPassword).toBe('string');
    expect(result.temporaryPassword.length).toBeGreaterThanOrEqual(12);
  });

  test('hashes password with encrypt before updating user', async() => {
    users.findByPk.mockResolvedValue({ id: 2 });
    encrypt.mockResolvedValue('hashedPass');
    users.update.mockResolvedValue([1]);
    userAuditLogs.create.mockResolvedValue({});

    await resetPassword(1, 2);

    expect(encrypt).toHaveBeenCalledTimes(1);
    expect(users.update).toHaveBeenCalledWith(
      { password: 'hashedPass', must_change_password: true },
      { where: { id: 2 } }
    );
  });

  test('creates audit log with caller_id, target_user_id and action', async() => {
    users.findByPk.mockResolvedValue({ id: 2 });
    encrypt.mockResolvedValue('hash');
    users.update.mockResolvedValue([1]);
    userAuditLogs.create.mockResolvedValue({});

    await resetPassword(5, 2);

    expect(userAuditLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'reset_password',
        caller_id: 5,
        target_user_id: 2
      })
    );
  });

  test('returned object only contains temporaryPassword key', async() => {
    users.findByPk.mockResolvedValue({ id: 2 });
    encrypt.mockResolvedValue('hash');
    users.update.mockResolvedValue([1]);
    userAuditLogs.create.mockResolvedValue({});

    const result = await resetPassword(1, 2);

    expect(Object.keys(result)).toEqual(['temporaryPassword']);
  });

  test('audit log does not contain the plain text password', async() => {
    users.findByPk.mockResolvedValue({ id: 2 });
    encrypt.mockResolvedValue('hash');
    users.update.mockResolvedValue([1]);
    userAuditLogs.create.mockResolvedValue({});

    await resetPassword(1, 2);

    const auditPayload = userAuditLogs.create.mock.calls[0][0];
    expect(auditPayload).not.toHaveProperty('password');
    expect(auditPayload).not.toHaveProperty('temporaryPassword');
  });

  test('propagates database error from users.update', async() => {
    users.findByPk.mockResolvedValue({ id: 2 });
    encrypt.mockResolvedValue('hash');
    users.update.mockRejectedValue(new Error('DB write failed'));

    await expect(resetPassword(1, 2)).rejects.toThrow('DB write failed');
  });
});
