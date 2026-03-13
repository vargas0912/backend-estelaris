# AGENTS.md - Agentic Coding Guidelines

## Overview
This is a Node.js backend for the Estelaris sales system using Express 4.x + Sequelize 6.x (MySQL) + JWT authentication. Follow these guidelines when working in this codebase.

---

## Commands

### Development
```bash
npm start                # Production start
npm run dev              # Start with nodemon (hot reload)
```

### Testing
```bash
npm test                 # Run all tests (resets test DB first)
npm test -- --testPathPattern="positions"  # Run single test file
npm test -- --testPathPattern="02_positions"  # Run specific test
```

### Linting
```bash
npm run lint             # Check code style
npm run lint:fix         # Auto-fix lint issues
```

### Database (Sequelize CLI)
```bash
npm run db:reset         # Drop, create, migrate, seed test DB
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:all --seeders-path ./src/database/seeders/test_files
```

---

## Architecture

### Request Flow
```
Route → authMiddleware → validator → checkRol → Controller → Service → Model
```

### Directory Structure
- `src/routes/` - Auto-loaded via index.js, mounted at `/api/{filename}`
- `src/controllers/` - HTTP request handling, calls services
- `src/services/` - Business logic, database operations
- `src/models/` - Sequelize models with auto-discovery in index.js
- `src/validators/` - express-validator chains per endpoint
- `src/middlewares/` - session.js (JWT), rol.js (RBAC), customHeader.js
- `src/constants/` - Roles, privileges, modules, error messages
- `src/utils/` - Utility functions (JWT, password, error handling)
- `src/database/migrations/` - Chronological migrations
- `src/database/seeders/json_files/` - Production seed data
- `src/database/seeders/test_files/` - Test seed data

---

## Code Style Guidelines

### Imports
- Use CommonJS `require()` syntax
- Group imports: node modules, internal modules, relative imports
- Example:
```javascript
const express = require('express');
const { matchedData } = require('express-validator');
const { users } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { getUsers } = require('../services/users');
```

### Naming Conventions
- **Files**: snake_case (e.g., `user-privileges.js`, `sale-payments.js`)
- **Database columns**: snake_case (e.g., `user_id`, `created_at`)
- **Routes**: lowercase plural (e.g., `/api/users`, `/api/products`)
- **Functions**: camelCase (e.g., `getUsers`, `updateRecord`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `ROLE.ADMIN`, `ERR_SECURITY.FORBIDDEN`)

### Model Configuration
- All models use `timestamps: true`, `paranoid: true` (soft delete)
- Use `underscored: true` for snake_case columns in database

### Error Handling
- Use `handleHttpError(res, 'ERROR_KEY', statusCode)` from `src/utils/handleErorr.js`
- Always return after calling handleHttpError (use `return` statement)
```javascript
if (!user) {
  handleHttpError(res, `USER_NOT_FOUND --> ${id}`, 404);
  return;
}
```

### Validation
- Use express-validator in `src/validators/`
- Controllers use `matchedData(req)` to get validated fields only
- Apply field whitelisting to prevent mass assignment:
```javascript
const cleanData = pick(body, ALLOWED_FIELDS);
```

### Authentication & Authorization
- JWT tokens with 2h expiry, payload: `{ id, role }`
- Header: `Authorization: Bearer <token>`
- Three roles: `superadmin` (bypasses checks), `admin`, `user`
- Granular privileges via `userprivileges` table with codenames like `view_users`, `create_product`

---

## Adding New Resources

Follow this order:
1. Create migration in `src/database/migrations/`
2. Create model in `src/models/` with associations
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Create validator in `src/validators/`
6. Create route in `src/routes/` (auto-mounted)
7. Add privilege constants in `src/constants/privileges.js`
8. Add seeders for privileges and test data

---

## Testing Patterns

### Integration Tests
- Location: `src/tests/*.test.js`
- Use supertest for HTTP assertions
- Test files numbered sequentially (01_, 02_, etc.)
- Example test structure:
```javascript
const request = require('supertest');
const server = require('../../app');

const api = request(server.app);

describe('[RESOURCE] Test description', () => {
  test('1. Test case name. Expected status', async() => {
    const response = await api
      .get('/api/resource')
      .auth(Token, { type: 'bearer' })
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### Test Helper Data
- Location: `src/tests/helper/helperData.js`
- Export test fixtures for consistent test data

---

## API Documentation

Swagger UI available at `http://localhost:3000/documentation`

Routes should include OpenAPI annotations:
```javascript
/**
 * @openapi
 * /endpoint:
 *    get:
 *      tags:
 *        - resource
 *      summary: Description
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Success
 */
```

---

## Key Files Reference

- **Error handling**: `src/utils/handleErorr.js`
- **Logger**: `src/utils/handleLogger.js`
- **JWT utilities**: `src/utils/handleJwt.js`
- **Password utilities**: `src/utils/handlePassword.js`
- **Field whitelisting**: `src/utils/fieldWhitelist.js`
- **Error constants**: `src/constants/errors.js`
- **Roles**: `src/constants/roles.js`
- **Privileges**: `src/constants/privileges.js`

---

## Database Relationships

```
Users ←→ UserPrivileges ←→ Privileges
States → Municipalities → Branches → Employees
                      ↘→ Suppliers
ProductCategories → Products → ProductStocks (per branch)
                           → ProductPrices ← PriceLists
```
