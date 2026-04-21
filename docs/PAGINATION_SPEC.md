# Spec: Paginación universal en endpoints de lista

**Versión API:** 1.4.0  
**Tipo de cambio:** BREAKING — todos los endpoints de lista cambian su shape de respuesta  
**Branch:** `feat/universal-pagination`

---

## Resumen

Todos los endpoints `GET` que devolvían un arreglo plano (o un objeto sin metadata) ahora devuelven un objeto con dos claves: el arreglo de datos y un objeto `pagination` con información de la página actual.

---

## Contrato de paginación

### Query params (todos opcionales)

| Param   | Tipo    | Default | Máximo | Descripción          |
|---------|---------|---------|--------|----------------------|
| `page`  | integer | `1`     | —      | Número de página     |
| `limit` | integer | `20`    | `100`  | Registros por página |

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

| Método | Ruta                           | Clave de datos | Notas                                 |
|--------|--------------------------------|----------------|---------------------------------------|
| GET    | `/api/sales`                   | `sales`        | Requiere header `X-Branch-ID`         |
| GET    | `/api/sales/customer/:id`      | `sales`        |                                       |
| GET    | `/api/sales/branch/:id`        | `sales`        |                                       |
| GET    | `/api/sales/overdue`           | `sales`        |                                       |

### Pagos de ventas

| Método | Ruta                           | Clave de datos | Notas                                 |
|--------|--------------------------------|----------------|---------------------------------------|
| GET    | `/api/sale-payments`           | `payments`     | Requiere header `X-Branch-ID`         |
| GET    | `/api/sale-payments/sale/:id`  | `payments`     |                                       |

### Compras

| Método | Ruta                           | Clave de datos | Notas |
|--------|--------------------------------|----------------|-------|
| GET    | `/api/purchases`               | `purchases`    |       |
| GET    | `/api/purchases/supplier/:id`  | `purchases`    |       |
| GET    | `/api/purchases/branch/:id`    | `purchases`    |       |

### Pagos de compras

| Método | Ruta                                  | Clave de datos | Notas |
|--------|---------------------------------------|----------------|-------|
| GET    | `/api/purch-payments`                 | `payments`     |       |
| GET    | `/api/purch-payments/purchase/:id`    | `payments`     |       |

### Gastos

| Método | Ruta                           | Clave de datos | Notas |
|--------|--------------------------------|----------------|-------|
| GET    | `/api/expenses`                | `expenses`     |       |
| GET    | `/api/expenses/branch/:id`     | `expenses`     |       |

### Transferencias

| Método | Ruta                                 | Clave de datos | Notas |
|--------|--------------------------------------|----------------|-------|
| GET    | `/api/transfers`                     | `transfers`    |       |
| GET    | `/api/transfers/from-branch/:id`     | `transfers`    |       |
| GET    | `/api/transfers/to-branch/:id`       | `transfers`    |       |

### Pólizas contables

| Método | Ruta                           | Clave de datos | Notas |
|--------|--------------------------------|----------------|-------|
| GET    | `/api/accounting/vouchers`     | `vouchers`     |       |

### Productos

| Método | Ruta                           | Clave de datos | Notas |
|--------|--------------------------------|----------------|-------|
| GET    | `/api/products`                | `products`     |       |

### Inventarios (stocks)

| Método | Ruta                              | Clave de datos | Notas                         |
|--------|-----------------------------------|----------------|-------------------------------|
| GET    | `/api/productStocks`              | `stocks`       | Requiere header `X-Branch-ID` |
| GET    | `/api/productStocks/product/:id`  | `stocks`       |                               |
| GET    | `/api/productStocks/branch/:id`   | `stocks`       |                               |

### Precios de productos

| Método | Ruta                                  | Clave de datos | Notas |
|--------|---------------------------------------|----------------|-------|
| GET    | `/api/productPrices`                  | `prices`       |       |
| GET    | `/api/productPrices/product/:id`      | `prices`       |       |
| GET    | `/api/productPrices/priceList/:id`    | `prices`       |       |

### Empleados

| Método | Ruta                           | Clave de datos | Notas                         |
|--------|--------------------------------|----------------|-------------------------------|
| GET    | `/api/employees`               | `employees`    | Requiere header `X-Branch-ID` |
| GET    | `/api/employees/branch/:id`    | `employees`    |                               |

### Proveedores

| Método | Ruta                | Clave de datos | Notas |
|--------|---------------------|----------------|-------|
| GET    | `/api/suppliers`    | `suppliers`    |       |

### Usuarios

| Método | Ruta            | Clave de datos | Notas |
|--------|-----------------|----------------|-------|
| GET    | `/api/users`    | `users`        |       |

### Direcciones de clientes

| Método | Ruta                                    | Clave de datos | Notas |
|--------|-----------------------------------------|----------------|-------|
| GET    | `/api/customer-addresses`               | `addresses`    |       |
| GET    | `/api/customer-addresses/customer/:id`  | `addresses`    |       |

### Clientes _(ya estaba paginado, sin cambio de interfaz)_

| Método | Ruta                                    | Clave de datos | Notas                                  |
|--------|-----------------------------------------|----------------|----------------------------------------|
| GET    | `/api/customers`                        | `customers`    | Sin cambio — ya retornaba `pagination` |
| GET    | `/api/customers/branch/:id`             | `customers`    | Sin cambio                             |
| GET    | `/api/customers/municipality/:id`       | `customers`    | Sin cambio                             |

### Campañas

| Método | Ruta                  | Clave de datos | Notas                           |
|--------|-----------------------|----------------|---------------------------------|
| GET    | `/api/campaigns`      | `campaigns`    | Antes era array plano           |
| GET    | `/api/campaigns/active` | `campaigns`  | Antes era array plano           |

### Productos de campaña

| Método | Ruta                                | Clave de datos      | Notas |
|--------|-------------------------------------|---------------------|-------|
| GET    | `/api/campaignProducts/campaign/:id` | `campaignProducts` |       |

### Sucursales

| Método | Ruta                    | Clave de datos | Notas                       |
|--------|-------------------------|----------------|-----------------------------|
| GET    | `/api/branches`         | `branches`     |                             |
| GET    | `/api/branches/public`  | `branches`     | Sin autenticación requerida |

### Estados

| Método | Ruta            | Clave de datos | Notas |
|--------|-----------------|----------------|-------|
| GET    | `/api/states`   | `states`       |       |

### Municipios

| Método | Ruta                              | Clave de datos    | Notas                                    |
|--------|-----------------------------------|-------------------|------------------------------------------|
| GET    | `/api/municipalities/state/:id`   | `municipalities`  |                                          |

### Puestos

| Método | Ruta              | Clave de datos | Notas |
|--------|-------------------|----------------|-------|
| GET    | `/api/positions`  | `positions`    |       |

### Listas de precios

| Método | Ruta               | Clave de datos | Notas                                    |
|--------|--------------------|----------------|------------------------------------------|
| GET    | `/api/priceLists`  | `priceLists`   | Ordenadas por `priority DESC, name ASC`  |

### Categorías de producto

| Método | Ruta                       | Clave de datos     | Notas |
|--------|----------------------------|--------------------|-------|
| GET    | `/api/productCategories`   | `productCategories`|       |

### Tipos de gasto

| Método | Ruta                   | Clave de datos | Notas |
|--------|------------------------|----------------|-------|
| GET    | `/api/expense-types`   | `expenseTypes` |       |

### Privilegios

| Método | Ruta                              | Clave de datos | Notas |
|--------|-----------------------------------|----------------|-------|
| GET    | `/api/privileges`                 | `privileges`   |       |
| GET    | `/api/privileges/module/:module`  | `privileges`   |       |

### Configuración del sistema

| Método | Ruta                              | Clave de datos | Notas                                        |
|--------|-----------------------------------|----------------|----------------------------------------------|
| GET    | `/api/system-settings`            | `settings`     | Query param adicional: `category` (opcional) |

### Cuentas contables

| Método | Ruta                        | Clave de datos | Notas |
|--------|-----------------------------|----------------|-------|
| GET    | `/api/accounting/accounts`  | `accounts`     |       |

### Períodos contables

| Método | Ruta                        | Clave de datos | Notas                               |
|--------|-----------------------------|----------------|-------------------------------------|
| GET    | `/api/accounting/periods`   | `periods`      | Ordenados por `year DESC, month DESC` |

### Puntos de lealtad (configs)

| Método | Ruta                          | Clave de datos | Notas                                         |
|--------|-------------------------------|----------------|-----------------------------------------------|
| GET    | `/api/loyaltyPoints/configs`  | `configs`      | Query param adicional: `branch_id` (opcional) |

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
