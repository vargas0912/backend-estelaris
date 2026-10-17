# Feature: privilege-templates

## Objective
Let admins define privilege templates, apply them to users (copy), and propagate later template edits to assigned users only after explicit confirmation.

## Problem / why
Too many individual privileges make assigning them to existing users hard. A fake "template user" pollutes `users`. A first-class template entity is cleaner.

## Decisions (accepted by user)
- One template per user. `users.template_id` + `users.template_applied_version`.
- `userprivileges.source_template_id` nullable: NULL = manual, never touched by sync.
- Editing a template bumps `version` only when its privilege set changes; no auto-propagation.
- Propagation: `GET /:id/sync-preview` (diff + affected users) then `POST /:id/sync { confirm: true, user_ids? }` in a transaction.
- Apply modes: `replace` (remove ALL user privileges, then copy) / `merge` (add missing only; existing manual ones stay manual).
- Pre-existing manual privilege that later enters the template: sync does NOT overwrite it (stays manual).
- Changing a user's template removes rows with the old `source_template_id`.
- No unique index on userprivileges (out of scope); dedupe in service.

## Scope
Migrations, models, constants, privilege seeds, service, validator, controller, route (`/api/privilege-templates`), JSDoc, swagger (route @openapi + docs/swagger.js schemas, never docs/openapi.json), unit + integration tests.

## Constraints
- Reuse existing conventions: route -> authMiddleware -> validator -> checkRol -> controller -> service. Errors via handleHttpError. matchedData in controllers; every field declared in validators.
- Non-superadmin cannot modify a superadmin's privileges (reuse existing ERR_SECURITY logic).
- pnpm only, full test suite (`pnpm test`), never commit to main, conventional commits, no AI attribution.
- ~400 authored changed lines per task is a planning heuristic only.

## Tasks
- [x] T1 Migrations + models + privilege constants/seeds/migration for new codenames (route: delegated writer; trigger: 2+ non-trivial files)
- [x] T2 Service layer + unit tests
- [x] T3 Validator + controller + route + swagger/JSDoc + integration tests

## Acceptance criteria
- `pnpm test` fully green, `pnpm lint` clean.
- Sync never alters rows with source_template_id NULL or a different template.
- Sync without `confirm: true` is rejected.

## Progress / evidence
### T1 (done) commit 0ad3e1e
- Route: delegated writer. Migrations 20260716000001-3, models privilegetemplates/privilegetemplateitems, users/userprivileges columns+associations, constants (modules.js PRIVILEGE_TEMPLATE, privileges.js).
- Privilege codenames inserted by migration only (same pattern as add-me-privileges / assign-employee-access); NOT added to json_files/privileges.js because test seeds run after migrations and would duplicate rows (no unique index).
- Test-first exception: schema/constants only, no runnable RED.
- Verification: `pnpm lint` clean; `pnpm test` 61 suites / 1459 tests passed.

### T2 (done) commit cefa1c1
- Route: delegated writer. `src/services/privilege-templates.js` (list/get/create/update/delete/apply/sync-preview/sync) + `src/tests/unit/privilege-templates.service.test.js` (23 tests).
- RED observed: unit test failed with module-not-found before the service existed (single-file run, RED only). GREEN: 23/23.
- Sync implemented as a diff (destroy stale/duplicate source rows, insert missing) instead of delete-all+insert; same net result without churning soft-deleted rows.
- Verification: `pnpm lint` clean; `pnpm test` 62 suites / 1482 tests passed.

### T3 (done) commit recorded in git log (feat(privilege-templates): add endpoints, swagger docs and integration tests)
- Route: delegated writer. validator, controller, route (`/api/privilege-templates`, @openapi in Spanish), docs/swagger.js schemas (privilegeTemplate*, never docs/openapi.json), helper `privilegeTemplatesData.js`, integration `38_privilege-templates.test.js` (39 tests: permissions/403, validation, CRUD, apply replace/merge, template change cleanup, version bump only on set change, sync-preview diff, sync requires confirm, sync preserves manual rows, delete blocked 409, superadmin protection).
- Test-first exception: endpoints and integration tests were written together; the first full run failed (39 tests) because of a fixture bug (register response is `body.user.user.id`), fixed, then all green. No separate RED for the endpoints.
- Verification: `pnpm lint` clean; `pnpm test` 63 suites / 1521 tests passed.
- Note: pre-existing intermittent failure observed in `15_customers.test.js` (401 on delete; unrelated files) in 2 of ~6 full runs; the next 2 consecutive full runs were 1521/1521 green.
- Extra behavior: sync skips superadmin users (reason SUPERADMIN_PROTECTED) when the requester is not superadmin; sync-preview/sync use the `sync_privilege_template` privilege.

## Next step
Open PR (user decision).
