import rawLocations from './data/india-locations.json'

type LocationDistrict = { code: number; name: string; local: string | null }
type LocationState = { code: number; districts: LocationDistrict[] }
const locationData = rawLocations as {
  source: string
  sourceResource: string
  states: Record<string, LocationState>
}

export type StateName = keyof typeof locationData.states
export const stateNames = Object.keys(locationData.states) as StateName[]

const hindiStateLabels: Record<string, string> = {
  'Andaman And Nicobar Islands': 'अंडमान और निकोबार द्वीपसमूह',
  'Andhra Pradesh': 'आंध्र प्रदेश',
  'Arunachal Pradesh': 'अरुणाचल प्रदेश',
  Assam: 'असम', Bihar: 'बिहार', Chandigarh: 'चंडीगढ़',
  Chhattisgarh: 'छत्तीसगढ़', Delhi: 'दिल्ली', Goa: 'गोवा',
  Gujarat: 'गुजरात', Haryana: 'हरियाणा', 'Himachal Pradesh': 'हिमाचल प्रदेश',
  'Jammu And Kashmir': 'जम्मू और कश्मीर', Jharkhand: 'झारखंड',
  Karnataka: 'कर्नाटक', Kerala: 'केरल', Ladakh: 'लद्दाख',
  Lakshadweep: 'लक्षद्वीप', 'Madhya Pradesh': 'मध्य प्रदेश',
  Maharashtra: 'महाराष्ट्र', Manipur: 'मणिपुर', Meghalaya: 'मेघालय',
  Mizoram: 'मिजोरम', Nagaland: 'नागालैंड', Odisha: 'ओडिशा',
  Puducherry: 'पुदुचेरी', Punjab: 'पंजाब', Rajasthan: 'राजस्थान',
  Sikkim: 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु', Telangana: 'तेलंगाना',
  'The Dadra And Nagar Haveli And Daman And Diu': 'दादरा और नगर हवेली और दमन और दीव',
  Tripura: 'त्रिपुरा', 'Uttar Pradesh': 'उत्तर प्रदेश',
  Uttarakhand: 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल',
}

export function getStateLabel(state: string): string {
  return hindiStateLabels[state] ?? state
}

export const districts = Object.fromEntries(
  Object.entries(locationData.states).map(([state, value]) => [
    state,
    ['सभी जिले', ...value.districts.map((district) => district.local && /[\\u0900-\\u097F]/.test(district.local) ? district.local : district.name)],
  ]),
) as Record<StateName, string[]>

export function getDistrictOptions(state: StateName): string[] {
  return districts[state].slice(1)
}

export const locationSource = {
  description: locationData.source,
  url: locationData.sourceResource,
  stateCount: stateNames.length,
  districtCount: Object.values(locationData.states).reduce((total, state) => total + state.districts.length, 0),
}
