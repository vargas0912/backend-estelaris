# Plan: Módulo de Transferencia de Mercancías

## Context

Módulo para registrar y controlar el movimiento físico de stock entre sucursales del ERP.
Los campos propuestos originalmente tenían dos errores de diseño críticos y varios campos
faltantes para soportar el flujo completo de una transferencia real en producción.

---

## Problemas en el Schema Propuesto

| Campo original | Problema | Corrección |
|---|---|---|
| `from_purch_id` | Una transferencia ocurre entre **sucursales**, no entre compras | Renombrar a `from_branch_id` |
| `to_purch_id` | Idem | Renombrar a `to_branch_id` |
| `qty` en header | Valor derivado → inconsistencia si difiere de details | Eliminar, se calcula desde details |
| (falta) `status` | Sin status no hay flujo controlable | Agregar ENUM |
| (falta) `received_by` | El que despacha ≠ el que recibe | Agregar FK a users |
| (falta) `received_at` | Auditoría de cuándo llegó | Agregar DATEONLY |
| (falta) `notes` | Sin observaciones no hay trazabilidad | Agregar TEXT |
| `qty` en detail | Solo guarda lo enviado, no lo recibido | Agregar `qty_received` |
| (falta) `unit_cost` | Sin costo no hay valuación de inventario | Agregar DECIMAL(12,2) |

---

## Schema Final

### `transfers` (header) — `paranoid: true`

```
id              PK AUTO_INCREMENT
from_branch_id  NOT NULL FK branches.id
to_branch_id    NOT NULL FK branches.id
transfer_date   DATEONLY NOT NULL
status          ENUM('Borrador','En_Transito','Recibido','Cancelado') DEFAULT 'Borrador'
user_id         NOT NULL FK users.id        — quien crea/despacha
received_by     NULL     FK users.id        — quien confirma recepción
driver_id       NULL     FK employees.id
transport_plate VARCHAR(20) NULL
notes           TEXT NULL
received_at     DATEONLY NULL
```

### `transfer_details` (detail) — `paranoid: false` (registro contable)

```
id           PK AUTO_INCREMENT
transfer_id  NOT NULL FK transfers.id
product_id   NOT NULL FK products.id (VARCHAR 20)
qty          DECIMAL(12,3) NOT NULL   — enviado
qty_received DECIMAL(12,3) NULL       — confirmado en destino
unit_cost    DECIMAL(12,2) NOT NULL   — costo al momento del envío
purch_id     NULL FK purchases.id     — trazabilidad al origen
notes        TEXT NULL                — observaciones de discrepancia
```

---

## Flujo de Estados

```
Borrador ──[dispatch]──► En_Transito ──[receive]──► Recibido
    │                         │
    └──[delete]──► Cancelado  └──[delete]──► Cancelado + reversal de stock
```

### Impacto en stock por transición

| Transición | Stock origen | Stock destino | stock_movements creado |
|---|---|---|---|
| Borrador → En_Transito | `qty -= detail.qty` | Sin cambio | `transfer` OUT en from_branch |
| En_Transito → Recibido | Sin cambio | `qty += detail.qty_received` | `transfer` IN en to_branch |
| En_Transito → Cancelado | `qty += detail.qty` (reversal) | Sin cambio | `adjustment` reversal en from_branch |
| Borrador → Cancelado | Sin cambio | Sin cambio | Ninguno |

---

## Reglas de Negocio

- `from_branch_id !== to_branch_id` (validación en creación)
- Al despachar: verificar `productStocks.quantity >= detail.qty` para cada producto en origin (SELECT FOR UPDATE)
- Al recibir: `qty_received <= detail.qty` por ítem, puede ser 0 (pérdida total)
- `qty_received` se provee como array en el body del PATCH receive
- Solo se puede editar en status `Borrador`
- Solo se puede cancelar desde `Borrador` o `En_Transito`

---

## Bug a Corregir (en `productStocks.js`)

**`src/services/productStocks.js` línea ~183:**
```js
// ❌ ACTUAL — sobreescribe el stock existente
stock.quantity = qty;

// ✅ CORRECTO — incrementa el stock existente
stock.quantity = parseFloat((parseFloat(stock.quantity) + qty).toFixed(3));
```

Este bug existe independientemente del módulo de transferencias y debe corregirse en el mismo PR.

---

## API Endpoints y Privilegios

```
GET    /api/transfers                            TRANSFER.VIEW_ALL
GET    /api/transfers/from-branch/:branch_id     TRANSFER.VIEW_ALL
GET    /api/transfers/to-branch/:branch_id       TRANSFER.VIEW_ALL
GET    /api/transfers/:id                        TRANSFER.VIEW_ALL
POST   /api/transfers                            TRANSFER.ADD
PUT    /api/transfers/:id                        TRANSFER.UPDATE      (solo Borrador)
PATCH  /api/transfers/:id/dispatch               TRANSFER.DISPATCH    (Borrador → En_Transito)
PATCH  /api/transfers/:id/receive                TRANSFER.RECEIVE     (En_Transito → Recibido)
DELETE /api/transfers/:id                        TRANSFER.DELETE      (Borrador o En_Transito)
```

> **Importante:** Sub-paths específicos (`/from-branch/`, `/to-branch/`, `/dispatch`, `/receive`)
> deben declararse ANTES de `/:id` en Express para evitar colisiones de rutas.

---

## Constante del Módulo

```js
// src/constants/modules.js
const TRANSFER = Object.freeze({
  MODULE_NAME: 'transfers',
  VIEW_ALL:  'view_transfers',      NAME_ALL:      'Ver transferencias',
  ADD:       'create_transfer',     NAME_ADD:      'Registrar transferencia',
  UPDATE:    'update_transfer',     NAME_UPDATE:   'Modificar transferencia',
  DISPATCH:  'dispatch_transfer',   NAME_DISPATCH: 'Despachar transferencia',
  RECEIVE:   'receive_transfer',    NAME_RECEIVE:  'Recibir transferencia',
  DELETE:    'delete_transfer',     NAME_DELETE:   'Eliminar transferencia',
});
```

---

## Archivos a Crear

```
src/database/migrations/20260302000001-create-transfers.js
src/database/migrations/20260302000002-create-transfer-details.js
src/database/migrations/20260302000003-alter-stock-movements-add-transfer-enum.js
src/database/migrations/20260302000004-add-transfer-privileges.js
src/models/transfers.js
src/models/transferDetails.js
src/services/transfers.js
src/controllers/transfers.js
src/validators/transfers.js
src/routes/transfers.js
src/constants/transfers.js
src/database/seeders/test_files/22_transfers.js
src/tests/22_transfers.test.js
src/tests/helper/transfersData.js
```

## Archivos a Modificar

```
src/constants/modules.js                      → agregar TRANSFER constant
src/database/seeders/json_files/privileges.js → agregar privileges de TRANSFER
src/models/branches.js                        → hasMany outgoingTransfers + incomingTransfers
src/models/employees.js                       → hasMany drivenTransfers
src/models/users.js                           → hasMany dispatchedTransfers + receivedTransfers
src/models/products.js                        → hasMany transferDetails
src/models/purchases.js                       → hasMany transferDetails
src/services/productStocks.js                 → fix bug + add updateFromTransfer + revertFromTransfer
```

---

## Asociaciones en `transfers.js`

```js
static associate(models) {
  this.belongsTo(models.branches,  { as: 'fromBranch', foreignKey: 'from_branch_id' });
  this.belongsTo(models.branches,  { as: 'toBranch',   foreignKey: 'to_branch_id' });
  this.belongsTo(models.users,     { as: 'dispatcher', foreignKey: 'user_id' });
  this.belongsTo(models.users,     { as: 'receiver',   foreignKey: 'received_by' });
  this.belongsTo(models.employees, { as: 'driver',     foreignKey: 'driver_id' });
  this.hasMany(models.transferDetails, { as: 'details', foreignKey: 'transfer_id' });
}
```

## Asociaciones en `transferDetails.js`

```js
static associate(models) {
  this.belongsTo(models.transfers, { as: 'transfer',       foreignKey: 'transfer_id' });
  this.belongsTo(models.products,  { as: 'product',        foreignKey: 'product_id' });
  this.belongsTo(models.purchases, { as: 'originPurchase', foreignKey: 'purch_id' });
}
```

---

## Body del PATCH receive

```json
{
  "items": [
    { "detail_id": 1, "qty_received": 5.000 },
    { "detail_id": 2, "qty_received": 3.000 }
  ],
  "notes": "Faltaron 2 unidades del producto X por daño en transporte"
}
```

Validar con `check('items.*.detail_id')` y `check('items.*.qty_received')`.

---

## Secuencia de Implementación

1. Migrations (transfers + details + alter stock_movements enum + privileges)
2. Models: `transfers.js` + `transferDetails.js`
3. Associations en modelos existentes
4. Fix bug en `productStocks.js` + agregar `updateFromTransfer` / `revertFromTransfer`
5. `modules.js` → agregar TRANSFER
6. `constants/transfers.js` con mensajes de validators
7. `services/transfers.js` (createTransfer, dispatchTransfer, receiveTransfer, deleteTransfer)
8. `controllers/transfers.js`
9. `validators/transfers.js`
10. `routes/transfers.js`
11. Seeder de privileges + test data
12. Test fixtures + `22_transfers.test.js`

---

## Verificación

```bash
npm run db:reset
npm test -- --testPathPattern="22_transfers"
npm test
```

### Tests a cubrir en `22_transfers.test.js`

- `POST` crear transferencia válida (Borrador)
- `POST` validación: misma sucursal, producto inexistente, sin items
- `GET` lista / por branch origen / por branch destino / por id
- `PUT` actualizar en Borrador / error si En_Transito o Recibido
- `PATCH dispatch`: happy path, stock insuficiente, status incorrecto
- `PATCH receive`: recepción completa, parcial, qty_received > qty enviado
- `DELETE` desde Borrador (sin reversal de stock)
- `DELETE` desde En_Transito (con reversal de stock)
- Verificar `stock_movements` creados correctamente tras dispatch y receive
