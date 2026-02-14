# Backend Estelaris

Sistema de administracion de mercancias Estelaris - API REST

## Requisitos

- Node.js >= 20.x
- MySQL >= 8.0
- npm >= 10.x

## Instalacion

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd backend-estelaris

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

## Configuracion

Crear archivo `.env` en la raiz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3000

# Base de datos - Desarrollo
MYSQL_DEV_USER=root
MYSQL_DEV_PASSWORD=tu_password
MYSQL_DEV_DB_NAME=estelaris_dev
MYSQL_DEV_HOST=localhost

# Base de datos - Test
MYSQL_TEST_USER=root
MYSQL_TEST_PASSWORD=tu_password
MYSQL_TEST_DB_NAME=uat_estelaris
MYSQL_TEST_HOST=localhost
MYSQL_TEST_PORT=3306

# Base de datos - Produccion
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DB_NAME=estelaris
MYSQL_HOST=localhost

# JWT
JWT_SECRET=tu_secret_key
```

## Scripts

```bash
# Desarrollo (con hot reload)
npm run dev

# Produccion
npm start

# Tests
npm test

# Linter
npm run lint
npm run lint:fix

# Base de datos
npm run db:reset        # Resetear BD de test
npm run db:create:test  # Crear BD de test
```

## Migraciones y Seeders

```bash
# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir migraciones
npx sequelize-cli db:migrate:undo:all

# Ejecutar seeders
npx sequelize-cli db:seed:all

# Ejecutar seeders de test
npx sequelize-cli db:seed:all --seeders-path ./src/database/seeders/test_files
```

### Inicializacion de base de datos en produccion

Para inicializar la base de datos en un entorno de produccion por primera vez (o cuando se requiera un reset completo), ejecutar el siguiente comando. **Esta operacion es destructiva: elimina la base de datos existente y la recrea desde cero.**

```bash
npx sequelize-cli db:drop && \
npx sequelize-cli db:create && \
npx sequelize-cli db:migrate && \
npx sequelize-cli db:seed:all
```

Este comando:
1. Elimina la base de datos configurada en `NODE_ENV=production`
2. La recrea limpia
3. Ejecuta todas las migraciones en orden cronologico
4. Ejecuta todos los seeders en orden cronologico (garantizado por los timestamps en los nombres de archivo)

#### Datos de produccion (migracion desde SQL Server)

Los seeders de produccion leen los datos desde los archivos en `src/database/seeders/json_files/`. Estos archivos contienen los datos exportados del sistema actual que corre en SQL Server.

Antes de ejecutar el comando de inicializacion, actualizar los archivos `.js` y `.json` en ese directorio con los datos exportados desde SQL Server:

```
src/database/seeders/json_files/
├── states.js             # Estados
├── municipalities.js     # Municipios (depende de states)
├── branches.js           # Sucursales (depende de municipalities)
├── users.js              # Usuarios
├── privileges.js         # Privilegios del sistema
├── user-privileges.js    # Asignacion de privilegios
├── positions.js          # Puestos
├── employees.js          # Empleados
├── product-categories.js # Categorias de productos
├── products.js           # Productos
├── product-stocks.js     # Stock por sucursal
├── price-lists.js        # Listas de precios
├── product-prices.js     # Precios por lista
├── suppliers.js          # Proveedores
├── campaigns.js          # Campanias
└── campaign-products.js  # Productos por campania
```

> **Nota:** No usar `db:seed:undo:all` antes de este comando. Si la tabla `SequelizeData` tiene registros de seeders de test, el undo fallara porque esos archivos viven en `test_files/` y no en el path por defecto. El `db:drop` resuelve esto directamente.

## Estructura del proyecto

```
src/
├── config/           # Configuracion de BD y Sequelize
├── constants/        # Constantes y mensajes de error
├── controllers/      # Controladores de rutas
├── database/
│   ├── migrations/   # Migraciones de BD
│   └── seeders/      # Datos iniciales
│       ├── json_files/    # Datos para produccion
│       └── test_files/    # Datos para tests
├── middlewares/      # Middlewares (auth, roles)
├── models/           # Modelos Sequelize
├── routes/           # Definicion de rutas
├── services/         # Logica de negocio
├── tests/            # Tests
│   ├── helper/       # Datos de prueba
│   └── unit/         # Tests unitarios
├── utils/            # Utilidades (JWT, password, etc)
└── validators/       # Validadores de entrada
```

## API Endpoints

### Autenticacion (`/api/auth`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/registerSuperUser` | Registrar super usuario |
| POST | `/register` | Registrar usuario (requiere auth) |
| POST | `/login` | Iniciar sesion |

### Usuarios (`/api/users`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar usuarios |
| GET | `/:id` | Obtener usuario por ID |
| PUT | `/:id` | Actualizar usuario |
| DELETE | `/:id` | Eliminar usuario |

### Puestos (`/api/positions`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar puestos |
| GET | `/:id` | Obtener puesto por ID |
| POST | `/` | Crear puesto |
| PUT | `/:id` | Actualizar puesto |
| DELETE | `/:id` | Eliminar puesto |

### Sucursales (`/api/branches`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar sucursales |
| GET | `/:id` | Obtener sucursal por ID |
| POST | `/` | Crear sucursal |
| PUT | `/:id` | Actualizar sucursal |
| DELETE | `/:id` | Eliminar sucursal |

### Privilegios (`/api/privileges`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar privilegios |
| GET | `/:id` | Obtener privilegio por ID |
| GET | `/module/:module` | Obtener privilegios por modulo |
| POST | `/` | Crear privilegio |
| PUT | `/:id` | Actualizar privilegio |
| DELETE | `/:id` | Eliminar privilegio |

### Estados (`/api/states`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar estados |
| GET | `/:id` | Obtener estado por ID |

### Municipios (`/api/municipalities`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar municipios |
| GET | `/state/:state_id` | Obtener municipios por estado |

## Documentacion API

La documentacion Swagger esta disponible en:

```
http://localhost:3000/documentation
```

## Tests

El proyecto incluye tests unitarios y de integracion:

```bash
# Ejecutar todos los tests
npm test

# Tests incluidos:
# - 01_auth.test.js      (19 tests) - Autenticacion, usuarios y privilegios
# - 02_positions.test.js (11 tests) - CRUD de puestos
# - positions.service.test.js (10 tests) - Tests unitarios del servicio
```

### Estructura de tests

- **Tests de integracion**: Prueban los endpoints completos con supertest
- **Tests unitarios**: Prueban servicios de forma aislada con mocks

## Modelos de datos

### Users
- `id` (INT, PK)
- `name` (STRING)
- `email` (STRING)
- `password` (STRING, hasheado)
- `role` (STRING: user, admin, superadmin)

### Positions (Puestos)
- `id` (INT, PK)
- `name` (STRING)

### Branches (Sucursales)
- `id` (INT, PK)
- `name` (STRING)
- `address` (STRING)
- `municipality_id` (INT, FK)
- `phone` (STRING)
- `opening_date` (DATE)

### Privileges
- `id` (INT, PK)
- `name` (STRING)
- `codename` (STRING)
- `module` (STRING)

### States (Estados)
- `id` (INT, PK)
- `name` (STRING)

### Municipalities (Municipios)
- `id` (INT, PK)
- `name` (STRING)
- `state_id` (INT, FK)

## Puestos disponibles

Los puestos predefinidos en el sistema son:

1. Vendedor
2. Maniobras Generales
3. Agente de Ventas
4. Programador
5. Administrador
6. Director General
7. Recepcionista
8. Propietario

## Tecnologias

- **Express** 4.22.x - Framework web
- **Sequelize** 6.37.x - ORM para MySQL
- **JWT** - Autenticacion
- **bcryptjs** - Hash de passwords
- **Jest** - Testing
- **Supertest** - Testing de APIs
- **Swagger** - Documentacion de API
- **ESLint** - Linting
- **Husky** - Git hooks

## Autor

GVV
