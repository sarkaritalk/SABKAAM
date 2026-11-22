import rawCityAreas from './data/india-city-areas.json'
import type { StateName } from './locations'

type CityAreaRecord = { state: string; district: string; city: string; aliases: string[]; areas: string[] }
const cityAreas = (rawCityAreas as { cities: CityAreaRecord[] }).cities

export type WorkAreaSuggestion = {
  state: StateName
  district: string
  city: string
  area: string
  label: string
}

export function normalizeWorkAreaQuery(value: string): string {
  const hindiNumbers: Record<string, string> = {
    एक: '1', दो: '2', तीन: '3', चार: '4', पांच: '5', पाँच: '5', छह: '6', सात: '7', आठ: '8', नौ: '9', दस: '10',
    ग्यारह: '11', बारह: '12', तेरह: '13', चौदह: '14', पंद्रह: '15', पन्द्रह: '15', सोलह: '16', सत्रह: '17',
    अठारह: '18', उन्नीस: '19', बीस: '20', इक्कीस: '21', बाईस: '22', तेईस: '23', चौबीस: '24', पच्चीस: '25',
    छब्बीस: '26', सत्ताईस: '27', अट्ठाईस: '28', उनतीस: '29', तीस: '30', इकतीस: '31', बत्तीस: '32',
    तैंतीस: '33', चौंतीस: '34', पैंतीस: '35',
  }
  return value.toLocaleLowerCase('en-IN')
    .replace(/सेक्टर/g, 'sector')
    .replace(/फेज़|फेज/g, 'phase')
    .replace(/ब्लॉक/g, 'block')
    .replace(/गली/g, 'gali')
    .replace(/लेबर|मज़दूर|मजदूर/g, 'labour')
    .replace(/चौक/g, 'chowk')
    .replace(/[,،;|/_-]/g, ' ')
    .replace(/\b(metro|station|near|nearby|area|locality)\b/g, ' ')
    .replace(/मेट्रो|स्टेशन/g, ' ')
    .replace(/नंबर|नं/g, ' ')
    .replace(/[\u0900-\u097F]+/g, word => hindiNumbers[word] ?? word)
    .replace(/\s+/g, ' ')
    .trim()
}

export function getWorkAreaSuggestions(query: string, preferredState?: string, preferredDistrict?: string, limit = 10): WorkAreaSuggestion[] {
  const normalized = normalizeWorkAreaQuery(query)
  const tokens = normalized.split(' ').filter(Boolean)
  const results: WorkAreaSuggestion[] = []

  for (const record of cityAreas) {
    const cityHaystack = normalizeWorkAreaQuery([record.city, ...record.aliases].join(' '))
    const cityMatch = !tokens.length || tokens.every(token => cityHaystack.includes(token))
    if (cityMatch) {
      results.push({ state: record.state as StateName, district: record.district, city: record.city, area: record.city, label: record.city + ' · ' + record.district + ', ' + record.state })
    }
    for (const area of record.areas) {
      const haystack = normalizeWorkAreaQuery([area, record.city, ...record.aliases].join(' '))
      const matches = !tokens.length || tokens.every(token => haystack.includes(token))
      if (matches) {
        results.push({ state: record.state as StateName, district: record.district, city: record.city, area, label: area + ' · ' + record.city + ', ' + record.state })
      }
    }
  }

  return results
    .sort((a, b) => {
      const aPreferred = (preferredState && a.state === preferredState ? 2 : 0) + (preferredDistrict && a.district === preferredDistrict ? 1 : 0)
      const bPreferred = (preferredState && b.state === preferredState ? 2 : 0) + (preferredDistrict && b.district === preferredDistrict ? 1 : 0)
      if (aPreferred !== bPreferred) return bPreferred - aPreferred
      if (tokens.length && a.area.toLocaleLowerCase('en-IN') === normalized) return -1
      if (tokens.length && b.area.toLocaleLowerCase('en-IN') === normalized) return 1
      return a.city.localeCompare(b.city)
    })
    .slice(0, limit)
}

export const workAreaCatalogueStats = {
  cityDistrictEntries: cityAreas.length,
  suggestedAreas: cityAreas.reduce((total, record) => total + record.areas.length, 0),
}
