# Supabase setup for SABKAAM

This repository keeps database changes in version control. The initial migration is in `supabase/migrations/`.

## Current state

- The SQL migration defines the first data model for profiles, employers, verification requests, jobs, applications, reports, notifications and audit logs.
- Row Level Security (RLS) is enabled on every application table.
- Client-side policies intentionally do not allow users to assign their own privileged roles or approve their own verification/job review.
- No Supabase project is connected by this file. No credentials are stored in Git.

## Before applying the migration

1. Create a Supabase project for SABKAAM. Select a region appropriate for users in Bihar/Jharkhand (choose India if offered).
2. Open the project's SQL Editor, or use the Supabase CLI after linking the project.
3. Review `supabase/migrations/202611220001_initial_schema.sql` and apply it once to the new, empty project.
4. Confirm the tables and RLS policies exist in the Supabase dashboard.

Do not run this initial migration on a database that already contains production data without a database review and backup.

## Frontend environment

When frontend integration is implemented, use local environment variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Keep these only in a local `.env.local` file (ignored by Git). A public anon/publishable key is intended for client use only when RLS is correctly configured. Never put a service-role key, secret key, database password, or access token in frontend code, screenshots, commits, or chat.

## Important production work still required

- Add automated SQL/RLS tests and validate every policy using separate candidate, employer and reviewer accounts.
- Implement trusted server-side review actions for job publication, employer verification and moderation.
- Add phone authentication and OTP rate limits before collecting real candidate contact details.
- Add data retention/deletion workflows, audit logging for privileged actions, backups and monitoring.
- Review privacy notices, consent, grievance handling and applicable Indian data-protection requirements.
- Decide how moderators/admins are securely provisioned; never let a public signup choose those roles.

This migration is a reviewed starting point, not a production-ready launch by itself.
