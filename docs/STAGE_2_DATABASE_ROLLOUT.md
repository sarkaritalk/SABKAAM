# Stage 2 database rollout record

## Production rollout

Project: `SABKAAM` (`fonzrxwlljmphehlozqr`), production, region `ap-south-1`.

The controlled rollout for PR #18 was completed on 2026-11-23. The production SQL was reviewed against the exact migration files at PR head `0eb9a21d6b3206bf792b6374bf0eef2165b462a4` before execution. Migrations were applied in transactions through the Supabase SQL connection, then their history entries were reconciled with `supabase migration repair`. The base schema and the three earlier Stage 2 migrations were not replayed.

The following migration versions are now recorded as applied both locally and remotely:

- `202611220001` through `202611220009`
- `20261123001536`, `20261123001543`, and `20261123001947`
- `20261123003000`

Verification performed:

- `npx supabase migration list --remote`: all 13 local and remote versions match.
- `npx supabase db push --dry-run --include-all --remote`: returned `Remote database is up to date.`; this was a dry-run and made no database changes.
- The India-wide LGD columns and related positive constraints were checked.
- The candidate-only application insert policy was checked.
- The application-created and application-status-changed notification triggers were checked and both exist.
- The notification trigger function remains available to the database owner, while direct EXECUTE permission is denied to `anon` and `authenticated`.
- The application-notification function is SECURITY DEFINER with an empty search_path.
- The existing production tables inspected before rollout had no application data rows; no user records were inserted as part of this rollout.

## Backup note

A production database archive was created at the user's machine and `pg_restore --list` successfully read its archive directory. This confirms archive readability only; a full restore test was not performed.

## Design boundary

This PR changes application logic, validation, tests, SQL migrations, and this runbook only. It does not change CSS, theme, colors, layout, animations, icons, or logo assets.

## Rollout safety

Do not replay the initial schema migration or run a non-dry-run `supabase db push` merely because the dry-run says the database is current. The production migration rollout is complete; any future schema change should be reviewed as a new migration, backed up, and separately approved.

The hosted project uses Supabase CLI commands with `--remote`. See the [Supabase CLI v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [migration repair reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).
