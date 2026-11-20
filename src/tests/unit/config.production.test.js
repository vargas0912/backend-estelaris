/**
 * Configuración de Sequelize en producción: sin log de SQL salvo DB_LOGGING=true
 */
describe('Configuración de base de datos en producción', () => {
  const originalEnv = { ...process.env };

  const loadProductionConfig = () => {
    let config;
    jest.isolateModules(() => {
      config = require('../../config/config').production;
    });
    return config;
  };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('no registra las consultas SQL por defecto', () => {
    delete process.env.DB_LOGGING;
    expect(loadProductionConfig().logging).toBe(false);
  });

  test('DB_LOGGING=true reactiva el log de SQL', () => {
    process.env.DB_LOGGING = 'true';
    expect(typeof loadProductionConfig().logging).toBe('function');
  });
});
