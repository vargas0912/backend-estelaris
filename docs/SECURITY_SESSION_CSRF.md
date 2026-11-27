# Sesión solo con cookie y CSRF (V2)

La sesión del navegador viaja solo en la cookie HttpOnly `token`. Las peticiones
que modifican datos llevan además un token CSRF de doble cookie. Toda la
configuración se lee de variables de entorno en `src/config/security.js`.

## Variables

| Variable | Valores | Por defecto | Producción V2 |
| --- | --- | --- | --- |
| `AUTH_ALLOW_BEARER` | `true` / `false` | `true` | `false` |
| `CSRF_MODE` | `off` / `report` / `enforce` | `report` | `enforce` |
| `COOKIE_SAMESITE` | `none` / `lax` / `strict` | `none` | `lax` |
| `COOKIE_SECURE` | `true` / `false` | `true` | `true` |
| `COOKIE_DOMAIN` | dominio o vacío | vacío | vacío |
| `FRONTEND_URL` | orígenes separados por coma | vacío (sin CORS) | `https://mega-estelaris.cloud` |
| `TRUST_PROXY` | número de saltos | vacío | `1` (detrás de Nginx) |

Los valores por defecto son compatibles con el front actual, para que este cambio
se pueda desplegar antes que el front V2. En producción, el servidor avisa en el log
al arrancar mientras `AUTH_ALLOW_BEARER` siga activo o `CSRF_MODE` no sea `enforce`.

El dominio `mega-estelaris.cloud` es temporal. Al cambiarlo solo hay que actualizar
`FRONTEND_URL` aquí y `DOMAIN` en `deploy/nginx/site.env` del front.

## Cómo funciona

- **Login** (`POST /api/auth/login`): pone la cookie `token` (HttpOnly) y una cookie
  `XSRF-TOKEN` nueva. Con `AUTH_ALLOW_BEARER=false` el token no viaja en el cuerpo.
- **Refresh** (`POST /api/auth/refresh`): renueva la cookie; tampoco devuelve el token
  en el cuerpo con `AUTH_ALLOW_BEARER=false`.
- **Logout** (`POST /api/auth/logout`): borra las dos cookies.
- **`GET /api/auth/csrf`**: público; entrega o renueva la cookie `XSRF-TOKEN` (204).
- **Middleware CSRF** (`src/middlewares/csrf.js`): en POST, PUT, PATCH y DELETE bajo
  `/api` compara la cookie `XSRF-TOKEN` con el header `X-XSRF-TOKEN`. Si no coinciden:
  `report` lo registra y deja pasar; `enforce` responde `403 { "error": "CSRF_TOKEN_INVALID" }`.
  Las peticiones con `Authorization: Bearer` (cuando está permitido) no lo necesitan,
  porque no dependen de cookies.
- **`X-Branch-ID`**: `src/middlewares/branchScope.js` ya valida en cada petición que el
  usuario (no superadmin) tenga asignada esa sucursal y responde 403 si no.

## Orden de despliegue en el VPS

Producción corre en Docker detrás del Nginx del host, que manda `mega-estelaris.cloud/api/`
al backend (mismo origen que el front). `FRONTEND_URL` y `TRUST_PROXY=1` ya están puestos.

1. Mergear este PR (no cambia el comportamiento con los valores por defecto).
2. Mergear el PR #240 del front y poner `COOKIE_SAMESITE=lax`. Reiniciar.
3. Revisar el log. Mientras haya sesiones de la V1 abiertas (Bearer, sin CSRF) saldrán
   líneas `[csrf] petición sin token`; deben desaparecer cuando todos usen la V2.
4. `CSRF_MODE=enforce` y `AUTH_ALLOW_BEARER=false`. Reiniciar.

Para volver atrás en cualquier paso basta con regresar las variables y reiniciar.

## Tests

`src/tests/43_security_session_csrf.test.js` cubre el modo de producción V2
(cookie, CSRF, Bearer desactivado) y los modos `report` y `off`. El resto de la suite
usa Bearer, que sigue permitido por defecto en el ambiente de test.
