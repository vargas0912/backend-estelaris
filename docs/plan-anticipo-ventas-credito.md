# Plan: Anticipo en ventas a crédito

## Context

Las ventas a crédito actualmente toman el total completo como saldo pendiente
(`due_payment = sales_total`) y generan cuotas por ese monto. Se requiere
manejar un **anticipo**: un pago inicial al momento de crear la venta que
reduce el saldo a financiar; las cuotas se calculan solo sobre el remanente.
El anticipo puede ser $0.00.

---

## Archivos a modificar (7)

| Archivo | Cambio |
|---------|--------|
| `src/database/migrations/20260327000002-add-anticipo-amount-to-sales.js` | Nueva columna |
| `src/models/sales.js` | Nuevo campo |
| `src/services/sales.js` | Lógica de anticipo en `createSale` |
| `src/validators/sales.js` | Campos `anticipo_amount` y `anticipo_payment_method` |
| `src/constants/sales.js` | 4 mensajes de error |
| `src/routes/sales.js` | Actualizar JSDoc del POST /sales |
| `docs/swagger.js` | Actualizar schemas `sales` y request body del POST |

---

## Cambios detallados

### 1. Migración
Crear `20260327000002-add-anticipo-amount-to-sales.js`:
```js
await queryInterface.addColumn('sales', 'anticipo_amount', {
  type: Sequelize.DECIMAL(12, 2),
  allowNull: false,
  defaultValue: 0.00,
  after: 'discount_amount'
});
```

### 2. Modelo (`src/models/sales.js`)
Agregar campo junto a `discount_amount`:
```js
anticipo_amount: {
  type: DataTypes.DECIMAL(12, 2),
  allowNull: false,
  defaultValue: 0.00
}
```

### 3. Service (`src/services/sales.js`) — `createSale`

Desestructurar `anticipo_amount` y `anticipo_payment_method` del body:
```js
const antizipoAmount = parseFloat(body.anticipo_amount || 0);
const antizipoPaymentMethod = body.anticipo_payment_method;
```

Validación de negocio (antes de la transacción):
```js
if (antizipoAmount > salesTotal) {
  return { error: 'ANTICIPO_EXCEEDS_TOTAL' };
}
```

Cálculo de saldo y estado:
```js
const remainingBalance = salesTotal - antizipoAmount;
const duePayment = isContado ? 0 : remainingBalance;
const status = (isContado || remainingBalance === 0) ? 'Pagado' : 'Pendiente';
```

Cuotas sobre `remainingBalance` (en lugar de `salesTotal`).

Pago automático del anticipo (dentro de la misma transacción, tras crear la venta):
```js
if (antizipoAmount > 0) {
  await salePayments.create({
    sale_id: sale.id,
    payment_amount: antizipoAmount,
    payment_date: salesDate,
    payment_method: antizipoPaymentMethod,
    notes: 'Anticipo',
    user_id: userId
  }, { transaction });
}
```

> No se llama a `applyPaymentToInstallments` porque las cuotas ya se generan
> sobre el remanente y `due_payment` ya lo descuenta.

### 4. Validator (`src/validators/sales.js`) — `valiAddRecord`

```js
check('anticipo_amount')
  .optional({ nullable: true })
  .isDecimal({ decimal_digits: '0,2', force_decimal: false })
  .withMessage(SALES_VALIDATORS.ANTICIPO_AMOUNT_INVALID)
  .bail()
  .custom(val => parseFloat(val) >= 0)
  .withMessage(SALES_VALIDATORS.ANTICIPO_AMOUNT_INVALID),

check('anticipo_payment_method')
  .if(check('anticipo_amount').custom(v => parseFloat(v) > 0))
  .notEmpty().withMessage(SALES_VALIDATORS.ANTICIPO_PAYMENT_METHOD_REQUIRED)
  .isIn(['Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta'])
  .withMessage(SALES_VALIDATORS.ANTICIPO_PAYMENT_METHOD_INVALID),
```

### 5. Constants (`src/constants/sales.js`)

```js
ANTICIPO_AMOUNT_INVALID: 'ANTICIPO_AMOUNT_INVALID',
ANTICIPO_EXCEEDS_TOTAL: 'ANTICIPO_EXCEEDS_TOTAL',
ANTICIPO_PAYMENT_METHOD_REQUIRED: 'ANTICIPO_PAYMENT_METHOD_REQUIRED',
ANTICIPO_PAYMENT_METHOD_INVALID: 'ANTICIPO_PAYMENT_METHOD_INVALID'
```

### 6. JSDoc — `src/routes/sales.js` (POST /sales)

Agregar en `properties` del `requestBody`:
```yaml
anticipo_amount:
  type: number
  format: decimal
  default: 0
  description: Pago inicial al crear la venta a crédito. Reduce el saldo financiado. Puede ser 0.
anticipo_payment_method:
  type: string
  enum: [Efectivo, Transferencia, Vale despensa, Tarjeta]
  description: Requerido si anticipo_amount > 0
```

Actualizar `description` del endpoint para mencionar el comportamiento del anticipo.

### 7. Swagger schema — `docs/swagger.js`

**Schema `sales`** — agregar campo:
```js
anticipo_amount: {
  type: 'number',
  format: 'decimal',
  description: 'Pago inicial registrado al crear la venta a crédito. Resta del saldo financiado.'
}
```

Actualizar descripción de `due_payment`:
```js
due_payment: {
  description: 'Contado=0. Crédito=(sales_total - anticipo_amount) inicialmente.'
}
```

---

## Tabla de comportamiento

| Escenario | `due_payment` inicial | Cuotas sobre | Pago auto-creado |
|-----------|----------------------|--------------|------------------|
| Contado | 0 | — | — |
| Crédito, anticipo=0 | `sales_total` | `sales_total` | — |
| Crédito, anticipo=500 | `sales_total - 500` | `sales_total - 500` | salePayment 'Anticipo' |
| Crédito, anticipo=total | 0 → status='Pagado' | 0 (sin cuotas) | salePayment 'Anticipo' |
| Crédito, anticipo>total | — | error: `ANTICIPO_EXCEEDS_TOTAL` | — |

---

## Verificación

1. `npm test` — tests existentes de sales deben pasar sin cambios
2. POST `/api/sales` crédito con `anticipo_amount: 500`, `anticipo_payment_method: "Efectivo"`:
   - `due_payment = total - 500`
   - Cuotas suman `total - 500`
   - Existe registro en `sale_payments` con `notes='Anticipo'`
3. POST con `anticipo_amount: 0` → comportamiento idéntico al actual
4. POST con `anticipo_amount > total` → respuesta con error `ANTICIPO_EXCEEDS_TOTAL`
5. POST con `anticipo_amount > 0` sin `anticipo_payment_method` → error de validación 400
6. Swagger UI en `/documentation` refleja los nuevos campos en el POST /sales
