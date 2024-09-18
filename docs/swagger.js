const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Api config Info
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Documentacion de API\'s de Estelaris Mueblerias',
    version: '1.2.2'
  },
  servers: [
    {
      url: 'http://localhost:3001/api'
    },
    {
      url: 'https://apires-mega-production.up.railway.app/api'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    },
    schemas: {
      authLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },
          password: {
            type: 'string',
            format: 'password'
          }
        }
      },
      authRegister: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          name: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          password: {
            type: 'string',
            format: 'password'
          },
          role: {
            type: 'string'
          }
        }
      },
      product: {
        type: 'object',
        required: ['name', 'description', 'cantidad', 'provider', 'mediaId'],
        properties: {
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          cantidad: {
            type: 'number'
          },
          provider: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              contact: {
                type: 'string'
              },
              country: {
                type: 'string'
              }
            }
          },
          mediaId: {
            type: 'string'
          }
        }
      },
      users: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          role: {
            type: 'string'
          }
        }
      },
      storage: {
        type: 'object',
        properties: {
          url: {
            type: 'string'
          },
          filename: {
            type: 'string'
          }
        }
      },
      states: {
        type: 'object',
        properties: {
          key: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          abrev: {
            type: 'string'
          },
          active: {
            type: 'boolean'
          }
        }
      },
      municipalities: {
        type: 'object',
        properties: {
          stateId: {
            type: 'number'
          },
          key: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          active: {
            type: 'boolean'
          }
        }
      },
      branches: {
        type: 'object',
        properties: {
          description: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          municipality_id: {
            type: 'number'
          },
          phone: {
            type: 'string'
          },
          opening_date: {
            type: 'string',
            format: 'date'
          }
        }
      },
      positions: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          }
        }
      },
      employees: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          phone: {
            type: 'string'
          },
          positionId: {
            type: 'number'
          },
          branchId: {
            type: 'number'
          },
          siganture: {
            type: 'string'
          }
        }
      },
      customers: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          reference: {
            type: 'string'
          },
          phone: {
            type: 'string'
          },
          email: {
            type: 'string'
          },
          rfc: {
            type: 'string'
          },
          branchId: {
            type: 'number'
          },
          municipalityId: {
            type: 'number'
          }
        }
      },
      privileges: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          codeName: {
            type: 'string'
          },
          module: {
            type: 'string'
          }
        }
      },
      userPrivileges: {
        type: 'object',
        properties: {
          user_id: {
            type: 'number'
          },
          privilege_id: {
            type: 'number'
          }
        }
      },
      categories: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          }
        }
      }
    }
  }
};

/**
 * Options
 */
const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.js'
  ]
};

const openApiConfiguration = swaggerJsdoc(options);

module.exports = openApiConfiguration;
