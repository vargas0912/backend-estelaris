# Settings Module — Frontend Spec

## Overview

The Settings module exposes two resources:

- **`/api/company-info`** — Singleton record with the company's fiscal/legal data.
- **`/api/system-settings`** — Key-value store for system-wide configuration parameters.

Both endpoints require a valid JWT (`Authorization: Bearer <token>`).

---

## 1. Company Info

### Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/company-info` | Any authenticated user | Get the singleton fiscal record |
| PUT | `/api/company-info` | `superadmin` only | Partial update — only sent fields are modified |

### GET `/api/company-info`

**Response 200**
```json
{
  "companyInfo": {
    "id": 1,
    "company_name": "Estelaris S.A. de C.V.",
    "trade_name": null,
    "rfc": "EST000000AAA",
    "fiscal_regime": "601 - General de Ley Personas Morales",
    "fiscal_address": "Av. Ejemplo 123, Col. Centro",
    "zip_code": "06000",
    "fiscal_email": null,
    "phone": null,
    "logo_url": null,
    "website": null,
    "created_at": "2026-03-09T00:00:00.000Z",
    "updated_at": "2026-03-09T00:00:00.000Z"
  }
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| 401 | Missing or invalid token |
| 404 | Record not initialized (should not happen after migration) |

### PUT `/api/company-info`

All fields are optional. Only fields present in the request body are updated.

**Request body (all optional)**
```json
{
  "company_name": "string, max 150",
  "trade_name": "string | null, max 150",
  "rfc": "string, 12–13 chars, auto-uppercased",
  "fiscal_regime": "string",
  "fiscal_address": "string",
  "zip_code": "string, max 10",
  "fiscal_email": "valid email | null",
  "phone": "string | null, max 20",
  "logo_url": "valid URL | null",
  "website": "valid URL | null"
}
```

**Response 200**
```json
{
  "companyInfo": { /* updated record */ }
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| 400 | Validation error (e.g. RFC too short, invalid email) |
| 401 | Missing or invalid token |
| 403 | User role is not `superadmin` |
| 404 | Record not found |

---

## 2. System Settings

### Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/system-settings` | Any authenticated user | List all settings (optional `?category=` filter) |
| GET | `/api/system-settings/:key` | Any authenticated user | Get one setting by key |
| PUT | `/api/system-settings/:key` | `superadmin` only | Update the value of a setting |

### Seed data (default settings)

| key | category | value | data_type |
|-----|----------|-------|-----------|
| `date_format` | `formats` | `DD/MM/YYYY` | `string` |
| `currency` | `formats` | `MXN` | `string` |
| `timezone` | `formats` | `America/Mexico_City` | `string` |
| `decimal_places` | `formats` | `2` | `integer` |
| `low_stock_threshold` | `inventory` | `5` | `integer` |

### GET `/api/system-settings`

Optionally filter by category: `GET /api/system-settings?category=formats`

**Response 200**
```json
{
  "settings": [
    {
      "id": 1,
      "category": "formats",
      "key": "date_format",
      "value": "DD/MM/YYYY",
      "label": "Formato de fecha",
      "description": null,
      "data_type": "string",
      "created_at": "2026-03-09T00:00:00.000Z",
      "updated_at": "2026-03-09T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/system-settings/:key`

Example: `GET /api/system-settings/date_format`

**Response 200**
```json
{
  "setting": {
    "id": 1,
    "category": "formats",
    "key": "date_format",
    "value": "DD/MM/YYYY",
    "label": "Formato de fecha",
    "description": null,
    "data_type": "string",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| 401 | Missing or invalid token |
| 404 | Key does not exist |

### PUT `/api/system-settings/:key`

Example: `PUT /api/system-settings/date_format`

**Request body**
```json
{
  "value": "YYYY-MM-DD"
}
```

`value` is required and must be a non-empty string. The backend does not cast or validate the value against `data_type` — that interpretation is left to the consumer.

**Response 200**
```json
{
  "setting": {
    "id": 1,
    "key": "date_format",
    "value": "YYYY-MM-DD",
    ...
  }
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| 400 | Missing or empty `value` field |
| 401 | Missing or invalid token |
| 403 | User role is not `superadmin` |
| 404 | Key does not exist |

---

## Authorization summary

| Operation | Required role |
|-----------|--------------|
| GET company-info | `user`, `admin`, `superadmin` (privilege: `view_company_info`) |
| PUT company-info | `superadmin` only (privilege: `update_company_info`) |
| GET system-settings | `user`, `admin`, `superadmin` (privilege: `view_system_settings`) |
| GET system-settings/:key | `user`, `admin`, `superadmin` (privilege: `view_system_settings`) |
| PUT system-settings/:key | `superadmin` only (privilege: `update_system_setting`) |

`superadmin` bypasses privilege checks entirely (see `checkRol` middleware).

---

## Running migrations

```bash
npx sequelize-cli db:migrate
```

The following migrations are applied in order:

1. `20260309000001-create-company-info.js` — Creates `company_info` table
2. `20260309000002-create-system-settings.js` — Creates `system_settings` table with index on `category` and unique index on `key`
3. `20260309000003-seed-company-info.js` — Inserts the initial singleton record
4. `20260309000004-seed-system-settings.js` — Inserts the 5 default settings
5. `20260309000005-add-settings-privileges.js` — Inserts 4 privileges into the `privileges` table

## Running tests

```bash
npm test -- --testPathPattern="company_info"
npm test -- --testPathPattern="system_settings"
```

Or run the full suite (resets DB first):

```bash
npm test
```
