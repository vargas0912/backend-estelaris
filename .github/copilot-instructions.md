# Copilot Instructions for backend-estelaris

## Project Overview
This is a Node.js backend for the Estelaris sales system, structured for maintainability and modularity. It uses Sequelize ORM for MySQL database management and follows a layered architecture.

## Architecture & Key Components
- **Entry Point:** `app.js` and `src/server.js` initialize the Express server and middleware.
- **Configuration:**
  - Environment-based DB config in `src/config/config.js` (uses `.env` variables).
  - MySQL connection via Sequelize (`src/config/mysql.js`).
- **Models:** Located in `src/models/`, each file maps to a DB table. Naming uses snake_case for foreign keys (e.g., `user_id`).
- **Controllers:** In `src/controllers/`, handle HTTP requests and orchestrate service logic.
- **Services:** Business logic and DB operations in `src/services/`.
- **Routes:** API endpoints defined in `src/routes/`, grouped by resource.
- **Middlewares:** Custom logic (auth, headers, session) in `src/middlewares/`.
- **Constants:** Shared enums/data in `src/constants/`.
- **Utils:** Utility functions in `src/utils/` (e.g., JWT, password, error handling).
- **Validation:** Request validation in `src/validators/`.
- **Database Migrations/Seeders:**
  - Migrations: `src/database/migrations/`
  - Seeders: `src/database/seeders/`
  - Seed data: `src/database/seeders/json_files/`

## Developer Workflows
- **Start Server:**
  ```zsh
  node app.js
  # or
  node src/server.js
  ```
- **Run Migrations/Seeders:**
  Use Sequelize CLI (ensure config matches environment):
  ```zsh
  npx sequelize db:migrate
  npx sequelize db:seed:all
  ```
- **Testing:**
  - Tests in `src/tests/` (Mocha/Chai style).
  - Run tests:
    ```zsh
    npm test
    ```
- **Debugging:**
  - Custom error handling in `src/utils/handleErorr.js`.
  - Logger in `src/utils/handleLogger.js`.

## Project-Specific Conventions
- **Foreign Keys:** Always snake_case (e.g., `user_id`).
- **Timestamps/Soft Delete:** All models use `timestamps: true` and `paranoid: true` (see config).
- **Seeders:** Use JSON files for bulk data import.
- **Validation:** All endpoints validated via `src/validators/` before controller logic.
- **Error Handling:** Use `handleErorr.js` for consistent error responses.

## Integration Points
- **External:** MySQL DB, JWT for auth, dotenv for config.
- **Internal:** Controllers call services, which interact with models.

## Examples
- To add a new resource:
  1. Create model in `src/models/`
  2. Add migration/seeders
  3. Implement controller/service/route/validator

---
For unclear or missing sections, please provide feedback to improve these instructions.
