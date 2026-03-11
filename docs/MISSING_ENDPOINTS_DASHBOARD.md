# Missing Endpoints — Dashboard

Estos endpoints no existen aún en el backend. El dashboard actual funciona cargando datos raw y computando en frontend, lo cual es ineficiente con volumen alto.

---

## 1. `GET /sales?from=YYYY-MM-DD&to=YYYY-MM-DD`

**Problema actual:** El frontend carga TODAS las ventas (`GET /sales`) y filtra por mes/día en memoria.

**Impacto:** Con miles de registros esto es un problema serio de performance y payload.

**Solución:** Agregar parámetros de query para filtrar por rango de fechas en SQL.

```
GET /sales?from=2026-03-01&to=2026-03-31
Response: { sales: Sale[] }
```

---

## 2. `GET /kpis/dashboard`

**Problema actual:** Cada KPI se calcula en el frontend con reduce/filter sobre arrays completos.

**Solución:** Un endpoint dedicado que calcule en SQL (órdenes de magnitud más eficiente).

```
GET /kpis/dashboard
Response:
{
  ventas_mes: number,
  ventas_hoy_count: number,
  ventas_hoy_total: number,
  cartera_vencida: number,
  clientes_activos: number
}
```

---

## 3. `GET /sale-details/top-products?limit=10`

**Problema actual:** Los detalles de venta solo están disponibles en `GET /sales/:id` (un request por venta). Construir el ranking de "Productos más vendidos" requeriría N+1 requests.

**Solución:** Endpoint que agregue en SQL y devuelva top N productos por cantidad vendida.

```
GET /sale-details/top-products?limit=10
Response:
{
  products: [
    { product_id: string, name: string, total_qty: number, total_revenue: number }
  ]
}
```

---

## 4. Privilege `view_dashboard`

**Requerimiento crítico:** El privilege `view_dashboard` debe existir en la tabla `privileges` y ser asignado a todos los usuarios con rol `admin` por defecto.

**Riesgo sin esto:** El `withPrivileges` HOC redirige a `/app` cuando el usuario no tiene el privilege. Si la ruta `/app` ES el dashboard, esto crea un loop infinito de redirects.

**SQL para agregar el privilege:**
```sql
-- 1. Crear el privilege si no existe
INSERT INTO privileges (codename, name, description)
VALUES ('view_dashboard', 'Ver Dashboard', 'Acceso al escritorio ejecutivo')
ON CONFLICT (codename) DO NOTHING;

-- 2. Asignarlo a todos los admins existentes
INSERT INTO user_privileges (user_id, privilege_id)
SELECT u.id, p.id
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN privileges p ON p.codename = 'view_dashboard'
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;
```
