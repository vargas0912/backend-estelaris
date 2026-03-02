# branchScope en el módulo de Transferencias

## Header requerido

```
x-branch-id: <branch_id>   (entero positivo)
```

- **Superadmin**: el header es ignorado. Ve y opera sobre todas las sucursales sin restricción.
- **Admin / User**: el header es obligatorio y debe corresponder a una sucursal asignada al usuario en `user_branches`.

---

## Comportamiento por endpoint

| Endpoint | Quién puede operar | Lógica de scope |
|---|---|---|
| `GET /api/transfers` | Origen o destino | Filtra por `from_branch_id = branchId OR to_branch_id = branchId` |
| `GET /api/transfers/from-branch/:id` | Solo si `:id == branchId` | 403 si el param no coincide con branchId |
| `GET /api/transfers/to-branch/:id` | Solo si `:id == branchId` | 403 si el param no coincide con branchId |
| `GET /api/transfers/:id` | Origen o destino | 403 si la transferencia no involucra a branchId |
| `POST /api/transfers` | Solo sucursal origen | `from_branch_id` del body debe coincidir con branchId |
| `PUT /api/transfers/:id` | Solo sucursal origen | `from_branch_id` de la transferencia debe coincidir |
| `PATCH /api/transfers/:id/dispatch` | Solo sucursal origen | `from_branch_id` de la transferencia debe coincidir |
| `PATCH /api/transfers/:id/receive` | Solo sucursal destino | `to_branch_id` de la transferencia debe coincidir |
| `DELETE /api/transfers/:id` | Solo sucursal origen | `from_branch_id` de la transferencia debe coincidir |

---

## Códigos de error

| Situación | HTTP | Mensaje |
|---|---|---|
| Header `x-branch-id` ausente (non-superadmin) | 400 | `BRANCH_ID_REQUIRED` |
| Usuario no tiene la sucursal asignada | 403 | `BRANCH_ACCESS_DENIED` |
| Operación sobre transferencia de otra sucursal | 403 | `BRANCH_ACCESS_DENIED` |

---

## Ejemplos

### Superadmin — sin header, ve todo

```http
GET /api/transfers
Authorization: Bearer <superadmin_token>
```

### Admin/User — lista sus transferencias

```http
GET /api/transfers
Authorization: Bearer <token>
x-branch-id: 3
```

Respuesta: solo transferencias donde `from_branch_id = 3` o `to_branch_id = 3`.

### Admin/User — intenta ver transferencias de otra sucursal

```http
GET /api/transfers/from-branch/5
Authorization: Bearer <token>
x-branch-id: 3
```

Respuesta: `403 BRANCH_ACCESS_DENIED`

### Sucursal destino recibe transferencia

```http
PATCH /api/transfers/42/receive
Authorization: Bearer <token>
x-branch-id: 2
Content-Type: application/json

{ "items": [{ "detail_id": 10, "qty_received": 5 }] }
```

Solo válido si `transfers[42].to_branch_id === 2`.

---

## Implementación técnica

El middleware `branchScope` (`src/middlewares/branchScope.js`) inyecta `req.branchId`:

- `null` para superadmin (sin filtro)
- `<int>` para otros roles (validado contra `user_branches`)

Los services reciben `reqBranchId` y aplican guards condicionales:

```js
// getAllTransfers — Op.or para incluir origen y destino
const where = reqBranchId
  ? { [Op.or]: [{ from_branch_id: reqBranchId }, { to_branch_id: reqBranchId }] }
  : {};

// Operaciones de escritura — solo origen puede crear/despachar/eliminar
if (reqBranchId && transfer.from_branch_id !== reqBranchId) {
  return { error: 'BRANCH_ACCESS_DENIED' };
}

// receive — solo destino puede recibir
if (reqBranchId && transfer.to_branch_id !== reqBranchId) {
  return { error: 'BRANCH_ACCESS_DENIED' };
}
```
