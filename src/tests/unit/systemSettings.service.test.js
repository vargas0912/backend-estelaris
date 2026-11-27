const { systemSettings } = require('../../models/index');
const {
  PUBLIC_SETTING_CATEGORIES,
  getAppConfigSettings
} = require('../../services/systemSettings');

jest.mock('../../models/index', () => ({
  systemSettings: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('SystemSettings Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUBLIC_SETTING_CATEGORIES', () => {
    test('solo incluye formats y modules, nunca pricing', () => {
      expect([...PUBLIC_SETTING_CATEGORIES].sort()).toEqual(['formats', 'modules']);
      expect(PUBLIC_SETTING_CATEGORIES).not.toContain('pricing');
    });
  });

  describe('getAppConfigSettings', () => {
    test('filtra por categorías públicas y devuelve solo key, value y data_type', async() => {
      const rows = [{ key: 'date_format', value: 'DD/MM/YYYY', data_type: 'string' }];
      systemSettings.findAll.mockResolvedValue(rows);

      const result = await getAppConfigSettings();

      expect(result).toBe(rows);
      expect(systemSettings.findAll).toHaveBeenCalledWith({
        attributes: ['key', 'value', 'data_type'],
        where: { category: PUBLIC_SETTING_CATEGORIES },
        order: [['key', 'ASC']]
      });
    });
  });
});
