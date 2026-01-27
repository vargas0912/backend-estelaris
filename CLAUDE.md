# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start with nodemon (hot reload)
npm start                # Production start

# Testing
npm test                 # Run all tests (resets test DB first)
npm test -- --testPathPattern="positions"  # Run single test file

# Linting
npm run lint             # Check code style
npm run lint:fix         # Auto-fix lint issues

# Database (Sequelize CLI)
npm run db:reset         # Drop, create, migrate, seed test DB
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:all --seeders-path ./src/database/seeders/test_files
```

## Architecture

**Stack:** Express 4.x + Sequelize 6.x (MySQL) + JWT authentication

**Request flow:**
```
Route → authMiddleware → validator → checkRol → Controller → Service → Model
```

**Directory structure:**
- `src/routes/` - Auto-loaded via index.js, mounted at `/api/{filename}`
- `src/controllers/` - HTTP request handling, calls services
- `src/services/` - Business logic, database operations
- `src/models/` - Sequelize models with auto-discovery in index.js
- `src/validators/` - express-validator chains per endpoint
- `src/middlewares/` - session.js (JWT), rol.js (RBAC), customHeader.js
- `src/constants/` - Roles, privileges, modules, error messages
- `src/database/migrations/` - Chronological migrations
- `src/database/seeders/json_files/` - Production seed data
- `src/database/seeders/test_files/` - Test seed data

## Key Patterns

**Route auto-loading:** Files in `/routes/` are automatically mounted. Creating `products.js` exposes `/api/products`.

**Model configuration:** All models use `timestamps: true`, `paranoid: true` (soft delete), `underscored: true` (snake_case columns).

**Authentication:** JWT tokens (2h expiry) with payload `{ id, role }`. Header: `Authorization: Bearer <token>`.

**Authorization:** Three roles: `superadmin` (bypasses checks), `admin`, `user`. Granular privileges via `userprivileges` table with codenames like `view_users`, `create_product`.

**Error handling:** Use `handleHttpError(res, 'ERROR_KEY', statusCode)` from `src/utils/handleErorr.js`.

**Validation:** Controllers use `matchedData(req)` to get validated fields only.

## Database Relationships

```
Users ←→ UserPrivileges ←→ Privileges
States → Municipalities → Branches → Employees
                      ↘→ Suppliers
ProductCategories → Products → ProductStocks (per branch)
                           → ProductPrices ← PriceLists
```

## Testing

- **Integration tests:** `src/tests/*.test.js` - Full endpoint tests with supertest
- **Unit tests:** `src/tests/unit/*.service.test.js` - Service tests with mocks
- **Test data:** `src/tests/helper/` contains test fixtures

Tests run sequentially (`--runInBand`) with DB reset before each run.

## Adding New Resources

1. Create migration in `src/database/migrations/`
2. Create model in `src/models/` with associations
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Create validator in `src/validators/`
6. Create route in `src/routes/` (auto-mounted)
7. Add privilege constants in `src/constants/privileges.js`
8. Add seeders for privileges and test data

## API Documentation

Swagger UI available at `http://localhost:3000/documentation`
