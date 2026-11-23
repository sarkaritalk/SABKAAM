# Stage 2 database rollout notes

## Why the migration history needs repair

The live project schema contains the original SABKAAM tables, policies, staff helpers, and protected-field triggers from migrations `202611220001` and `202611220002`, but its `supabase_migrations.schema_migrations` ledger currently records only:

- `20261123001536`
- `20261123001543`
- `20261123001947`

The repository already contains the intervening migrations `202611220003` through `202611220009`. Live schema inspection confirmed that several of their effects are absent: India-wide LGD columns on employers, verification requests, and job posts; employer contact person; public employer display name; candidate-only application insert policy; and application notification triggers.

Do not run `supabase db push` against production until the baseline history is reconciled. Otherwise the CLI may try to replay the initial table-creation migrations against tables that already exist.

## Controlled production rollout

This is a runbook only. No production migration or migration-history repair was run as part of this PR.

1. Take/confirm a current database backup and link the intended project.
2. Run `supabase migration list --remote` and confirm the remote history matches the versions above.
3. Verify that the live schema really contains the complete baseline from migrations `202611220001` and `202611220002` (all tables, policies, staff helper functions, and protection triggers). Only if that verification is complete, mark those two already-installed baseline migrations as applied in the history table:

   ```sh
   supabase migration repair 202611220001 202611220002 --status applied --remote
   ```

   This command changes migration history only; it does not execute the old SQL.
4. Run `supabase migration list --remote` again. Confirm the two baseline versions are recorded and that `202611220003` through `202611220009` remain pending.
5. Preview the exact pending SQL before any schema change:

   ```sh
   supabase db push --dry-run --remote
   ```

6. Review the preview. With explicit production approval and a fresh backup, apply the pending migrations:

   ```sh
   supabase db push --yes --remote
   ```

7. Verify the LGD columns, removed two-state constraints, candidate-only application policy, notification triggers, and notification-function privileges. Re-run the browser and database tests after deployment.

The current Supabase CLI v3 defaults database commands to the local stack; `--remote` is required for the hosted project. Hosted changes require confirmation, and unattended commands require `--yes`. See the [Supabase CLI v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3) and [migration repair reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).
