# Paginación en Endpoints de Clientes

## Descripción

Los endpoints de listado de clientes soportan paginación mediante query parameters `page` y `limit`. Esto permite al frontend cargar datos en páginas en lugar de traer todos los registros de una sola vez.

---

## Endpoints paginados

### `GET /api/customers`
Lista todos los clientes.

**Query params:**

| Parámetro | Tipo    | Default | Máximo | Descripción             |
|-----------|---------|---------|--------|-------------------------|
| `page`    | integer | `1`     | —      | Número de página        |
| `limit`   | integer | `20`    | `100`  | Registros por página    |

**Ejemplo de request:**
```
GET /api/customers?page=2&limit=20
```

**Respuesta:**
```json
{
  "customers": [ ... ],
  "pagination": {
    "total": 5000,
    "page": 2,
    "limit": 20,
    "totalPages": 250
  }
}
```

---

### `GET /api/customers/branch/:branchId`
Clientes de una sucursal específica, con paginación.

**Ejemplo:**
```
GET /api/customers/branch/1?page=1&limit=10
```

---

### `GET /api/customers/municipality/:municipalityId`
Clientes de un municipio específico, con paginación.

**Ejemplo:**
```
GET /api/customers/municipality/5?page=1&limit=10
```

---

## Objeto `pagination`

Todos los endpoints de listado incluyen el objeto `pagination` en la respuesta:

```json
{
  "total": 5000,       // Total de registros que coinciden con el filtro
  "page": 1,           // Página actual
  "limit": 20,         // Registros por página
  "totalPages": 250    // Total de páginas disponibles
}
```

## Notas

- Sin parámetros, se devuelve la primera página con 20 registros por defecto.
- El parámetro `limit` tiene un máximo de 100 para evitar cargas excesivas.
- Un `limit=101` o mayor retornará un error `400`.
