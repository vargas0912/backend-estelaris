# Plan: Sistema de Puntos de Lealtad (Loyalty Points)

## Contexto

Los clientes deben poder acumular puntos con cada compra y canjearlos como descuento en futuras ventas. El sistema es altamente configurable: tasa de acumulación, valor de canje, límites de uso por venta, vencimiento de puntos y scope por sucursal. Cada movimiento de puntos queda registrado en una bitácora inmutable.

---

## Archivos a crear / modificar

| Archivo | Tipo de cambio |
|---------|----------------|
| `src/database/migrations/20260331000000-create-loyalty-configs.js` | Nueva tabla |
| `src/database/migrations/20260331000001-create-customer-points.js` | Nueva tabla |
| `src/database/migrations/20260331000002-create-point-transactions.js` | Nueva tabla |
| `src/database/migrations/20260331000003-add-points-fields-to-sales.js` | Columnas adicionales |
| `src/models/loyaltyConfig.js` | Nuevo modelo |
| `src/models/customerPoints.js` | Nuevo modelo |
| `src/models/pointTransactions.js` | Nuevo modelo |
| `src/models/sales.js` | 3 campos nuevos |
| `src/models/customers.js` | Asociación con customerPoints y pointTransactions |
| `src/services/loyaltyPoints.js` | Servicio completo (earn / redeem / void / expire) |
| `src/controllers/loyaltyPoints.js` | Endpoints HTTP |
| `src/routes/loyaltyPoints.js` | Rutas (auto-mounted en `/api/loyaltyPoints`) |
| `src/validators/loyaltyPoints.js` | Validaciones de entrada |
| `src/constants/loyaltyPoints.js` | Mensajes de error |
| `src/constants/privileges.js` | Privilegios del módulo |
| `src/services/sales.js` | Integración earn/redeem al crear/pagar/cancelar ventas |
| `src/validators/sales.js` | Campos `points_redeemed` en POST /sales |

---

## Esquema de Base de Datos

### 1. `loyalty_configs`

Configuración del programa de puntos. Una fila por sucursal; si `branch_id` es `null`, aplica como configuración global (fallback).

```
id                    INT PK AUTO_INCREMENT
branch_id             INT FK branches nullable        -- null = config global
is_active             BOOLEAN NOT NULL DEFAULT true

-- Acumulación
points_per_peso       DECIMAL(10,4) NOT NULL DEFAULT 0.1
                      -- Puntos que se ganan por cada $1 de compra
                      -- Ejemplo: 0.1 = 1 punto por cada $10 gastados
earn_on_tax           BOOLEAN NOT NULL DEFAULT false  -- ¿puntos sobre IVA?
earn_on_discount      BOOLEAN NOT NULL DEFAULT false  -- ¿sobre precio antes del descuento?
earn_on_credit        BOOLEAN NOT NULL DEFAULT true   -- ¿ventas a crédito generan puntos?
earn_on_credit_when   ENUM('sale','paid') DEFAULT 'paid'
                      -- 'sale'  → puntos al crear la venta
                      -- 'paid'  → puntos al liquidar la venta por completo

-- Canje
peso_per_point        DECIMAL(12,2) NOT NULL DEFAULT 0.10
                      -- Valor monetario de 1 punto al canjear ($MXN)
                      -- Ejemplo: 0.10 = 1 punto vale $0.10
min_points_redeem     INT NOT NULL DEFAULT 100        -- mínimo de puntos para poder canjear
max_redeem_pct        DECIMAL(5,2) NOT NULL DEFAULT 20.00
                      -- % máximo del total de la venta pagable con puntos
max_redeem_points     INT nullable                    -- límite absoluto por venta (null = sin límite)

-- Vencimiento
points_expiry_days    INT nullable                    -- días hasta que vencen los puntos (null = nunca)

-- Redondeo de puntos calculados
rounding_strategy     ENUM('floor','round','ceil') NOT NULL DEFAULT 'floor'

timestamps, paranoid
```

**Índices:** `branch_id`, `is_active`

---

### 2. `customer_points`

Una fila por cliente. Actúa como "cuenta corriente" de puntos.

```
id              INT PK AUTO_INCREMENT
customer_id     INT FK customers UNIQUE NOT NULL
total_points    DECIMAL(12,2) NOT NULL DEFAULT 0   -- saldo actual disponible
lifetime_points DECIMAL(12,2) NOT NULL DEFAULT 0   -- puntos acumulados históricos (nunca baja)
updated_at      DATETIME
```

---

### 3. `point_transactions`

Bitácora inmutable de cada movimiento de puntos (paranoid: true para audit trail).

```
id              INT PK AUTO_INCREMENT
customer_id     INT FK customers NOT NULL
type            ENUM('earn','redeem','expire','adjust','void') NOT NULL
points          DECIMAL(12,2) NOT NULL
                -- positivo: ingreso de puntos (earn, adjust+)
                -- negativo: egreso de puntos (redeem, expire, void)
balance_after   DECIMAL(12,2) NOT NULL              -- snapshot del saldo tras el movimiento
reference_type  ENUM('sale','payment','admin','expiry') NOT NULL
reference_id    INT nullable                         -- sale_id o payment_id
expires_at      DATETIME nullable                    -- cuándo vencen estos puntos (solo en 'earn')
user_id         INT FK users NOT NULL                -- quién procesó
notes           TEXT nullable
timestamps, paranoid
```

**Índices:** `customer_id`, `type`, `reference_type`, `expires_at`

---

### 4. Columnas nuevas en `sales`

```sql
points_redeemed   DECIMAL(12,2) NOT NULL DEFAULT 0
  -- Puntos canjeados al crear esta venta
points_discount   DECIMAL(12,2) NOT NULL DEFAULT 0
  -- Valor monetario de los puntos canjeados ($MXN), resta del total a pagar
points_earned     DECIMAL(12,2) NOT NULL DEFAULT 0
  -- Puntos generados por esta venta (0 hasta que se acrediten)
```

`points_discount` afecta `due_payment` igual que `anticipo_amount` pero sin generar un `salePayment` separado; el descuento ya está reflejado en el `sales_total` reducido.

---

## Flujos de negocio

### Crear venta con canje de puntos (`POST /api/sales`)

```
1. Recibir points_redeemed (opcional, default 0)
2. Si points_redeemed > 0:
   a. Obtener loyalty_config vigente para el branch
   b. Validar que el cliente tenga saldo >= points_redeemed
   c. Validar points_redeemed >= min_points_redeem
   d. Calcular points_discount = points_redeemed × peso_per_point
   e. Validar points_discount ≤ (sales_total × max_redeem_pct / 100)
   f. Validar points_redeemed ≤ max_redeem_points (si aplica)
   g. Ajustar due_payment: due_payment -= points_discount
3. Crear la venta con points_redeemed y points_discount guardados
4. Si points_redeemed > 0:
   → Crear point_transaction(type='redeem', points=-N, reference_type='sale')
   → Decrementar customer_points.total_points
5. Calcular puntos a ganar según loyalty_config:
   base = subtotal [±tax_amount según earn_on_tax] [±discount_amount según earn_on_discount]
   points_earned = round(base × points_per_peso, rounding_strategy)
6. Si earn_on_credit_when='sale' (o venta de contado):
   → Acreditar puntos earned inmediatamente
   → Crear point_transaction(type='earn', expires_at=now+expiry_days)
   → Incrementar customer_points (total_points y lifetime_points)
   → Guardar points_earned en sales
```

### Pago de venta a crédito (`POST /api/salePayments`)

```
Si sale.earn_on_credit_when = 'paid' Y due_payment llega a 0 tras el pago:
  → Acreditar sale.points_earned al cliente
  → Crear point_transaction(type='earn', reference_type='payment', reference_id=payment.id)
  → Incrementar customer_points
```

### Cancelación de venta (`PUT /api/sales/:id/cancel`)

```
Si points_redeemed > 0:
  → Crear point_transaction(type='void', points=+points_redeemed, reference_type='sale')
  → Devolver puntos a customer_points.total_points
Si points_earned > 0 y ya fueron acreditados:
  → Crear point_transaction(type='void', points=-points_earned, reference_type='sale')
  → Decrementar customer_points.total_points (y lifetime_points)
```

### Expiración de puntos (job manual o futuro cron)

```
GET /api/loyaltyPoints/expire  [solo superadmin]
  → Buscar point_transactions tipo 'earn' con expires_at <= NOW y no vencidas
  → Para cada una, calcular cuántos puntos siguen vigentes
  → Crear point_transaction(type='expire', points=-N, reference_type='expiry')
  → Decrementar customer_points.total_points
```

---

## Endpoints del módulo

### Configuración

| Método | Ruta | Descripción | Privilegio |
|--------|------|-------------|------------|
| `GET` | `/api/loyaltyPoints/config` | Obtener config vigente (global o por branch) | `view_loyalty_config` |
| `POST` | `/api/loyaltyPoints/config` | Crear configuración | `create_loyalty_config` |
| `PUT` | `/api/loyaltyPoints/config/:id` | Actualizar configuración | `edit_loyalty_config` |

### Puntos de clientes

| Método | Ruta | Descripción | Privilegio |
|--------|------|-------------|------------|
| `GET` | `/api/loyaltyPoints/customer/:customerId` | Saldo y resumen de un cliente | `view_loyalty_points` |
| `GET` | `/api/loyaltyPoints/customer/:customerId/transactions` | Historial de transacciones | `view_loyalty_points` |
| `POST` | `/api/loyaltyPoints/customer/:customerId/adjust` | Ajuste manual de puntos | `adjust_loyalty_points` |
| `POST` | `/api/loyaltyPoints/expire` | Procesar vencimientos | superadmin |

---

## Integración con `POST /api/sales`

Nuevo campo opcional en el request body:

```json
{
  "points_redeemed": 200
}
```

La respuesta del sale incluirá los nuevos campos:

```json
{
  "id": 123,
  "sales_total": 1000.00,
  "points_redeemed": 200,
  "points_discount": 20.00,
  "points_earned": 98,
  "due_payment": 780.00
}
```

### Cálculo de `due_payment` con puntos

```
due_payment = sales_total - anticipo_amount - points_discount
```

---

## Tabla de comportamiento — canje de puntos

| Escenario | Válido | Resultado |
|-----------|--------|-----------|
| `points_redeemed=0` | ✓ | Sin cambios, sin descuento |
| `points_redeemed=200`, saldo=500, min=100 | ✓ | `points_discount = 200 × peso_per_point` |
| `points_redeemed=50`, min=100 | ✗ | Error `POINTS_BELOW_MINIMUM` |
| `points_redeemed=600`, saldo=500 | ✗ | Error `INSUFFICIENT_POINTS` |
| `points_discount > sales_total × max_redeem_pct%` | ✗ | Error `POINTS_EXCEED_MAX_DISCOUNT` |

---

## Tabla de comportamiento — acumulación en crédito

| `earn_on_credit` | `earn_on_credit_when` | Cuándo se acreditan |
|------------------|-----------------------|---------------------|
| `false` | — | Nunca para ventas a crédito |
| `true` | `'sale'` | Al crear la venta (optimista) |
| `true` | `'paid'` | Al liquidar el saldo completamente (conservador) |

---

## Constantes de error

```js
// src/constants/loyaltyPoints.js
LOYALTY_CONFIG_NOT_FOUND:      'LOYALTY_CONFIG_NOT_FOUND'
LOYALTY_CONFIG_INACTIVE:       'LOYALTY_CONFIG_INACTIVE'
INSUFFICIENT_POINTS:           'INSUFFICIENT_POINTS'
POINTS_BELOW_MINIMUM:          'POINTS_BELOW_MINIMUM'
POINTS_EXCEED_MAX_DISCOUNT:    'POINTS_EXCEED_MAX_DISCOUNT'
POINTS_EXCEED_MAX_LIMIT:       'POINTS_EXCEED_MAX_LIMIT'
CUSTOMER_POINTS_NOT_FOUND:     'CUSTOMER_POINTS_NOT_FOUND'
INVALID_ADJUST_AMOUNT:         'INVALID_ADJUST_AMOUNT'
ADJUST_WOULD_NEGATIVE_BALANCE: 'ADJUST_WOULD_NEGATIVE_BALANCE'
```

---

## Verificación

1. `npm test` — tests existentes de sales deben pasar sin cambios
2. Crear loyalty_config global → `GET /api/loyaltyPoints/config` debe devolverla
3. `POST /api/sales` con `points_redeemed: 100`:
   - `points_discount` = 100 × `peso_per_point`
   - `due_payment` = `sales_total - anticipo - points_discount`
   - Existe `point_transaction` tipo `redeem` para el cliente
   - `customer_points.total_points` decrementó
4. Si `earn_on_credit_when='sale'`: tras la venta el cliente tiene puntos acreditados
5. Si `earn_on_credit_when='paid'`: puntos aparecen solo al liquidar el saldo
6. Cancelar venta con puntos canjeados → puntos devueltos al cliente
7. Cancelar venta con puntos ganados ya acreditados → puntos retirados del cliente
