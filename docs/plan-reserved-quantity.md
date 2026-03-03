# Plan: Prevención de inventario negativo con `reserved_quantity`

## Contexto

**Escenario de riesgo:**
Sucursal B recibe 3 unidades de un lote. Despacha 1 (→ `En_Transito`). Los artículos siguen físicamente en B mientras el transporte no pasa. Alguien podría crear otra transferencia o venta sobre ese mismo lote sin saber que ya está comprometido, resultando en inventario negativo.

**Mecanismo propuesto: `reserved_quantity`**

En vez de decrementar `quantity` al hacer dispatch, se incrementa `reserved_quantity`. La cantidad disponible para nuevas operaciones es `available = quantity - reserved_quantity`. Recién cuando la transferencia se **recibe** en destino (los artículos salieron físicamente de B), se descuenta `quantity` y se libera `reserved_quantity` en origen.

| Campo | Significado |
|-------|-------------|
| `quantity` | Unidades físicamente presentes en la sucursal |
| `reserved_quantity` | Unidades comprometidas en transferencias `En_Transito` (físicamente aún en B) |
| `available = quantity - reserved_quantity` | Lo que realmente se puede vender o transferir |

**Estrategia de migraciones:**
El workflow de desarrollo usa siempre `db:reset` (drop → create → migrate → seed). Se consolida el schema final directamente en el CREATE TABLE original y se convierten las migraciones intermedias en no-ops para evitar conflictos.

---

## Estado actual del código

- Solo existen dos operaciones que decrementan `quantity`: dispatch de transferencia y (futuro) ventas.
- El módulo de ventas aún no está implementado (`sale` existe en el ENUM de `stock_movements` pero no hay código).
- `SELECT FOR UPDATE` ya previene race conditions entre dispatches concurrentes.
- No existe ningún concepto de "reserva" en el modelo actual.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/database/migrations/20260123200000-create-product-stocks.js` | Schema final: todos los campos + índices + CHECK constraints |
| `src/database/migrations/20260225000002-add-batch-ref-to-product-stocks.js` | Convertir en no-op |
| `src/database/migrations/20260226000001-add-purch-id-and-bar-code-to-product-stocks.js` | Convertir en no-op |
| `src/database/migrations/20260302100000-update-product-stocks-unique-index.js` | Convertir en no-op |
| `src/models/productStocks.js` | Agregar campo `reserved_quantity` |
| `src/services/productStocks.js` | `updateFromTransfer` dispatch/receive + `revertFromTransfer` |
| `src/services/transfers.js` | Dispatch validation: usar `available = quantity - reserved_quantity` |

---

## Implementación

### 1. Reescribir el CREATE TABLE original (schema final consolidado)

**`src/database/migrations/20260123200000-create-product-stocks.js`**

```js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_stocks', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      product_id: {
        allowNull: false, type: Sequelize.STRING(20),
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      branch_id: {
        allowNull: false, type: Sequelize.INTEGER,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      quantity: {
        allowNull: false, type: Sequelize.DECIMAL(12, 3), defaultValue: 0
      },
      reserved_quantity: {
        allowNull: false, type: Sequelize.DECIMAL(12, 3), defaultValue: 0,
        comment: 'Unidades comprometidas en transferencias En_Transito'
      },
      min_stock:       { allowNull: true, type: Sequelize.DECIMAL(12, 3), defaultValue: 0 },
      max_stock:       { allowNull: true, type: Sequelize.DECIMAL(12, 3) },
      location:        { allowNull: true, type: Sequelize.STRING(100), comment: 'Ubicación física (ej: A-01-03)' },
      last_count_date: { allowNull: true, type: Sequelize.DATE, comment: 'Fecha del último conteo físico' },
      purch_id: {
        allowNull: true, type: Sequelize.INTEGER,
        references: { model: 'purchases', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
        comment: 'ID de la compra que originó este lote de stock'
      },
      bar_code: {
        allowNull: true, type: Sequelize.STRING(100),
        comment: 'Código de barra del lote: {product_id}-{purch_id}'
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
      deleted_at: { allowNull: true,  type: Sequelize.DATE }
    });

    // Safety net a nivel DB (MySQL 8.0.16+ las aplica; anteriores las ignoran)
    await queryInterface.sequelize.query(
      'ALTER TABLE product_stocks ADD CONSTRAINT chk_qty_non_negative CHECK (quantity >= 0)'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE product_stocks ADD CONSTRAINT chk_reserved_non_negative CHECK (reserved_quantity >= 0)'
    );

    // Índice único por lote+sucursal (NULLs no colisionan en MySQL)
    await queryInterface.addIndex('product_stocks', ['bar_code', 'branch_id'], {
      unique: true, name: 'product_stocks_barcode_branch_unique'
    });
    // Índice de búsqueda no-único por producto+sucursal (performance)
    await queryInterface.addIndex('product_stocks', ['product_id', 'branch_id'], {
      unique: false, name: 'product_stocks_product_branch_idx'
    });
    await queryInterface.addIndex('product_stocks', ['product_id']);
    await queryInterface.addIndex('product_stocks', ['branch_id']);
    await queryInterface.addIndex('product_stocks', ['quantity']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_stocks');
  }
};
```

### 2. Convertir migraciones intermedias en no-ops

Reemplazar el contenido de estas tres migraciones (ahora redundantes):

```js
'use strict';
module.exports = {
  async up() {},
  async down() {}
};
```

- `20260225000002-add-batch-ref-to-product-stocks.js`
- `20260226000001-add-purch-id-and-bar-code-to-product-stocks.js`
- `20260302100000-update-product-stocks-unique-index.js`

### 3. Modelo: agregar campo `reserved_quantity`

**`src/models/productStocks.js`** — agregar dentro de `productStocks.init({...})`:

```js
reserved_quantity: {
  type: DataTypes.DECIMAL(12, 3),
  allowNull: false,
  defaultValue: 0
}
```

Agregar `'reserved_quantity'` al array `attributes` en `src/services/productStocks.js` (línea ~3).

### 4. Cambiar lógica de `updateFromTransfer`

**`src/services/productStocks.js`**

#### Dispatch — ANTES decrementaba `quantity`, AHORA incrementa `reserved_quantity`

```js
if (action === 'dispatch') {
  const dispatchBarCode = detail.purch_id ? `${productId}-${detail.purch_id}` : null;
  const dispatchWhere = dispatchBarCode
    ? { bar_code: dispatchBarCode, branch_id: fromBranchId }
    : { product_id: productId, branch_id: fromBranchId };

  const originStock = await productStocks.findOne({
    where: dispatchWhere,
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  const qty = parseFloat(detail.qty);
  // quantity NO se toca — los artículos siguen físicamente en B
  originStock.reserved_quantity = parseFloat((parseFloat(originStock.reserved_quantity) + qty).toFixed(3));
  originStock.last_count_date = today;
  await originStock.save({ transaction });

  await stockMovements.create({
    product_id: productId,
    branch_id: fromBranchId,
    reference_type: 'transfer',
    reference_id: transferId,
    qty_change: -qty,
    notes: `Salida por transferencia #${transferId}`,
    created_by: userId
  }, { transaction });
}
```

#### Receive — AHORA también descuenta origen (quantity y reserved)

```js
if (action === 'receive') {
  const qtyReceived = parseFloat(detail.qty_received);
  const qtySent = parseFloat(detail.qty);

  // 1. Origen: artículos salieron físicamente de B
  const originBarCode = detail.purch_id ? `${productId}-${detail.purch_id}` : null;
  const originWhere = originBarCode
    ? { bar_code: originBarCode, branch_id: fromBranchId }
    : { product_id: productId, branch_id: fromBranchId };

  const originStock = await productStocks.findOne({
    where: originWhere,
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  if (originStock) {
    originStock.quantity          = parseFloat((parseFloat(originStock.quantity) - qtySent).toFixed(3));
    originStock.reserved_quantity = parseFloat((parseFloat(originStock.reserved_quantity) - qtySent).toFixed(3));
    originStock.last_count_date = today;
    await originStock.save({ transaction });
  }

  // 2. Destino: igual que antes
  if (qtyReceived > 0) {
    const receiveBarCode = detail.purch_id ? `${productId}-${detail.purch_id}` : null;
    const receiveWhere = receiveBarCode
      ? { bar_code: receiveBarCode, branch_id: toBranchId }
      : { product_id: productId, branch_id: toBranchId };

    const [destStock, created] = await productStocks.findOrCreate({
      where: receiveWhere,
      defaults: {
        product_id: productId,
        quantity: qtyReceived,
        min_stock: parseFloat((qtyReceived * 0.25).toFixed(3)),
        max_stock: parseFloat((qtyReceived * 1.5).toFixed(3)),
        purch_id: detail.purch_id || null,
        bar_code: receiveBarCode,
        last_count_date: today
      },
      transaction
    });

    if (!created) {
      destStock.quantity = parseFloat((parseFloat(destStock.quantity) + qtyReceived).toFixed(3));
      destStock.last_count_date = today;
      await destStock.save({ transaction });
    }

    await stockMovements.create({
      product_id: productId,
      branch_id: toBranchId,
      reference_type: 'transfer',
      reference_id: transferId,
      qty_change: qtyReceived,
      notes: `Entrada por transferencia #${transferId}`,
      created_by: userId
    }, { transaction });
  }
}
```

> **Nota:** El `stockMovement` de salida (qty_change: -qty) se crea en dispatch. En receive solo se crea el movement de entrada en destino. No se duplica.

### 5. Cambiar `revertFromTransfer` — liberar reserva, NO restaurar quantity

**`src/services/productStocks.js`**

`quantity` nunca fue decrementada en dispatch, por lo que el revert solo libera la reserva:

```js
// ANTES (incorrecto con el nuevo modelo):
// originStock.quantity += qty

// AHORA:
originStock.reserved_quantity = parseFloat((parseFloat(originStock.reserved_quantity) - qty).toFixed(3));
originStock.last_count_date = today;
await originStock.save({ transaction });
```

### 6. Validación de dispatch: usar `available`

**`src/services/transfers.js`** — en la verificación de stock (~línea 210):

```js
// ANTES:
if (!stock || parseFloat(stock.quantity) < parseFloat(detail.qty)) {

// DESPUÉS:
const available = parseFloat(stock.quantity) - parseFloat(stock.reserved_quantity);
if (!stock || available < parseFloat(detail.qty)) {
```

---

## Flujo completo post-implementación

```
Recibir compra:
  quantity += qty, reserved_quantity sin cambio

Dispatch transferencia:
  origin.reserved_quantity += qty    (quantity NO cambia — artículos aún en B)
  Validación: available = quantity - reserved_quantity >= qty_a_despachar

Receive transferencia:
  origin.quantity -= qty_sent        (artículos salieron físicamente)
  origin.reserved_quantity -= qty_sent
  destination.quantity += qty_received

Cancelar transferencia En_Transito:
  origin.reserved_quantity -= qty    (quantity nunca fue decrementada → solo liberar)
```

---

## Consideraciones

- **Seeders de test:** los registros no tienen `reserved_quantity` → `DEFAULT 0` los cubre automáticamente
- **CHECK constraints:** MySQL 8.0.16+ las aplica. En versiones anteriores actúan como documentación; la validación de la app es la defensa real
- **Ventas futuras:** SIEMPRE validar contra `available = quantity - reserved_quantity`, nunca contra `quantity` directamente
- **Tests afectados:** `22_transfers.test.js` test 23 (eliminar En_Transito con reversal de stock) — el comportamiento del revert cambia

---

## Verificación

1. `npm run db:reset` — crea tabla con schema final limpio
2. `npm test -- --testPathPattern="transfers"` — verificar que todos los tests pasan
3. `npm test` — suite completa
4. **Flujo manual:** recibir compra → dispatch → `quantity` no cambia, `reserved_quantity` sube → receive → `quantity` baja, `reserved_quantity` vuelve a 0
