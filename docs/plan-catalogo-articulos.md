# Plan: Catálogo de Artículos (Muebles)

## Resumen
Sistema de catálogo de productos (muebles) preparado para compras, ventas y e-commerce, con inventario multi-sucursal y listas de precios.

---

## Estructura de Base de Datos

### Diagrama de Relaciones
```
product_categories (existente)
        │
        │ 1:N
        ▼
    products ─────────────────┬─────────────────┐
        │                     │                 │
        │ 1:N                 │ 1:N             │
        ▼                     ▼                 │
  product_stocks      product_prices            │
   (por sucursal)      (por lista)              │
        │                     │                 │
        ▼                     ▼                 │
    branches            price_lists             │
   (existente)                                  │
                                                │
                                                ▼
                                    [Módulo de Compras]
                                    - suppliers
                                    - purchase_orders
                                    - purchase_order_items
                                    (La relación producto-proveedor
                                     se establece en las compras)
```

### Decisión de Diseño: Proveedores

Los proveedores NO se vinculan directamente al catálogo de productos porque:
1. Un mismo mueble puede comprarse a diferentes proveedores
2. Los precios de compra varían según el proveedor y el momento
3. La relación producto-proveedor se establece naturalmente al registrar compras

**Conclusión**: Las tablas `suppliers` y `product_suppliers` se implementarán en el módulo de compras, no en el catálogo.

---

## Fases de Implementación

### Fase 1: CRUD de Productos ✅ COMPLETADA

**Archivos creados:**
- `src/database/migrations/20260123100000-create-products.js`
- `src/models/products.js`
- `src/services/products.js`
- `src/controllers/products.js`
- `src/validators/products.js`
- `src/constants/products.js`
- `src/routes/products.js`
- `src/tests/unit/products.service.test.js`

**Archivos modificados:**
- `src/models/productCategories.js` - Agregada relación `hasMany(products)`
- `src/constants/modules.js` - Agregado `PRODUCT` con privilegios
- `src/tests/helper/helperData.js` - Agregados datos de prueba

**Campos del modelo Product:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| sku | STRING(50) | Sí | Código único del producto |
| barcode | STRING(50) | No | Código de barras |
| name | STRING(200) | Sí | Nombre del producto |
| description | TEXT | No | Descripción detallada |
| short_description | STRING(500) | No | Descripción corta |
| category_id | INTEGER (FK) | No | Categoría del producto |
| unit_of_measure | ENUM | Sí | piece, kg, lt, mt, box |
| cost_price | DECIMAL(12,2) | No | Precio de costo referencial |
| base_price | DECIMAL(12,2) | Sí | Precio base de venta |
| weight | DECIMAL(10,3) | No | Peso del producto |
| dimensions | JSON | No | Dimensiones (largo, ancho, alto) |
| images | JSON | No | URLs de imágenes |
| is_active | BOOLEAN | Sí | Activo/Inactivo |
| is_featured | BOOLEAN | Sí | Destacado para e-commerce |
| seo_title | STRING(100) | No | Título SEO |
| seo_description | STRING(200) | No | Descripción SEO |
| seo_keywords | STRING(200) | No | Palabras clave SEO |

**Endpoints:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar todos los productos |
| GET | `/api/products/:id` | Obtener producto por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto (soft delete) |

---

### Fase 2: Inventario Multi-sucursal ✅ COMPLETADA

**Archivos creados:**
- `src/database/migrations/20260123200000-create-product-stocks.js`
- `src/models/productStocks.js`
- `src/services/productStocks.js`
- `src/controllers/productStocks.js`
- `src/validators/productStocks.js`
- `src/constants/productStocks.js`
- `src/routes/productStocks.js`
- `src/tests/unit/productStocks.service.test.js`

**Archivos modificados:**
- `src/models/products.js` - Agregada relación `hasMany(productStocks)`
- `src/models/branches.js` - Agregada relación `hasMany(productStocks)`
- `src/constants/modules.js` - Agregado `PRODUCT_STOCK` con privilegios
- `src/tests/helper/helperData.js` - Agregados datos de prueba

**Campos del modelo ProductStock:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| product_id | INTEGER (FK) | Sí | Producto |
| branch_id | INTEGER (FK) | Sí | Sucursal |
| quantity | DECIMAL(12,3) | No | Cantidad (soporta fraccionables) |
| min_stock | DECIMAL(12,3) | No | Stock mínimo para alerta |
| max_stock | DECIMAL(12,3) | No | Stock máximo |
| location | STRING(100) | No | Ubicación en almacén (ej: A-01-03) |
| last_count_date | DATE | No | Fecha del último conteo físico |

**Índices:**
- Único: `product_id + branch_id` (evita duplicados)
- Índices simples en `product_id`, `branch_id`, `quantity`

**Endpoints:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productStocks` | Listar todos los inventarios |
| GET | `/api/productStocks/:id` | Obtener inventario por ID |
| GET | `/api/productStocks/product/:product_id` | Inventario de un producto en todas las sucursales |
| GET | `/api/productStocks/branch/:branch_id` | Inventario de una sucursal |
| POST | `/api/productStocks` | Crear registro de inventario |
| PUT | `/api/productStocks/:id` | Actualizar inventario |
| DELETE | `/api/productStocks/:id` | Eliminar inventario (soft delete) |

---

### Fase 3: Listas de Precios (Pendiente)

**Modelo: PriceLists**
```
- id, name, description
- discount_percent (descuento % sobre base_price)
- is_active, priority
- timestamps + soft delete
```

**Modelo: ProductPrices**
```
- id, product_id (FK), price_list_id (FK)
- price (DECIMAL 12,2)
- min_quantity (para precios escalonados)
- timestamps + soft delete
```

**Archivos a crear:**
- Migraciones para `price_lists` y `product_prices`
- Modelos, servicios, controladores, validadores y rutas

---

### Fase 4: Módulo de Compras (Pendiente - Separado del catálogo)

**Modelos:**
- `suppliers` - Catálogo de proveedores
- `purchase_orders` - Órdenes de compra
- `purchase_order_items` - Detalle de la orden (aquí se vincula producto-proveedor)

**Nota**: Este módulo se implementará por separado y establecerá la relación producto-proveedor de forma natural a través de las órdenes de compra.

---

## Verificación

### Tests
```bash
npm test
```
- Total: 424 tests pasando
- Tests de productos: 31 tests pasando

### Validaciones manuales
1. Ejecutar migraciones: `npx sequelize-cli db:migrate`
2. Crear producto vía API `POST /api/products`
3. Listar productos `GET /api/products`
4. Obtener producto con categoría `GET /api/products/:id`
5. Actualizar producto `PUT /api/products/:id`
6. Eliminar producto (soft delete) `DELETE /api/products/:id`
