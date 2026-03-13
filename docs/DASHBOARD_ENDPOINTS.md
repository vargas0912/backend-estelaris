# Dashboard Endpoints

Base URL: `/api/dashboard`

**Autenticación:** `Authorization: Bearer <token>`
**Roles permitidos:** `admin` (superadmin bypasea automáticamente)
**Privilegio requerido:** `view_dashboard`

---

## GET /api/dashboard/kpis

Retorna indicadores clave de ventas calculados en SQL (una sola query).

**Response:**

```json
{
  "kpis": {
    "ventas_saldadas": 142,
    "ventas_pendientes": 38,
    "ventas_canceladas": 12,
    "ingreso_total": "284500.00",
    "cartera_pendiente": "76200.00",
    "clientes_activos": 95,
    "ventas_morosas": 7,
    "monto_moroso": "18400.00"
  }
}
```

**Notas:**

- `ingreso_total`: suma de `sales_total` de ventas con status `Pagado`
- `cartera_pendiente`: suma de `due_payment` de ventas con status `Pendiente`
- `ventas_morosas`: ventas `Pendiente` de tipo `Credito` con `due_date < hoy`
- `monto_moroso`: suma de `due_payment` de ventas morosas
- Valores DECIMAL retornan como string (comportamiento MySQL/Sequelize)

---

## GET /api/dashboard/trends

Retorna totales agrupados por mes para el período indicado.

**Query params:**

| Param    | Tipo    | Default | Min | Max | Descripción                   |
| -------- | ------- | ------- | --- | --- | ----------------------------- |
| `months` | integer | `6`     | 1   | 24  | Cantidad de meses hacia atrás |

**Response:**

```json
{
  "trends": [
    {
      "mes": "2025-10",
      "ventas_nuevas": 45,
      "ventas_saldadas": 38,
      "ventas_canceladas": 3,
      "ingreso_mensual": "92500.00"
    }
  ]
}
```

**Notas:**

- `mes` formato `YYYY-MM`
- `ventas_nuevas`: count de ventas que no son `Cancelado`
- `ingreso_mensual`: suma de `sales_total` de ventas `Pagado` en ese mes
- El período parte desde el día 1 del mes más antiguo (sin perder días)

---

## GET /api/dashboard/top-products

Retorna los productos más vendidos por ingreso en el período indicado.

**Query params:**

| Param    | Tipo    | Default | Min | Max | Descripción                   |
| -------- | ------- | ------- | --- | --- | ----------------------------- |
| `limit`  | integer | `10`    | 1   | 50  | Cantidad máxima de productos  |
| `months` | integer | `3`     | 1   | 24  | Cantidad de meses hacia atrás |

**Response:**

```json
{
  "products": [
    {
      "product_id": 1,
      "product_name": "Producto A",
      "unidades_vendidas": "245.000",
      "ingreso_total": "48900.00",
      "cantidad_ventas": 32
    }
  ]
}
```

**Notas:**

- Ordenado por `ingreso_total` DESC
- Excluye ventas `Cancelado` y productos eliminados (soft delete)
- `unidades_vendidas` e `ingreso_total` retornan como string (DECIMAL en MySQL)
- `sale_details` no tiene soft delete — no se filtra por `deleted_at` en esa tabla

---

## GET /api/dashboard/expenses-by-month

Retorna el total de gastos agrupados por mes para el período indicado.

**Query params:**

| Param    | Tipo    | Default | Min | Max | Descripción                   |
| -------- | ------- | ------- | --- | --- | ----------------------------- |
| `months` | integer | `6`     | 1   | 60  | Cantidad de meses hacia atrás |

**Response:**

```json
{
  "expensesByMonth": [
    {
      "mes": "2026-02",
      "total_gastos": "12500.00",
      "cantidad_gastos": 15
    }
  ]
}
```

**Notas:**

- `mes` formato `YYYY-MM`
- `total_gastos`: suma de `expense_amount` de gastos en ese mes
- `cantidad_gastos`: conteo de registros de gastos en ese mes
- Excluye gastos eliminados (soft delete)
- Período parte desde el día 1 del mes más antiguo

---

## GET /api/dashboard/expenses-by-branch

Retorna el total de gastos agrupados por sucursal.
**Query params:**

| Param    | Tipo    | Default | Min | Max | Descripción                   |
| -------- | ------- | ------- | --- | --- | ----------------------------- |
| `months` | integer | `6`     | 1   | 60  | Cantidad de meses hacia atrás |

**Response:**

```json
{
  "expensesByBranch": [
    {
      "branch_id": 1,
      "sucursal": "Sucursal Centro",
      "total_gastos": "8500.00",
      "cantidad_gastos": 12
    }
  ]
}
```

**Notas:**

- `sucursal`: nombre de la sucursal
- `total_gastos`: suma de `expense_amount` de gastos en esa sucursal
- `cantidad_gastos`: conteo de registros de gastos en esa sucursal
- Excluye gastos eliminados (soft delete)
- Ordered by `total_gastos` DESC
- Incluye sucursales sin gastos (con valores en 0)
