# Plan: Trazabilidad de sucursal en cobros de venta

## Contexto

Los pagos de venta (`sale_payments`) no registraban en qué sucursal se recibía el abono. Una venta puede originarse en una sucursal, pero el cliente puede pagar en cualquier otra. Sin este dato no hay trazabilidad para que cada sucursal reporte los cobros que procesó en el día.

**Impacto contable:** El motor contable usaba `payment.sale.branch_id` para atribuir la póliza de ingreso, lo cual era incorrecto — el ingreso en caja/banco ocurre en la sucursal receptora del pago, no en la de la venta.

---

## Solución

Agregar `branch_id` a la tabla `sale_payments`, tomado del header `X-Branch-ID` vía middleware `branchScope` — consistente con el resto del sistema (gastos, compras, transferencias). No se expone en el body del request.

```
sale_payments.branch_id  →  branches.id   (sucursal que recibió el pago)
sales.branch_id          →  branches.id   (sucursal donde se originó la venta)
```

---

## Cambios implementados

### Base de datos
- **Migration:** `20260402000000-add-branch-id-to-sale-payments.js`
  - Columna `branch_id INT NOT NULL` con FK a `branches.id`
  - `ON DELETE RESTRICT`, `ON UPDATE CASCADE`
  - Índice en `branch_id`

### Modelo
- **`src/models/salePayments.js`**
  - Campo `branch_id: INTEGER allowNull: false`
  - Asociación `belongsTo(branches, { as: 'branch', foreignKey: 'branch_id' })`

### Validación
- **`src/validators/salePayments.js`** — `branch_id` **no** se valida en el body; lo provee el middleware `branchScope` desde el header `X-Branch-ID`

### Ruta
- **`src/routes/sale-payments.js`**
  - Middleware `branchScope` agregado al stack del `POST /sale-payments`
  - `branch_id` documentado en el OpenAPI como header `X-Branch-ID` (no en el requestBody)

### Controlador
- **`src/controllers/salePayments.js`** — `addRecord`
  - `branchId = req.branchId || parseInt(req.headers['x-branch-id'], 10)`
  - El fallback al header cubre el caso superadmin donde `branchScope` pone `req.branchId = null`

### Servicio
- **`src/services/salePayments.js`**
  - `createPayment(body, userId, branchId)` — `branchId` como tercer argumento, ya no se lee del body
  - `'branch_id'` incluido en `paymentAttributes`
  - `paymentIncludes` incluye `{ model: branches, as: 'branch', attributes: ['id', 'name'] }`

### Motor contable
- **`src/services/accountingEngine.service.js`** — `generateFromSalePayment`
  - Corregido: `branchId = payment.branch_id` (antes usaba `payment.sale?.branch_id`)
  - El include del sale ya no necesita `branch_id`

### Tests
- **`src/tests/helper/salePaymentsData.js`** — eliminado `branch_id` de todos los fixtures y el helper `paymentNoBranchId`
- **`src/tests/24_sale_payments.test.js`** — todos los `POST` usan `.set('x-branch-id', ...)`:
  - Test 11: sin header `X-Branch-ID` → 400 (desde `branchScope`)
  - Test 12: cobro con `x-branch-id: 2` en venta de sucursal 1 → 200, `branch_id` registrado correctamente

---

## Flujo POST /sale-payments

**Request:**
```http
POST /api/sale-payments
Authorization: Bearer <token>
X-Branch-ID: 3
Content-Type: application/json

{
  "sale_id": 42,
  "payment_amount": 500.00,
  "payment_date": "2026-04-02",
  "payment_method": "Efectivo",
  "reference_number": "REF-001",
  "notes": "Abono en sucursal norte"
}
```

**Response incluye:**
```json
{
  "payment": {
    "id": 15,
    "sale_id": 42,
    "branch_id": 3,
    "branch": { "id": 3, "name": "Sucursal Norte" },
    ...
  }
}
```

---

## Casos de uso habilitados

1. **Reporte de cobros por sucursal** — filtrar `sale_payments` por `branch_id` para ver los ingresos recibidos en cada punto de venta.
2. **Pólizas contables correctas** — el asiento `Caja/Bancos` se genera en la sucursal que recibió el efectivo, no en la que generó la venta.
3. **Auditoría cruzada** — una venta de sucursal A puede tener múltiples abonos en sucursales B y C, todo trazable.
