# SABKAAM backend connection and production checklist

## Frontend capabilities added

- A browser-safe Supabase REST/Auth adapter lives in `src/lib/backend.ts`.
- It supports email signup/sign-in, public published-job discovery, candidate applications, employer draft creation and review submission, safety reports, candidate applications, and notifications.
- It sends only the public Supabase publishable/anon key from the browser. It never uses a service-role key.
- Requests that require a user identity need the signed-in user's access token and are expected to be enforced by Supabase RLS.
- Candidate/employer email sign-up and sign-in UI is included. Employer signup is constrained to the employer role; moderator/admin roles cannot be self-selected. Session tokens are held in sessionStorage and expire with the access token (automatic refresh is not implemented yet).\n- Candidate profile, application history, notifications, employer job submission, verification requests, and safety reports use authenticated Supabase calls when configured.\n- A staff moderation dashboard can approve/reject jobs, verify/reject employers, and resolve/dismiss reports for moderator/admin accounts. Provision the first staff account out-of-band.\n- The adapter is not a substitute for configuring a real Supabase project, Auth providers, SMTP, moderation staff, or production secrets.

## Connect a Supabase project

1. Create separate Supabase projects for staging and production.
2. Apply the repository migrations in order with the Supabase CLI after reviewing them.
3. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (or the project's publishable key)
4. Never add `service_role`, database passwords, access tokens, or provider secrets to any `VITE_*` variable. Vite bundles `VITE_*` values into public browser code.
5. Configure email confirmation, a trusted SMTP sender, redirect URLs, password policy, and abuse/rate limits in Supabase Auth.
6. Provision the first administrator out-of-band after verifying the Auth user's UUID. Never allow users to set their own moderator/admin role.
7. Configure a reviewed moderation process before allowing job publication or employer verification.
8. Run the Supabase Security Advisor and complete the official production checklist before opening signups.

## Location data and database

- The frontend includes 36 State/UT entries and 785 district records from the imported LGD snapshot.
- The migration `202611220003_india_location_codes.sql` removes the former Bihar/Jharkhand-only state-code restrictions and adds LGD state/district code columns to profiles, employers, verification requests, and jobs. Migrations `202611220005_candidate_profile_fields.sql` and `202611220006_employer_contact_person.sql` add candidate skills/work preferences and employer contact-person data. Migration `202611220007_public_employer_display_name.sql` stores a public-safe employer name on job cards; private contact phone numbers are not exposed in the public feed. Migration `202611220008_candidate_application_role_guard.sql` ensures only candidate-role accounts can submit applications. Migration `202611220009_application_notifications.sql` notifies employers about new applications and candidates about status changes.
- Old `state_code` text values are retained for compatibility. Do not bulk-convert old values without a reviewed mapping.
- The LGD snapshot is not live-synced. Refresh it from the latest official Government of India LGD/OGD export before production and on a monthly maintenance schedule.

## Services that still need provider/account setup

- SMS OTP: select an Indian transactional SMS provider, complete sender/template registration, and configure secrets server-side.
- Email delivery: configure SMTP and verify domain authentication.
- AI applicant matching: define a vetted model/provider, consent rules, cost controls, and explainable ranking policy. Do not rank candidates on protected or sensitive traits.
- Voice search: browser SpeechRecognition is used where supported. Availability and accuracy vary by browser/device; unsupported browsers retain text search.
- File uploads: if resumes or verification files are later accepted, use private Storage buckets, strict file-size/type validation, malware scanning, and short-lived signed URLs. Do not request Aadhaar/PAN by default.
- Production hosting/domain: configure HTTPS, DNS, CSP/security headers, monitoring, backups, and rollback.

## Important launch status

This repository includes a frontend prototype, account flows, a Supabase adapter, and staff moderation UI. A live service is **not** activated until real project credentials, Auth settings, moderation/admin provisioning, hosting, and provider accounts are configured and verified. Demo job data must never be presented as real vacancies.
