# SABKAAM — UX Foundation

This document captures the first approved direction for the interface. It is a starting point for iterative design, not a final specification.

## Design direction

- Mobile-first and easy to understand.
- Hindi-first labels with room for additional local languages.
- Clear icons and image-led category navigation.
- Large tap targets and short forms.
- Avoid requiring a CV for basic applications.
- Make location and pay information easy to scan.
- Keep job seeker and employer actions distinct.

## Primary navigation

1. Home
2. Applications
3. Notifications
4. Profile

Employer tools can appear contextually or through a clearly labeled employer area.

## Screen 1 — Home

Main elements:
- SABKAAM name and slogan.
- Search field for job, skill, or employer.
- Voice-search entry point (planned; requires speech support).
- Bihar/Jharkhand selector.
- District and nearby-area selection.
- Visual category tiles.
- Primary navigation.

## Screen 2 — Search filters

Filters:
- State.
- District.
- Town, market, or nearby area (where supported by available location data).
- Work category.
- Work format: all, full-time, part-time, daily wage, work from home, or freelance.

The interface should show selected filters clearly and allow users to reset them.

## Screen 3 — Job results

Each result should show, when available:
- Job title and employer.
- Area and district.
- Pay or pay range.
- Work format.
- Short requirements summary.
- Employer verification status with an explanation.

Use clear empty states when no matching listings are available. Never fill production search results with invented vacancies.

## Screen 4 — Job details and apply

Show:
- Full job description.
- Pay, hours, location, and requirements.
- Food/accommodation details if supplied.
- Employer information and verification level.
- Report-listing action.
- Apply or contact action, depending on the employer's configured process.

Before sharing a candidate's contact details, explain what will be shared and obtain consent.

## Screen 5 — Candidate profile and applications

Keep profile setup short:
- Name or preferred display name.
- Contact method and verification, when needed.
- Location.
- Skills and experience.
- Preferred work types.

Resume upload should be optional for suitable roles. Applications should have simple status labels and clear next steps.

## Screen 6 — Employer dashboard

Planned sections:
- Employer profile and verification status.
- Create a job.
- Active and closed jobs.
- Applicants.
- Candidate contact actions.
- Billing and promoted listing features (only after these are implemented and pricing is validated).

## Prototype data policy

Early mockups may use clearly labeled fictional sample content to demonstrate layout. Production must use real submitted listings and must not present sample data as actual vacancies.

## Accessibility and localization

- Use plain Hindi and familiar words.
- Avoid relying on color alone to communicate status.
- Support readable text sizes and keyboard/screen-reader semantics.
- Plan for Bhojpuri, Maithili, Magahi, Angika, and other languages after the core Hindi experience is stable.
- Voice input and audio job descriptions are planned features, not assumed browser capabilities.

## Validation questions

Test the flows with real job seekers and employers in different districts before finalizing:
- Can a first-time user find a relevant job without help?
- Do users understand pay, hours, and location?
- Can a small employer post a job quickly?
- Do users understand what employer verification does and does not mean?
- Can users report suspicious listings easily?
