# Expenses Endpoints

Base URL: `/api/expenses`

**Autenticación:** `Authorization: Bearer <token>`
**Roles permitidos:** `user`, `admin` (superadmin bypasea automáticamente)

---

## Headers requeridos

| Header | Endpoint | Descripción |
|--------|----------|-------------|
| `X-Branch-ID` | `POST /` | ID de la sucursal donde se registra el gasto |

**Nota sobre branchScope:** El middleware `branchScope` valida que el usuario tenga asignada la sucursal indicada en `X-Branch-ID`. Si el usuario es `superadmin`, el header se usa directamente sin validar la asignación.

---

## GET /api/expenses

Retorna todos los gastos del sistema, sin filtro de sucursal.

**Privilegio:** `view_expenses`

**Response 200:**
```json
{
  "expenses": [
    {
      "id": 1,
      "branch_id": 1,
      "user_id": 1,
      "expense_type_id": 1,
      "trans_date": "2026-03-11",
      "expense_amount": "500.00",
      "notes": null,
      "created_at": "2026-03-11T19:00:00.000Z",
      "updated_at": "2026-03-11T19:00:00.000Z",
      "branch": { "id": 1, "name": "Sucursal Centro" },
      "user": { "id": 1, "name": "Super admin", "email": "superadmin@estelaris.com" },
      "expenseType": { "id": 1, "name": "Nómina" }
    }
  ]
}
```

---

## GET /api/expenses/branch/:branch_id

Retorna todos los gastos filtrados por sucursal.

**Privilegio:** `view_expenses_by_branch`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `branch_id` | integer | ID de la sucursal |

**Response 200:**
```json
{
  "expenses": [...]
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | `branch_id` inválido o vacío |
| `401` | Sin token o token inválido |
| `403` | Sin privilegio `view_expenses_by_branch` |

> **Importante:** Esta ruta va ANTES de `/:id` en Express para evitar que `/branch/1` sea interpretado como `id = "branch"`.

---

## GET /api/expenses/:id

Retorna el detalle de un gasto por su ID.

**Privilegio:** `view_expenses`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del gasto |

**Response 200:**
```json
{
  "expense": {
    "id": 1,
    "branch_id": 1,
    "user_id": 1,
    "expense_type_id": 1,
    "trans_date": "2026-03-11",
    "expense_amount": "500.00",
    "notes": "Nota opcional",
    "created_at": "2026-03-11T19:00:00.000Z",
    "updated_at": "2026-03-11T19:00:00.000Z",
    "branch": { "id": 1, "name": "Sucursal Centro" },
    "user": { "id": 1, "name": "Super admin", "email": "superadmin@estelaris.com" },
    "expenseType": { "id": 1, "name": "Nómina" }
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `404` | Gasto no encontrado |
| `400` | `id` inválido o vacío |

---

## POST /api/expenses

Registra un nuevo gasto. El `branch_id` se inyecta desde el header `X-Branch-ID` y el `user_id` desde el JWT.

**Privilegio:** `create_expense`
**Header requerido:** `X-Branch-ID: <branch_id>`

**Request body:**
```json
{
  "expense_type_id": 1,
  "trans_date": "2026-03-11",
  "expense_amount": "500.00",
  "notes": "Nota opcional"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `expense_type_id` | integer | ✓ | ID del tipo de gasto |
| `trans_date` | date (YYYY-MM-DD) | ✓ | Fecha de la transacción |
| `expense_amount` | decimal (≥ 0) | ✓ | Monto del gasto |
| `notes` | string | — | Notas opcionales |

**Response 200:**
```json
{
  "expense": {
    "id": 4,
    "branch_id": 1,
    "user_id": 1,
    "expense_type_id": 1,
    "trans_date": "2026-03-11",
    "expense_amount": "500.00",
    "notes": null,
    "created_at": "2026-03-11T19:30:00.000Z",
    "updated_at": "2026-03-11T19:30:00.000Z"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | Falta `expense_type_id`, `trans_date` o `expense_amount` |
| `400` | `expense_amount` inválido (no es decimal o es negativo) |
| `400` | `trans_date` con formato inválido |
| `400` | Header `X-Branch-ID` ausente o inválido (no superadmin) |
| `403` | Usuario no tiene acceso a la sucursal indicada |

---

## PUT /api/expenses/:id

Actualiza los campos de un gasto existente. Todos los campos del body son opcionales.

**Privilegio:** `update_expense`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del gasto |

**Request body:**
```json
{
  "expense_type_id": 2,
  "expense_amount": "750.00",
  "notes": "Gasto modificado"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `expense_type_id` | integer | — | Nuevo tipo de gasto |
| `trans_date` | date (YYYY-MM-DD) | — | Nueva fecha |
| `expense_amount` | decimal (≥ 0) | — | Nuevo monto |
| `notes` | string | — | Nuevas notas |

**Response 200:**
```json
{
  "expense": {
    "id": 4,
    "branch_id": 1,
    "user_id": 1,
    "expense_type_id": 2,
    "trans_date": "2026-03-11",
    "expense_amount": "750.00",
    "notes": "Gasto modificado",
    "created_at": "2026-03-11T19:30:00.000Z",
    "updated_at": "2026-03-11T19:35:00.000Z"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | `id` inválido o vacío |
| `400` | Valor de campo inválido |

> **Nota:** No se puede cambiar `branch_id` ni `user_id` vía PUT. Si el registro fue eliminado (soft delete), el PUT fallará silenciosamente (Sequelize no encontrará el registro por `paranoid: true`).

---

## DELETE /api/expenses/:id

Elimina lógicamente un gasto (soft delete). El registro permanece en la base de datos con `deleted_at` seteado.

**Privilegio:** `delete_expense`

**Parámetros de ruta:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID del gasto |

**Response 200:**
```json
{
  "result": 1
}
```

> `result: 1` indica que se eliminó 1 registro. `result: 0` indica que el gasto no existía o ya estaba eliminado.

**Errores:**

| Código | Descripción |
|--------|-------------|
| `400` | `id` inválido o vacío |

---

## Privilegios del módulo

| Codename | Descripción |
|----------|-------------|
| `view_expenses` | Ver todos los gastos y por ID |
| `view_expenses_by_branch` | Ver gastos filtrados por sucursal |
| `create_expense` | Registrar nuevo gasto |
| `update_expense` | Modificar gasto existente |
| `delete_expense` | Eliminar gasto (soft delete) |

---

## Notas de arquitectura

- **`branch_id`** nunca viene del body — siempre del header `X-Branch-ID` vía middleware `branchScope`.
- **`user_id`** nunca viene del body — siempre del JWT vía middleware `session`.
- **Soft delete (`paranoid: true`):** Los gastos eliminados no aparecen en ningún GET. Son registros financieros — se preservan en la base de datos.
- **GET `/`** devuelve TODOS los gastos del sistema (sin filtro de sucursal) — útil para reportes globales.
- **Valores DECIMAL** retornan como string en MySQL/Sequelize (ej. `"500.00"`).
