# SABKAAM city and locality search

## What is included

- The State/UT and district master remains sourced from the monthly Local Government Directory (LGD) catalogue maintained by the Ministry of Panchayati Raj and published through data.gov.in.
- `src/data/india-city-areas.json` adds a curated suggestion layer for 85 city/district entries across all 36 States/UTs and more than 1,400 locality, sector, industrial estate, phase, metro-station and neighbourhood names.
- The priority city list is informed by public hiring-trend reports, not by population alone. Naukri JobSpeak's October 2026 geography table highlighted strong year-on-year hiring growth in Gandhinagar (+48%), Surat (+36%), Raipur (+34%), Vadodara (+30%), Ranchi (+29%), Jaipur (+26%), Ahmedabad (+23%), Indore (+22%) and Bhopal (+21%). Its August 2026 report also highlighted Hyderabad, Kolkata and Chennai among leading metros, and Bhubaneswar, Raipur, Surat and Ranchi among emerging-city hiring markets.
- Candidate search supports a searchable suggestion list and free text. People can enter an unlisted village, ward, colony, sector, block, phase, metro station, chowk, street or PIN code without waiting for the catalogue to contain it.
- Employer job posting requires a specific city/market/locality field. It is saved in `town_or_market` and `locality`, so the same value can be searched by candidates.

## Data boundaries

The city and locality suggestions are a curated convenience index, not an official complete address register. City boundaries and district assignments can differ across administrative and colloquial usage, especially around metro regions. A suggestion should not be treated as proof of a postal address or service boundary.

LGD is authoritative for administrative states and districts; it does not provide a complete directory of every neighbourhood, street, sector or metro station. India Post provides a PIN/post-office lookup, but PIN codes are not a substitute for neighbourhood boundaries.

The public OpenStreetMap Nominatim endpoint is deliberately not used for client-side autocomplete: its published usage policy prohibits autocomplete and systematic bulk lookup on the public service. A future full national place search should use a licensed provider or a self-hosted geocoding/search service with caching, rate limits and attribution.

## Research sources

- Naukri JobSpeak, October 2026: https://www.infoedge.in/pdfs/News_Events_pdfs/Naukri-Jobspeak-October-2026.pdf
- Naukri JobSpeak, August 2026: https://www.naukri.com/blog/naukri-jobspeak-white-collar-hiring-grows-14-in-aug-fresher-hiring-ai-roles-lead/
- Naukri JobSpeak, March 2026: https://www.naukri.com/blog/naukri-jobspeak-march-26-records-a-9-rise-in-white-collar-hiring-as-fy26-closes-at-8-the-strongest-job-growth-in-three-years/
- Government of India LGD catalogue: https://data.gov.in/catalog/local-government-directory-lgd
- Government of India LGD district dataset: https://data.gov.in/resource/local-government-directory-lgd-districts
- India Post post-office locator: https://www.indiapost.gov.in/locate-postoffice
- OpenStreetMap Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
