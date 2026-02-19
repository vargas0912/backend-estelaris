const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Api config Info
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Documentacion de API\'s de Estelaris Mueblerias',
    version: '1.3.0'
  },
  servers: [
    {
      url: 'http://localhost:3000/api'
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
      users: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          role: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      privileges: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          codename: {
            type: 'string'
          },
          module: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      userPrivileges: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          user_id: {
            type: 'integer'
          },
          privilege_id: {
            type: 'integer'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      states: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
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
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      municipalities: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          key: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          state_id: {
            type: 'integer'
          },
          active: {
            type: 'boolean'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      branches: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          municipality_id: {
            type: 'integer'
          },
          phone: {
            type: 'string'
          },
          opening_date: {
            type: 'string',
            format: 'date'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      positions: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      employees: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          phone: {
            type: 'string'
          },
          position_id: {
            type: 'integer'
          },
          branch_id: {
            type: 'integer'
          },
          signature: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      customers: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          phone: {
            type: 'string'
          },
          mobile: {
            type: 'string'
          },
          tax_id: {
            type: 'string'
          },
          is_international: {
            type: 'boolean'
          },
          country: {
            type: 'string'
          },
          billing_address: {
            type: 'string'
          },
          municipality_id: {
            type: 'integer'
          },
          branch_id: {
            type: 'integer'
          },
          user_id: {
            type: 'integer'
          },
          notes: {
            type: 'string'
          },
          is_active: {
            type: 'boolean'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      customerAddresses: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          customer_id: {
            type: 'integer'
          },
          address_type: {
            type: 'string',
            enum: ['billing', 'shipping']
          },
          street: {
            type: 'string'
          },
          neighborhood: {
            type: 'string'
          },
          postal_code: {
            type: 'string'
          },
          country: {
            type: 'string'
          },
          municipality_id: {
            type: 'integer'
          },
          is_default: {
            type: 'boolean'
          },
          notes: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      productCategories: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      products: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          sku: {
            type: 'string'
          },
          barcode: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          short_description: {
            type: 'string'
          },
          category_id: {
            type: 'integer'
          },
          unit_of_measure: {
            type: 'string',
            enum: ['piece', 'kg', 'lt', 'mt', 'box']
          },
          cost_price: {
            type: 'number',
            format: 'decimal'
          },
          base_price: {
            type: 'number',
            format: 'decimal'
          },
          weight: {
            type: 'number',
            format: 'decimal'
          },
          dimensions: {
            type: 'object'
          },
          images: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          is_active: {
            type: 'boolean'
          },
          is_featured: {
            type: 'boolean'
          },
          seo_title: {
            type: 'string'
          },
          seo_description: {
            type: 'string'
          },
          seo_keywords: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      productStocks: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          product_id: {
            type: 'integer'
          },
          branch_id: {
            type: 'integer'
          },
          quantity: {
            type: 'number',
            format: 'decimal'
          },
          min_stock: {
            type: 'number',
            format: 'decimal'
          },
          max_stock: {
            type: 'number',
            format: 'decimal'
          },
          location: {
            type: 'string'
          },
          last_count_date: {
            type: 'string',
            format: 'date-time'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      priceLists: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          discount_percent: {
            type: 'number',
            format: 'decimal'
          },
          is_active: {
            type: 'boolean'
          },
          priority: {
            type: 'integer'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      productPrices: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          product_id: {
            type: 'integer'
          },
          price_list_id: {
            type: 'integer'
          },
          price: {
            type: 'number',
            format: 'decimal'
          },
          min_quantity: {
            type: 'number',
            format: 'decimal'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      suppliers: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          trade_name: {
            type: 'string'
          },
          tax_id: {
            type: 'string'
          },
          contact_name: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          phone: {
            type: 'string'
          },
          mobile: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          municipality_id: {
            type: 'integer'
          },
          postal_code: {
            type: 'string'
          },
          website: {
            type: 'string'
          },
          payment_terms: {
            type: 'string'
          },
          credit_limit: {
            type: 'number',
            format: 'decimal'
          },
          notes: {
            type: 'string'
          },
          is_active: {
            type: 'boolean'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      campaigns: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          start_date: {
            type: 'string',
            format: 'date-time'
          },
          end_date: {
            type: 'string',
            format: 'date-time'
          },
          is_active: {
            type: 'boolean'
          },
          priority: {
            type: 'integer'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      campaignProducts: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          campaign_id: {
            type: 'integer'
          },
          product_id: {
            type: 'integer'
          },
          discount_type: {
            type: 'string',
            enum: ['percentage', 'fixed_price']
          },
          discount_value: {
            type: 'number',
            format: 'decimal'
          },
          max_quantity: {
            type: 'integer'
          },
          sold_quantity: {
            type: 'integer'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      campaignBranches: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          campaign_id: {
            type: 'integer'
          },
          branch_id: {
            type: 'integer'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      campaignProductBranches: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          campaign_product_id: {
            type: 'integer'
          },
          branch_id: {
            type: 'integer'
          },
          discount_value_override: {
            type: 'number',
            format: 'decimal'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
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
