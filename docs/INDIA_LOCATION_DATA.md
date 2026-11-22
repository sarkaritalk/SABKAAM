# India location catalogue — source and validation plan

## Scope

SABKAAM location search is intended to cover all Indian States and Union Territories, with a dependent district selector. Bengaluru is a city in Karnataka, not a State; city/locality must remain a separate location level from State and district.

## Source of truth

- Primary authority: Government of India, Ministry of Panchayati Raj, Local Government Directory (LGD): https://www.data.gov.in/catalog/local-government-directory-lgd
- Snapshot cross-check used for this implementation plan: 30 October 2026 LGD snapshot presented at https://guessthedistrict.in/en/states
- The cross-check page reports 790 districts across 36 States/UTs. It identifies LGD as its district-list source. Use the LGD export itself for production ingestion where available; do not treat third-party boundary files as the legal source of administrative names.

## Snapshot manifest (30 October 2026)

| State / Union Territory | Districts |
|---|---:|
| Andaman and Nicobar Islands | 3 |
| Andhra Pradesh | 28 |
| Arunachal Pradesh | 27 |
| Assam | 35 |
| Bihar | 38 |
| Chandigarh | 1 |
| Chhattisgarh | 33 |
| Dadra and Nagar Haveli and Daman and Diu | 3 |
| Delhi | 13 |
| Goa | 3 |
| Gujarat | 34 |
| Haryana | 23 |
| Himachal Pradesh | 12 |
| Jammu and Kashmir | 20 |
| Jharkhand | 24 |
| Karnataka | 31 |
| Kerala | 14 |
| Ladakh | 8 |
| Lakshadweep | 1 |
| Madhya Pradesh | 55 |
| Maharashtra | 36 |
| Manipur | 16 |
| Meghalaya | 12 |
| Mizoram | 11 |
| Nagaland | 17 |
| Odisha | 30 |
| Puducherry | 2 |
| Punjab | 23 |
| Rajasthan | 41 |
| Sikkim | 6 |
| Tamil Nadu | 38 |
| Telangana | 33 |
| Tripura | 8 |
| Uttar Pradesh | 75 |
| Uttarakhand | 13 |
| West Bengal | 23 |
| **Total** | **790** |

## Data quality rules

1. Keep stable machine identifiers separate from localized display names.
2. Store English and Hindi district labels; do not infer Hindi spellings from transliteration at runtime.
3. Preserve the LGD State/UT and district identifiers in the imported catalogue.
4. Validate that all 36 State/UT entries exist, each district belongs to exactly one parent State/UT, and the imported snapshot total is 790.
5. Treat a newly announced district as unavailable until it appears in the chosen LGD snapshot; record the snapshot date.
6. Do not infer district boundaries from a district name. City/locality (for example Bengaluru) is a separate optional field.
7. Search should match district name in English and Hindi and should be scoped by the selected State/UT.

## Product integration checklist

- [ ] Replace the Bihar/Jharkhand-only catalogue with a verified LGD export.
- [ ] Add a single State/UT selector and a dependent, searchable district selector.
- [ ] Apply the same location catalogue to job search, candidate profile, employer posting, and safety/report forms.
- [ ] Keep city/locality as a separate optional field.
- [ ] Add automated checks for 36 State/UTs, 790 districts, unique LGD IDs, and representative searches (Madhubani, Mumbai, Chennai, Bengaluru).
- [ ] Display the catalogue snapshot date in internal admin/data documentation.

## Important status note

This document records the source, snapshot manifest, and acceptance checks. It does not itself import the 790 district records or activate live job search. The current UI remains a prototype until the catalogue and application data are connected.
