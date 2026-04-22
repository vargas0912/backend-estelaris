# Spec: Paginación universal en endpoints de lista

**Versión API:** 1.5.0  
**Tipo de cambio:** BREAKING — todos los endpoints de lista cambian su shape de respuesta; nuevos endpoints soportan búsqueda por texto  
**Branch:** `feat/universal-pagination`

---

## Resumen

Todos los endpoints `GET` que devolvían un arreglo plano (o un objeto sin metadata) ahora devuelven un objeto con dos claves: el arreglo de datos y un objeto `pagination` con información de la página actual.

---

## Contrato de paginación

### Query params (todos opcionales)

| Param    | Tipo    | Default | Máximo | Descripción                                      |
|----------|---------|---------|--------|--------------------------------------------------|
| `page`   | integer | `1`     | —      | Número de página                                 |
| `limit`  | integer | `20`    | `100`  | Registros por página                             |
| `search` | string  | `""`    | —      | Texto para filtrar resultados (ver tabla abajo) |

> `search` solo está disponible en los endpoints marcados con ✔ en la columna **Búsqueda** de cada tabla.

### Shape de respuesta

```jsonc
{
  "<key>": [ ...items ],
  "pagination": {
    "total":      150,   // total de registros que coinciden con el filtro
    "page":       1,     // página actual
    "limit":      20,    // registros por página solicitados
    "totalPages": 8      // Math.ceil(total / limit)
  }
}
```

> `<key>` varía por endpoint — ver la tabla de endpoints más abajo.

### Ejemplo de petición

```http
GET /api/sales?page=2&limit=50
Authorization: Bearer <token>
```

### Ejemplo de respuesta

```json
{
  "sales": [ { "id": 51, ... }, { "id": 52, ... } ],
  "pagination": {
    "total": 320,
    "page": 2,
    "limit": 50,
    "totalPages": 7
  }
}
```

---

## Endpoints afectados

### Ventas

| Método | Ruta                           | Clave de datos | Búsqueda | Campo(s)      | Notas                         |
|--------|--------------------------------|----------------|----------|---------------|-------------------------------|
| GET    | `/api/sales`                   | `sales`        | ✔        | `ticket`      | Requiere header `X-Branch-ID` |
| GET    | `/api/sales/customer/:id`      | `sales`        | ✔        | `ticket`      |                               |
| GET    | `/api/sales/branch/:id`        | `sales`        | ✔        | `ticket`      |                               |
| GET    | `/api/sales/overdue`           | `sales`        | ✔        | `ticket`      |                               |

### Pagos de ventas

| Método | Ruta                           | Clave de datos | Búsqueda | Notas                         |
|--------|--------------------------------|----------------|----------|-------------------------------|
| GET    | `/api/sale-payments`           | `payments`     | —        | Requiere header `X-Branch-ID` |
| GET    | `/api/sale-payments/sale/:id`  | `payments`     | —        |                               |

### Compras

| Método | Ruta                           | Clave de datos | Búsqueda | Notas |
|--------|--------------------------------|----------------|----------|-------|
| GET    | `/api/purchases`               | `purchases`    | —        |       |
| GET    | `/api/purchases/supplier/:id`  | `purchases`    | —        |       |
| GET    | `/api/purchases/branch/:id`    | `purchases`    | —        |       |

### Pagos de compras

| Método | Ruta                                  | Clave de datos | Búsqueda | Notas |
|--------|---------------------------------------|----------------|----------|-------|
| GET    | `/api/purch-payments`                 | `payments`     | —        |       |
| GET    | `/api/purch-payments/purchase/:id`    | `payments`     | —        |       |

### Gastos

| Método | Ruta                           | Clave de datos | Búsqueda | Campo(s)          | Notas |
|--------|--------------------------------|----------------|----------|-------------------|-------|
| GET    | `/api/expenses`                | `expenses`     | ✔        | `expenseType.name`|       |
| GET    | `/api/expenses/branch/:id`     | `expenses`     | ✔        | `expenseType.name`|       |

### Transferencias

| Método | Ruta                                 | Clave de datos | Búsqueda | Notas |
|--------|--------------------------------------|----------------|----------|-------|
| GET    | `/api/transfers`                     | `transfers`    | —        |       |
| GET    | `/api/transfers/from-branch/:id`     | `transfers`    | —        |       |
| GET    | `/api/transfers/to-branch/:id`       | `transfers`    | —        |       |

### Pólizas contables

| Método | Ruta                           | Clave de datos | Búsqueda | Campo(s) | Notas |
|--------|--------------------------------|----------------|----------|----------|-------|
| GET    | `/api/accounting/vouchers`     | `vouchers`     | ✔        | `folio`  |       |

### Productos

| Método | Ruta                           | Clave de datos | Búsqueda | Campo(s)       | Notas |
|--------|--------------------------------|----------------|----------|----------------|-------|
| GET    | `/api/products`                | `products`     | ✔        | `id`, `name`   |       |

### Inventarios (stocks)

| Método | Ruta                              | Clave de datos | Búsqueda | Campo(s)                    | Notas                         |
|--------|-----------------------------------|----------------|----------|-----------------------------|-------------------------------|
| GET    | `/api/productStocks`              | `stocks`       | ✔        | `product.id`, `product.name`| Requiere header `X-Branch-ID` |
| GET    | `/api/productStocks/product/:id`  | `stocks`       | —        |                             |                               |
| GET    | `/api/productStocks/branch/:id`   | `stocks`       | ✔        | `product.id`, `product.name`|                               |

### Precios de productos

| Método | Ruta                                  | Clave de datos | Búsqueda | Notas |
|--------|---------------------------------------|----------------|----------|-------|
| GET    | `/api/productPrices`                  | `prices`       | —        |       |
| GET    | `/api/productPrices/product/:id`      | `prices`       | —        |       |
| GET    | `/api/productPrices/priceList/:id`    | `prices`       | —        |       |

### Empleados

| Método | Ruta                           | Clave de datos | Búsqueda | Campo(s) | Notas                         |
|--------|--------------------------------|----------------|----------|----------|-------------------------------|
| GET    | `/api/employees`               | `employees`    | ✔        | `name`   | Requiere header `X-Branch-ID` |
| GET    | `/api/employees/branch/:id`    | `employees`    | ✔        | `name`   |                               |

### Proveedores

| Método | Ruta                | Clave de datos | Búsqueda | Campo(s) | Notas |
|--------|---------------------|----------------|----------|----------|-------|
| GET    | `/api/suppliers`    | `suppliers`    | ✔        | `name`   |       |

### Usuarios

| Método | Ruta            | Clave de datos | Búsqueda | Campo(s) | Notas |
|--------|-----------------|----------------|----------|----------|-------|
| GET    | `/api/users`    | `users`        | ✔        | `name`   |       |

### Direcciones de clientes

| Método | Ruta                                    | Clave de datos | Búsqueda | Notas |
|--------|-----------------------------------------|----------------|----------|-------|
| GET    | `/api/customer-addresses`               | `addresses`    | —        |       |
| GET    | `/api/customer-addresses/customer/:id`  | `addresses`    | —        |       |

### Clientes

| Método | Ruta                                    | Clave de datos | Búsqueda | Campo(s) | Notas                         |
|--------|-----------------------------------------|----------------|----------|----------|-------------------------------|
| GET    | `/api/customers`                        | `customers`    | ✔        | `name`   | Ya tenía paginación           |
| GET    | `/api/customers/branch/:id`             | `customers`    | ✔        | `name`   |                               |
| GET    | `/api/customers/municipality/:id`       | `customers`    | ✔        | `name`   |                               |

### Campañas

| Método | Ruta                    | Clave de datos | Búsqueda | Notas               |
|--------|-------------------------|----------------|----------|---------------------|
| GET    | `/api/campaigns`        | `campaigns`    | —        | Antes era array plano |
| GET    | `/api/campaigns/active` | `campaigns`    | —        | Antes era array plano |

### Productos de campaña

| Método | Ruta                                 | Clave de datos      | Búsqueda | Notas |
|--------|--------------------------------------|---------------------|----------|-------|
| GET    | `/api/campaignProducts/campaign/:id` | `campaignProducts`  | —        |       |

### Sucursales

| Método | Ruta                    | Clave de datos | Búsqueda | Campo(s)        | Notas                       |
|--------|-------------------------|----------------|----------|-----------------|-----------------------------|
| GET    | `/api/branches`         | `branches`     | ✔        | `name`, `address`|                            |
| GET    | `/api/branches/public`  | `branches`     | ✔        | `name`, `address`| Sin autenticación requerida |

### Estados

| Método | Ruta            | Clave de datos | Búsqueda | Notas |
|--------|-----------------|----------------|----------|-------|
| GET    | `/api/states`   | `states`       | —        |       |

### Municipios

| Método | Ruta                              | Clave de datos    | Búsqueda | Notas |
|--------|-----------------------------------|-------------------|----------|-------|
| GET    | `/api/municipalities/state/:id`   | `municipalities`  | —        |       |

### Puestos

| Método | Ruta              | Clave de datos | Búsqueda | Campo(s) | Notas |
|--------|-------------------|----------------|----------|----------|-------|
| GET    | `/api/positions`  | `positions`    | ✔        | `name`   |       |

### Listas de precios

| Método | Ruta               | Clave de datos | Búsqueda | Notas                                   |
|--------|--------------------|----------------|----------|-----------------------------------------|
| GET    | `/api/priceLists`  | `priceLists`   | —        | Ordenadas por `priority DESC, name ASC` |

### Categorías de producto

| Método | Ruta                       | Clave de datos      | Búsqueda | Campo(s)           | Notas |
|--------|----------------------------|---------------------|----------|--------------------|-------|
| GET    | `/api/productCategories`   | `productCategories` | ✔        | `name`, `description`|     |

### Tipos de gasto

| Método | Ruta                   | Clave de datos | Búsqueda | Notas |
|--------|------------------------|----------------|----------|-------|
| GET    | `/api/expense-types`   | `expenseTypes` | —        |       |

### Privilegios

| Método | Ruta                              | Clave de datos | Búsqueda | Notas |
|--------|-----------------------------------|----------------|----------|-------|
| GET    | `/api/privileges`                 | `privileges`   | —        |       |
| GET    | `/api/privileges/module/:module`  | `privileges`   | —        |       |

### Configuración del sistema

| Método | Ruta                    | Clave de datos | Búsqueda | Notas                                        |
|--------|-------------------------|----------------|----------|----------------------------------------------|
| GET    | `/api/system-settings`  | `settings`     | —        | Query param adicional: `category` (opcional) |

### Cuentas contables

| Método | Ruta                        | Clave de datos | Búsqueda | Campo(s)       | Notas |
|--------|-----------------------------|----------------|----------|----------------|-------|
| GET    | `/api/accounting/accounts`  | `accounts`     | ✔        | `code`, `name` |       |

### Períodos contables

| Método | Ruta                        | Clave de datos | Búsqueda | Notas                               |
|--------|-----------------------------|----------------|----------|-------------------------------------|
| GET    | `/api/accounting/periods`   | `periods`      | —        | Ordenados por `year DESC, month DESC` |

### Puntos de lealtad (configs)

| Método | Ruta                          | Clave de datos | Búsqueda | Notas                                         |
|--------|-------------------------------|----------------|----------|-----------------------------------------------|
| GET    | `/api/loyaltyPoints/configs`  | `configs`      | —        | Query param adicional: `branch_id` (opcional) |

---

---

## Búsqueda por texto (`search`)

### Comportamiento

- Si `search` se omite o es cadena vacía, el endpoint devuelve todos los registros con la paginación normal.
- Si `search` tiene valor, se aplica un filtro `LIKE %valor%` (case-insensitive en MySQL) sobre los campos indicados en cada tabla.
- El parámetro se combina con la paginación: el `total` y `totalPages` reflejan el universo filtrado.
- Algunos recursos buscan en un campo de un modelo relacionado (ej. gastos busca por nombre del tipo de gasto, inventario busca por código/nombre del producto). En esos casos, el join se convierte en INNER JOIN y solo devuelve registros que tienen la relación con coincidencia.

### Ejemplo de petición con búsqueda y paginación

```http
GET /api/products?search=laptop&page=1&limit=20
Authorization: Bearer <token>
```

```json
{
  "products": [
    { "id": "LAP-001", "name": "Laptop Pro 15", ... },
    { "id": "LAP-002", "name": "Laptop Air 13", ... }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Patrón frontend para buscador con debounce

```js
const [search, setSearch] = useState('');
const [page, setPage] = useState(1);

// Resetear a página 1 cuando cambia el texto
const handleSearch = (value) => {
  setSearch(value);
  setPage(1);
};

// Petición con parámetros combinados
const { data } = await api.get('/products', {
  params: { search, page, limit: 20 }
});
```

> **Importante:** siempre resetear `page` a 1 cuando el usuario modifica `search`, o el resultado puede quedar vacío si la nueva búsqueda tiene menos páginas que la actual.

---

## Migración en el frontend

### Patrón de acceso a datos

```js
// ANTES
const response = await api.get('/sales');
const sales = response.data; // array directo

// AHORA
const response = await api.get('/sales');
const { sales, pagination } = response.data;
```

### Patrón para renderizar paginación

```js
const response = await api.get('/sales', {
  params: { page: currentPage, limit: pageSize }
});

const { sales, pagination } = response.data;
// pagination.total      → total de registros
// pagination.page       → página actual
// pagination.limit      → registros por página
// pagination.totalPages → total de páginas
```

### Pedir todos los registros sin paginación

No existe un modo "sin límite". Para obtener todos los datos usar `limit=100` (máximo permitido) y recorrer páginas si `totalPages > 1`. Se recomienda no hacer esto a menos que sea estrictamente necesario.

---

## Endpoints que NO cambian

Los siguientes endpoints devuelven datos individuales o tienen una forma de respuesta distinta por diseño — no reciben paginación:

- Todos los `GET /:id` (detalle por ID)
- `POST`, `PUT`, `DELETE` en cualquier ruta
- `/api/auth/*` — autenticación
- `/api/dashboard/*` — KPIs y métricas
- `/api/company-info` — configuración de empresa
- `/api/accounting/reports/*` — reportes contables calculados
- `/api/accounting/sat/*` — catálogos SAT
- `/api/sale-deliveries/*` — acotado por venta
- `/api/userBranches/*` — asignaciones usuario-sucursal

---

## Documentación interactiva

Swagger UI disponible en `http://localhost:3000/documentation` — todos los endpoints actualizados con los parámetros `page`/`limit` y el schema de respuesta paginada.
