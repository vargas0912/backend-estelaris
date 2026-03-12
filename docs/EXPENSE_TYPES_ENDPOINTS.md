# Expense Types Endpoints

Base URL: `/api/expense-types`

**Autenticación:** `Authorization: Bearer <token>`
**Roles permitidos:** `user`, `admin` (superadmin bypasea automáticamente)

---

## GET /api/expense-types

Retorna todos los tipos de gastos registrados.

**Privilegio:** `view_expense_types`

**Response 200:**
```json
{
  "expenseTypes": [
    {
      "id": 1,
      "name": "Nómina",
      "created_at": "2026-03-11T00:00:00.000Z",
      "updated_at": "2026-03-11T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Renta",
      "created_at": "2026-03-11T00:00:00.000Z",
      "updated_at": "2026-03-11T00:00:00.000Z"
    }
  ]
}
```

---

## GET /api/expense-types/:id

Retorna el detalle de un tipo de gasto por su ID.

**Privilegio:** `view_expense_types`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del tipo de gasto |

**Response 200:**
```json
{
  "expenseType": {
    "id": 1,
    "name": "Nómina",
    "created_at": "2026-03-11T00:00:00.000Z",
    "updated_at": "2026-03-11T00:00:00.000Z"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `404` | Tipo de gasto no encontrado |
| `400` | `id` inválido o vacío |

---

## POST /api/expense-types

Crea un nuevo tipo de gasto.

**Privilegio:** `create_expense_type`

**Request body:**
```json
{
  "name": "Gasolina"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | ✓ | Nombre del tipo de gasto |

**Response 200:**
```json
{
  "expenseType": {
    "id": 37,
    "name": "Gasolina",
    "created_at": "2026-03-11T19:00:00.000Z",
    "updated_at": "2026-03-11T19:00:00.000Z"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | `name` vacío o ausente |

---

## PUT /api/expense-types/:id

Actualiza el nombre de un tipo de gasto.

**Privilegio:** `update_expense_type`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del tipo de gasto |

**Request body:**
```json
{
  "name": "Gasolina y Diésel"
}
```

**Response 200:**
```json
{
  "expenseType": {
    "id": 37,
    "name": "Gasolina y Diésel",
    "created_at": "2026-03-11T19:00:00.000Z",
    "updated_at": "2026-03-11T19:05:00.000Z"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | `id` o `name` inválido o vacío |

---

## DELETE /api/expense-types/:id

Elimina un tipo de gasto (hard delete — `paranoid: false`).

**Privilegio:** `delete_expense_type`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del tipo de gasto |

**Response 200:**
```json
{
  "result": 1
}
```

> `result: 1` indica que se eliminó 1 registro. `result: 0` indica que el tipo no existía.

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | `id` inválido o vacío |

> **Advertencia:** Este es un **hard delete** (`paranoid: false`). El registro se elimina físicamente de la base de datos. No eliminar tipos de gastos que tengan gastos (`expenses`) asociados — fallará por la FK `RESTRICT`.

---

## Privilegios del módulo

| Codename | Descripción |
|----------|-------------|
| `view_expense_types` | Ver todos los tipos y por ID |
| `create_expense_type` | Crear nuevo tipo de gasto |
| `update_expense_type` | Modificar tipo de gasto |
| `delete_expense_type` | Eliminar tipo de gasto (hard delete) |

---

## Datos iniciales (seeders)

El seeder de producción incluye 36 tipos precargados:

`Nómina`, `Renta`, `Teléfono`, `Internet`, `Papelería`, `Artículos de Limpieza`, `Comisión`, `Viáticos`, `Servicios`, `Cancelación de Cuenta`, `Préstamos`, `Mercancía Maltratada`, `Infracción`, `Afinación de Camioneta`, `Reparación de Camioneta`, `Reparación de Motos`, `Reparación de Aparatos`, `Diésel`, `Gasolina`, `Recibo de Luz`, `Recibo de Agua`, `Fletes`, `Publicidad`, `Uniformes`, `Herramientas`, `Equipo de Cómputo`, `Muebles y Enseres`, `Seguros`, `Impuestos`, `Honorarios`, `Capacitación`, `Mantenimiento`, `Materiales de Construcción`, `Gastos Médicos`, `Donaciones`, `Otros`.

---

## Notas de arquitectura

- **`paranoid: false`** — hard delete. Los tipos de gastos son un catálogo; no requieren soft delete.
- **FK RESTRICT en `expenses`** — no se puede eliminar un tipo de gasto que tenga gastos asociados. Sequelize lanzará un error de FK constraint.
- No tiene `deleted_at` en la migración ni en el modelo (coherente con `paranoid: false`).
