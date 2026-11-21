import { useState } from 'react'
import './safety-center.css'

const warningSigns = [
  'नौकरी देने से पहले रजिस्ट्रेशन, सिक्योरिटी या ट्रेनिंग फीस माँगना',
  'OTP, UPI PIN, बैंक पासवर्ड या कार्ड की जानकारी माँगना',
  'काम, वेतन या कंपनी की पहचान साफ़ न बताना',
  'बिना पुष्टि के तुरंत पैसे भेजने का दबाव बनाना',
]

export default function SafetyCenter() {
  const [reason, setReason] = useState('नौकरी के नाम पर पैसे माँगे')
  const [details, setDetails] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return <section className="safety-center">
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
    <div className="safety-status"><strong>नियोक्ता सत्यापन</strong><span>सत्यापित बैज और दस्तावेज़ जाँच सुविधा अभी विकसित हो रही है। फिलहाल किसी डेमो लिस्टिंग को सत्यापित न मानें।</span></div>
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
  </section>
}
