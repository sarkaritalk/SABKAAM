import { useEffect, useState, type FormEvent } from 'react'
import './candidate-area.css'
import { Localized, type Language } from './i18n'
import { stateNames, getStateLabel, getDistrictOptions, getStateCode, getDistrictCode, type StateName } from './locations'
import { getMyApplications, getMyNotifications, updateMyProfile, type AuthSession } from './lib/backend'

type Mode = 'मेरे आवेदन' | 'सूचनाएँ' | 'प्रोफ़ाइल'

const sampleApplications = [
  { role: 'दुकान में सेल्स हेल्पर', employer: 'डेमो किराना स्टोर', place: 'मधुबनी', status: 'डेमो: आवेदन देखा गया', tone: 'review' },
  { role: 'रेस्टोरेंट में किचन हेल्पर', employer: 'डेमो फूड कॉर्नर', place: 'दरभंगा', status: 'डेमो: जवाब का इंतज़ार', tone: 'pending' },
]

export default function CandidateArea({ mode, language, session, onSignIn }: { mode: Mode; language: Language; session: AuthSession | null; onSignIn: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [stateName, setStateName] = useState<StateName>('Bihar')
  const [district, setDistrict] = useState('मधुबनी')
  const [skills, setSkills] = useState('')
  const [workType, setWorkType] = useState('फुल टाइम')
  const [saved, setSaved] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [realApplications, setRealApplications] = useState<Array<{ id: string; job_id: string; status: string; created_at: string; job_posts?: { title: string; district: string } | null }>>([])
  const [realNotifications, setRealNotifications] = useState<Array<{ id: string; title: string; body: string; kind: string; read_at: string | null; created_at: string }>>([])
  useEffect(() => { const options = getDistrictOptions(stateName, language); if (!options.includes(district)) setDistrict(options[0] ?? '') }, [stateName, language])
  useEffect(() => { if (!session) return; if (mode === 'मेरे आवेदन') getMyApplications(session.access_token).then(setRealApplications).catch(error => setProfileMessage(error instanceof Error ? error.message : 'आवेदन लोड नहीं हुए')); if (mode === 'सूचनाएँ') getMyNotifications(session.access_token).then(setRealNotifications).catch(error => setProfileMessage(error instanceof Error ? error.message : 'सूचनाएँ लोड नहीं हुईं')) }, [mode, session?.access_token])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) { setSaved(true); setProfileMessage('यह डेमो प्रोफ़ाइल केवल इस स्क्रीन पर तैयार हुई। सेव करने के लिए लॉगिन करें।'); return }
    try {
      await updateMyProfile(session.access_token, session.user.id, { full_name: name, phone, district, state_code: String(getStateCode(stateName)), state_lgd_code: getStateCode(stateName), district_lgd_code: getDistrictCode(stateName, district, language) ?? 0, preferred_language: language })
      setSaved(true); setProfileMessage('आपकी प्रोफ़ाइल सुरक्षित रूप से सेव हो गई।')
    } catch (error) { setProfileMessage(error instanceof Error ? error.message : 'प्रोफ़ाइल सेव नहीं हुई।') }
  }

  if (mode === 'मेरे आवेदन') {
    return <Localized language={language}><section className="candidate-area">
      <div className="candidate-heading"><span className="section-kicker">आपकी नौकरी की यात्रा</span><h1>मेरे आवेदन</h1><p>आपने जिन नौकरियों के लिए आवेदन किया है, उनकी स्थिति यहाँ देख सकेंगे।</p></div>
      {session ? <div className="application-list">{realApplications.length ? realApplications.map(item => <article className="candidate-application" key={item.id}><div className="application-symbol">▤</div><div className="application-info"><strong>{item.job_posts?.title || "नौकरी आवेदन"}</strong><span>{item.job_posts?.district || "भारत"} · {new Date(item.created_at).toLocaleDateString()}</span><small className="pending">{item.status}</small></div></article>) : <div className="candidate-notice">अभी आपके खाते में कोई आवेदन नहीं है।</div>}</div> : <div className="candidate-notice">अपने वास्तविक आवेदन देखने के लिए लॉगिन करें। <button type="button" onClick={onSignIn}>लॉगिन करें</button></div>}</div>
      <div className="candidate-empty-tip"><strong>अगला कदम</strong><p>नौकरी खोजें और आवेदन करें। वास्तविक आवेदन सुविधा लाइव जॉब सिस्टम बनने के बाद जोड़ी जाएगी।</p></div>
    </section></Localized>
  }

  if (mode === 'सूचनाएँ') {
    return <Localized language={language}><section className="candidate-area">
      <div className="candidate-heading"><span className="section-kicker">काम की खबर</span><h1>सूचनाएँ</h1><p>नौकरी और आवेदन से जुड़ी जरूरी जानकारी एक जगह।</p></div>
      <div className="candidate-notice">अभी नोटिफिकेशन सेवा कनेक्ट नहीं है। ये उदाहरण सिर्फ स्क्रीन का नमूना हैं।</div>
      <article className="candidate-application"><div className="application-symbol">✦</div><div className="application-info"><strong>अपनी प्रोफ़ाइल पूरी करें</strong><span>अपनी स्किल और पसंदीदा काम जोड़ें ताकि सही अवसर ढूँढना आसान हो।</span><small className="pending">डेमो सूचना</small></div></article>
      <article className="candidate-application"><div className="application-symbol">⌖</div><div className="application-info"><strong>अपना जिला चुनें</strong><span>स्थानीय अवसरों के लिए अपना जिला और क्षेत्र सही रखें।</span><small className="pending">डेमो सूचना</small></div></article>
    </section></Localized>
  }

  return <Localized language={language}><section className="candidate-area">
    <div className="candidate-heading"><span className="section-kicker">आपकी पहचान, आपकी पसंद</span><h1>मेरी प्रोफ़ाइल</h1><p>बिना रिज़्यूमे के भी अपनी बुनियादी जानकारी तैयार रखें।</p></div>
    <div className="profile-layout">
      <form className="candidate-profile-form" onSubmit={(event) => { event.preventDefault(); setSaved(true) }}>
        <label>आपका नाम<input required value={name} onChange={event => { setName(event.target.value); setSaved(false) }} placeholder="अपना नाम लिखें" /></label>
        <label>मोबाइल नंबर<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={phone} onChange={event => { setPhone(event.target.value); setSaved(false) }} placeholder="10 अंकों का नंबर" /></label>
        <label>राज्य<select value={stateName} onChange={event => { const nextState = event.target.value as StateName; setStateName(nextState); setDistrict(getDistrictOptions(nextState, language)[0] ?? ''); setSaved(false) }}>{stateNames.map(state => <option key={state} value={state}>{getStateLabel(state, language)}</option>)}</select></label>
        <label>आपका जिला<select value={district} onChange={event => { setDistrict(event.target.value); setSaved(false) }}>{getDistrictOptions(stateName, language).map(item => <option key={item}>{item}</option>)}</select></label>
        <label>आपको कौन-सा काम आता है?<textarea rows={3} value={skills} onChange={event => { setSkills(event.target.value); setSaved(false) }} placeholder="जैसे: दुकान संभालना, ड्राइविंग, सिलाई..." /></label>
        <label>काम का प्रकार<select value={workType} onChange={event => { setWorkType(event.target.value); setSaved(false) }}><option>फुल टाइम</option><option>पार्ट टाइम</option><option>दैनिक मजदूरी</option><option>घर से काम</option><option>फ्रीलांस</option></select></label>
        <button type="submit">प्रोफ़ाइल सेव करें →</button>
        {saved && <p className="profile-saved" role="status">डेमो प्रोफ़ाइल इस स्क्रीन पर तैयार हुई। जानकारी सर्वर पर सेव नहीं हुई है।</p>}
      </form>
      <aside className="profile-side"><div className="profile-avatar">👤</div><strong>{name || 'आपका नाम'}</strong><span>{district} · {getStateLabel(stateName, language)} · {workType}</span><p>{skills || 'आपकी स्किल यहाँ दिखाई देंगी।'}</p><small>प्रोफ़ाइल प्रीव्यू · केवल इसी स्क्रीन पर</small></aside>
    </div>
    <p className="candidate-privacy">आपकी सहमति के बिना मोबाइल नंबर या निजी जानकारी किसी नियोक्ता के साथ साझा नहीं की जानी चाहिए।</p>
  </section></Localized>
}
