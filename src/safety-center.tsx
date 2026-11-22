import { useEffect, useState, type FormEvent } from 'react'
import './safety-center.css'
import { Localized, type Language } from './i18n'
import { stateNames, getStateLabel, getDistrictOptions, getStateCode, getDistrictCode, type StateName } from './locations'
import { backendConfigured, createEmployer, createVerificationRequest, getMyEmployer, submitSafetyReport, type AuthSession } from './lib/backend'

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

  async function sendReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!backendConfigured) { setSubmitted(true); setReportMessage('डेमो शिकायत तैयार हुई। Backend connect होने पर ही रिपोर्ट भेजी जा सकेगी।'); return }
    if (!session) { setReportMessage('शिकायत भेजने के लिए लॉगिन करें।'); onSignIn(); return }
    try {
      await submitSafetyReport(session.access_token, { reporter_id: session.user.id, reason, details, contact_phone: contact || undefined })
      setSubmitted(true)
      setReportMessage('शिकायत SABKAAM टीम को भेज दी गई है।')
    } catch (error) { setReportMessage(error instanceof Error ? error.message : 'शिकायत भेजी नहीं जा सकी।') }
  }

  async function sendVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!backendConfigured) { setVerificationSent(true); setVerificationMessage('डेमो अनुरोध तैयार हुआ। Backend connect होने पर ही समीक्षा के लिए भेजा जा सकेगा।'); return }
    if (!session) { setVerificationMessage('सत्यापन अनुरोध के लिए employer account से लॉगिन करें।'); onSignIn(); return }
    if (session.user.user_metadata?.account_type !== 'employer') { setVerificationMessage('इस अनुरोध के लिए employer account जरूरी है।'); return }
    try {
      let employer = await getMyEmployer(session.access_token, session.user.id)
      if (!employer) {
        const created = await createEmployer(session.access_token, { owner_id: session.user.id, business_name: businessName, business_type: businessType, contact_phone: businessPhone, state_lgd_code: getStateCode(businessState), district_lgd_code: getDistrictCode(businessState, businessDistrict, language) ?? 0, district: businessDistrict, address: businessAddress })
        employer = created[0]
      }
      if (!employer?.id) throw new Error('Employer profile could not be created.')
      await createVerificationRequest(session.access_token, { employer_id: employer.id, business_name: businessName, business_type: businessType, contact_phone: businessPhone, state_lgd_code: getStateCode(businessState), district_lgd_code: getDistrictCode(businessState, businessDistrict, language) ?? 0, district: businessDistrict, address: businessAddress })
      setVerificationSent(true)
      setVerificationMessage('सत्यापन अनुरोध समीक्षा के लिए भेज दिया गया है।')
    } catch (error) { setVerificationMessage(error instanceof Error ? error.message : 'सत्यापन अनुरोध भेजा नहीं जा सका।') }
  }

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
    <div className="safety-status"><strong>नियोक्ता सत्यापन</strong><span>सत्यापन अनुरोध एडमिन समीक्षा के लिए भेजा जाएगा। समीक्षा पूरी होने से पहले कोई verified badge नहीं दिखेगा।</span></div>
    <section className="verification-card">
      <div><span className="section-kicker">EMPLOYER VERIFICATION</span><h2>नियोक्ता सत्यापन के लिए अनुरोध</h2><p>व्यवसाय की बुनियादी जानकारी दें। आधार, PAN या बैंक विवरण अपलोड न करें।</p></div>
      {verificationSent ? <div className="verification-pending" role="status"><strong>{backendConfigured ? 'सत्यापन अनुरोध भेजा गया · स्थिति: समीक्षा बाकी' : 'डेमो सत्यापन अनुरोध तैयार हुआ'}</strong><span>{businessName} · {businessDistrict}, {getStateLabel(businessState, language)}</span><small>{backendConfigured ? 'अनुरोध सुरक्षित रूप से सेव हुआ है। सत्यापन बैज एडमिन की जाँच के बाद ही जारी होगा।' : 'यह अनुरोध सेव नहीं हुआ है। Backend connect करना बाकी है।'}</small><button type="button" onClick={() => setVerificationSent(false)}>जानकारी संपादित करें</button></div> : <form onSubmit={sendVerification}>
        <label>व्यवसाय / कंपनी का नाम<input required value={businessName} onChange={event => setBusinessName(event.target.value)} placeholder="दुकान या कंपनी का नाम" /></label>
        <label>व्यवसाय का प्रकार<select value={businessType} onChange={event => setBusinessType(event.target.value)}><option>दुकान / रिटेल</option><option>होटल / रेस्टोरेंट</option><option>अस्पताल / क्लिनिक</option><option>फैक्ट्री / कंपनी</option><option>ऑफिस / अन्य</option></select></label>
        <label>संपर्क मोबाइल नंबर<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={businessPhone} onChange={event => setBusinessPhone(event.target.value)} placeholder="10 अंकों का नंबर" /></label>
        <label>राज्य<select value={businessState} onChange={event => { const nextState = event.target.value as StateName; setBusinessState(nextState); setBusinessDistrict(getDistrictOptions(nextState, language)[0] ?? '') }}>{stateNames.map(state => <option key={state} value={state}>{getStateLabel(state)}</option>)}</select></label>
        <label>जिला<select required value={businessDistrict} onChange={event => setBusinessDistrict(event.target.value)}>{getDistrictOptions(businessState, language).map(district => <option key={district}>{district}</option>)}</select></label>
        <label className="verification-address">व्यवसाय का पता<textarea required rows={2} value={businessAddress} onChange={event => setBusinessAddress(event.target.value)} placeholder="बाजार / मोहल्ला और पूरा पता" /></label>
        <button type="submit">सत्यापन अनुरोध भेजें →</button>
      </form>}
      <div className="verification-steps"><strong>वास्तविक सत्यापन प्रक्रिया में ये चरण होंगे</strong><ol><li>व्यवसाय और संपर्क की जानकारी प्राप्त करना</li><li>उचित आधिकारिक स्रोतों से व्यवसाय की जाँच</li><li>प्रशिक्षित एडमिन द्वारा दस्तावेज़ और जानकारी की समीक्षा</li><li>स्वीकृति, अस्वीकृति या अतिरिक्त जानकारी का अनुरोध</li></ol></div>
    </section>
    <section className="report-card">
      <div><span className="section-kicker">REPORT A PROBLEM</span><h2>शिकायत या संदिग्ध नौकरी की सूचना दें</h2><p>{session ? 'आपकी शिकायत SABKAAM की समीक्षा कतार में भेजी जाएगी।' : 'शिकायत भेजने के लिए पहले लॉगिन करें।'}</p></div>
      {submitted ? <div className="report-success" role="status"><strong>{backendConfigured ? 'शिकायत भेज दी गई।' : 'डेमो शिकायत तैयार हुई।'}</strong><span>{backendConfigured ? 'आपकी रिपोर्ट समीक्षा के लिए सुरक्षित रूप से सेव हुई है।' : 'यह रिपोर्ट कहीं सेव या भेजी नहीं गई है।'}</span><button type="button" onClick={() => { setSubmitted(false); setDetails(''); setContact('') }}>नई शिकायत लिखें</button></div> : <form onSubmit={sendReport}>
        <label>शिकायत का कारण<select value={reason} onChange={event => setReason(event.target.value)}><option>नौकरी के नाम पर पैसे माँगे</option><option>फर्जी या गलत नौकरी की जानकारी</option><option>OTP / बैंक जानकारी माँगी</option><option>दुर्व्यवहार या धमकी</option><option>अन्य समस्या</option></select></label>
        <label>क्या हुआ? <textarea required rows={4} value={details} onChange={event => setDetails(event.target.value)} placeholder="जितनी जानकारी सुरक्षित रूप से साझा कर सकते हैं, लिखें..." /></label>
        <label>संपर्क नंबर (वैकल्पिक)<input value={contact} onChange={event => setContact(event.target.value)} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" placeholder="10 अंकों का मोबाइल नंबर" /></label>
        <button type="submit">शिकायत भेजें →</button>
      </form>}
    </section>
    <p className="safety-footnote">जरूरी: तत्काल खतरे या वित्तीय धोखाधड़ी की स्थिति में स्थानीय पुलिस / साइबर क्राइम सहायता से संपर्क करें। SABKAAM का यह प्रोटोटाइप आपातकालीन सेवा नहीं है।</p>
  </section></Localized>
}
