# SABKAAM Backend Foundation Plan

Status: architecture proposal for review; no backend provider or database has been connected.

This document defines the first safe backend milestone for the Bihar + Jharkhand launch. It is intentionally provider-neutral. Supabase/PostgreSQL is one possible implementation, but selecting a provider, creating a project, or adding credentials requires a separate decision.

## 1. First backend milestone

Build only the foundation needed to safely support:
- candidate accounts and profiles;
- employer accounts and employer verification requests;
- job posts and moderation status;
- candidate applications;
- abuse/fraud reports;
- in-app notifications.

Do not enable public job publishing until authentication, authorization, validation, moderation, and audit logging are in place.

## 2. Roles and access boundaries

- **Candidate:** can read published jobs, manage their own profile, create and view their own applications, and submit reports.
- **Employer:** can manage their own employer profile, submit a verification request, create job drafts, and view applications for jobs they own. They cannot approve their own verification or publish directly.
- **Moderator:** can review reports, job posts, and verification requests; actions must be audited.
- **Administrator:** manages roles and platform configuration. Admin access must be restricted and audited.

Never trust a role, employer ID, owner ID, verification status, or moderation status supplied by the browser. Derive identity from the authenticated server-side session and enforce ownership on the server/database.

## 3. Initial data model

| Table | Purpose | Important fields |
|---|---|---|
| profiles | Candidate/user public profile | id (auth user ID), display_name, phone, preferred_language, district_code, created_at, updated_at |
| employers | Employer/business profile | id, owner_user_id, business_name, business_type, phone, district_code, address, verification_status |
| verification_requests | Human-reviewed verification workflow | id, employer_id, submitted_by, status, review_notes_private, reviewed_by, timestamps |
| job_posts | Job listing and moderation | id, employer_id, title, category, work_type, district_code, salary_min, salary_max, salary_period, description, status, timestamps |
| applications | Candidate application | id, job_id, candidate_user_id, message, status, timestamps |
| reports | Fraud/safety complaints | id, reporter_user_id (nullable only if anonymous reports are deliberately supported), job_id, employer_id, reason, details, status, timestamps |
| notifications | In-app updates | id, recipient_user_id, type, title, body, read_at, created_at |
| audit_logs | Sensitive administrative actions | id, actor_user_id, action, entity_type, entity_id, metadata_redacted, created_at |

Use stable district codes rather than relying on district names as identifiers. Keep Bihar and Jharkhand district seed data in one canonical source and validate all submitted district codes against it.

## 4. State machines

- Job post: draft -> pending_review -> published | rejected -> paused | closed.
- Employer verification: not_submitted -> pending_review -> verified | rejected | needs_more_information.
- Application: submitted -> viewed -> shortlisted | rejected | hired | withdrawn.
- Report: submitted -> under_review -> action_taken | dismissed.

Only authorized moderator/admin actions may transition a job to published or an employer to verified. Every moderation transition must write an audit record.

## 5. API surface for the first release

- GET /jobs — published jobs only; supports state, district, category, work type, and keyword filters with pagination.
- GET /jobs/:id — published job details only.
- POST /employer/jobs — authenticated employer creates a draft.
- PATCH /employer/jobs/:id — owner edits their own draft or permitted listing.
- POST /jobs/:id/applications — authenticated candidate applies; prevent duplicate active applications.
- GET /me/applications — candidate's own applications only.
- GET /employer/applications — applications for jobs owned by the authenticated employer only.
- POST /employer/verification-requests — submit verification request; initial status is always pending_review.
- POST /reports — submit a safety report.
- GET /me/notifications and PATCH /me/notifications/:id — read only/update own notifications.

Admin/moderation endpoints are intentionally not public API routes. They require a separate protected admin surface and stronger access controls.

## 6. Security and privacy requirements

- Require verified phone authentication before applying, posting, or submitting employer verification requests.
- Collect only the information needed for the stated workflow. Do not request Aadhaar, PAN, bank credentials, UPI PIN, OTP, or identity-document uploads in the first milestone.
- Do not expose private review notes, reporter contact details, or audit logs to ordinary users.
- Enforce row-level ownership and role checks on every read and write, not only by hiding UI controls.
- Validate and normalize phone numbers, salary ranges, text lengths, IDs, and district codes on the server.
- Add rate limits and abuse controls to login/OTP, job creation, applications, and reports.
- Keep secrets in server-side environment variables; never commit service-role keys, database passwords, or private API keys.
- Define retention/deletion rules and a privacy notice before collecting real candidate/employer data.
- Use HTTPS, backups, error monitoring, and a documented incident-response process before public launch.

## 7. Migration and delivery order

1. Select backend provider and hosting region after checking pricing, data location, access controls, and operational fit.
2. Create development and production environments separately; keep credentials out of Git.
3. Add schema migrations and canonical district seed data.
4. Implement authentication and profile ownership policies.
5. Implement employer/job draft APIs and moderation gates.
6. Implement candidate applications and notifications.
7. Implement reports, verification review, and audit logs.
8. Add automated authorization tests (including cross-user access denial) and end-to-end tests.
9. Only then connect the prototype forms to live APIs and remove demo-only messaging.

## 8. Explicitly out of scope for this milestone

- Real employer verification or government identity verification.
- Payments, subscriptions, paid job boosts, or wallet features.
- SMS/WhatsApp/push notification delivery.
- AI matching, voice recognition, or document uploads.
- Public production launch.

## 9. Decisions required before implementation

- Backend provider and hosting region.
- Phone OTP provider and expected monthly volume/cost.
- Who will act as the initial human moderators and what evidence they may review.
- Privacy policy, retention period, and support/escalation contact.

Until these decisions are approved, this branch contains planning documentation only. The existing prototype and main branch remain unchanged.
