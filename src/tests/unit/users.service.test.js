const { users } = require('../../models/index');
const { encrypt } = require('../../utils/handlePassword');
const { tokenSign } = require('../../utils/handleJwt');
const {
  getUser,
  getUsers,
  registerUser,
  registerSuperAdmin,
  findByEmail
} = require('../../services/users');

// Mock del modelo users
jest.mock('../../models/index', () => ({
  users: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

// Mock de utils
jest.mock('../../utils/handlePassword', () => ({
  encrypt: jest.fn()
}));

jest.mock('../../utils/handleJwt', () => ({
  tokenSign: jest.fn()
}));

describe('Users Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Tests para getUser
  // ============================================
  describe('getUser', () => {
    test('debe retornar un usuario por id sin password', async() => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedPassword123',
        role: 'admin',
        set: jest.fn()
      };

      users.findOne.mockResolvedValue(mockUser);

      const result = await getUser(1);

      expect(users.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUser.set).toHaveBeenCalledWith('password', undefined, { strict: false });
      expect(result).toEqual(mockUser);
    });

    test('debe retornar null si el usuario no existe', async() => {
      users.findOne.mockResolvedValue(null);

      const result = await getUser(999);

      expect(users.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });

    test('debe llamar findOne con el id correcto', async() => {
      users.findOne.mockResolvedValue(null);

      await getUser(42);

      expect(users.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
    });
  });

  // ============================================
  // Tests para getUsers
  // ============================================
  describe('getUsers', () => {
    test('debe retornar lista de usuarios sin passwords', async() => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@test.com',
          password: 'hash1',
          role: 'admin',
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            name: 'User 1',
            email: 'user1@test.com',
            password: 'hash1',
            role: 'admin'
          })
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@test.com',
          password: 'hash2',
          role: 'user',
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            name: 'User 2',
            email: 'user2@test.com',
            password: 'hash2',
            role: 'user'
          })
        }
      ];

      users.findAll.mockResolvedValue(mockUsers);

      const result = await getUsers();

      expect(users.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      // Verificar que no incluye password
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      // Verificar que incluye otros campos
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'User 1');
      expect(result[0]).toHaveProperty('email', 'user1@test.com');
    });

    test('debe retornar array vacio si no hay usuarios', async() => {
      users.findAll.mockResolvedValue([]);

      const result = await getUsers();

      expect(result).toEqual([]);
    });

    test('debe llamar toJSON en cada usuario', async() => {
      const mockUser = {
        id: 1,
        name: 'User',
        email: 'user@test.com',
        password: 'hash',
        role: 'admin',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'User',
          email: 'user@test.com',
          password: 'hash',
          role: 'admin'
        })
      };

      users.findAll.mockResolvedValue([mockUser]);

      await getUsers();

      expect(mockUser.toJSON).toHaveBeenCalled();
    });
  });

  // ============================================
  // Tests para registerUser
  // ============================================
  describe('registerUser', () => {
    test('debe registrar un usuario y retornar token', async() => {
      const userData = {
        name: 'New User',
        email: 'new@test.com',
        password: 'plainPassword123',
        role: 'user'
      };

      const encryptedPassword = 'encryptedHash123';
      const mockToken = 'jwt.token.here';
      const mockCreatedUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: encryptedPassword,
        role: userData.role,
        set: jest.fn()
      };

      encrypt.mockResolvedValue(encryptedPassword);
      users.create.mockResolvedValue(mockCreatedUser);
      tokenSign.mockResolvedValue(mockToken);

      const result = await registerUser(userData);

      expect(encrypt).toHaveBeenCalledWith(userData.password);
      expect(users.create).toHaveBeenCalledWith({
        ...userData,
        password: encryptedPassword
      });
      expect(mockCreatedUser.set).toHaveBeenCalledWith('password', undefined, { strict: false });
      expect(tokenSign).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toHaveProperty('token', mockToken);
      expect(result).toHaveProperty('user', mockCreatedUser);
    });

    test('debe encriptar el password antes de crear el usuario', async() => {
      const userData = {
        name: 'Test',
        email: 'test@test.com',
        password: 'myPassword',
        role: 'admin'
      };

      encrypt.mockResolvedValue('encrypted');
      users.create.mockResolvedValue({
        id: 1,
        ...userData,
        password: 'encrypted',
        set: jest.fn()
      });
      tokenSign.mockResolvedValue('token');

      await registerUser(userData);

      expect(encrypt).toHaveBeenCalledWith('myPassword');
      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'encrypted' })
      );
    });

    test('debe ocultar el password del usuario retornado', async() => {
      const userData = {
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
        role: 'user'
      };

      const mockUser = {
        id: 1,
        ...userData,
        set: jest.fn()
      };

      encrypt.mockResolvedValue('encrypted');
      users.create.mockResolvedValue(mockUser);
      tokenSign.mockResolvedValue('token');

      await registerUser(userData);

      expect(mockUser.set).toHaveBeenCalledWith('password', undefined, { strict: false });
    });
  });

  // ============================================
  // Tests para registerSuperAdmin
  // ============================================
  describe('registerSuperAdmin', () => {
    test('debe registrar un superadmin y retornar token', async() => {
      const adminData = {
        name: 'Super Admin',
        email: 'admin@test.com',
        password: 'adminPass123',
        role: 'superadmin'
      };

      const encryptedPassword = 'encryptedAdminHash';
      const mockToken = 'admin.jwt.token';
      const mockCreatedAdmin = {
        id: 1,
        name: adminData.name,
        email: adminData.email,
        password: encryptedPassword,
        role: adminData.role
      };

      encrypt.mockResolvedValue(encryptedPassword);
      users.create.mockResolvedValue(mockCreatedAdmin);
      tokenSign.mockResolvedValue(mockToken);

      const result = await registerSuperAdmin(adminData);

      expect(encrypt).toHaveBeenCalledWith(adminData.password);
      expect(users.create).toHaveBeenCalledWith({
        ...adminData,
        password: encryptedPassword
      });
      expect(tokenSign).toHaveBeenCalledWith(mockCreatedAdmin);
      expect(result).toHaveProperty('token', mockToken);
      expect(result).toHaveProperty('user', mockCreatedAdmin);
    });

    test('debe encriptar el password del superadmin', async() => {
      const adminData = {
        name: 'Admin',
        email: 'admin@test.com',
        password: 'secretPass',
        role: 'superadmin'
      };

      encrypt.mockResolvedValue('encryptedSecret');
      users.create.mockResolvedValue({ id: 1, ...adminData });
      tokenSign.mockResolvedValue('token');

      await registerSuperAdmin(adminData);

      expect(encrypt).toHaveBeenCalledWith('secretPass');
    });
  });

  // ============================================
  // Tests para findByEmail
  // ============================================
  describe('findByEmail', () => {
    test('debe encontrar usuario por email sin password', async() => {
      const mockUser = {
        id: 1,
        name: 'Found User',
        email: 'found@test.com',
        password: 'hashedPassword',
        role: 'user',
        set: jest.fn()
      };

      users.findOne.mockResolvedValue(mockUser);

      const result = await findByEmail({ email: 'found@test.com' });

      expect(users.findOne).toHaveBeenCalledWith({
        where: { email: 'found@test.com' }
      });
      expect(mockUser.set).toHaveBeenCalledWith('password', undefined, { strict: false });
      expect(result).toEqual(mockUser);
    });

    test('debe buscar con el email correcto', async() => {
      const mockUser = {
        id: 1,
        name: 'User',
        email: 'specific@email.com',
        set: jest.fn()
      };

      users.findOne.mockResolvedValue(mockUser);

      await findByEmail({ email: 'specific@email.com' });

      expect(users.findOne).toHaveBeenCalledWith({
        where: { email: 'specific@email.com' }
      });
    });

    test('debe ocultar el password del usuario encontrado', async() => {
      const mockUser = {
        id: 1,
        name: 'User',
        email: 'user@test.com',
        password: 'secret',
        set: jest.fn()
      };

      users.findOne.mockResolvedValue(mockUser);

      await findByEmail({ email: 'user@test.com' });

      expect(mockUser.set).toHaveBeenCalledWith('password', undefined, { strict: false });
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getUser debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      users.findOne.mockRejectedValue(dbError);

      await expect(getUser(1)).rejects.toThrow('Database connection failed');
    });

    test('getUsers debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      users.findAll.mockRejectedValue(dbError);

      await expect(getUsers()).rejects.toThrow('Database query failed');
    });

    test('registerUser debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      encrypt.mockResolvedValue('encrypted');
      users.create.mockRejectedValue(dbError);

      await expect(registerUser({ password: 'test' })).rejects.toThrow('Insert failed');
    });

    test('registerSuperAdmin debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      encrypt.mockResolvedValue('encrypted');
      users.create.mockRejectedValue(dbError);

      await expect(registerSuperAdmin({ password: 'test' })).rejects.toThrow('Insert failed');
    });

    test('findByEmail debe propagar error de BD', async() => {
      const dbError = new Error('Query failed');
      users.findOne.mockRejectedValue(dbError);

      await expect(findByEmail({ email: 'test@test.com' })).rejects.toThrow('Query failed');
    });

    test('registerUser debe propagar error de encrypt', async() => {
      const encryptError = new Error('Encryption failed');
      encrypt.mockRejectedValue(encryptError);

      await expect(registerUser({ password: 'test' })).rejects.toThrow('Encryption failed');
    });

    test('registerUser debe propagar error de tokenSign', async() => {
      const tokenError = new Error('Token generation failed');
      encrypt.mockResolvedValue('encrypted');
      users.create.mockResolvedValue({ id: 1, set: jest.fn() });
      tokenSign.mockRejectedValue(tokenError);

      await expect(registerUser({ password: 'test' })).rejects.toThrow('Token generation failed');
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getUsers con muchos usuarios', async() => {
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        password: `hash${i + 1}`,
        role: 'user',
        toJSON: jest.fn().mockReturnValue({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@test.com`,
          password: `hash${i + 1}`,
          role: 'user'
        })
      }));

      users.findAll.mockResolvedValue(manyUsers);

      const result = await getUsers();

      expect(result).toHaveLength(100);
      result.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });

    test('getUser con id tipo string numerico', async() => {
      const mockUser = {
        id: 1,
        name: 'User',
        set: jest.fn()
      };
      users.findOne.mockResolvedValue(mockUser);

      await getUser('1');

      expect(users.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    test('registerUser preserva campos adicionales del request', async() => {
      const userData = {
        name: 'User',
        email: 'user@test.com',
        password: 'pass',
        role: 'admin',
        extraField: 'extra'
      };

      encrypt.mockResolvedValue('encrypted');
      users.create.mockResolvedValue({ id: 1, ...userData, set: jest.fn() });
      tokenSign.mockResolvedValue('token');

      await registerUser(userData);

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ extraField: 'extra' })
      );
    });

    test('findByEmail con email en mayusculas', async() => {
      const mockUser = {
        id: 1,
        email: 'TEST@TEST.COM',
        set: jest.fn()
      };

      users.findOne.mockResolvedValue(mockUser);

      await findByEmail({ email: 'TEST@TEST.COM' });

      expect(users.findOne).toHaveBeenCalledWith({
        where: { email: 'TEST@TEST.COM' }
      });
    });
  });
});
