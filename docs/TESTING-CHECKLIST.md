# SABKAAM Integration QA Checklist

This checklist is for the draft integration branch and must be completed before any production release.

## Automated check
- [x] GitHub Actions TypeScript check and Vite production build passed on the initial integration snapshot.
- [ ] Re-run and confirm the latest integration commit after the district and navigation fixes.

## Manual browser checks

### Home and job discovery
- [ ] Home screen loads at desktop and mobile widths.
- [ ] Switching Bihar/Jharkhand resets the district to “सभी जिले”.
- [ ] Selecting a district filters demo jobs to that district.
- [ ] Selecting Jharkhand does not show Bihar demo jobs.
- [ ] Search text and category filters work together.
- [ ] Empty results show a clear empty state.
- [ ] Voice-search control is clearly marked as coming soon and does not imply speech recognition works.

### Employer flow
- [ ] Employer entry opens the Employer Dashboard.
- [ ] Back button returns to Home.
- [ ] Bihar selector contains all 38 districts.
- [ ] Jharkhand selector contains all 24 districts.
- [ ] Required fields and 10-digit phone validation work.
- [ ] Submit shows a local preview only; no job is published or persisted.

### Candidate flow
- [ ] Each bottom tab shows only its own screen.
- [ ] Profile required fields and phone validation work.
- [ ] Profile preview updates as fields change.
- [ ] Applications and notifications remain clearly marked as sample data.

### Job application
- [ ] Job card opens the detail dialog.
- [ ] Dialog closes by close button and backdrop.
- [ ] Required name and 10-digit phone validation work.
- [ ] Submit shows a local demo confirmation only.

### Trust and safety
- [ ] Safety Center opens and back control returns to the app.
- [ ] Fraud-report form validates required details.
- [ ] Employer verification request displays a pending demo state.
- [ ] Both forms clearly disclose that no report/request is sent or stored.

### Responsive and accessibility review
- [ ] Check 360px, 390px, tablet and desktop widths.
- [ ] No horizontal overflow or clipped form controls.
- [ ] Keyboard focus and form labels are usable.
- [ ] Dialog has a visible close control and dialog semantics.

## Release blockers / known limitations
- No authentication, database, API, server persistence, or real-time listings.
- Candidate applications, employer job posts, reports, and verification requests are local UI demonstrations only.
- Employer verification and moderation are not operational.
- No real voice search, push notifications, SMS, or email alerts.
- Demo job listings are fictional and must not be presented as real vacancies.
- Before launch: implement backend and access controls, privacy/retention policy, abuse moderation, audit trail, rate limits, logging, backups, and production security review.
