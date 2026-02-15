const { municipalities, states } = require('../../models/index');
const {
  getMunicipalitiesByStateId,
  getMunicipality
} = require('../../services/municipalities');

// Mock de los modelos
jest.mock('../../models/index', () => ({
  municipalities: {
    findAll: jest.fn(),
    findOne: jest.fn()
  },
  states: {}
}));

describe('Municipalities Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Tests para getMunicipalitiesByStateId
  // ============================================
  describe('getMunicipalitiesByStateId', () => {
    test('debe retornar municipios por state_id con estado incluido', async() => {
      const mockMunicipalities = [
        {
          id: 1,
          name: 'Guadalajara',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: {
            id: 14,
            name: 'Jalisco'
          }
        },
        {
          id: 2,
          name: 'Zapopan',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: {
            id: 14,
            name: 'Jalisco'
          }
        }
      ];

      municipalities.findAll.mockResolvedValue(mockMunicipalities);

      const result = await getMunicipalitiesByStateId(14);

      expect(municipalities.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        where: {
          state_id: 14
        },
        include: [
          {
            model: states,
            as: 'estado',
            attributes: ['id', 'name'],
            required: true
          }
        ]
      });
      expect(municipalities.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMunicipalities);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacio si no hay municipios para el estado', async() => {
      municipalities.findAll.mockResolvedValue([]);

      const result = await getMunicipalitiesByStateId(999);

      expect(municipalities.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        where: {
          state_id: 999
        },
        include: [
          {
            model: states,
            as: 'estado',
            attributes: ['id', 'name'],
            required: true
          }
        ]
      });
      expect(result).toEqual([]);
    });

    test('debe llamar findAll con el state_id correcto', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId(5);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            state_id: 5
          }
        })
      );
    });

    test('debe incluir solo los atributos especificados del municipio', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId(1);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: ['id', 'name', 'created_at', 'updated_at']
        })
      );
    });

    test('debe incluir la relacion estado con sus atributos', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId(1);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: states,
              as: 'estado',
              attributes: ['id', 'name'],
              required: true
            }
          ]
        })
      );
    });

    test('debe retornar un solo municipio si el estado solo tiene uno', async() => {
      const mockMunicipality = [
        {
          id: 1,
          name: 'Municipio Unico',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: {
            id: 1,
            name: 'Estado Pequeño'
          }
        }
      ];

      municipalities.findAll.mockResolvedValue(mockMunicipality);

      const result = await getMunicipalitiesByStateId(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Municipio Unico');
    });

    test('debe manejar state_id tipo string', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId('10');

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            state_id: '10'
          }
        })
      );
    });

    test('debe retornar municipios con estructura completa de datos', async() => {
      const mockMunicipalities = [
        {
          id: 10,
          name: 'Monterrey',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-02-20T15:45:00.000Z',
          estado: {
            id: 19,
            name: 'Nuevo León'
          }
        }
      ];

      municipalities.findAll.mockResolvedValue(mockMunicipalities);

      const result = await getMunicipalitiesByStateId(19);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('created_at');
      expect(result[0]).toHaveProperty('updated_at');
      expect(result[0]).toHaveProperty('estado');
      expect(result[0].estado).toHaveProperty('id');
      expect(result[0].estado).toHaveProperty('name');
    });
  });

  // ============================================
  // Tests para getMunicipality
  // ============================================
  describe('getMunicipality', () => {
    test('debe retornar un municipio por id con estado incluido', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'Guadalajara',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: {
          id: 14,
          name: 'Jalisco'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(1);

      expect(municipalities.findOne).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        where: {
          id: 1
        },
        include: [
          {
            model: states,
            as: 'estado',
            attributes: ['id', 'name'],
            required: true
          }
        ]
      });
      expect(municipalities.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMunicipality);
    });

    test('debe retornar null si el municipio no existe', async() => {
      municipalities.findOne.mockResolvedValue(null);

      const result = await getMunicipality(999);

      expect(municipalities.findOne).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        where: {
          id: 999
        },
        include: [
          {
            model: states,
            as: 'estado',
            attributes: ['id', 'name'],
            required: true
          }
        ]
      });
      expect(result).toBeNull();
    });

    test('debe llamar findOne con el id correcto', async() => {
      municipalities.findOne.mockResolvedValue(null);

      await getMunicipality(42);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 42
          }
        })
      );
    });

    test('debe incluir solo los atributos especificados del municipio', async() => {
      municipalities.findOne.mockResolvedValue(null);

      await getMunicipality(1);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: ['id', 'name', 'created_at', 'updated_at']
        })
      );
    });

    test('debe incluir la relacion estado con sus atributos', async() => {
      municipalities.findOne.mockResolvedValue(null);

      await getMunicipality(1);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: states,
              as: 'estado',
              attributes: ['id', 'name'],
              required: true
            }
          ]
        })
      );
    });

    test('debe retornar municipio con estructura completa de datos', async() => {
      const mockMunicipality = {
        id: 5,
        name: 'León',
        created_at: '2024-01-10T08:00:00.000Z',
        updated_at: '2024-01-10T08:00:00.000Z',
        estado: {
          id: 11,
          name: 'Guanajuato'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(5);

      expect(result).toHaveProperty('id', 5);
      expect(result).toHaveProperty('name', 'León');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
      expect(result).toHaveProperty('estado');
      expect(result.estado).toHaveProperty('id', 11);
      expect(result.estado).toHaveProperty('name', 'Guanajuato');
    });

    test('debe manejar id tipo string numerico', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'Municipio Test',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: {
          id: 1,
          name: 'Estado Test'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      await getMunicipality('1');

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: '1'
          }
        })
      );
    });

    test('debe retornar municipio sin estado si la relacion no existe', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'Municipio Sin Estado',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: null
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(1);

      expect(result.estado).toBeNull();
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getMunicipalitiesByStateId debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      municipalities.findAll.mockRejectedValue(dbError);

      await expect(getMunicipalitiesByStateId(1)).rejects.toThrow('Database connection failed');
    });

    test('getMunicipality debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      municipalities.findOne.mockRejectedValue(dbError);

      await expect(getMunicipality(1)).rejects.toThrow('Database query failed');
    });

    test('getMunicipalitiesByStateId debe propagar error de relacion', async() => {
      const relationError = new Error('Association estado not found');
      municipalities.findAll.mockRejectedValue(relationError);

      await expect(getMunicipalitiesByStateId(1)).rejects.toThrow('Association estado not found');
    });

    test('getMunicipality debe propagar error de relacion', async() => {
      const relationError = new Error('Association estado not found');
      municipalities.findOne.mockRejectedValue(relationError);

      await expect(getMunicipality(1)).rejects.toThrow('Association estado not found');
    });

    test('getMunicipalitiesByStateId debe propagar error de timeout', async() => {
      const timeoutError = new Error('Query timeout exceeded');
      municipalities.findAll.mockRejectedValue(timeoutError);

      await expect(getMunicipalitiesByStateId(1)).rejects.toThrow('Query timeout exceeded');
    });

    test('getMunicipality debe propagar error de timeout', async() => {
      const timeoutError = new Error('Query timeout exceeded');
      municipalities.findOne.mockRejectedValue(timeoutError);

      await expect(getMunicipality(1)).rejects.toThrow('Query timeout exceeded');
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getMunicipalitiesByStateId con id 0', async() => {
      municipalities.findAll.mockResolvedValue([]);

      const result = await getMunicipalitiesByStateId(0);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            state_id: 0
          }
        })
      );
      expect(result).toEqual([]);
    });

    test('getMunicipality con id 0', async() => {
      municipalities.findOne.mockResolvedValue(null);

      const result = await getMunicipality(0);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 0
          }
        })
      );
      expect(result).toBeNull();
    });

    test('getMunicipalitiesByStateId con id negativo', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId(-1);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            state_id: -1
          }
        })
      );
    });

    test('getMunicipality con id negativo', async() => {
      municipalities.findOne.mockResolvedValue(null);

      await getMunicipality(-1);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: -1
          }
        })
      );
    });

    test('getMunicipalitiesByStateId con muchos municipios', async() => {
      const manyMunicipalities = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Municipio ${i + 1}`,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: {
          id: 1,
          name: 'Estado Grande'
        }
      }));

      municipalities.findAll.mockResolvedValue(manyMunicipalities);

      const result = await getMunicipalitiesByStateId(1);

      expect(result).toHaveLength(100);
      expect(result[0].name).toBe('Municipio 1');
      expect(result[99].name).toBe('Municipio 100');
    });

    test('getMunicipality con nombre especial (caracteres especiales)', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'San José de García',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: {
          id: 1,
          name: 'México'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(1);

      expect(result.name).toBe('San José de García');
      expect(result.estado.name).toBe('México');
    });

    test('getMunicipality con timestamps diferentes', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'Municipio Actualizado',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-06-15T10:30:45.000Z',
        estado: {
          id: 1,
          name: 'Estado'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(1);

      expect(result.created_at).not.toBe(result.updated_at);
      expect(new Date(result.updated_at).getTime()).toBeGreaterThan(new Date(result.created_at).getTime());
    });

    test('getMunicipalitiesByStateId preserva orden de resultados de BD', async() => {
      const orderedMunicipalities = [
        {
          id: 3,
          name: 'C Municipio',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: { id: 1, name: 'Estado' }
        },
        {
          id: 1,
          name: 'A Municipio',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: { id: 1, name: 'Estado' }
        },
        {
          id: 2,
          name: 'B Municipio',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: { id: 1, name: 'Estado' }
        }
      ];

      municipalities.findAll.mockResolvedValue(orderedMunicipalities);

      const result = await getMunicipalitiesByStateId(1);

      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(1);
      expect(result[2].id).toBe(2);
    });
  });

  // ============================================
  // Tests de validacion de parametros
  // ============================================
  describe('Validacion de parametros', () => {
    test('getMunicipalitiesByStateId debe aceptar state_id numerico', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId(123);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            state_id: 123
          }
        })
      );
    });

    test('getMunicipality debe aceptar id numerico', async() => {
      municipalities.findOne.mockResolvedValue(null);

      await getMunicipality(456);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 456
          }
        })
      );
    });

    test('getMunicipalitiesByStateId debe pasar state_id exacto sin modificar', async() => {
      municipalities.findAll.mockResolvedValue([]);

      await getMunicipalitiesByStateId(99);

      expect(municipalities.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            state_id: 99
          }
        })
      );
    });

    test('getMunicipality debe pasar id exacto sin modificar', async() => {
      municipalities.findOne.mockResolvedValue(null);

      await getMunicipality(77);

      expect(municipalities.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 77
          }
        })
      );
    });
  });

  // ============================================
  // Tests de integracion de atributos
  // ============================================
  describe('Integracion de atributos y relaciones', () => {
    test('getMunicipalitiesByStateId no debe incluir atributos no especificados', async() => {
      const mockMunicipalities = [
        {
          id: 1,
          name: 'Municipio',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: {
            id: 1,
            name: 'Estado'
          }
        }
      ];

      municipalities.findAll.mockResolvedValue(mockMunicipalities);

      const result = await getMunicipalitiesByStateId(1);

      // Verificar que no incluye atributos como 'key', 'active', 'deleted_at'
      expect(result[0]).not.toHaveProperty('key');
      expect(result[0]).not.toHaveProperty('active');
      expect(result[0]).not.toHaveProperty('deleted_at');
    });

    test('getMunicipality no debe incluir atributos no especificados', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'Municipio',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: {
          id: 1,
          name: 'Estado'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(1);

      // Verificar que no incluye atributos como 'key', 'active', 'deleted_at'
      expect(result).not.toHaveProperty('key');
      expect(result).not.toHaveProperty('active');
      expect(result).not.toHaveProperty('deleted_at');
    });

    test('getMunicipalitiesByStateId debe incluir estado con solo id y name', async() => {
      const mockMunicipalities = [
        {
          id: 1,
          name: 'Municipio',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          estado: {
            id: 1,
            name: 'Estado'
          }
        }
      ];

      municipalities.findAll.mockResolvedValue(mockMunicipalities);

      const result = await getMunicipalitiesByStateId(1);

      expect(result[0].estado).toHaveProperty('id');
      expect(result[0].estado).toHaveProperty('name');
      expect(Object.keys(result[0].estado)).toHaveLength(2);
    });

    test('getMunicipality debe incluir estado con solo id y name', async() => {
      const mockMunicipality = {
        id: 1,
        name: 'Municipio',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        estado: {
          id: 1,
          name: 'Estado'
        }
      };

      municipalities.findOne.mockResolvedValue(mockMunicipality);

      const result = await getMunicipality(1);

      expect(result.estado).toHaveProperty('id');
      expect(result.estado).toHaveProperty('name');
      expect(Object.keys(result.estado)).toHaveLength(2);
    });
  });
});
