import { useState } from 'react'
import './candidate-area.css'

type Mode = 'मेरे आवेदन' | 'सूचनाएँ' | 'प्रोफ़ाइल'

const sampleApplications = [
  { role: 'दुकान में सेल्स हेल्पर', employer: 'डेमो किराना स्टोर', place: 'मधुबनी', status: 'डेमो: आवेदन देखा गया', tone: 'review' },
  { role: 'रेस्टोरेंट में किचन हेल्पर', employer: 'डेमो फूड कॉर्नर', place: 'दरभंगा', status: 'डेमो: जवाब का इंतज़ार', tone: 'pending' },
]

export default function CandidateArea({ mode }: { mode: Mode }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('मधुबनी')
  const [skills, setSkills] = useState('')
  const [workType, setWorkType] = useState('फुल टाइम')
  const [saved, setSaved] = useState(false)

  if (mode === 'मेरे आवेदन') {
    return <section className="candidate-area">
      <div className="candidate-heading"><span className="section-kicker">आपकी नौकरी की यात्रा</span><h1>मेरे आवेदन</h1><p>आपने जिन नौकरियों के लिए आवेदन किया है, उनकी स्थिति यहाँ देख सकेंगे।</p></div>
      <div className="candidate-notice">यह केवल UI डेमो है। नीचे दिए गए आवेदन काल्पनिक हैं; किसी वास्तविक नियोक्ता को नहीं भेजे गए।</div>
      <div className="application-list">{sampleApplications.map((item) => <article className="candidate-application" key={item.role}><div className="application-symbol">▤</div><div className="application-info"><strong>{item.role}</strong><span>{item.employer} · {item.place}</span><small className={item.tone}>{item.status}</small></div><span className="application-arrow">→</span></article>)}</div>
      <div className="candidate-empty-tip"><strong>अगला कदम</strong><p>नौकरी खोजें और आवेदन करें। वास्तविक आवेदन सुविधा लाइव जॉब सिस्टम बनने के बाद जोड़ी जाएगी।</p></div>
    </section>
  }

  if (mode === 'सूचनाएँ') {
    return <section className="candidate-area">
      <div className="candidate-heading"><span className="section-kicker">काम की खबर</span><h1>सूचनाएँ</h1><p>नौकरी और आवेदन से जुड़ी जरूरी जानकारी एक जगह।</p></div>
      <div className="candidate-notice">अभी नोटिफिकेशन सेवा कनेक्ट नहीं है। ये उदाहरण सिर्फ स्क्रीन का नमूना हैं।</div>
      <article className="candidate-application"><div className="application-symbol">✦</div><div className="application-info"><strong>अपनी प्रोफ़ाइल पूरी करें</strong><span>अपनी स्किल और पसंदीदा काम जोड़ें ताकि सही अवसर ढूँढना आसान हो।</span><small className="pending">डेमो सूचना</small></div></article>
      <article className="candidate-application"><div className="application-symbol">⌖</div><div className="application-info"><strong>अपना जिला चुनें</strong><span>स्थानीय अवसरों के लिए अपना जिला और क्षेत्र सही रखें।</span><small className="pending">डेमो सूचना</small></div></article>
    </section>
  }

  return <section className="candidate-area">
    <div className="candidate-heading"><span className="section-kicker">आपकी पहचान, आपकी पसंद</span><h1>मेरी प्रोफ़ाइल</h1><p>बिना रिज़्यूमे के भी अपनी बुनियादी जानकारी तैयार रखें।</p></div>
    <div className="profile-layout">
      <form className="candidate-profile-form" onSubmit={(event) => { event.preventDefault(); setSaved(true) }}>
        <label>आपका नाम<input required value={name} onChange={event => { setName(event.target.value); setSaved(false) }} placeholder="अपना नाम लिखें" /></label>
        <label>मोबाइल नंबर<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={phone} onChange={event => { setPhone(event.target.value); setSaved(false) }} placeholder="10 अंकों का नंबर" /></label>
        <label>आपका जिला<select value={district} onChange={event => { setDistrict(event.target.value); setSaved(false) }}><option>मधुबनी</option><option>दरभंगा</option><option>पटना</option><option>मुजफ्फरपुर</option><option>रांची</option><option>धनबाद</option><option>बोकारो</option></select></label>
        <label>आपको कौन-सा काम आता है?<textarea rows={3} value={skills} onChange={event => { setSkills(event.target.value); setSaved(false) }} placeholder="जैसे: दुकान संभालना, ड्राइविंग, सिलाई..." /></label>
        <label>काम का प्रकार<select value={workType} onChange={event => { setWorkType(event.target.value); setSaved(false) }}><option>फुल टाइम</option><option>पार्ट टाइम</option><option>दैनिक मजदूरी</option><option>घर से काम</option><option>फ्रीलांस</option></select></label>
        <button type="submit">प्रोफ़ाइल सेव करें →</button>
        {saved && <p className="profile-saved" role="status">डेमो प्रोफ़ाइल इस स्क्रीन पर तैयार हुई। जानकारी सर्वर पर सेव नहीं हुई है।</p>}
      </form>
      <aside className="profile-side"><div className="profile-avatar">👤</div><strong>{name || 'आपका नाम'}</strong><span>{district} · {workType}</span><p>{skills || 'आपकी स्किल यहाँ दिखाई देंगी।'}</p><small>प्रोफ़ाइल प्रीव्यू · केवल इसी स्क्रीन पर</small></aside>
    </div>
    <p className="candidate-privacy">आपकी सहमति के बिना मोबाइल नंबर या निजी जानकारी किसी नियोक्ता के साथ साझा नहीं की जानी चाहिए।</p>
  </section>
}
