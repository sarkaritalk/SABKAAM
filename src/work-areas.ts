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
  return value.toLocaleLowerCase('en-IN')
    .replace(/[,،;|]/g, ' ')
    .replace(/\b(metro|station|near|nearby|area|locality)\b/g, ' ')
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
