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
          updated_at: { type: 'string', format: 'date-time' }
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
          updated_at: { type: 'string', format: 'date-time' }
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
          invoice: { type: 'string', maxLength: 50, nullable: true },
          subtotal: { type: 'number', format: 'decimal' },
          discount_amount: { type: 'number', format: 'decimal' },
          tax_amount: { type: 'number', format: 'decimal' },
          sales_total: { type: 'number', format: 'decimal' },
          due_payment: { type: 'number', format: 'decimal', description: 'Contado=0, Crédito=sales_total inicialmente' },
          due_date: { type: 'string', format: 'date', nullable: true, description: 'sales_date + total_days_term (solo crédito)' },
          status: { type: 'string', enum: ['Pendiente', 'Pagado', 'Cancelado'] },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
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
          notes: { type: 'string', nullable: true },
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
