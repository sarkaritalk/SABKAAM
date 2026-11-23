# Stage 2 database rollout notes

## Why the migration history needs repair

The live project schema contains the original tables, base RLS policies, and seven protected-field triggers from migration `202611220001`, but migration `202611220002` is not applied: its staff/admin helper functions and reviewer/admin policies are absent. The `supabase_migrations.schema_migrations` ledger currently records only:

- `20261123001536`
- `20261123001543`
- `20261123001947`

The repository already contains the intervening migrations `202611220003` through `202611220009`. Live schema inspection confirmed that several of their effects are absent: India-wide LGD columns on employers, verification requests, and job posts; employer contact person; public employer display name; candidate-only application insert policy; and application notification triggers.

Do not run `supabase db push` against production until the baseline history is reconciled. Otherwise the CLI may try to replay the initial table-creation migration against tables that already exist. The missing authorization-hardening migration `202611220002` must remain pending so its security functions and policies are actually installed.

## Controlled production rollout

This is a runbook only. No production migration or migration-history repair was run as part of this PR.

1. Take/confirm a current database backup and link the intended project.
2. Run `supabase migration list --remote` and confirm the remote history matches the versions above.
3. Verify that the live schema really contains the complete base schema from `202611220001` (all eight application tables, base policies, and seven protection triggers). Do not mark `202611220002` as applied: live inspection found its staff/admin helpers and reviewer/admin policies missing. Mark only the already-installed first migration as applied in the history table:

   ```sh
   supabase migration repair 202611220001 --status applied --remote
   ```

   This command changes migration history only; it does not execute the old SQL.
4. Run `supabase migration list --remote` again. Confirm `202611220001` is recorded and `202611220002` through `202611220009` remain pending. The later profile/security migrations already recorded on the remote must remain recorded.
5. Preview all missing migrations, including the older versions that are behind the latest recorded timestamp:

   ```sh
   supabase db push --include-all --dry-run --remote
   ```

6. Review the preview. It should include `202611220002` through `202611220009` and the new notification-function hardening migration, but must not replay `202611220001` or the three already-recorded `2026112300...` migrations. With explicit production approval and a fresh backup, apply the reviewed set:

   ```sh
   supabase db push --include-all --yes --remote
   ```

7. Verify the LGD columns, removed two-state constraints, candidate-only application policy, notification triggers, and notification-function privileges. Re-run the browser and database tests after deployment.

The current Supabase CLI v3 defaults database commands to the local stack; `--remote` is required for the hosted project. Hosted changes require confirmation, and unattended commands require `--yes`. See the [Supabase CLI v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [migration repair reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).
