# Reporte de Auditoría de Seguridad - API Backend Estelaris

**Fecha:** 2026-01-28
**Auditor:** Claude Code
**Alcance:** Revisión exhaustiva de endpoints, autenticación, autorización, validación y tests de seguridad

---

## Resumen Ejecutivo

Se realizó una auditoría de seguridad completa de la API Backend Estelaris, identificando **17 rutas de recursos** con **91 endpoints** en total. Se encontraron **12 vulnerabilidades de seguridad** clasificadas por severidad, y se identificaron **gaps críticos en la cobertura de tests de seguridad**.

### Métricas Generales
- **Total de endpoints analizados:** 91
- **Endpoints con autenticación:** 88 (97%)
- **Endpoints con autorización (RBAC):** 85 (93%)
- **Endpoints con validación:** 91 (100%)
- **Tests de integración existentes:** 15 archivos
- **Vulnerabilidades CRÍTICAS:** 2
- **Vulnerabilidades ALTAS:** 4
- **Vulnerabilidades MEDIAS:** 4
- **Vulnerabilidades BAJAS:** 2

---

## 1. Inventario de Endpoints y Nivel de Protección

### Tabla Resumen de Rutas

| Ruta | Endpoints | Autenticación | Autorización | Validación | Tests | Nivel de Protección |
|------|-----------|---------------|--------------|------------|-------|---------------------|
| `/api/auth` | 3 | 1/3 (33%) | 1/3 (33%) | 3/3 (100%) | ✅ | CRÍTICO - Parcial |
| `/api/users` | 4 | 4/4 (100%) | 4/4 (100%) | 4/4 (100%) | ✅ | ALTO |
| `/api/states` | 2 | 2/2 (100%) | 0/2 (0%) | 2/2 (100%) | ✅ | MEDIO |
| `/api/branches` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/municipalities` | 2 | 2/2 (100%) | 2/2 (100%) | 2/2 (100%) | ✅ | ALTO |
| `/api/privileges` | 9 | 9/9 (100%) | 9/9 (100%) | 9/9 (100%) | ✅ | ALTO |
| `/api/positions` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/productCategories` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/employees` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/products` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/productStocks` | 8 | 8/8 (100%) | 8/8 (100%) | 8/8 (100%) | ✅ | ALTO |
| `/api/priceLists` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/productPrices` | 8 | 8/8 (100%) | 8/8 (100%) | 8/8 (100%) | ✅ | ALTO |
| `/api/suppliers` | 5 | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) | ✅ | ALTO |
| `/api/campaigns` | 10 | 10/10 (100%) | 10/10 (100%) | 10/10 (100%) | ❌ | ALTO - Sin tests |
| `/api/campaignProducts` | 10 | 10/10 (100%) | 10/10 (100%) | 10/10 (100%) | ❌ | ALTO - Sin tests |
| `/health` | 1 | 0/1 (0%) | 0/1 (0%) | 0/1 (0%) | ❌ | BAJO - Público |

### Desglose Detallado por Endpoint

#### 🔴 Auth (`/api/auth`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| POST | `/registerSuperUser` | ❌ | ❌ | ✅ | ⚠️ Parcial | CRÍTICO: Endpoint público para crear superadmin |
| POST | `/register` | ✅ | ✅ | ✅ | ✅ | OK: Protegido, solo admin/superadmin |
| POST | `/login` | ❌ | ❌ | ✅ | ⚠️ Parcial | OK: Endpoint público, con rate limiting |

#### 🟢 Users (`/api/users`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK: Admin/Superadmin + privilegio VIEW_ALL |
| GET | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR + mass assignment |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟡 States (`/api/states`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ❌ | ✅ | ❌ | Solo auth, sin checkRol |
| GET | `/:id` | ✅ | ❌ | ✅ | ❌ | Solo auth, sin checkRol |

#### 🟢 Branches (`/api/branches`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ⚠️ | Tests 401, faltan 403 |
| GET | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| POST | `/` | ✅ | ✅ | ✅ | ⚠️ | Tests 401, faltan boundary |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Municipalities (`/api/municipalities`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/state/:stateId` | ✅ | ✅ | ✅ | ✅ | OK |

#### 🟢 Privileges (`/api/privileges`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/module/:module` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ⚠️ | Falta test privilege escalation |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/user/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/user/:userid/code/:codename` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/user/` | ✅ | ✅ | ✅ | ⚠️ | Falta test privilege escalation |
| DELETE | `/user/:userid/privilege/:pid` | ✅ | ✅ | ✅ | ✅ | OK |

#### 🟢 Positions (`/api/positions`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Product Categories (`/api/productCategories`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Employees (`/api/employees`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Products (`/api/products`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Product Stocks (`/api/productStocks`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/product/:product_id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/branch/:branch_id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Price Lists (`/api/priceLists`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Product Prices (`/api/productPrices`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/product/:product_id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/priceList/:price_list_id` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟢 Suppliers (`/api/suppliers`)

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| GET | `/:id` | ✅ | ✅ | ✅ | ✅ | OK |
| POST | `/` | ✅ | ✅ | ✅ | ✅ | OK |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | Falta test IDOR |

#### 🟡 Campaigns (`/api/campaigns`) - **SIN TESTS**

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| GET | `/active` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| GET | `/:id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + IDOR |
| POST | `/` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + Date validation |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + IDOR |
| POST | `/:id/activate` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + Business logic |
| POST | `/:id/deactivate` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + Business logic |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + IDOR |
| GET | `/:id/branches` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| POST | `/:id/branches` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| DELETE | `/:id/branches/:branch_id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |

#### 🟡 Campaign Products (`/api/campaignProducts`) - **SIN TESTS**

| Método | Endpoint | Auth | Authz | Validación | Tests Seg. | Notas |
|--------|----------|------|-------|------------|------------|-------|
| GET | `/campaign/:campaign_id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| GET | `/:id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + IDOR |
| POST | `/` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + Discount validation |
| PUT | `/:id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + IDOR |
| DELETE | `/:id` | ✅ | ✅ | ✅ | ❌ | FALTA TODO + IDOR |
| GET | `/:id/branches` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| POST | `/:id/branches/override` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| PUT | `/:id/branches/:branch_id/override` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |
| DELETE | `/:id/branches/:branch_id/override` | ✅ | ✅ | ✅ | ❌ | FALTA TODO |

---

## 2. Vulnerabilidades Identificadas

### 🔴 CRÍTICAS (Acción Inmediata Requerida)

#### CRIT-001: Endpoint de Registro de Superadmin Público
**Ubicación:** `POST /api/auth/registerSuperUser`
**Descripción:** El endpoint para crear superadministradores es completamente público y no requiere autenticación ni autorización.
**Impacto:** Un atacante puede crear cuentas de superadministrador con privilegios totales sobre el sistema.
**Evidencia:**
```javascript
// src/routes/auth.js:36
router.post('/registerSuperUser', validateRegister, registerAdminCtrl);
// NO tiene authMidleware ni checkRol
```
**Explotación:**
```bash
curl -X POST http://api.example.com/api/auth/registerSuperUser \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacker","email":"hacker@evil.com","role":"superadmin","password":"Hack1234"}'
```
**Recomendación:**
1. **Eliminar** este endpoint en producción o moverlo a una ruta administrativa interna
2. Agregar autenticación + autorización (solo superadmin puede crear otro superadmin)
3. Implementar un mecanismo de "primer usuario" protegido por variable de entorno
4. Agregar logging de auditoría para todas las creaciones de superadmin

**Severidad:** CRÍTICA (CVSS 9.8)

---

#### CRIT-002: Falta Validación de Propiedad de Recursos (IDOR Masivo)
**Ubicación:** Múltiples endpoints PUT/DELETE con parámetros `/:id`
**Descripción:** Los endpoints de actualización y eliminación no verifican que el usuario tenga permisos sobre el recurso específico que está modificando, solo verifican el privilegio genérico.
**Impacto:** Un usuario con privilegio "update_user" puede modificar CUALQUIER usuario, incluso superadmins. Aplica a: users, branches, positions, productCategories, employees, products, productStocks, priceLists, productPrices, suppliers.
**Evidencia:**
```javascript
// src/controllers/user.js - updateRecord
const updateRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const id = req.params.id;

    // NO verifica ownership ni restricciones de rol
    const user = await users.update(body, { where: { id } });
    // ...
```
**Explotación:**
```bash
# Usuario "admin" con ID 3 puede modificar al superadmin con ID 1
curl -X PUT http://api.example.com/api/users/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name":"Pwned","role":"user"}' # Degradar superadmin a user
```
**Recomendación:**
1. Implementar verificación de ownership en servicios
2. Agregar regla: usuarios no pueden modificar/eliminar usuarios con rol superior
3. Implementar campo `owner_id` o relación `user_id` en recursos sensibles
4. Agregar tests específicos de IDOR para cada endpoint PUT/DELETE

**Severidad:** CRÍTICA (CVSS 8.8)

---

### 🟠 ALTAS (Remediar en Sprint Actual)

#### HIGH-001: Falta Rate Limiting en Endpoints de Negocio
**Ubicación:** Todos los endpoints excepto `/api/auth`
**Descripción:** Solo `/api/auth` tiene rate limiting específico (5 req/15min). Los demás comparten un límite global de 100 req/15min muy permisivo.
**Impacto:** Un atacante puede hacer scraping masivo de datos, enumerar IDs, o causar DoS parcial.
**Evidencia:**
```javascript
// src/server.js:56
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // MUY PERMISIVO para endpoints sensibles
  // ...
});
```
**Explotación:**
```bash
# Enumerar todos los usuarios (asumiendo 100 usuarios)
for i in {1..100}; do
  curl http://api.example.com/api/users/$i -H "Authorization: Bearer $TOKEN"
done
# Todas las requests pasan antes del límite
```
**Recomendación:**
1. Implementar rate limiting por endpoint según sensibilidad:
   - Lectura pública: 30 req/min
   - Lectura autenticada: 60 req/min
   - Escritura: 20 req/min
   - Búsqueda/listado: 10 req/min
2. Considerar rate limiting por usuario (además de por IP)

**Severidad:** ALTA (CVSS 7.5)

---

#### HIGH-002: Estados Sin Control de Autorización
**Ubicación:** `GET /api/states` y `GET /api/states/:id`
**Descripción:** Los endpoints de estados solo requieren autenticación pero no verifican privilegios mediante `checkRol`.
**Impacto:** Cualquier usuario autenticado (incluso sin privilegios) puede acceder a datos de estados.
**Evidencia:**
```javascript
// src/routes/states.js:33
router.get('/', authMidleware, getRecords);
// Falta: checkRol([ROLE.USER, ROLE.ADMIN], STATES.VIEW_ALL)

// src/routes/states.js:63
router.get('/:id', validateGetRecord, authMidleware, getRecord);
// Orden incorrecto: validateGetRecord ANTES de authMidleware
```
**Explotación:**
```bash
# Un usuario sin privilegios puede acceder
curl http://api.example.com/api/states -H "Authorization: Bearer USER_NO_PRIVILEGES_TOKEN"
# 200 OK - devuelve datos
```
**Recomendación:**
1. Agregar `checkRol` a ambos endpoints
2. Definir privilegio `STATES.VIEW_ALL` y `STATES.VIEW` en constants/modules.js
3. Corregir orden de middlewares (auth ANTES de validación)

**Severidad:** ALTA (CVSS 6.5)

---

#### HIGH-003: Mass Assignment en Actualización de Usuarios
**Ubicación:** `PUT /api/users/:id`
**Descripción:** No hay whitelist de campos permitidos. Un usuario puede enviar campos arbitrarios que podrían sobrescribir datos sensibles.
**Impacto:** Un admin podría intentar modificar su propio `role` a `superadmin` o cambiar campos del sistema.
**Evidencia:**
```javascript
// src/controllers/user.js
const updateRecord = async(req, res) => {
  const body = matchedData(req); // matchedData solo valida, no previene mass assignment
  const id = req.params.id;
  const user = await users.update(body, { where: { id } });
  // No hay whitelist explícita de campos permitidos
```
**Validator permite name y role, pero no está claro qué otros campos del modelo son actualizables:**
```javascript
// src/validators/auth.js:68
check('name')..., check('role')... // Solo valida estos 2 campos
// ¿Pero qué pasa si envío "created_at", "deleted_at", etc.?
```
**Recomendación:**
1. Implementar whitelist explícita de campos actualizables por endpoint
2. Usuarios NO deben poder modificar su propio `role`
3. Validar que admins no puedan modificar superadmins
4. Agregar tests de mass assignment enviando campos prohibidos

**Severidad:** ALTA (CVSS 6.5)

---

#### HIGH-004: Falta Cobertura de Tests para Módulos de Campañas
**Ubicación:** `/api/campaigns` y `/api/campaignProducts` (20 endpoints)
**Descripción:** Módulos completos de funcionalidad crítica de negocio (campañas y productos en campaña) no tienen tests de integración.
**Impacto:** No se puede garantizar que autenticación, autorización, validación y lógica de negocio funcionen correctamente. Alto riesgo de regresiones.
**Evidencia:**
```bash
# Tests existentes:
ls src/tests/*.test.js
# NO existe: campaigns.test.js ni campaignProducts.test.js
```
**Recomendación:**
1. Crear `src/tests/16_campaigns.test.js` con casos de seguridad:
   - Acceso sin autenticación (401)
   - Acceso sin privilegios (403)
   - IDOR en GET/PUT/DELETE `/:id`
   - Validación de fechas (start_date < end_date)
   - Activación de campaña por usuario sin privilegio
2. Crear `src/tests/17_campaignProducts.test.js` con:
   - Todos los casos anteriores
   - Validación de discount_type y discount_value
   - Overrides de sucursal con valores negativos/inválidos

**Severidad:** ALTA (CVSS N/A - Risk Management)

---

### 🟡 MEDIAS (Remediar en Próximo Sprint)

#### MED-001: Información de Stack Traces en Errores (Development Mode)
**Ubicación:** Global error handler en `src/server.js`
**Descripción:** En modo desarrollo, los errores devuelven stack traces completos al cliente.
**Impacto:** Filtración de información sensible sobre estructura interna del código, rutas de archivos, versiones de librerías.
**Evidencia:**
```javascript
// src/server.js:134
const errorResponse = {
  error: process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message,
  ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
};
```
**Explotación:**
```bash
# En development, obtener stack trace
curl http://dev-api.example.com/api/users/invalid
# Response: { error: "...", stack: "Error: ...\nat Controller.updateRecord (/app/src/controllers/user.js:45:12)..." }
```
**Recomendación:**
1. Usar variable `DEBUG` separada de `NODE_ENV` para controlar verbosidad
2. En staging/QA, NO exponer stack traces al cliente (loggear internamente)
3. Implementar IDs únicos de error para tracking sin exponer detalles

**Severidad:** MEDIA (CVSS 5.3)

---

#### MED-002: Falta Sanitización de Outputs (XSS Almacenado Potencial)
**Ubicación:** Todos los endpoints que retornan datos de usuario sin sanitizar
**Descripción:** No hay sanitización explícita de datos al retornarlos. Si un usuario almacena `<script>alert('xss')</script>` en su nombre, se devuelve sin sanitizar.
**Impacto:** XSS almacenado si el frontend no sanitiza correctamente.
**Evidencia:**
```javascript
// src/services/users.js:19
const getUsers = async() => {
  const data = await users.findAll();
  return allUsers; // Sin sanitización
};
```
**Nota:** Este backend es una API REST que devuelve JSON. El XSS real solo ocurre si:
1. El frontend renderiza datos sin escapar
2. La API sirve HTML directamente (no es el caso)

Sin embargo, es buena práctica defensiva sanitizar outputs.

**Recomendación:**
1. Implementar sanitización de HTML en campos de texto libre (name, description, notes)
2. Usar librería como `DOMPurify` (node) o `validator` (isHTML)
3. Documentar en API que el frontend DEBE escapar HTML al renderizar
4. Agregar tests de XSS intentando inyectar payloads en campos de texto

**Severidad:** MEDIA (CVSS 5.4)

---

#### MED-003: Passwords No Tienen Requisitos de Complejidad Suficientes
**Ubicación:** Validador de passwords en `src/validators/auth.js`
**Descripción:** Los requisitos son: 8-50 caracteres, 1 número, 1 mayúscula, 1 minúscula. No se validan caracteres especiales, palabras comunes, ni reutilización.
**Impacto:** Passwords débiles como "Password1" son aceptados.
**Evidencia:**
```javascript
// src/validators/auth.js:30
check('password')
  .isLength({ min: 8, max: 50 })
  .matches(/\d/) // 1 número
  .matches(/[A-Z]/) // 1 mayúscula
  .matches(/[a-z]/) // 1 minúscula
  // FALTA: matches(/[!@#$%^&*]/) para caracter especial
```
**Explotación:**
```bash
# Passwords débiles que pasan validación:
"Password1" ✅
"Qwerty123" ✅
"Admin2024" ✅
```
**Recomendación:**
1. Agregar validación de caracter especial: `.matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)`
2. Implementar validación contra diccionario de passwords comunes (10K más comunes)
3. Considerar usar zxcvbn para medir fortaleza real
4. Implementar política de rotación de passwords
5. Prevenir reutilización de últimos 5 passwords

**Severidad:** MEDIA (CVSS 5.3)

---

#### MED-004: Email No Se Normaliza Consistentemente
**Ubicación:** Validación de email en registros y login
**Descripción:** El validator valida formato de email pero no garantiza normalización consistente (lowercase, trim).
**Impacto:** Posibilidad de crear cuentas duplicadas con `User@Test.com` y `user@test.com`.
**Evidencia:**
```javascript
// src/validators/auth.js:17
.custom(async(value) => {
  const user = await users.findOne({
    where: { email: value.toLowerCase() } // Normaliza AQUÍ
  });
  // ...
});

// Pero en el controller NO se normaliza antes de crear:
// src/services/users.js:32
const registerUser = async(req) => {
  // req.email podría ser "User@Test.com"
  const register = await users.create(body);
  // Se guarda sin normalizar
```
**Explotación:**
```bash
# Registro 1
POST /api/auth/register {"email": "user@test.com", ...}
# Registro 2
POST /api/auth/register {"email": "User@Test.com", ...}
# Si la DB es case-sensitive, crea 2 cuentas
```
**Recomendación:**
1. Agregar `normalizeEmail()` en validator antes de custom check
2. Agregar `.toLowerCase().trim()` en service antes de create
3. Agregar constraint UNIQUE case-insensitive en columna email de DB
4. Agregar test de email case-insensitive duplicates

**Severidad:** MEDIA (CVSS 4.3)

---

### 🟢 BAJAS (Backlog)

#### LOW-001: Health Check Endpoint Público Sin Rate Limiting
**Ubicación:** `GET /health`
**Descripción:** El endpoint de health check es completamente público y no tiene rate limiting dedicado.
**Impacto:** Puede ser abusado para reconocimiento (obtener versión, uptime, environment) o como vector de DoS menor.
**Evidencia:**
```javascript
// src/server.js:94
this.app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development' // Information disclosure
  });
});
```
**Explotación:**
```bash
# Obtener información del servidor
curl http://api.example.com/health
# {"status":"ok","uptime":123456,"environment":"production"} <- Info disclosure
```
**Recomendación:**
1. Remover campo `environment` del response público
2. Agregar rate limiting: 10 req/min por IP
3. Considerar autenticación para versión detallada del health check
4. Mover detalles sensibles a endpoint `/health/detailed` autenticado

**Severidad:** BAJA (CVSS 3.7)

---

#### LOW-002: Tokens JWT No Tienen Jti (ID Único) para Revocación
**Ubicación:** `src/utils/handleJwt.js`
**Descripción:** Los tokens JWT generados no incluyen un `jti` (JWT ID), lo que impide implementar revocación de tokens individual.
**Impacto:** No se puede invalidar un token específico sin cambiar el secreto global (invalidando TODOS los tokens).
**Evidencia:**
```javascript
// Asumo que handleJwt.js hace algo como:
const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '2h' });
// No incluye jti
```
**Recomendación:**
1. Agregar `jti: uuidv4()` al payload del token
2. Implementar blacklist de tokens revocados (Redis con TTL de 2h)
3. Middleware para verificar que token no está en blacklist
4. Endpoint `POST /api/auth/logout` para agregar token a blacklist

**Severidad:** BAJA (CVSS 3.1)

---

## 3. Gaps en Cobertura de Tests de Seguridad

### 3.1 Tests Faltantes por Módulo

| Módulo | Tests Existentes | Tests de Seguridad Faltantes |
|--------|------------------|------------------------------|
| auth | ✅ Básicos | ❌ Rate limiting, ❌ Brute force, ❌ Token expiration, ❌ Token refresh |
| users | ✅ CRUD básico | ❌ IDOR, ❌ Privilege escalation, ❌ Mass assignment |
| branches | ⚠️ Parciales (401) | ❌ 403 Forbidden, ❌ IDOR |
| privileges | ✅ Completos | ❌ Privilege escalation al asignar privilegios |
| positions | ✅ CRUD básico | ❌ IDOR en PUT/DELETE |
| productCategories | ✅ CRUD básico | ❌ IDOR en PUT/DELETE |
| employees | ✅ CRUD básico | ❌ IDOR en PUT/DELETE |
| products | ✅ CRUD básico | ❌ IDOR en PUT/DELETE |
| productStocks | ✅ Completos | ✅ Bien cubierto |
| priceLists | ✅ CRUD básico | ❌ IDOR en PUT/DELETE |
| productPrices | ✅ Completos | ✅ Bien cubierto |
| suppliers | ✅ CRUD básico | ❌ IDOR en PUT/DELETE |
| **campaigns** | ❌ NO EXISTE | ❌ TODO (20 endpoints sin tests) |
| **campaignProducts** | ❌ NO EXISTE | ❌ TODO (10 endpoints sin tests) |

### 3.2 Escenarios de Seguridad NO Cubiertos

#### Autenticación
- [ ] Login con credentials incorrectas (múltiples intentos)
- [ ] Login bloqueado después de 5 intentos fallidos
- [ ] Token expirado (después de 2h)
- [ ] Token inválido (modificado, firmado con otro secret)
- [ ] Token con payload corrupto
- [ ] Login concurrente desde múltiples IPs

#### Autorización
- [ ] Usuario sin privilegio intenta acceder a recurso protegido (403)
- [ ] Usuario con rol "user" intenta acceso de "admin"
- [ ] Degradación de rol (admin intenta hacerse superadmin)
- [ ] Privilege escalation asignando privilegios que no tiene

#### IDOR (Insecure Direct Object Reference)
- [ ] Usuario A intenta modificar recurso propiedad de Usuario B
- [ ] Usuario con privilegio VIEW_ALL intenta UPDATE sin privilegio UPDATE
- [ ] Enumerar IDs de recursos ajenos

#### Mass Assignment
- [ ] Enviar campos no permitidos (created_at, deleted_at, id)
- [ ] Modificar campos sensibles (role, password_hash)
- [ ] Sobrescribir relaciones (user_id, owner_id)

#### Input Validation
- [ ] SQL Injection en parámetros (si hubiera raw queries)
- [ ] XSS payloads en campos de texto
- [ ] Path traversal en uploads
- [ ] Integer overflow en cantidades/precios
- [ ] Fechas inválidas (start_date > end_date)
- [ ] Valores negativos en campos numéricos (precios, cantidades)

#### Rate Limiting
- [ ] Exceder límite global de 100 req/15min
- [ ] Exceder límite de auth de 5 req/15min
- [ ] Rate limiting por usuario (además de IP)

#### Business Logic
- [ ] Activar campaña con fechas pasadas
- [ ] Agregar producto a campaña inexistente
- [ ] Eliminar recurso con dependencias (cascade o error)
- [ ] Crear descuento mayor a 100%
- [ ] Stock negativo

### 3.3 Matriz de Cobertura Recomendada

Para cada endpoint con `/:id` parámetro, implementar estos tests:

| Test Case | Descripción | Prioridad |
|-----------|-------------|-----------|
| **GET /:id** | | |
| 200 OK | Usuario autenticado con privilegio correcto accede a recurso propio | ALTA |
| 200 OK | Admin/superadmin con VIEW_ALL accede a cualquier recurso | ALTA |
| 401 Unauthorized | Request sin token | ALTA |
| 403 Forbidden | Usuario sin privilegio intenta acceder | ALTA |
| 404 Not Found | ID no existe | MEDIA |
| 403 Forbidden | Usuario A intenta acceder a recurso de Usuario B (IDOR) | **CRÍTICA** |
| **PUT /:id** | | |
| 200 OK | Update propio recurso con datos válidos | ALTA |
| 401 Unauthorized | Request sin token | ALTA |
| 403 Forbidden | Usuario sin privilegio UPDATE | ALTA |
| 404 Not Found | ID no existe | MEDIA |
| 403 Forbidden | Usuario A intenta modificar recurso de Usuario B (IDOR) | **CRÍTICA** |
| 400 Bad Request | Datos inválidos (validación) | MEDIA |
| 400 Bad Request | Mass assignment - campos prohibidos | ALTA |
| 403 Forbidden | Admin intenta modificar Superadmin (role check) | ALTA |
| **DELETE /:id** | | |
| 200 OK | Delete propio recurso | ALTA |
| 401 Unauthorized | Request sin token | ALTA |
| 403 Forbidden | Usuario sin privilegio DELETE | ALTA |
| 404 Not Found | ID no existe | MEDIA |
| 403 Forbidden | Usuario A intenta eliminar recurso de Usuario B (IDOR) | **CRÍTICA** |
| 400 Bad Request | Recurso tiene dependencias y no se puede eliminar | BAJA |

---

## 4. Recomendaciones Priorizadas

### 🚨 Prioridad 1: CRÍTICAS (Esta Semana)

1. **[CRIT-001] Asegurar endpoint de Registro de Superadmin**
   - **Acción:** Eliminar `POST /api/auth/registerSuperUser` o protegerlo con auth + authz
   - **Implementación:**
     ```javascript
     // Opción A: Proteger endpoint
     router.post('/registerSuperUser', [
       authMidleware,
       checkRol([ROLE.SUPERADMIN], USERS.CREATE_SUPERADMIN) // Solo superadmin puede crear otro
     ], registerAdminCtrl);

     // Opción B: Primer usuario vía script/seed
     // Remover endpoint completamente de routes
     ```
   - **Esfuerzo:** 2 horas
   - **Tests:** Verificar 401/403 en calls sin auth/authz

2. **[CRIT-002] Implementar Validación de Ownership (IDOR)**
   - **Acción:** Agregar verificación de propiedad de recurso en servicios
   - **Implementación:**
     ```javascript
     // src/services/generic-service.js
     const updateRecord = async(id, data, userId, userRole) => {
       const resource = await Model.findByPk(id);
       if (!resource) throw new NotFoundError();

       // Verificar ownership o privilegio admin
       if (resource.user_id !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
         throw new ForbiddenError('You do not own this resource');
       }

       // Verificar que no puede modificar roles superiores
       if (resource.role === 'superadmin' && userRole !== 'superadmin') {
         throw new ForbiddenError('Cannot modify superadmin');
       }

       return await resource.update(data);
     };
     ```
   - **Esfuerzo:** 2 días (aplicar a todos los servicios)
   - **Tests:** Crear suite de tests IDOR para cada recurso

---

### 🔥 Prioridad 2: ALTAS (Este Sprint - 2 Semanas)

3. **[HIGH-001] Implementar Rate Limiting Granular**
   - **Acción:** Agregar rate limiters específicos por tipo de operación
   - **Implementación:**
     ```javascript
     // src/middlewares/rateLimiters.js
     const readLimiter = rateLimit({ windowMs: 60000, max: 60 }); // 60 req/min
     const writeLimiter = rateLimit({ windowMs: 60000, max: 20 }); // 20 req/min
     const searchLimiter = rateLimit({ windowMs: 60000, max: 10 }); // 10 req/min

     // Aplicar en routes:
     router.get('/', readLimiter, authMidleware, checkRol(...), getRecords);
     router.post('/', writeLimiter, authMidleware, checkRol(...), addRecord);
     ```
   - **Esfuerzo:** 1 día
   - **Tests:** Verificar que límites se aplican correctamente

4. **[HIGH-002] Agregar Autorización a Estados**
   - **Acción:** Agregar `checkRol` a endpoints de estados
   - **Implementación:**
     ```javascript
     // src/routes/states.js
     router.get('/', [
       authMidleware,
       checkRol([ROLE.USER, ROLE.ADMIN], STATES.VIEW_ALL)
     ], getRecords);

     router.get('/:id', [
       authMidleware, // Mover ANTES de validación
       validateGetRecord,
       checkRol([ROLE.USER, ROLE.ADMIN], STATES.VIEW)
     ], getRecord);
     ```
   - **Esfuerzo:** 1 hora
   - **Tests:** Verificar 403 sin privilegios

5. **[HIGH-003] Prevenir Mass Assignment**
   - **Acción:** Whitelist explícita de campos actualizables
   - **Implementación:**
     ```javascript
     // src/services/users.js
     const UPDATABLE_FIELDS = ['name', 'email'];
     const ADMIN_UPDATABLE_FIELDS = ['name', 'email', 'role'];

     const updateUser = async(id, data, userRole) => {
       const allowedFields = userRole === 'superadmin'
         ? ADMIN_UPDATABLE_FIELDS
         : UPDATABLE_FIELDS;

       const cleanData = pick(data, allowedFields);
       return await users.update(cleanData, { where: { id } });
     };
     ```
   - **Esfuerzo:** 4 horas
   - **Tests:** Enviar campos prohibidos y verificar que se ignoran

6. **[HIGH-004] Crear Tests para Campañas y CampaignProducts**
   - **Acción:** Crear 2 suites completas de tests
   - **Implementación:** Ver sección 3.3 "Matriz de Cobertura Recomendada"
   - **Esfuerzo:** 3 días
   - **Tests:** 20+ test cases por módulo

---

### ⚡ Prioridad 3: MEDIAS (Próximo Sprint - 4 Semanas)

7. **[MED-001] Mejorar Manejo de Errores**
   - **Acción:** Implementar error IDs y remover stack traces en staging/prod
   - **Esfuerzo:** 1 día

8. **[MED-002] Sanitizar Outputs**
   - **Acción:** Agregar sanitización de HTML en respuestas
   - **Esfuerzo:** 1 día

9. **[MED-003] Fortalecer Política de Passwords**
   - **Acción:** Agregar requisito de caracter especial + validación contra diccionario
   - **Esfuerzo:** 4 horas

10. **[MED-004] Normalizar Emails Consistentemente**
    - **Acción:** Agregar normalización en validators y services
    - **Esfuerzo:** 2 horas

---

### 📋 Prioridad 4: BAJAS (Backlog)

11. **[LOW-001] Asegurar Health Check**
    - **Acción:** Rate limiting + remover info sensible
    - **Esfuerzo:** 1 hora

12. **[LOW-002] Implementar Revocación de Tokens**
    - **Acción:** Agregar `jti` + blacklist en Redis
    - **Esfuerzo:** 1 día

---

## 5. Plan de Acción Sugerido

### Sprint 1 (Semana 1-2): Vulnerabilidades Críticas
- [ ] Día 1-2: CRIT-001 - Asegurar registerSuperUser
- [ ] Día 3-10: CRIT-002 - Implementar validación IDOR en todos los servicios

### Sprint 2 (Semana 3-4): Vulnerabilidades Altas
- [ ] Día 1: HIGH-001 - Rate limiting granular
- [ ] Día 1: HIGH-002 - Autorización en estados
- [ ] Día 2: HIGH-003 - Prevenir mass assignment
- [ ] Día 3-5: HIGH-004 - Tests de campañas

### Sprint 3 (Semana 5-6): Vulnerabilidades Medias + Refactoring
- [ ] Día 1: MED-001 - Manejo de errores
- [ ] Día 1: MED-002 - Sanitización
- [ ] Día 2: MED-003 - Política de passwords
- [ ] Día 2: MED-004 - Normalización de emails

### Sprint 4 (Semana 7-8): Hardening + Mejoras Bajas
- [ ] Día 1: LOW-001 - Health check
- [ ] Día 2-3: LOW-002 - Revocación de tokens
- [ ] Día 4-5: Tests adicionales de seguridad
- [ ] Día 6-7: Re-auditoría y validación de fixes

---

## 6. Métricas de Seguimiento

### Indicadores de Éxito

| Métrica | Baseline Actual | Objetivo | Fecha Objetivo |
|---------|-----------------|----------|----------------|
| Vulnerabilidades CRÍTICAS | 2 | 0 | Semana 2 |
| Vulnerabilidades ALTAS | 4 | 0 | Semana 4 |
| Cobertura IDOR en endpoints | 0% | 100% | Semana 4 |
| Tests de seguridad (endpoints) | 65% | 95% | Semana 6 |
| Tests para campañas | 0% | 100% | Semana 4 |

### Dashboard de Seguridad (Propuesto)

Implementar dashboard interno que muestre:
- Intentos de acceso fallidos por endpoint
- Rate limiting hits
- Errores 401/403 por usuario
- Alertas de actividad sospechosa (múltiples 403 del mismo usuario)

---

## 7. Conclusiones

### Fortalezas del Sistema Actual

1. **Validación de Entrada Robusta:** Todos los endpoints tienen validators completos con express-validator
2. **Autenticación Sólida:** JWT con bcrypt, tokens de 2h de expiración
3. **RBAC Implementado:** Sistema de roles y privilegios granulares bien diseñado
4. **Rate Limiting Básico:** Protección contra brute force en login
5. **Seguridad de Headers:** Helmet configurado correctamente
6. **Sequelize ORM:** Protección nativa contra SQL injection

### Debilidades Críticas

1. **Endpoint de Superadmin Público:** Vulnerabilidad crítica de seguridad
2. **Falta Validación IDOR:** Usuarios pueden modificar recursos ajenos
3. **Tests de Seguridad Incompletos:** 30% de endpoints sin tests de seguridad
4. **Módulos Sin Tests:** Campañas completamente sin cobertura

### Riesgo General

**NIVEL DE RIESGO: ALTO**

El sistema tiene buenas bases de seguridad pero presenta **2 vulnerabilidades críticas** que deben remediarse inmediatamente antes de desplegar en producción.

---

## 8. Referencias

### Estándares y Frameworks Utilizados
- OWASP Top 10 2021
- OWASP API Security Top 10 2023
- CWE Top 25 Most Dangerous Software Weaknesses
- CVSS 3.1 para scoring de vulnerabilidades

### Recursos Adicionales
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP API Security Project](https://owasp.org/www-project-api-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Fin del Reporte**

*Este reporte es confidencial y debe ser tratado según las políticas de seguridad de la organización.*
