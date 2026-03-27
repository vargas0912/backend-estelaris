# Plan: Tickets de Venta por Sucursal

## Contexto

Se requiere un sistema de numeración automática de tickets por cada venta, donde cada sucursal mantiene su propio identificador en el número. El objetivo inmediato es que cada venta genere un ticket único e imprimible para el cliente.

El objetivo a mediano plazo es habilitar **facturación bajo demanda**: el cliente proporciona su ticket + fecha de compra + datos fiscales para generar una factura. El campo `invoice` existente en `sales` se preserva intacto para almacenar el número de factura fiscal (SAT) cuando eso se implemente.

---

## Formato del Ticket

```
{PREFIX}-{YY}-{SALE_ID}
```

| Segmento | Descripción | Ejemplo |
|---|---|---|
| `PREFIX` | Código corto de la sucursal (configurable) | `MTY`, `GDL`, `001` |
| `YY` | Año de la venta, 2 dígitos | `26` |
| `SALE_ID` | ID de la venta con zero-padding a 6 dígitos | `001042` |

**Ejemplos:** `MTY-26-001042`, `GDL-26-000099`, `001-26-000003`

El `PREFIX` se toma de `branches.ticket_prefix` (nuevo campo configurable). Si no está configurado, se usa el `branch_id` con padding de 3 dígitos (`001`, `002`...).

---

## Cambios en Base de Datos

### Tabla `branches` — nuevo campo

| Campo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `ticket_prefix` | VARCHAR(5) | Sí | Código corto de la sucursal para el ticket (ej. `MTY`) |

### Tabla `sales` — nuevo campo

| Campo | Tipo | Nulo | Descripción |
|---|---|---|---|
| `ticket` | VARCHAR(20) | Sí* | Número de ticket generado automáticamente |

*Nulo sólo para registros anteriores a este feature. Toda venta nueva tendrá ticket.

**Índices nuevos:**
- `UNIQUE` en `sales.ticket`
- Compuesto en `(branch_id, ticket)` para búsquedas por sucursal

---

## Comportamiento

### Generación automática
El ticket se genera en el momento de crear la venta (`POST /api/sales`). No es editable por el usuario.

### Flujo interno
1. Se crea el registro de venta → el DB asigna `sale.id` (autoincrement)
2. Se calcula el ticket: `{prefix}-{yy}-{sale_id_padded}`
3. Se actualiza el registro con el ticket dentro del mismo transaction

### Unicidad
- El `sale.id` es autoincrement global → el ticket es siempre único sin contadores adicionales
- El índice UNIQUE en `ticket` garantiza integridad a nivel de BD

### Ventas canceladas
Los IDs de ventas canceladas no se reutilizan (autoincrement), por lo tanto sus tickets tampoco.

---

## Endpoints afectados

| Endpoint | Cambio |
|---|---|
| `POST /api/sales` | Respuesta incluye campo `ticket` generado |
| `GET /api/sales` | Respuesta incluye `ticket` en cada venta |
| `GET /api/sales/:id` | Respuesta incluye `ticket` |
| `GET /api/sales/customer/:id` | Respuesta incluye `ticket` |
| `GET /api/sales/branch/:id` | Respuesta incluye `ticket` |
| `PUT /api/sales/:id` | `ticket` NO es editable (solo `invoice` y `notes`) |

---

## Configuración del Prefix por Sucursal

Para configurar el prefix de una sucursal, se usa el endpoint de actualización de sucursales (`PUT /api/branches/:id`) con el campo `ticket_prefix`.

```json
{ "ticket_prefix": "MTY" }
```

Reglas:
- Máximo 5 caracteres alfanuméricos
- Se almacena en mayúsculas
- Si no se configura, el sistema usa el ID de la sucursal con padding (`001`)

---

## Flujo Futuro: Facturación Bajo Demanda

```
Cliente llama con: ticket MTY-26-001042 + fecha 2026-03-15 + RFC XAXX010101000
    ↓
Sistema busca: sales WHERE ticket = 'MTY-26-001042' AND sales_date = '2026-03-15'
    ↓
Muestra al agente: detalle de la venta, productos, totales
    ↓
Agente genera factura con datos fiscales del cliente
    ↓
Número de factura SAT se guarda en: sales.invoice (campo ya existente)
```

---

## Consideraciones para Frontend

- El campo `ticket` viene en **todas las respuestas de GET /sales*** desde la implementación
- El `ticket` es de **solo lectura** — no enviarlo en PUT requests
- El campo `invoice` sigue siendo editable vía PUT (para captura manual de número de factura hasta que se automatice)
- Para mostrar en tickets impresos/PDF: usar `ticket` como folio de referencia visible al cliente
- Para la búsqueda de venta en futura facturación: usar `ticket` + `sales_date` como criterios
