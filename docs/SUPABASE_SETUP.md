# Supabase setup for SABKAAM

This repository keeps database changes in version control. Database changes are ordered SQL migrations in `supabase/migrations/`.

## Current state

- The initial migration defines profiles, employers, verification requests, jobs, applications, reports, notifications and audit logs.
- Row Level Security (RLS) is enabled on every application table.
- The authorization-hardening migration adds role-aware staff policies and stricter workflow guards.
- No Supabase project credentials are stored in Git. A repository migration is not applied to a Supabase project until an operator runs it.

## Applying migrations

For the already-created SABKAAM Supabase project:

1. Take a database backup before applying schema/security changes.
2. Confirm `202611220001_initial_schema.sql` has already been applied.
3. Review `supabase/migrations/202611220002_authorization_hardening.sql`.
4. Apply **only** `202611220002_authorization_hardening.sql` once in the Supabase SQL Editor (or through the Supabase CLI migration workflow).
5. Verify the new helper functions, policies and trigger definition in the dashboard.
6. Run the authorization test matrix below using separate test accounts before connecting the public frontend.

Do not rerun the initial migration on an existing project. Do not apply the hardening migration until it has been reviewed and backed up. If it fails partway through, stop and inspect the database before retrying.

For a brand-new empty project, apply migrations in filename order.

## Authorization model

| Role | Intended access |
| --- | --- |
| Candidate | Read/update own profile; read published jobs; submit and read own applications; withdraw own applications; submit/read own reports; read and mark own notifications as read. |
| Employer | Own employer record and jobs; submit verification request; read applications for own jobs; update application workflow status for own jobs. Employers cannot approve their own verification or publish jobs directly. |
| Moderator | Review employers, verification requests, jobs, applications and reports through authenticated staff policies. Cannot change account roles or read audit logs. |
| Admin | Moderator permissions plus profile/role administration and audit-log read access. |

Staff identity is resolved from the protected `profiles.role` value by `SECURITY DEFINER` helper functions with a fixed empty `search_path`. Public signup always creates a candidate. Only a trusted project operator may provision the first admin; never expose role assignment in public signup or client UI.

## First-admin provisioning

Do not promote a user until that person has signed in and their Auth user UUID has been independently verified in Supabase Authentication. A trusted project owner may then run the following in the Supabase SQL Editor, replacing the placeholder with that verified UUID:

```sql
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = 'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid;
```

Check that exactly one intended profile was updated. Never accept a user-supplied UUID or email as proof of administrator identity. Keep the number of admins minimal. Promote moderators only through an equally trusted operator-controlled process.

## Authorization test matrix

Use separate disposable accounts and verify both allowed and denied cases:

- Candidate A cannot read Candidate B's profile, applications, reports or notifications.
- Candidate A cannot set their own application to hired/rejected or edit submitted application details.
- An employer can read applications only for that employer's jobs and can update only the application status workflow.
- An employer cannot publish a job, approve its own verification, or read another employer's applications.
- A moderator can review reports, verification requests and job status, but cannot change profile roles or read audit logs.
- An admin can perform moderator actions, change profile roles and read audit logs.
- Anonymous users can read only published jobs; they cannot read profiles, applications, reports or notifications.

Do not use real candidate phone numbers or production personal data in these tests.

## Frontend environment

When frontend integration is implemented, use local environment variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Keep these only in a local `.env.local` file (ignored by Git). A public anon/publishable key is intended for client use only when RLS is correctly configured. Never put a service-role key, secret key, database password, or access token in frontend code, screenshots, commits, or chat.

## Important production work still required

- Add automated SQL/RLS tests (for example, pgTAP) and run the authorization matrix above against the actual Supabase project.
- Implement trusted server-side review actions and audit-log writes for privileged operations.
- Ensure the service-role key is server-only; the trigger intentionally permits trusted SQL/service-role operations when `auth.uid()` is null.
- Add phone authentication and OTP rate limits before collecting real candidate contact details.
- Add data retention/deletion workflows, backups, monitoring and an incident-response process.
- Review privacy notices, consent, grievance handling and applicable Indian data-protection requirements.
- Confirm that status changes and employer verification updates are performed transactionally by trusted workflows where multiple tables must stay in sync.

These migrations are a security-conscious starting point, not a production-ready launch by themselves. A full review and live authorization tests are required before collecting real user data.
