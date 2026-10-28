# Ticket Configs — Spec para frontend

Configuración de los datos que muestran los tickets de **venta** (`sale`) y de **abono/liquidación** (`payment`).
El backend **no renderiza** el ticket: solo entrega la configuración. El frontend dibuja e imprime (impresora térmica).

Base URL: `/api/ticket-configs` · Auth: `Authorization: Bearer <token>`

## Modelo

La configuración es **global** hoy (una fila por tipo). El esquema ya soporta configuración por sucursal (`branch_id`), pero no hay endpoint para crearla todavía.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer \| null | `null` solo si el backend devuelve los valores por defecto del código |
| `branch_id` | integer \| null | `null` = global |
| `type` | `"sale"` \| `"payment"` | Tipo de ticket |
| `title` | string(100) \| null | Título del ticket |
| `header_text` | string(255) \| null | Texto bajo el encabezado |
| `footer_text` | string(255) \| null | Leyenda final |
| `show_logo` | boolean | Mostrar `company.logo_url` |
| `show_iva` | boolean | Mostrar desglose de IVA |
| `show_barcode` | boolean | Mostrar código de barras (del folio) |
| `show_folio` | boolean | Mostrar folio/ticket |
| `show_cashier` | boolean | Mostrar cajero |
| `show_branch_address` | boolean | Mostrar dirección de la sucursal |
| `paper_width` | `"58mm"` \| `"80mm"` | Ancho del papel térmico |

Valores iniciales: `sale` → título `TICKET DE VENTA`, leyenda `¡Gracias por su compra!`; `payment` → título `COMPROBANTE DE ABONO`, leyenda `Conserve este comprobante`. Todos los `show_*` en `true`, `paper_width` `80mm`.

## Privilegios

| Privilegio | Uso |
|---|---|
| `view_ticket_configs` | `GET /` y `GET /resolve`. **Debe asignarse a los cajeros**, porque `resolve` lo exige para imprimir |
| `update_ticket_config` | `PUT /:type`. Además requiere rol `admin` |

`superadmin` no necesita privilegios.

## Endpoints

### `GET /api/ticket-configs/resolve?type=sale|payment` — usar al imprimir

Devuelve la configuración efectiva más los datos de empresa. **Es el único endpoint que el flujo de impresión necesita.**

- Header `X-Branch-ID`: obligatorio para usuarios no superadmin (igual que el resto de la API). Hoy no cambia el resultado; queda listo para configuración por sucursal.

```json
{
  "config": {
    "id": 1, "branch_id": null, "type": "sale",
    "title": "TICKET DE VENTA", "header_text": null,
    "footer_text": "¡Gracias por su compra!",
    "show_logo": true, "show_iva": true, "show_barcode": true,
    "show_folio": true, "show_cashier": true, "show_branch_address": true,
    "paper_width": "80mm",
    "created_at": "...", "updated_at": "..."
  },
  "company": {
    "company_name": "Estelaris S.A. de C.V.", "trade_name": null,
    "rfc": "EST000000AAA", "fiscal_address": "Av. Ejemplo 123, Col. Centro",
    "zip_code": "06000", "phone": "5512345678",
    "logo_url": null, "website": "https://estelaris.com"
  }
}
```

Notas:
- `company.logo_url` puede ser `null`: si `show_logo` es `true` pero no hay logo, omitir la imagen sin error.
- `company` incluye más campos fiscales (`fiscal_regime`, `fiscal_email`, etc.); usar solo los que el ticket necesite.
- Errores: `400` si `type` es inválido, `401` sin token, `403` sin privilegio o sin acceso a la sucursal.

### `GET /api/ticket-configs` — pantalla de administración

Lista las configuraciones globales. Requiere `view_ticket_configs`.

```json
{ "configs": [ { "...": "sale" }, { "...": "payment" } ] }
```

### `PUT /api/ticket-configs/:type` — guardar cambios

`:type` = `sale` | `payment`. Actualización **parcial**: enviar solo los campos que cambian; los demás se conservan.

```json
{ "footer_text": "Gracias, vuelva pronto", "show_iva": false, "paper_width": "58mm" }
```

Respuesta `200`: `{ "config": { ...configuración completa... } }` (puede incluir `deleted_at: null`; ignorarlo).

Validaciones (`400`):

| Caso | Respuesta |
|---|---|
| `type` distinto de `sale`/`payment` | `{ errors: [{ msg: "El tipo de ticket debe ser sale o payment", path: "type" }] }` |
| `paper_width` distinto de `58mm`/`80mm` | `{ errors: [{ msg: "El ancho de papel debe ser 58mm o 80mm", ... }] }` |
| `show_*` que no sea booleano estricto (`"true"` o `1` se rechazan) | `{ errors: [{ msg: "El valor debe ser booleano", ... }] }` |
| `title` > 100, `header_text`/`footer_text` > 255 caracteres | `{ errors: [...] }` |
| Body sin campos editables | `{ error: "Debe enviar al menos un campo a actualizar" }` |

Para borrar un texto, enviar `null` (por ejemplo `"header_text": null`). `401` sin token, `403` sin rol/privilegio.

## Guía de uso

- **Imprimir:** llamar `GET /resolve?type=sale` (o `payment`) antes de renderizar. Puede cachearse por sesión y refrescarse al abrir caja o tras guardar cambios.
- **Papel térmico:** `paper_width` define el ancho del layout (58 mm o 80 mm). El backend no genera PDF ni comandos ESC/POS.
- **Código de barras:** el valor a codificar es el folio de la venta (`sales.ticket`); esta configuración solo controla si se muestra.
- **Reimpresión:** un ticket reimpreso usa la configuración **actual**, no la vigente al momento de la venta. El backend no guarda snapshot por ahora.
- **Pantalla de administración:** `GET /` para cargar los dos tipos, `PUT /:type` para guardar. Mostrarla solo a quien tenga `update_ticket_config`.

Swagger: `http://localhost:3000/documentation` (tag `ticket-configs`).
