# Feature: notifications (manual scheduled reminders)

## Objective
Admins create one-off reminders for users (individual or by branch). Reminders can be scheduled, are read-tracked per recipient, and persist as evidence.

## Scope / constraints
- One row per recipient in `notifications`; `batch_id` groups bulk sends.
- Fields: user_id, created_by, title, body, scheduled_at, due_at, read_at, cancelled_at, archived_at, batch_id, ref_type, ref_id (informational, no FK).
- Visibility via query: `scheduled_at IS NULL OR scheduled_at <= NOW()` and not cancelled. No cron.
- No DELETE endpoint. Edit/cancel only while `scheduled_at > now`. `read_at` set server-side, idempotent.
- Out of scope: cron, email/push, recurrence, preferences, auto-close, delivered_at.

## Endpoints
- Admin (`create_notification`): POST /api/notifications (user_ids | branch_id), GET sent (+ per-recipient status, batch summary), PATCH cancel/edit while scheduled.
- User (session only): GET /me (unread filter), GET /me/count, PATCH /:id/read, PATCH /read-all, PATCH /:id/archive.

## Tasks
- [x] T1 Migration + model + users associations + privilege constants/seeders
- [x] T2 Service + unit tests
- [x] T3 Validator + controller + route (+ swagger) + integration tests

- [x] T4 Scope GET /sent to creator (created_by = caller, superadmin sees all); rename test to 39_notifications.test.js

- [x] T5 Restrict edit and cancel to creator (non-owner 404, superadmin exempt)

## Route
Delegated direct: one writer (2+ non-trivial files, reading prepares write).

## Verification
`pnpm test` (full suite) and `pnpm lint`.

## Progress / evidence
- T1: migrations (create table + privilege create_notification), model, users associations, constants. Observed: `NODE_ENV=test pnpm run db:reset` migrates OK; `pnpm lint` clean. Project is CommonJS (not ESM), privileges are seeded via migration (as privilege-templates), no seeder files needed. Commit: a1ac0df

- T2: service + unit tests. RED observed (module not found), then GREEN: `jest src/tests/unit/notifications.service.test.js` 29 passed (isolated run only for RED/GREEN iteration; full suite runs at pre-commit and in T3). Commit: 2cc1b09

- T3: validator, controller, routes (+ swagger schemas and @openapi), integration tests (src/tests/notifications.test.js, 36 tests) with helper notificationsData.js. RED observed (36 failing before routes existed), then GREEN under the full suite. Verification: `pnpm lint` clean; `pnpm test` full suite all passing (see final result in commit hook output). Commit: e8e71dd

- T4: RED observed (unit test failing 1/30 before change). GREEN: lint clean, full `pnpm test` passing. 39_ prefix was free (highest was 38). Commit: b55ba55

- T5: RED observed for unit (2 failing) and integration (1 failing, full suite 3 failed). GREEN: lint clean, full `pnpm test` passing. Non-owner returns 404, same as read/archive of foreign notifications (no 403 ownership convention found). Commit: T5_HASH
