const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Api config Info
 */
const swaggerDefinition = {
  openapi: '3.1.0',
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
      },
      branchHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Branch-ID',
        description: 'ID de la sucursal activa. Requerido en endpoints transaccionales (inventarios, empleados) para usuarios no superadmin.'
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
      tokenRefresh: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Nuevo token JWT válido por 2 horas'
          },
          expires_at: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora de expiración del nuevo token (ISO 8601)'
          }
        }
      },
      changePassword: {
        type: 'object',
        required: ['current_password', 'new_password', 'confirm_password'],
        properties: {
          current_password: {
            type: 'string',
            format: 'password',
            description: 'Contraseña actual del usuario'
          },
          new_password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            maxLength: 50,
            description: 'Nueva contraseña (mín. 8 caracteres, debe incluir mayúscula, minúscula y número)'
          },
          confirm_password: {
            type: 'string',
            format: 'password',
            description: 'Confirmación de la nueva contraseña (debe coincidir con new_password)'
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
          ticket_prefix: {
            type: 'string',
            maxLength: 5,
            nullable: true,
            description: 'Prefijo corto para el ticket de venta (ej. MTY, GDL). Si no se configura, se usa el id de la sucursal con padding (001).'
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
          user_id: {
            type: 'integer',
            nullable: true,
            description: 'ID del usuario de sistema vinculado. NULL si el empleado no tiene acceso.'
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
      grantEmployeeAccessRequest: {
        type: 'object',
        required: ['email', 'password', 'privileges'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email del usuario a crear. Debe ser único en el sistema.'
          },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Contraseña del usuario. Mínimo 8 caracteres.'
          },
          privileges: {
            type: 'array',
            minItems: 1,
            items: { type: 'string' },
            description: 'Codenames de privileges a asignar.',
            example: ['view_driver_deliveries', 'update_driver_delivery']
          }
        }
      },
      grantEmployeeAccessResponse: {
        type: 'object',
        description: 'Resultado de habilitar acceso a un empleado',
        properties: {
          employee: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              user_id: { type: 'integer', description: 'ID del user recién creado y vinculado' }
            }
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', example: 'user' }
            }
          },
          privileges: {
            type: 'array',
            items: { type: 'string' },
            description: 'Codenames de los privileges asignados',
            example: ['view_driver_deliveries', 'update_driver_delivery']
          }
        }
      },
      pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total de registros que coinciden con el filtro'
          },
          page: {
            type: 'integer',
            description: 'Página actual'
          },
          limit: {
            type: 'integer',
            description: 'Registros por página'
          },
          totalPages: {
            type: 'integer',
            description: 'Total de páginas disponibles'
          }
        }
      },
      customersPaginated: {
        type: 'object',
        properties: {
          customers: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/customers'
            }
          },
          pagination: {
            $ref: '#/components/schemas/pagination'
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
            type: 'string',
            maxLength: 20,
            description: 'Identificador único del producto (código SKU)'
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
          credit_price: {
            type: 'number',
            format: 'decimal',
            description: 'Precio para ventas a crédito'
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
            type: 'string',
            maxLength: 20
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
            type: 'string',
            maxLength: 20
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
          payment_days: {
            type: 'integer',
            description: 'Días de plazo de pago para calcular due_date automáticamente en compras a crédito'
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
            type: 'string',
            maxLength: 20
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
      userBranches: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          user_id: {
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
      purchases: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          supplier_id: { type: 'integer' },
          branch_id: { type: 'integer' },
          user_id: { type: 'integer' },
          purch_date: { type: 'string', format: 'date' },
          invoice_number: { type: 'string' },
          purch_type: { type: 'string', enum: ['Contado', 'Credito'] },
          payment_method: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta'] },
          status: { type: 'string', enum: ['Pendiente', 'Pagado', 'Cancelado'] },
          subtotal: { type: 'number', format: 'decimal' },
          discount_amount: { type: 'number', format: 'decimal' },
          tax_amount: { type: 'number', format: 'decimal' },
          purch_total: { type: 'number', format: 'decimal' },
          due_payment: { type: 'number', format: 'decimal' },
          due_date: { type: 'string', format: 'date', description: 'Calculado automáticamente desde payment_days del proveedor cuando purch_type es Credito' },
          notes: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            description: 'Líneas de detalle de la compra',
            items: { $ref: '#/components/schemas/purchaseDetails' }
          }
        }
      },
      purchaseDetails: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          purch_id: { type: 'integer' },
          product_id: { type: 'string', maxLength: 20 },
          qty: { type: 'number', format: 'decimal' },
          unit_price: { type: 'number', format: 'decimal' },
          discount: { type: 'number', format: 'decimal' },
          tax_rate: { type: 'number', format: 'decimal' },
          subtotal: { type: 'number', format: 'decimal' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      generateByProductResult: {
        type: 'object',
        description: 'Resultado de la generación masiva de precios para un producto',
        properties: {
          product_id: {
            type: 'string',
            maxLength: 20,
            description: 'ID del producto procesado'
          },
          created: {
            type: 'integer',
            description: 'Cantidad de registros insertados en esta ejecución'
          },
          price_lists_processed: {
            type: 'integer',
            description: 'Cantidad de listas de precios activas procesadas'
          }
        }
      },
      generateByPriceListResult: {
        type: 'object',
        description: 'Resultado de la generación masiva de precios para una lista de precios',
        properties: {
          price_list_id: {
            type: 'integer',
            description: 'ID de la lista de precios procesada'
          },
          created: {
            type: 'integer',
            description: 'Cantidad de registros insertados en esta ejecución'
          },
          products_processed: {
            type: 'integer',
            description: 'Cantidad de productos activos procesados'
          }
        }
      },
      generateAllResult: {
        type: 'object',
        description: 'Resultado de la generación masiva de precios completa (cross-join)',
        properties: {
          created: {
            type: 'integer',
            description: 'Cantidad de registros insertados en esta ejecución'
          },
          products_processed: {
            type: 'integer',
            description: 'Cantidad de productos activos procesados'
          },
          price_lists_processed: {
            type: 'integer',
            description: 'Cantidad de listas de precios activas procesadas'
          }
        }
      },
      purchasePayments: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          purch_id: { type: 'integer' },
          payment_amount: { type: 'number', format: 'decimal' },
          payment_date: { type: 'string', format: 'date' },
          payment_method: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta'] },
          reference_number: { type: 'string', maxLength: 100 },
          user_id: { type: 'integer' },
          notes: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      stockMovements: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          product_id: { type: 'string', maxLength: 20 },
          branch_id: { type: 'integer' },
          reference_type: {
            type: 'string',
            enum: ['purchase', 'sale', 'adjustment', 'reversal', 'transfer'],
            description: 'Tipo de operación que originó el movimiento'
          },
          reference_id: { type: 'integer', description: 'ID del documento origen (compra, transferencia, etc.)' },
          qty_change: {
            type: 'number',
            format: 'decimal',
            description: 'Positivo para entradas, negativo para salidas'
          },
          notes: { type: 'string' },
          created_by: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      transfers: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          from_branch_id: { type: 'integer', description: 'Sucursal origen' },
          to_branch_id: { type: 'integer', description: 'Sucursal destino' },
          transfer_date: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: ['Borrador', 'En_Transito', 'Recibido', 'Cancelado'],
            description: 'Borrador → En_Transito (dispatch) → Recibido (receive). Cancelable desde Borrador o En_Transito.'
          },
          user_id: { type: 'integer', description: 'Usuario que crea/despacha' },
          received_by: { type: 'integer', nullable: true, description: 'Usuario que confirma recepción' },
          driver_id: { type: 'integer', nullable: true, description: 'Empleado conductor' },
          transport_plate: { type: 'string', maxLength: 20, nullable: true },
          notes: { type: 'string', nullable: true },
          received_at: { type: 'string', format: 'date', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            description: 'Líneas de detalle de la transferencia',
            items: { $ref: '#/components/schemas/transferDetails' }
          }
        }
      },
      transferDetails: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          transfer_id: { type: 'integer' },
          product_id: { type: 'string', maxLength: 20 },
          qty: { type: 'number', format: 'decimal', description: 'Cantidad enviada' },
          qty_received: { type: 'number', format: 'decimal', nullable: true, description: 'Cantidad confirmada en destino' },
          unit_cost: { type: 'number', format: 'decimal', description: 'Costo unitario al momento del envío' },
          purch_id: { type: 'integer', nullable: true, description: 'Compra de origen para trazabilidad' },
          notes: { type: 'string', nullable: true, description: 'Observaciones de discrepancia' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      sales: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          branch_id: { type: 'integer' },
          customer_id: { type: 'integer' },
          customer_address_id: { type: 'integer' },
          employee_id: { type: 'integer' },
          user_id: { type: 'integer' },
          price_list_id: { type: 'integer', nullable: true },
          sales_date: { type: 'string', format: 'date' },
          sales_type: { type: 'string', enum: ['Contado', 'Credito'] },
          payment_periods: { type: 'string', enum: ['Semanal', 'Quincenal', 'Mensual'], nullable: true, description: 'Solo para ventas a crédito' },
          total_days_term: { type: 'integer', nullable: true, description: 'Plazo total en días (solo crédito)' },
          ticket: { type: 'string', maxLength: 20, nullable: true, readOnly: true, description: 'Folio de ticket auto-generado. Formato: {PREFIX}-{YY}-{NNNNNN} (ej. MTY-26-000042). Solo lectura.' },
          invoice: { type: 'string', maxLength: 50, nullable: true, description: 'Número de factura fiscal (SAT). Se asigna manualmente en la facturación.' },
          subtotal: { type: 'number', format: 'decimal' },
          discount_amount: { type: 'number', format: 'decimal' },
          anticipo_amount: { type: 'number', format: 'decimal', description: 'Pago inicial registrado al crear la venta a crédito. Resta del saldo financiado.' },
          points_redeemed: { type: 'number', format: 'decimal', default: 0, description: 'Puntos canjeados al crear la venta.' },
          points_discount: { type: 'number', format: 'decimal', default: 0, description: 'Valor monetario de los puntos canjeados ($MXN). Reduce el due_payment.' },
          points_earned: { type: 'number', format: 'decimal', default: 0, description: 'Puntos acreditados al cliente por esta venta.' },
          tax_amount: { type: 'number', format: 'decimal' },
          sales_total: { type: 'number', format: 'decimal' },
          due_payment: { type: 'number', format: 'decimal', description: 'Contado=0. Crédito=(sales_total - anticipo_amount) inicialmente.' },
          due_date: { type: 'string', format: 'date', nullable: true, description: 'sales_date + total_days_term (solo crédito)' },
          status: { type: 'string', enum: ['Pendiente', 'Pagado', 'Cancelado'] },
          delivery_status: { type: 'string', enum: ['Entregado', 'Pendiente'], default: 'Pendiente', description: 'Entregado=cliente retira en tienda, Pendiente=requiere envío posterior (saleDeliveries)' },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            description: 'Líneas de detalle de la venta',
            items: { $ref: '#/components/schemas/saleDetails' }
          },
          installments: {
            type: 'array',
            description: 'Cuotas generadas (solo ventas a crédito)',
            items: { $ref: '#/components/schemas/saleInstallments' }
          }
        }
      },
      saleDetails: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          sale_id: { type: 'integer' },
          product_id: { type: 'string', maxLength: 20 },
          qty: { type: 'number', format: 'decimal' },
          unit_price: { type: 'number', format: 'decimal' },
          discount: { type: 'number', format: 'decimal', description: 'Porcentaje de descuento por línea' },
          tax_rate: { type: 'number', format: 'decimal', description: 'Tasa de IVA (default 16)' },
          subtotal: { type: 'number', format: 'decimal' },
          purch_id: { type: 'integer', nullable: true, description: 'Trazabilidad al lote de compra' },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      salePayments: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          sale_id: { type: 'integer' },
          payment_amount: { type: 'number', format: 'decimal' },
          payment_date: { type: 'string', format: 'date' },
          payment_method: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta'] },
          reference_number: { type: 'string', maxLength: 100, nullable: true },
          user_id: { type: 'integer' },
          branch_id: { type: 'integer' },
          notes: { type: 'string', nullable: true },
          payment_type: {
            type: 'string',
            enum: ['Anticipo', 'Abono'],
            description: 'Asignado automáticamente por el backend. Anticipo: pago inicial al crear la venta. Abono: pago posterior al saldo pendiente.'
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      saleInstallments: {
        type: 'object',
        description: 'Cuotas generadas automáticamente para ventas a crédito',
        properties: {
          id: { type: 'integer' },
          sale_id: { type: 'integer' },
          installment_number: { type: 'integer', description: 'Número secuencial de la cuota (1, 2, 3...)' },
          due_date: { type: 'string', format: 'date' },
          amount: { type: 'number', format: 'decimal', description: 'Monto esperado de la cuota' },
          paid_amount: { type: 'number', format: 'decimal', description: 'Monto acumulado pagado de esta cuota' },
          status: { type: 'string', enum: ['Pendiente', 'Pagado'] },
          paid_date: { type: 'string', format: 'date', nullable: true, description: 'Fecha en que se completó el pago' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      saleDeliveries: {
        type: 'object',
        description: 'Seguimiento de entrega con máquina de estados tipo DHL',
        properties: {
          id: { type: 'integer' },
          sale_id: { type: 'integer' },
          customer_address_id: { type: 'integer' },
          status: {
            type: 'string',
            enum: ['Preparando', 'Recolectado', 'En_Transito', 'En_Ruta_Entrega', 'Entregado', 'Devuelto'],
            description: 'Preparando → Recolectado → En_Transito → En_Ruta_Entrega → Entregado. Devuelto desde cualquier estado no-final.'
          },
          driver_id: { type: 'integer', nullable: true },
          transport_plate: { type: 'string', maxLength: 20, nullable: true },
          estimated_date: { type: 'string', format: 'date', nullable: true },
          delivered_at: { type: 'string', format: 'date', nullable: true },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      saleDeliveryLogs: {
        type: 'object',
        description: 'Historial inmutable de cambios de estado de entregas (audit trail)',
        properties: {
          id: { type: 'integer' },
          delivery_id: { type: 'integer' },
          status: { type: 'string', enum: ['Preparando', 'Recolectado', 'En_Transito', 'En_Ruta_Entrega', 'Entregado', 'Devuelto'] },
          location: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          created_by: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      deliveryTransition: {
        type: 'object',
        description: 'Body para transiciones de estado de entrega',
        properties: {
          location: { type: 'string', description: 'Ubicación actual (ej: Almacén central, En ruta km 45)' },
          notes: { type: 'string', description: 'Observaciones de la transición' }
        }
      },
      companyInfo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          company_name: { type: 'string', maxLength: 150 },
          trade_name: { type: 'string', maxLength: 150, nullable: true },
          rfc: { type: 'string', minLength: 12, maxLength: 13 },
          fiscal_regime: { type: 'string', maxLength: 100 },
          fiscal_address: { type: 'string' },
          zip_code: { type: 'string', maxLength: 10 },
          fiscal_email: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', maxLength: 20, nullable: true },
          logo_url: { type: 'string', format: 'uri', nullable: true },
          website: { type: 'string', format: 'uri', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      systemSettings: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          category: { type: 'string', maxLength: 50, description: 'Agrupación lógica (ej: formats, inventory)' },
          key: { type: 'string', maxLength: 100, description: 'Clave única de la configuración' },
          value: { type: 'string', description: 'Valor almacenado como texto' },
          label: { type: 'string', maxLength: 150, description: 'Etiqueta legible para el frontend' },
          description: { type: 'string', nullable: true },
          data_type: {
            type: 'string',
            enum: ['string', 'integer', 'decimal', 'boolean'],
            description: 'Tipo de dato para que el frontend haga el cast correcto'
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
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
      dashboardKpis: {
        type: 'object',
        description: 'KPIs generales de ventas calculados sobre todas las sucursales',
        properties: {
          ventas_saldadas: { type: 'integer', description: 'Cantidad de ventas con status Pagado' },
          ventas_pendientes: { type: 'integer', description: 'Cantidad de ventas con status Pendiente' },
          ventas_canceladas: { type: 'integer', description: 'Cantidad de ventas con status Cancelado' },
          ingreso_total: { type: 'number', format: 'decimal', description: 'Suma de sales_total de ventas Pagadas' },
          cartera_pendiente: { type: 'number', format: 'decimal', description: 'Suma de due_payment de ventas Pendientes' },
          ventas_morosas: { type: 'integer', description: 'Ventas a crédito Pendientes con due_date < hoy' },
          monto_moroso: { type: 'number', format: 'decimal', description: 'Suma de due_payment de ventas morosas' },
          clientes_activos: { type: 'integer', description: 'Clientes con is_active = 1' }
        }
      },
      dashboardTrend: {
        type: 'object',
        description: 'Totales mensuales de ventas para el período solicitado',
        properties: {
          mes: { type: 'string', example: '2025-11', description: 'Mes en formato YYYY-MM' },
          ventas_nuevas: { type: 'integer', description: 'Ventas no canceladas creadas en el mes' },
          ventas_saldadas: { type: 'integer', description: 'Ventas con status Pagado en el mes' },
          ventas_canceladas: { type: 'integer', description: 'Ventas con status Cancelado en el mes' },
          ingreso_mensual: { type: 'number', format: 'decimal', description: 'Suma de sales_total de ventas Pagadas en el mes' }
        }
      },
      dashboardTopProduct: {
        type: 'object',
        description: 'Producto con mayor ingreso en el período solicitado',
        properties: {
          product_id: { type: 'string', maxLength: 20 },
          product_name: { type: 'string' },
          unidades_vendidas: { type: 'number', format: 'decimal', description: 'Suma de qty en sale_details' },
          ingreso_total: { type: 'number', format: 'decimal', description: 'Suma de subtotal en sale_details' },
          cantidad_ventas: { type: 'integer', description: 'Cantidad de ventas distintas donde aparece el producto' }
        }
      },
      dashboardSalesByBranch: {
        type: 'object',
        description: 'Sumatoria de ventas por sucursal en el período solicitado',
        properties: {
          branch_id: { type: 'integer', description: 'ID de la sucursal' },
          branch_name: { type: 'string', description: 'Nombre de la sucursal' },
          total_ventas: { type: 'integer', description: 'Cantidad de ventas no canceladas' },
          ingreso_total: { type: 'number', format: 'decimal', description: 'Suma de sales_total de ventas no canceladas' },
          ventas_saldadas: { type: 'integer', description: 'Cantidad de ventas con status Pagado' },
          ventas_pendientes: { type: 'integer', description: 'Cantidad de ventas con status Pendiente' },
          ventas_canceladas: { type: 'integer', description: 'Cantidad de ventas con status Cancelado' }
        }
      },
      dashboardRecentSale: {
        type: 'object',
        description: 'Venta reciente con datos clave para KPIs',
        properties: {
          id: { type: 'integer', description: 'ID de la venta' },
          sales_date: { type: 'string', format: 'date', example: '2026-03-25', description: 'Fecha de la venta' },
          branch_name: { type: 'string', description: 'Nombre de la sucursal donde se realizó la venta' },
          sales_total: { type: 'number', format: 'decimal', description: 'Monto total de la venta' },
          status: { type: 'string', enum: ['Pagado', 'Pendiente', 'Cancelado'], description: 'Estado de la venta' }
        }
      },
      expenseTypes: {
        type: 'object',
        description: 'Catálogo de tipos de gastos (caja chica, servicios, etc.)',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', description: 'Nombre del tipo de gasto' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      expenses: {
        type: 'object',
        description: 'Registro de gasto operativo de una sucursal',
        properties: {
          id: { type: 'integer' },
          branch_id: { type: 'integer', description: 'Sucursal donde se realizó el gasto' },
          user_id: { type: 'integer', description: 'Usuario que registró el gasto' },
          expense_type_id: { type: 'integer', description: 'Tipo de gasto (FK a expense_types)' },
          trans_date: { type: 'string', format: 'date', description: 'Fecha de la transacción del gasto' },
          expense_amount: { type: 'number', format: 'decimal', description: 'Importe del gasto' },
          notes: { type: 'string', nullable: true, description: 'Observaciones adicionales' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      accountingAccounts: {
        type: 'object',
        description: 'Cuenta del catálogo contable (Plan de Cuentas)',
        properties: {
          id: { type: 'integer' },
          code: { type: 'string', maxLength: 20, description: 'Código único de la cuenta (ej: 111, 210.01)' },
          name: { type: 'string', maxLength: 120, description: 'Nombre de la cuenta' },
          type: {
            type: 'string',
            enum: ['activo', 'pasivo', 'capital', 'ingreso', 'egreso', 'costo'],
            description: 'Tipo contable de la cuenta'
          },
          nature: {
            type: 'string',
            enum: ['deudora', 'acreedora'],
            description: 'Naturaleza de la cuenta. Activo/costo/egreso → deudora; pasivo/capital/ingreso → acreedora'
          },
          level: { type: 'integer', minimum: 1, maximum: 3, description: '1=grupo, 2=subcuenta, 3=cuenta detalle' },
          parent_id: { type: 'integer', nullable: true, description: 'ID de la cuenta padre (árbol jerárquico)' },
          allows_movements: { type: 'boolean', description: 'Solo cuentas nivel 3 aceptan cargos/abonos en pólizas' },
          is_system: { type: 'boolean', description: 'Cuenta del catálogo SAT, no puede eliminarse' },
          active: { type: 'boolean', description: 'Estado activo/inactivo de la cuenta' },
          parent: {
            nullable: true,
            description: 'Cuenta padre (solo en GET individual y lista)',
            type: 'object',
            properties: {
              id: { type: 'integer' },
              code: { type: 'string' },
              name: { type: 'string' }
            }
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      accountingPeriods: {
        type: 'object',
        description: 'Período contable mensual',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', maxLength: 50, example: 'Enero 2026' },
          year: { type: 'integer', example: 2026 },
          month: { type: 'integer', minimum: 1, maximum: 12, example: 1 },
          status: {
            type: 'string',
            enum: ['abierto', 'cerrado', 'bloqueado'],
            description: 'abierto: acepta pólizas | cerrado: solo lectura, reapertura posible | bloqueado: definitivo'
          },
          balance_snapshot: {
            type: 'object',
            nullable: true,
            description: 'Snapshot del balance al momento del cierre'
          },
          closed_at: { type: 'string', format: 'date-time', nullable: true },
          closed_by_user_id: { type: 'integer', nullable: true },
          closedBy: {
            nullable: true,
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      accountingVoucherLines: {
        type: 'object',
        description: 'Línea de cargo/abono de una póliza contable',
        properties: {
          id: { type: 'integer' },
          voucher_id: { type: 'integer' },
          account_id: { type: 'integer' },
          debit: { type: 'number', format: 'decimal', description: 'Cargo (debe)' },
          credit: { type: 'number', format: 'decimal', description: 'Abono (haber)' },
          description: { type: 'string', maxLength: 255, nullable: true },
          order: { type: 'integer', description: 'Orden de presentación dentro de la póliza' },
          account: {
            nullable: true,
            type: 'object',
            description: 'Cuenta contable asociada',
            properties: {
              id: { type: 'integer' },
              code: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string', enum: ['activo', 'pasivo', 'capital', 'ingreso', 'egreso', 'costo'] },
              nature: { type: 'string', enum: ['deudora', 'acreedora'] }
            }
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      accountingVouchers: {
        type: 'object',
        description: 'Póliza contable',
        properties: {
          id: { type: 'integer' },
          folio: { type: 'string', maxLength: 20, example: 'POL-2026-03-001', description: 'Folio generado automáticamente' },
          type: {
            type: 'string',
            enum: ['ingreso', 'egreso', 'diario', 'ajuste'],
            description: 'Tipo de póliza contable'
          },
          period_id: { type: 'integer' },
          branch_id: { type: 'integer', nullable: true },
          date: { type: 'string', format: 'date' },
          description: { type: 'string', maxLength: 255 },
          status: {
            type: 'string',
            enum: ['borrador', 'aplicada', 'cancelada'],
            description: 'borrador: editable | aplicada: definitiva | cancelada: anulada'
          },
          reference_type: { type: 'string', maxLength: 50, nullable: true, description: 'Tipo del documento origen (ej: purchase, sale)' },
          reference_id: { type: 'integer', nullable: true, description: 'ID del documento origen' },
          created_by_user_id: { type: 'integer' },
          applied_at: { type: 'string', format: 'date-time', nullable: true },
          period: {
            nullable: true,
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              year: { type: 'integer' },
              month: { type: 'integer' },
              status: { type: 'string' }
            }
          },
          branch: {
            nullable: true,
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            }
          },
          createdBy: {
            nullable: true,
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          },
          lines: {
            type: 'array',
            description: 'Líneas contables (solo en GET individual)',
            items: {
              $ref: '#/components/schemas/accountingVoucherLines'
            }
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          deleted_at: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      loyaltyConfig: {
        type: 'object',
        description: 'Configuración del programa de puntos de lealtad. Una fila por sucursal; branch_id=null es la config global.',
        properties: {
          id: { type: 'integer' },
          branch_id: { type: 'integer', nullable: true, description: 'null = configuración global (fallback para todas las sucursales)' },
          is_active: { type: 'boolean', default: true },
          points_per_peso: { type: 'number', format: 'decimal', default: 0.1, description: 'Puntos ganados por cada $1 gastado. Ej: 0.1 = 1 punto cada $10.' },
          earn_on_tax: { type: 'boolean', default: false, description: '¿Se acumulan puntos sobre el IVA?' },
          earn_on_discount: { type: 'boolean', default: false, description: '¿Se acumulan sobre el precio antes del descuento?' },
          earn_on_credit: { type: 'boolean', default: true, description: '¿Las ventas a crédito generan puntos?' },
          earn_on_credit_when: { type: 'string', enum: ['sale', 'paid'], default: 'paid', description: 'sale=al crear la venta | paid=al liquidar el saldo completo' },
          peso_per_point: { type: 'number', format: 'decimal', default: 0.10, description: 'Valor monetario de 1 punto al canjear ($MXN).' },
          min_points_redeem: { type: 'integer', default: 100, description: 'Mínimo de puntos requeridos para poder canjear.' },
          max_redeem_pct: { type: 'number', format: 'decimal', default: 20.00, description: 'Porcentaje máximo del total de la venta pagable con puntos.' },
          max_redeem_points: { type: 'integer', nullable: true, description: 'Límite absoluto de puntos canjeables por venta. null = sin límite.' },
          points_expiry_days: { type: 'integer', nullable: true, description: 'Días hasta que vencen los puntos acumulados. null = nunca vencen.' },
          rounding_strategy: { type: 'string', enum: ['floor', 'round', 'ceil'], default: 'floor', description: 'Estrategia de redondeo al calcular puntos fraccionarios.' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          deleted_at: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      customerPoints: {
        type: 'object',
        description: 'Saldo de puntos de lealtad de un cliente (una fila por cliente).',
        properties: {
          id: { type: 'integer' },
          customer_id: { type: 'integer' },
          total_points: { type: 'number', format: 'decimal', description: 'Saldo actual de puntos disponibles para canje.' },
          lifetime_points: { type: 'number', format: 'decimal', description: 'Total de puntos acumulados históricamente (nunca decrece por canje).' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      pointTransactions: {
        type: 'object',
        description: 'Bitácora inmutable de cada movimiento de puntos de un cliente.',
        properties: {
          id: { type: 'integer' },
          customer_id: { type: 'integer' },
          type: {
            type: 'string',
            enum: ['earn', 'redeem', 'expire', 'adjust', 'void'],
            description: 'earn=acumulación | redeem=canje | expire=vencimiento | adjust=ajuste manual | void=reversión'
          },
          points: { type: 'number', format: 'decimal', description: 'Positivo=ingreso de puntos, negativo=egreso.' },
          balance_after: { type: 'number', format: 'decimal', description: 'Saldo del cliente después de esta transacción.' },
          reference_type: { type: 'string', enum: ['sale', 'payment', 'admin', 'expiry'], description: 'Origen del movimiento.' },
          reference_id: { type: 'integer', nullable: true, description: 'ID del documento origen (sale_id, payment_id, etc.).' },
          expires_at: { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de vencimiento de los puntos ganados en esta tx (solo type=earn).' },
          user_id: { type: 'integer', description: 'Usuario que procesó el movimiento.' },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          deleted_at: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      accountsReceivableReport: {
        type: 'object',
        description: 'Reporte de cartera de créditos activos de una sucursal',
        properties: {
          credits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                saleId: { type: 'integer' },
                customerId: { type: 'integer' },
                customerName: { type: 'string' },
                salesDate: { type: 'string', format: 'date' },
                dueDate: { type: 'string', format: 'date', nullable: true },
                salesTotal: { type: 'number', format: 'decimal' },
                anticipoAmount: { type: 'number', format: 'decimal' },
                duePayment: { type: 'number', format: 'decimal' },
                paymentPeriod: { type: 'string', enum: ['Semanal', 'Quincenal', 'Mensual'], nullable: true },
                totalDaysTerm: { type: 'integer', nullable: true },
                creditStatus: { type: 'string', enum: ['vencido', 'atrasado', 'abonan_hoy', 'al_corriente'] },
                daysOverdue: { type: 'integer', description: '0 si no hay cuotas vencidas' },
                overdueAmount: { type: 'number', format: 'decimal', description: '0 si no aplica' },
                installments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      installmentNumber: { type: 'integer' },
                      dueDate: { type: 'string', format: 'date' },
                      amount: { type: 'number', format: 'decimal' },
                      paidAmount: { type: 'number', format: 'decimal' },
                      status: { type: 'string', enum: ['Pendiente', 'Pagado'] }
                    }
                  }
                },
                paymentsReceived: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      paymentDate: { type: 'string', format: 'date' },
                      amount: { type: 'number', format: 'decimal' },
                      method: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta'] }
                    }
                  }
                }
              }
            }
          },
          summary: {
            type: 'object',
            properties: {
              totalVencido: { type: 'number', format: 'decimal' },
              totalAtrasado: { type: 'number', format: 'decimal' },
              totalAlCorriente: { type: 'number', format: 'decimal' },
              totalAbonanHoy: { type: 'number', format: 'decimal' },
              countVencido: { type: 'integer' },
              countAtrasado: { type: 'integer' },
              countAlCorriente: { type: 'integer' },
              countAbonanHoy: { type: 'integer' }
            }
          }
        }
      },
      inventoryReportItem: {
        type: 'object',
        description: 'Fila del reporte de inventario por producto',
        properties: {
          productId: { type: 'string', maxLength: 20, description: 'Código SKU del producto' },
          productName: { type: 'string', description: 'Nombre del producto' },
          inicio: { type: 'number', format: 'decimal', description: 'Stock al inicio del periodo' },
          compro: { type: 'number', format: 'decimal', description: 'Entradas por compras en el periodo' },
          recibio: { type: 'number', format: 'decimal', description: 'Entradas por transferencias recibidas' },
          cancelo: { type: 'number', format: 'decimal', description: 'Reingresos por cancelaciones de venta' },
          envio: { type: 'number', format: 'decimal', description: 'Salidas por transferencias despachadas' },
          contado: { type: 'number', format: 'decimal', description: 'Unidades vendidas en ventas de contado' },
          credito: { type: 'number', format: 'decimal', description: 'Unidades vendidas en ventas a crédito' },
          existencia: { type: 'number', format: 'decimal', description: 'inicio + compro + recibio + cancelo - envio - contado - credito' },
          unitPrice: { type: 'number', format: 'decimal', description: 'Precio base unitario del producto' },
          importe: { type: 'number', format: 'decimal', description: 'unitPrice × existencia' }
        }
      },
      dailyMovementReport: {
        type: 'object',
        description: 'Reporte de movimiento diario de una sucursal',
        properties: {
          credits: {
            type: 'array',
            description: 'Una fila por ítem de venta a crédito del día (no canceladas)',
            items: {
              type: 'object',
              properties: {
                saleId: { type: 'integer' },
                productName: { type: 'string' },
                customerName: { type: 'string' },
                customerAddress: { type: 'string', nullable: true },
                unitPrice: { type: 'number', format: 'decimal' },
                anticipo: { type: 'number', format: 'decimal' },
                duePayment: { type: 'number', format: 'decimal' },
                paymentPeriod: { type: 'string', nullable: true, enum: ['Semanal', 'Quincenal', 'Mensual'] }
              }
            }
          },
          cash: {
            type: 'array',
            description: 'Una fila por ítem de venta de contado del día (no canceladas)',
            items: {
              type: 'object',
              properties: {
                saleId: { type: 'integer' },
                qty: { type: 'number', format: 'decimal' },
                productName: { type: 'string' },
                customerName: { type: 'string' },
                unitPrice: { type: 'number', format: 'decimal' },
                subtotal: { type: 'number', format: 'decimal' }
              }
            }
          },
          expenses: {
            type: 'array',
            description: 'Gastos registrados en el día',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                amount: { type: 'number', format: 'decimal' },
                concept: { type: 'string' },
                notes: { type: 'string', nullable: true }
              }
            }
          },
          payments: {
            type: 'array',
            description: 'Abonos recibidos en el día',
            items: {
              type: 'object',
              properties: {
                saleId: { type: 'integer' },
                customerName: { type: 'string' },
                paymentDate: { type: 'string', format: 'date' },
                amount: { type: 'number', format: 'decimal' },
                remainingDue: { type: 'number', format: 'decimal' }
              }
            }
          },
          transfersSent: {
            type: 'array',
            description: 'Transferencias enviadas desde esta sucursal (no canceladas)',
            items: {
              type: 'object',
              properties: {
                transferId: { type: 'integer' },
                toBranchName: { type: 'string' }
              }
            }
          },
          transfersReceived: {
            type: 'array',
            description: 'Transferencias recibidas en esta sucursal (status Recibido)',
            items: {
              type: 'object',
              properties: {
                transferId: { type: 'integer' },
                fromBranchName: { type: 'string' }
              }
            }
          },
          totals: {
            type: 'object',
            properties: {
              anticipos: { type: 'number', format: 'decimal', description: 'Suma de anticipo_amount de ventas a crédito' },
              cashSales: { type: 'number', format: 'decimal', description: 'Suma de subtotales de ítems de contado' },
              expenses: { type: 'number', format: 'decimal', description: 'Suma de gastos' },
              payments: { type: 'number', format: 'decimal', description: 'Suma de abonos recibidos' }
            }
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
    './src/routes/*.js',
    './src/routes/accounting/*.js'
  ]
};

const openApiConfiguration = swaggerJsdoc(options);

module.exports = openApiConfiguration;
