import { useEffect, useState, type FormEvent } from 'react'
import './employer-dashboard.css'
import { LanguageSelect, Localized, type Language } from './i18n'
import { stateNames, getStateLabel, getDistrictOptions, type StateName } from './locations'

type Props = { onBack: () => void; language: Language; onLanguageChange: (language: Language) => void }


export default function EmployerDashboard({ onBack, language, onLanguageChange }: Props) {
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('दुकान और रिटेल')
  const [stateName, setStateName] = useState<StateName>('Bihar')
  const [district, setDistrict] = useState('मधुबनी')
  const [workType, setWorkType] = useState('फुल टाइम')
  const [salary, setSalary] = useState('')
  const [vacancies, setVacancies] = useState('1')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)
  useEffect(() => { const options = getDistrictOptions(stateName, language); if (!options.includes(district)) setDistrict(options[0] ?? '') }, [stateName, language])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(true)
  }

  return (
    <Localized language={language}><div className="employer-page">
      <header className="employer-header">
        <button className="back-button" onClick={onBack}>← वापस होम पर</button>
        <div className="employer-brand"><span>स</span><strong>SABKAAM <small>EMPLOYER DESK</small></strong></div>
        <LanguageSelect language={language} onChange={onLanguageChange} /><span className="preview-pill">प्रारंभिक संस्करण</span>
      </header>
      <main className="employer-main">
        <section className="employer-welcome">
          <div><span className="employer-kicker">नियोक्ता डैशबोर्ड</span><h1>अपनी टीम के लिए<br /><em>सही लोग खोजें।</em></h1><p>अपने यहाँ खाली पद की जानकारी भरें। अभी यह केवल फॉर्म का डेमो है; नौकरी ऑनलाइन प्रकाशित नहीं होगी।</p></div>
          <div className="employer-stat"><span>✦</span><strong>आसान भर्ती</strong><small>स्थानीय लोगों तक पहुँचने का लक्ष्य</small></div>
        </section>
        <div className="employer-layout">
          <form className="job-form" onSubmit={submit}>
            <div className="form-heading"><div><span className="employer-kicker">नया अवसर</span><h2>नौकरी की जानकारी भरें</h2></div><span className="required-note">* जरूरी जानकारी</span></div>
            <div className="form-section-title"><b>01</b><span>आपकी दुकान / कंपनी</span></div>
            <div className="form-grid">
              <label>दुकान / कंपनी का नाम *<input required value={company} onChange={e => setCompany(e.target.value)} placeholder="जैसे: अपना बिजनेस नाम" /></label>
              <label>संपर्क व्यक्ति का नाम *<input required value={contact} onChange={e => setContact(e.target.value)} placeholder="आपका नाम" /></label>
              <label className="full-field">मोबाइल नंबर *<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 अंकों का मोबाइल नंबर" /><small>यह नंबर उम्मीदवार आपसे संपर्क करने के लिए देख सकेंगे (लाइव संस्करण में)।</small></label>
            </div>
            <div className="form-section-title"><b>02</b><span>खाली पद की जानकारी</span></div>
            <div className="form-grid">
              <label className="full-field">काम / पद का नाम *<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="जैसे: सेल्समैन, ड्राइवर, कुक, हेल्पर" /></label>
              <label>काम की श्रेणी<select value={category} onChange={e => setCategory(e.target.value)}>{['दुकान और रिटेल','होटल और रेस्टोरेंट','अस्पताल और क्लिनिक','फैक्ट्री और गोदाम','ड्राइवर और डिलीवरी','ऑफिस और कंपनी','टेक्निकल काम','खेती और मजदूरी','घर और घरेलू काम','निर्माण और सिक्योरिटी','शिक्षा और ट्रेनिंग','ऑनलाइन और फ्रीलांस'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label>काम का प्रकार<select value={workType} onChange={e => setWorkType(e.target.value)}>{['फुल टाइम','पार्ट टाइम','दैनिक मजदूरी','वर्क फ्रॉम होम','कॉन्ट्रैक्ट'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label>राज्य<select value={stateName} onChange={e => { const nextState = e.target.value as StateName; setStateName(nextState); setDistrict(getDistrictOptions(nextState, language)[0] ?? '') }}>{stateNames.map(state => <option key={state} value={state}>{getStateLabel(state, language)}</option>)}</select></label>
              <label>जिला<select value={district} onChange={e => setDistrict(e.target.value)}>{getDistrictOptions(stateName, language).map(x => <option key={x}>{x}</option>)}</select></label>
              <label>मासिक वेतन / मजदूरी<input value={salary} onChange={e => setSalary(e.target.value)} placeholder="जैसे: ₹8,000–10,000" /></label>
              <label>कुल पद<input type="number" min="1" max="500" value={vacancies} onChange={e => setVacancies(e.target.value)} /></label>
              <label className="full-field">काम और योग्यता का विवरण<textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="काम क्या होगा? अनुभव या योग्यता चाहिए? खाना/रहना मिलेगा? काम के घंटे क्या होंगे?" /></label>
            </div>
            <div className="form-actions"><p>आगे चलकर पोस्ट करने से पहले मोबाइल सत्यापन और नौकरी की समीक्षा जोड़ी जाएगी।</p><button type="submit">डेमो पोस्ट का प्रीव्यू देखें <span>→</span></button></div>
            {success && <div className="form-success" role="status"><strong>प्रीव्यू तैयार है — अभी प्रकाशित नहीं हुआ।</strong><p>{title || 'नया पद'} · {company || 'आपकी कंपनी'} · {district}, {getStateLabel(stateName, language)}</p><small>यह जानकारी केवल इस स्क्रीन पर दिखाई गई है; सर्वर पर सेव नहीं हुई।</small></div>}
          </form>
          <aside className="employer-aside"><div className="aside-card"><span className="aside-icon">✓</span><h3>अच्छी नौकरी पोस्ट कैसी हो?</h3><ul><li>वेतन साफ-साफ लिखें</li><li>काम के घंटे बताएँ</li><li>सही जगह और संपर्क दें</li><li>जरूरी योग्यता ही माँगें</li><li>कोई फीस या सिक्योरिटी जमा न माँगें</li></ul></div><div className="aside-note"><strong>उम्मीदवार का भरोसा जरूरी है</strong><p>SABKAAM पर आगे चलकर संदिग्ध पोस्ट की रिपोर्ट और नियोक्ता सत्यापन की सुविधा बनाई जाएगी।</p></div></aside>
        </div>
      </main>
    </div></Localized>
  )
}
