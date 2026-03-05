# Plan: Modulo de Ventas (Sales Module)

## Contexto

La tienda necesita un sistema de ventas que soporte venta de contado y a crédito (su negocio principal). Requiere control riguroso de saldos, plazos de pago, vigilancia de morosos, trazabilidad por lote de compra (bar_code), y seguimiento de entregas tipo DHL. Se migrará data existente al finalizar el proyecto.

## Analisis de los campos propuestos

### Header - Campos coherentes (se mantienen tal cual)
- `id`, `branch_id`, `customer_id`, `employee_id`, `user_id`, `sales_date`, `sales_total`, `invoice`, `sales_type`, `payment_periods`, `total_days_term`, `notes`

### Header - Campos a renombrar
- `saldo_pendiente` → **`due_payment`** (consistencia con el patron de `purchases.due_payment`)

### Header - Campos a AGREGAR
| Campo | Tipo | Por qué |
|-------|------|---------|
| `customer_address_id` | FK customerAddresses | **Requisito explícito**: la venta debe tener la dirección de entrega asociada |
| `subtotal` | DECIMAL(12,2) | Desglose financiero consistente con purchases |
| `discount_amount` | DECIMAL(12,2) | Descuento global del header (como purchases) |
| `tax_amount` | DECIMAL(12,2) | IVA calculado de las líneas |
| `due_date` | DATEONLY nullable | Calculado: `sales_date + total_days_term` (solo crédito). Esencial para detectar morosos |
| `price_list_id` | FK priceLists nullable | Registra qué lista de precios se usó |

### Header - Status ENUM
`('Pendiente', 'Pagado', 'Cancelado')`

### Detail - Campos coherentes
- `sale_id`, `product_id`, `qty`, `unit_price`, `purch_id`, `notes`

### Detail - Campos a AGREGAR
| Campo | Tipo | Por qué |
|-------|------|---------|
| `discount` | DECIMAL(5,2) | Descuento por línea (consistencia con purchaseDetails) |
| `tax_rate` | DECIMAL(5,2) default 16 | IVA por línea (consistencia con purchaseDetails) |
| `subtotal` | DECIMAL(12,2) | Subtotal calculado por línea |

### Tablas NUEVAS necesarias (el usuario no las mencionó pero son necesarias)
1. **`sale_payments`** - Cobros de venta (patrón idéntico a `purchasePayments` con `due_payment` + SELECT FOR UPDATE)
2. **`sale_installments`** - Calendario de cuotas generado automáticamente para ventas a crédito
3. **`sale_deliveries`** - Seguimiento de entrega con máquina de estados tipo DHL
4. **`sale_delivery_logs`** - Historial inmutable de cambios de estado (audit trail)

---

## Tablas - Diseño final

### 1. `sales` (paranoid: true)
```
id                  INT PK auto
branch_id           FK branches NOT NULL
customer_id         FK customers NOT NULL
customer_address_id FK customerAddresses NOT NULL
employee_id         FK employees NOT NULL (vendedor)
user_id             FK users NOT NULL (quien registra en sistema)
price_list_id       FK priceLists nullable
sales_date          DATEONLY NOT NULL
sales_type          ENUM('Contado','Credito') NOT NULL default 'Contado'
payment_periods     ENUM('Semanal','Quincenal','Mensual') nullable (solo crédito)
total_days_term     INT nullable (solo crédito)
invoice             STRING(50) nullable
subtotal            DECIMAL(12,2) NOT NULL
discount_amount     DECIMAL(12,2) default 0
tax_amount          DECIMAL(12,2) NOT NULL
sales_total         DECIMAL(12,2) NOT NULL
due_payment         DECIMAL(12,2) NOT NULL (crédito=sales_total, contado=0)
due_date            DATEONLY nullable (sales_date + total_days_term)
status              ENUM('Pendiente','Pagado','Cancelado') default 'Pendiente'
notes               TEXT nullable
created_at, updated_at, deleted_at
```
Índices: `branch_id`, `customer_id`, `status`, `due_date`, `employee_id`, `sales_date`

### 2. `sale_details` (paranoid: false - inmutable contable)
```
id            INT PK auto
sale_id       FK sales CASCADE NOT NULL
product_id    FK products RESTRICT NOT NULL (STRING 20)
qty           DECIMAL(12,3) NOT NULL
unit_price    DECIMAL(12,2) NOT NULL
discount      DECIMAL(5,2) default 0
tax_rate      DECIMAL(5,2) default 16
subtotal      DECIMAL(12,2) NOT NULL
purch_id      FK purchases nullable (trazabilidad de lote)
notes         TEXT nullable
created_at, updated_at (NO deleted_at)
```

### 3. `sale_payments` (paranoid: true)
```
id               INT PK auto
sale_id          FK sales RESTRICT NOT NULL
payment_amount   DECIMAL(12,2) NOT NULL
payment_date     DATEONLY NOT NULL
payment_method   ENUM('Efectivo','Transferencia','Vale despensa','Tarjeta') NOT NULL
reference_number STRING(100) nullable
user_id          FK users NOT NULL
notes            TEXT nullable
created_at, updated_at, deleted_at
```
Patrón idéntico a `purchasePayments`: SELECT FOR UPDATE en sale, decrementa `due_payment`, si llega a 0 → 'Pagado'. No hay PUT (eliminar y re-crear). Además, al crear pago se auto-aplica a las cuotas más antiguas pendientes.

### 4. `sale_installments` (paranoid: false - registro contable)
```
id                  INT PK auto
sale_id             FK sales CASCADE NOT NULL
installment_number  INT NOT NULL (1, 2, 3...)
due_date            DATEONLY NOT NULL
amount              DECIMAL(12,2) NOT NULL (monto esperado de la cuota)
paid_amount         DECIMAL(12,2) default 0 (cuanto se ha pagado de esta cuota)
status              ENUM('Pendiente','Pagado') default 'Pendiente'
paid_date           DATEONLY nullable (cuando se completó el pago)
created_at, updated_at (NO deleted_at)
```
Índices: `sale_id`, `(sale_id, installment_number)` UNIQUE

**Generación automática al crear venta a crédito:**
- Número de cuotas = `total_days_term / días_periodo` (Semanal=7, Quincenal=15, Mensual=30)
- Monto por cuota = `sales_total / num_cuotas` (última cuota absorbe redondeo)
- Fechas: `sales_date + (periodo * N)` para cada cuota N

**Aplicación de pagos a cuotas:**
- Al crear un `sale_payment`, se aplica automáticamente a la cuota más antigua con status 'Pendiente'
- Si el pago cubre más de una cuota, se encadenan
- `paid_amount` se acumula; cuando `paid_amount >= amount` → status = 'Pagado', `paid_date = hoy`

### 6. `sale_deliveries` (paranoid: true)
```
id                  INT PK auto
sale_id             FK sales RESTRICT NOT NULL
customer_address_id FK customerAddresses RESTRICT NOT NULL
status              ENUM('Preparando','Recolectado','En_Transito','En_Ruta_Entrega','Entregado','Devuelto') default 'Preparando'
driver_id           FK employees nullable
transport_plate     STRING(20) nullable
estimated_date      DATEONLY nullable
delivered_at        DATEONLY nullable
notes               TEXT nullable
created_at, updated_at, deleted_at
```

### 7. `sale_delivery_logs` (paranoid: false - inmutable, append-only)
```
id           INT PK auto
delivery_id  FK sale_deliveries NOT NULL
status       ENUM (mismo que deliveries)
location     TEXT nullable
notes        TEXT nullable
created_by   FK users NOT NULL
created_at   DATETIME (solo created_at, NO updated_at)
```

---

## Lógica de negocio clave

### createSale (transacción atómica)
1. Validar que customer, address (pertenece al customer), employee, branch existen
2. Calcular subtotales por línea, totales del header (patrón de `createPurchase`)
3. **Contado**: `due_payment = 0`, `status = 'Pagado'` (directo, sin registrar pago aparte)
4. **Crédito**: `due_payment = sales_total`, `due_date = sales_date + total_days_term`, `status = 'Pendiente'`
5. **SELECT FOR UPDATE** en `productStocks` por cada item (busca por `bar_code` si tiene `purch_id`)
6. Validar stock suficiente
7. Crear header + bulkCreate details
8. Decrementar stock + crear `stockMovements` (reference_type: 'sale', qty_change negativo)
9. **Solo crédito**: generar `sale_installments` automáticamente (num_cuotas = total_days_term / días_periodo)
10. Nota: `stock_movements` ya tiene 'sale' en el enum, NO se necesita migration adicional

### cancelSale
- Solo si no tiene deliveries activos (Recolectado/En_Transito/En_Ruta_Entrega)
- Solo si no tiene pagos activos (primero eliminar pagos)
- Revierte stock (stockMovement 'adjustment' positivo) + status = 'Cancelado'
- Elimina installments pendientes (si crédito)

### createSalePayment (solo crédito, transacción atómica)
1. Validar sale es pagable (not Cancelado, not Pagado)
2. SELECT FOR UPDATE en sale, validar amount <= due_payment
3. Crear payment, decrementar due_payment
4. **Auto-aplicar a cuotas**: buscar installments Pendiente ordenados por installment_number, distribuir el monto del pago entre cuotas (paid_amount += X, si paid_amount >= amount → 'Pagado')
5. Si due_payment llega a 0 → status = 'Pagado'

### Morosos (endpoint de consulta, no status almacenado)
`GET /api/sales/overdue` → ventas crédito donde `due_date < HOY` y status = 'Pendiente'
- Incluye: cuotas vencidas por cliente, días de atraso, monto total vencido

### Máquina de estados de entregas
```
Preparando → Recolectado → En_Transito → En_Ruta_Entrega → Entregado
                                                          ↗
Cualquier estado no-final ──────────────────────────→ Devuelto
```
Cada transición crea un `sale_delivery_log` inmutable.

---

## Archivos a crear/modificar

### Migraciones (6 archivos nuevos)
- `src/database/migrations/20260303000001-create-sales.js`
- `src/database/migrations/20260303000002-create-sale-details.js`
- `src/database/migrations/20260303000003-create-sale-payments.js`
- `src/database/migrations/20260303000004-create-sale-installments.js`
- `src/database/migrations/20260303000005-create-sale-deliveries.js`
- `src/database/migrations/20260303000006-create-sale-delivery-logs.js`

### Modelos (6 archivos nuevos + 5 existentes a modificar)
- `src/models/sales.js` (nuevo)
- `src/models/saleDetails.js` (nuevo)
- `src/models/salePayments.js` (nuevo)
- `src/models/saleInstallments.js` (nuevo)
- `src/models/saleDeliveries.js` (nuevo)
- `src/models/saleDeliveryLogs.js` (nuevo)
- Agregar asociaciones en: `customers.js`, `customerAddresses.js`, `employees.js`, `purchases.js`, `priceLists.js`

### Constants (3 nuevos + 1 a modificar)
- `src/constants/modules.js` (agregar SALE, SALE_PAYMENT, SALE_DELIVERY)
- `src/constants/sales.js` (nuevo - mensajes de validación)
- `src/constants/salePayments.js` (nuevo)
- `src/constants/saleDeliveries.js` (nuevo)

### Services (3 nuevos)
- `src/services/sales.js` — Patrón base: `createPurchase` + `updateFromTransfer('dispatch')` para stock + generación de installments
- `src/services/salePayments.js` — Patrón de `purchasePayments.js` + auto-aplicación a cuotas
- `src/services/saleDeliveries.js` — Máquina de estados genérica con `transitionDelivery()`

### Controllers + Validators + Routes (3 de cada uno = 9 archivos nuevos)
- `src/validators/sales.js`, `src/controllers/sales.js`, `src/routes/sales.js`
- `src/validators/salePayments.js`, `src/controllers/salePayments.js`, `src/routes/sale-payments.js`
- `src/validators/saleDeliveries.js`, `src/controllers/saleDeliveries.js`, `src/routes/sale-deliveries.js`

### Endpoints resultantes
```
# Ventas
GET    /api/sales                        (branchScope)
GET    /api/sales/customer/:customer_id
GET    /api/sales/branch/:branch_id      (branchScope)
GET    /api/sales/overdue                (morosos: cuotas vencidas, días atraso, totales)
GET    /api/sales/:id                    (incluye details, installments, customer, address)
POST   /api/sales                        (branchScope, genera installments si crédito)
PUT    /api/sales/:id                    (solo invoice, notes)
PUT    /api/sales/:id/cancel
DELETE /api/sales/:id                    (solo Pendiente sin pagos)

# Cobros de Venta (solo crédito)
GET    /api/sale-payments
GET    /api/sale-payments/sale/:sale_id
GET    /api/sale-payments/:id
POST   /api/sale-payments                (auto-aplica a cuotas pendientes)
DELETE /api/sale-payments/:id            (revierte cuotas afectadas)

# Entregas (1 activa por venta)
GET    /api/sale-deliveries/sale/:sale_id
GET    /api/sale-deliveries/:id          (incluye logs de tracking)
POST   /api/sale-deliveries
PATCH  /api/sale-deliveries/:id/pickup
PATCH  /api/sale-deliveries/:id/ship
PATCH  /api/sale-deliveries/:id/out
PATCH  /api/sale-deliveries/:id/deliver
PATCH  /api/sale-deliveries/:id/return
DELETE /api/sale-deliveries/:id
```

### Seeders
- Modificar `src/database/seeders/json_files/privileges.js` (agregar privilegios de ventas)

### Tests (6 archivos nuevos)
- `src/tests/helper/salesData.js`, `src/tests/23_sales.test.js` (incluye tests de installments generados)
- `src/tests/helper/salePaymentsData.js`, `src/tests/24_sale_payments.test.js` (incluye verificación de cuotas)
- `src/tests/helper/saleDeliveriesData.js`, `src/tests/25_sale_deliveries.test.js`

---

## Orden de implementación

1. Constants (modules.js + 3 archivos de mensajes)
2. Migraciones (6 archivos, orden de FK)
3. Modelos (6 nuevos + actualizar asociaciones en 5 existentes)
4. Services (sales → salePayments → saleDeliveries)
5. Validators + Controllers + Routes (por cada sub-módulo)
6. Seeders de privilegios
7. Tests

## Verificación
```bash
npm run db:reset          # Resetea BD con nuevas migrations
npm test                  # Corre toda la suite (debe pasar existentes + nuevos)
```
