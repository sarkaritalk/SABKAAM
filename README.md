# SABKAAM

**हर काम, हर इंसान के लिए।**

SABKAAM is a jobs, work, and opportunities platform. The location catalogue currently includes all 36 Indian States/Union Territories and 785 district records from an imported LGD snapshot. The first launch can be phased by district, with nationwide location support in the product.

> Project status: frontend prototype with India-wide LGD locations, Hindi/English/Hinglish UI switching, browser voice search where supported, Supabase schema and client adapter. Live jobs/authenticated workflows require project credentials, Auth configuration, and moderation setup.

## Initial focus

- Help people discover local jobs and work opportunities.
- Help employers and small businesses find suitable workers.
- Make search accessible through simple Hindi-first language and a low-friction interface.
- Support district, town, market, and nearby-area discovery.
- Build trust through employer checks, reporting, and clear job details.

## Initial opportunity categories

Retail and shops, hotels and restaurants, hospitals and clinics, factories, offices and companies, driving and delivery, domestic work, technical trades, agriculture, education, construction, security, online and freelance work, part-time and full-time roles, daily-wage work, and work-from-home opportunities. Government recruitment information should link to official sources and must not imply government affiliation.

## Planned user experiences

### Job seekers
- Search by State/UT, district, area, category, and work type across India.
- View pay, hours, location, requirements, and food/stay details where provided.
- Contact employers directly and apply without a mandatory resume.
- Track applications and receive relevant alerts.

### Employers
- Create a basic employer profile.
- Post and manage openings.
- Review applicants and contact candidates.
- Access optional paid visibility and hiring features, subject to validation.

### Trust and safety
- Clear employer and job information.
- Report suspicious listings and employers.
- Review and moderation workflows.
- No guarantee of a job, salary, or employer legitimacy solely because a listing appears on the platform.

## Location catalogue

- All 36 States/Union Territories
- 785 district records in the imported LGD snapshot (refresh from the official monthly export before production)
- LGD state and district identifiers retained for database references
- Bengaluru is a city within Karnataka, not a State/UT

## Product principles

1. Hindi-first, simple, mobile-friendly experience.
2. Useful for both smartphone-first and low-literacy users.
3. Do not require a resume for every application.
4. Show important job terms clearly before a candidate contacts or applies.
5. Protect personal information and collect only what is needed.
6. Validate pricing and demand before relying on projected revenue.

## Repository guide

- `docs/PRODUCT_BLUEPRINT.md` — product scope and launch plan.
- `docs/UX_FOUNDATION.md` — initial screens and user journeys.

## Development status

The UI includes a single persistent Hindi/English/Hinglish selector, India-wide dependent State/UT and district selectors, and browser voice search where supported. Candidate/employer email account flows, Supabase schema and LGD code migrations, authenticated candidate/employer actions, and a staff moderation dashboard are included. Demo jobs remain fictional when Supabase is not configured. Before launch, configure staging/production Supabase projects, Auth/SMTP, provider secrets, admin/moderation workflows, HTTPS hosting, monitoring, and backups. See `docs/INDIA_LOCATION_DATA.md` and `docs/BACKEND_CONNECTION_AND_LAUNCH.md`.

## Brand

**SABKAAM**  
*Jobs, Work & Opportunities*  
**हर काम, हर इंसान के लिए।**

Name, domain, and trademark availability have not yet been verified.
