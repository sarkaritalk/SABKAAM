import { useEffect, useState, type FormEvent } from 'react'
import './safety-center.css'
import { Localized, type Language } from './i18n'
import { stateNames, getStateLabel, getDistrictOptions, getStateCode, getDistrictCode, type StateName } from './locations'
import { createEmployer, createVerificationRequest, getMyEmployer, submitSafetyReport, type AuthSession } from './lib/backend'

const warningSigns = [
  'नौकरी देने से पहले रजिस्ट्रेशन, सिक्योरिटी या ट्रेनिंग फीस माँगना',
  'OTP, UPI PIN, बैंक पासवर्ड या कार्ड की जानकारी माँगना',
  'काम, वेतन या कंपनी की पहचान साफ़ न बताना',
  'बिना पुष्टि के तुरंत पैसे भेजने का दबाव बनाना',
]

export default function SafetyCenter({ language, session, onSignIn }: { language: Language; session: AuthSession | null; onSignIn: () => void }) {
  const [reason, setReason] = useState('नौकरी के नाम पर पैसे माँगे')
  const [details, setDetails] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('दुकान / रिटेल')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessState, setBusinessState] = useState<StateName>('Bihar')
  const [businessDistrict, setBusinessDistrict] = useState('मधुबनी')
  const [businessAddress, setBusinessAddress] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  useEffect(() => { const options = getDistrictOptions(businessState, language); if (!options.includes(businessDistrict)) setBusinessDistrict(options[0] ?? '') }, [businessState, language])

  return <Localized language={language}><section className="safety-center">
    <div className="safety-heading">
      <span className="section-kicker">SABKAAM TRUST & SAFETY</span>
      <h1>सुरक्षित तरीके से काम खोजें</h1>
      <p>किसी भी नौकरी या नियोक्ता पर भरोसा करने से पहले जानकारी जाँचें। शक होने पर शिकायत दर्ज करने का विकल्प यहाँ मिलेगा।</p>
    </div>
    <div className="safety-grid">
      <article className="safety-card safety-warning">
        <div className="safety-card-icon">🛡️</div>
        <h2>धोखाधड़ी के संकेत पहचानें</h2>
        <ul>{warningSigns.map(item => <li key={item}>{item}</li>)}</ul>
      </article>
      <article className="safety-card">
        <div className="safety-card-icon">✓</div>
        <h2>नौकरी जाँचने की आदत</h2>
        <ul>
          <li>कंपनी का पूरा नाम और काम की जगह पूछें।</li>
          <li>वेतन, काम के घंटे और छुट्टी पहले स्पष्ट करें।</li>
          <li>ऑफर की पुष्टि कंपनी के आधिकारिक संपर्क से करें।</li>
          <li>मुलाकात सुरक्षित और सार्वजनिक जगह पर रखें।</li>
        </ul>
      </article>
    </div>
    <div className="safety-status"><strong>नियोक्ता सत्यापन</strong><span>नियोक्ता की पहचान और व्यवसाय की जानकारी जाँचने के बाद ही सत्यापित बैज दिया जाना चाहिए। नीचे अनुरोध प्रक्रिया का प्रोटोटाइप है; अभी कोई बैज जारी नहीं होता।</span></div>
    <section className="verification-card">
      <div><span className="section-kicker">EMPLOYER VERIFICATION</span><h2>नियोक्ता सत्यापन के लिए अनुरोध</h2><p>व्यवसाय की बुनियादी जानकारी दें। इस डेमो में कोई पहचान-पत्र, आधार, PAN, बैंक विवरण या दस्तावेज़ अपलोड न करें।</p></div>
      {verificationSent ? <div className="verification-pending" role="status"><strong>अनुरोध का डेमो तैयार है · स्थिति: समीक्षा बाकी</strong><span>{businessName} · {businessDistrict}, {getStateLabel(businessState, language)}</span><small>यह अनुरोध सर्वर पर नहीं भेजा गया है। वास्तविक जाँच और सत्यापन बैज अभी सक्रिय नहीं हैं।</small><button type="button" onClick={() => setVerificationSent(false)}>जानकारी संपादित करें</button></div> : <form onSubmit={event => { event.preventDefault(); setVerificationSent(true) }}>
        <label>व्यवसाय / कंपनी का नाम<input required value={businessName} onChange={event => setBusinessName(event.target.value)} placeholder="दुकान या कंपनी का नाम" /></label>
        <label>व्यवसाय का प्रकार<select value={businessType} onChange={event => setBusinessType(event.target.value)}><option>दुकान / रिटेल</option><option>होटल / रेस्टोरेंट</option><option>अस्पताल / क्लिनिक</option><option>फैक्ट्री / कंपनी</option><option>ऑफिस / अन्य</option></select></label>
        <label>संपर्क मोबाइल नंबर<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={businessPhone} onChange={event => setBusinessPhone(event.target.value)} placeholder="10 अंकों का नंबर" /></label>
        <label>राज्य<select value={businessState} onChange={event => { const nextState = event.target.value as StateName; setBusinessState(nextState); setBusinessDistrict(getDistrictOptions(nextState, language)[0] ?? '') }}>{stateNames.map(state => <option key={state} value={state}>{getStateLabel(state)}</option>)}</select></label>
        <label>जिला<select required value={businessDistrict} onChange={event => setBusinessDistrict(event.target.value)}>{getDistrictOptions(businessState, language).map(district => <option key={district}>{district}</option>)}</select></label>
        <label className="verification-address">व्यवसाय का पता<textarea required rows={2} value={businessAddress} onChange={event => setBusinessAddress(event.target.value)} placeholder="बाजार / मोहल्ला और पूरा पता" /></label>
        <button type="submit">डेमो सत्यापन अनुरोध बनाएँ →</button>
      </form>}
      <div className="verification-steps"><strong>वास्तविक सत्यापन प्रक्रिया में ये चरण होंगे</strong><ol><li>व्यवसाय और संपर्क की जानकारी प्राप्त करना</li><li>उचित आधिकारिक स्रोतों से व्यवसाय की जाँच</li><li>प्रशिक्षित एडमिन द्वारा दस्तावेज़ और जानकारी की समीक्षा</li><li>स्वीकृति, अस्वीकृति या अतिरिक्त जानकारी का अनुरोध</li></ol></div>
    </section>
    <section className="report-card">
      <div><span className="section-kicker">REPORT A PROBLEM</span><h2>शिकायत या संदिग्ध नौकरी की सूचना दें</h2><p>यह फॉर्म अभी केवल प्रोटोटाइप है। शिकायत कहीं भेजी या सेव नहीं होगी।</p></div>
      {submitted ? <div className="report-success" role="status"><strong>डेमो शिकायत तैयार हुई।</strong><span>अभी यह रिपोर्ट SABKAAM टीम तक नहीं पहुँची है और स्क्रीन बंद करने पर सेव नहीं रहेगी।</span><button type="button" onClick={() => { setSubmitted(false); setDetails(''); setContact('') }}>नई शिकायत लिखें</button></div> : <form onSubmit={event => { event.preventDefault(); setSubmitted(true) }}>
        <label>शिकायत का कारण<select value={reason} onChange={event => setReason(event.target.value)}><option>नौकरी के नाम पर पैसे माँगे</option><option>फर्जी या गलत नौकरी की जानकारी</option><option>OTP / बैंक जानकारी माँगी</option><option>दुर्व्यवहार या धमकी</option><option>अन्य समस्या</option></select></label>
        <label>क्या हुआ? <textarea required rows={4} value={details} onChange={event => setDetails(event.target.value)} placeholder="जितनी जानकारी सुरक्षित रूप से साझा कर सकते हैं, लिखें..." /></label>
        <label>संपर्क नंबर (वैकल्पिक)<input value={contact} onChange={event => setContact(event.target.value)} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" placeholder="10 अंकों का मोबाइल नंबर" /></label>
        <button type="submit">डेमो शिकायत तैयार करें →</button>
      </form>}
    </section>
    <p className="safety-footnote">जरूरी: तत्काल खतरे या वित्तीय धोखाधड़ी की स्थिति में स्थानीय पुलिस / साइबर क्राइम सहायता से संपर्क करें। SABKAAM का यह प्रोटोटाइप आपातकालीन सेवा नहीं है।</p>
  </section></Localized>
}
