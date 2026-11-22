# India location catalogue

## Implemented catalogue

SABKAAM now ships a static, client-side State/UT → District catalogue in `src/data/india-locations.json`.

- State/Union Territory entries: **36**
- District records: **785**
- Each district record retains its LGD district code, English name, and local-language name when the source provides one.
- State records retain their LGD state code.
- The data is used by the job-search filters, employer job-post form, candidate profile, and employer-verification request form.
- Bengaluru is correctly treated as a city in Karnataka, not as a State/UT or district.

## Source and snapshot caveat

The authoritative source is the Government of India Ministry of Panchayati Raj Local Government Directory (LGD), published through the Open Government Data platform:

- LGD catalogue: https://www.data.gov.in/catalog/local-government-directory-lgd
- District resource: https://www.data.gov.in/resource/local-government-directory-lgd-districts
- Ministry description of LGD and its location-code hierarchy: https://panchayat.gov.in/lgd/

The imported rows came from a CSV mirror of the OGD district resource, whose columns include `state_code`, `state_name_english`, `district_code`, `district_name_english`, and `district_name_local`. The mirror file does not expose a reliable publication timestamp, so **785 is the count of the imported snapshot, not a guarantee of the live LGD count on every future date**. The OGD catalogue says the state and district resources are updated monthly. Before production launch, refresh from the latest official LGD/OGD export and compare the resulting codes and counts.

## Data quality and product rules

1. Preserve LGD codes as stable identifiers; never use translated display names as database keys.
2. Use the provided local-language name when available; otherwise show the official English name rather than inventing a translation.
3. A district belongs to the State/UT recorded in the same LGD row.
4. Keep city/locality separate from State/UT and district. Example: Bengaluru is a city in Karnataka.
5. Search and employer forms must use the same catalogue so locations stay consistent.
6. When LGD adds, renames, merges, or retires a district, update the bundled snapshot and record the new source date.

## Implemented UI coverage

- [x] State/UT selector covering all 36 entries.
- [x] Dependent district selector covering all 785 imported records.
- [x] Job search filters use the selected State/UT and district.
- [x] Employer job-post form uses the same State/UT and district catalogue.
- [x] Candidate profile uses the same State/UT and district catalogue.
- [x] Employer verification request uses the same State/UT and district catalogue.
- [ ] Add a searchable type-ahead district control for very long lists.
- [ ] Add an automated data-integrity test for unique LGD codes and parent relationships.
- [ ] Refresh from the latest official OGD export immediately before production launch.

## Runtime status

The catalogue and selectors work in the frontend prototype. This does not make job publishing, applications, employer verification, or complaint submission live; those workflows still require the production backend and admin review process.
